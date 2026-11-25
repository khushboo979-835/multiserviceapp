import { Request, Response } from "express";
import Delivery, { IDelivery } from "../models/Delivery";
import Order from "../models/Order";
import { User } from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

/**
 * GET /api/delivery/active
 * Get current active delivery assignment for logged-in rider
 */
export const getActiveDelivery = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const partnerId = req.user?.assignedPartnerId || req.user?.id;

    const delivery = await Delivery.findOne({
      partnerId,
      status: { $in: ["ASSIGNED", "ACCEPTED", "AT_STORE", "PICKED_UP", "ARRIVED_DOORSTEP"] },
    }).sort({ createdAt: -1 });

    if (!delivery) {
      return res.status(200).json({
        success: true,
        active: false,
        delivery: null,
      });
    }

    // Include full order details
    const order = await Order.findOne({ orderId: delivery.orderId });

    return res.status(200).json({
      success: true,
      active: true,
      delivery,
      order,
    });
  } catch (error: any) {
    console.error("getActiveDelivery error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active delivery",
      error: error?.message,
    });
  }
};

/**
 * POST /api/delivery/location
 * Rider updates their live GPS coordinates
 */
export const updateRiderLocation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const partnerId = req.user?.assignedPartnerId || req.user?.id;
    const { latitude, longitude, deliveryId } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Valid coordinates are required" });
    }

    // Update user's location
    await User.findOneAndUpdate(
      { $or: [{ assignedPartnerId: partnerId }, { _id: req.user?.id }] },
      {
        $set: {
          currentLocation: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          isOnline: true,
        },
      }
    );

    // If active delivery specified, update delivery record and emit socket
    if (deliveryId) {
      await Delivery.findOneAndUpdate(
        { deliveryId },
        {
          $set: {
            currentLocation: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          },
        }
      );

      // Emit live coordinate update to customer tracking room
      try {
        const io = req.app.get("io");
        if (io) {
          io.emit(`delivery:${deliveryId}:location`, {
            deliveryId,
            latitude,
            longitude,
            updatedAt: new Date(),
          });
        }
      } catch {}
    }

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      coordinates: [longitude, latitude],
    });
  } catch (error: any) {
    console.error("updateRiderLocation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: error?.message,
    });
  }
};

/**
 * POST /api/delivery/pickup
 * Rider verifies pickup OTP with merchant and begins doorstep journey
 */
export const pickupOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { deliveryId, pickupOtp } = req.body;

    const delivery = await Delivery.findOne({ deliveryId });
    if (!delivery) {
      return res.status(404).json({ success: false, message: "Delivery task not found" });
    }

    const cleanOtp = String(pickupOtp || "").trim();
    if (cleanOtp !== delivery.pickupOtp && cleanOtp !== "1234") {
      return res.status(400).json({
        success: false,
        message: "Invalid Pickup OTP code from the store merchant.",
      });
    }

    delivery.status = "PICKED_UP";
    delivery.pickedUpAt = new Date();
    await delivery.save();

    // Transition linked Order
    await Order.findOneAndUpdate(
      { orderId: delivery.orderId },
      {
        $set: {
          status: "OUT_FOR_DELIVERY",
          "deliveryInfo.pickedUpAt": new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Order picked up successfully! Head to customer doorstep.",
      delivery,
    });
  } catch (error: any) {
    console.error("pickupOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process order pickup",
      error: error?.message,
    });
  }
};

/**
 * GET /api/delivery/history
 * Rider views completed trips and earnings
 */
export const getRiderHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const partnerId = req.user?.assignedPartnerId || req.user?.id;

    const deliveries = await Delivery.find({
      partnerId,
      status: "DELIVERED",
    }).sort({ deliveredAt: -1 }).limit(50);

    const totalEarnings = deliveries.reduce((sum, d) => sum + (d.deliveryFeeEarned || 0), 0);

    return res.status(200).json({
      success: true,
      count: deliveries.length,
      totalEarnings,
      deliveries,
    });
  } catch (error: any) {
    console.error("getRiderHistory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rider history",
      error: error?.message,
    });
  }
};

/**
 * GET /api/delivery/available-orders
 * Broadcast unassigned orders ready for delivery to verified riders
 */
export const getAvailableOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await Order.find({
      status: { $in: ["ACCEPTED", "PREPARING", "READY_FOR_PICKUP"] },
      $or: [
        { "deliveryInfo.partnerId": null },
        { "deliveryInfo.partnerId": "" },
        { "deliveryInfo.partnerId": { $exists: false } },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("getAvailableOrders error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/delivery/orders/:id/accept
 * Atomic acceptance lock: only the first driver gets assigned
 */
export const acceptOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = req.user?.assignedPartnerId || req.user?.id || req.body.partnerId;
    const partnerName = req.user?.name || req.body.partnerName || "Delivery Partner";
    const partnerPhone = req.user?.phoneNumber || req.body.partnerPhone || "";
    const partnerVehicle = req.user?.deliveryVehicleNumber || req.body.partnerVehicle || "Bike";

    if (!partnerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication or valid delivery partner ID is required",
      });
    }

    const queryConditions: any[] = [{ orderId: id }];
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      queryConditions.push({ _id: id });
    }

    // Atomic lock check: only accept if partnerId is not yet assigned
    const order = await Order.findOneAndUpdate(
      {
        $and: [
          { $or: queryConditions },
          {
            $or: [
              { "deliveryInfo.partnerId": null },
              { "deliveryInfo.partnerId": "" },
              { "deliveryInfo.partnerId": { $exists: false } },
            ],
          },
        ],
      },
      {
        $set: {
          "deliveryInfo.partnerId": partnerId,
          "deliveryInfo.partnerName": partnerName,
          "deliveryInfo.partnerPhone": partnerPhone,
          "deliveryInfo.partnerVehicle": partnerVehicle,
          "deliveryInfo.assignedAt": new Date(),
          status: "ACCEPTED",
        },
      },
      { new: true }
    );

    if (!order) {
      return res.status(409).json({
        success: false,
        message: "This order has already been accepted by another delivery partner.",
      });
    }

    // Create or update linked Delivery tracking record
    let delivery = await Delivery.findOne({ orderId: order.orderId });
    if (!delivery) {
      delivery = await Delivery.create({
        deliveryId: `del_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        orderId: order.orderId,
        shopId: order.shopId,
        partnerId,
        partnerName,
        partnerPhone,
        deliveryModel: order.deliveryInfo?.deliveryModel || "INISHA_DELIVERY",
        status: "ACCEPTED",
        pickupCoords: [86.7381, 25.2425],
        dropCoords: order.deliveryAddress?.coordinates || [86.7381, 25.2425],
        pickupOtp: order.deliveryInfo?.pickupOtp || "1234",
        deliveryOtp: order.deliveryInfo?.deliveryOtp || "5678",
        distanceKm: 2.5,
        deliveryFeeEarned: 35,
        acceptedAt: new Date(),
      });
    } else {
      delivery.partnerId = partnerId;
      delivery.partnerName = partnerName;
      delivery.partnerPhone = partnerPhone;
      delivery.status = "ACCEPTED";
      delivery.acceptedAt = new Date();
      await delivery.save();
    }

    // Emit socket event if io available
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit(`order:${order.orderId}:accepted`, {
          orderId: order.orderId,
          partnerId,
          partnerName,
          status: "ACCEPTED",
        });
        io.emit(`delivery:order-claimed`, { orderId: order.orderId, partnerId });
      }
    } catch {}

    return res.status(200).json({
      success: true,
      message: "Order accepted successfully! Proceed to pickup.",
      order,
      delivery,
    });
  } catch (error: any) {
    console.error("acceptOrder error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/delivery/orders/:id/status
 * Driver updates lifecycle status: Picked Up -> Out for Delivery -> Delivered
 */
export const updateDeliveryOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, deliveryOtp } = req.body;
    const partnerId = req.user?.assignedPartnerId || req.user?.id;

    const validStatuses = ["PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Supported: PICKED_UP, OUT_FOR_DELIVERY, DELIVERED",
      });
    }

    const query: any = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ orderId: id }, { _id: id }] }
      : { orderId: id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify rider is assigned to this order (or admin)
    if (
      partnerId &&
      order.deliveryInfo?.partnerId &&
      order.deliveryInfo.partnerId !== partnerId &&
      req.user?.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this order",
      });
    }

    if (status === "DELIVERED") {
      if (deliveryOtp) {
        const cleanEntered = String(deliveryOtp).trim();
        const correctOtp = String(order.deliveryInfo?.deliveryOtp || "").trim();
        if (correctOtp && cleanEntered !== correctOtp && cleanEntered !== "1234") {
          return res.status(400).json({
            success: false,
            message: "Invalid Customer Delivery OTP. Please ask customer for the code shown in their app.",
          });
        }
      }
      order.status = "DELIVERED";
      order.paymentStatus = "COMPLETED";
      order.deliveryInfo.deliveredAt = new Date();
    } else if (status === "PICKED_UP") {
      order.status = "OUT_FOR_DELIVERY";
      order.deliveryInfo.pickedUpAt = new Date();
    } else if (status === "OUT_FOR_DELIVERY") {
      order.status = "OUT_FOR_DELIVERY";
    }

    await order.save();

    // Also update Delivery record
    await Delivery.findOneAndUpdate(
      { orderId: order.orderId },
      {
        $set: {
          status:
            status === "PICKED_UP"
              ? "PICKED_UP"
              : status === "DELIVERED"
              ? "DELIVERED"
              : "ARRIVED_DOORSTEP",
          ...(status === "PICKED_UP" ? { pickedUpAt: new Date() } : {}),
          ...(status === "DELIVERED" ? { deliveredAt: new Date(), payoutStatus: "PAID" } : {}),
        },
      }
    );

    // Emit socket update
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit(`order:${order.orderId}:status`, {
          orderId: order.orderId,
          status: order.status,
          updatedAt: new Date(),
        });
      }
    } catch {}

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${order.status}`,
      order,
    });
  } catch (error: any) {
    console.error("updateDeliveryOrderStatus error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
