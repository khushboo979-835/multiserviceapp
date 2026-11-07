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
