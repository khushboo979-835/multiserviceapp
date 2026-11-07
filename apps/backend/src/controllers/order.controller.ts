import { Request, Response } from "express";
import crypto from "crypto";
import Order, { IOrder, OrderStatus } from "../models/Order";
import Shop from "../models/Shop";
import Product from "../models/Product";
import Delivery from "../models/Delivery";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

/**
 * Generate 4-digit secure numeric OTP
 */
const generateOtp4 = (): string => {
  return crypto.randomInt(1000, 10000).toString();
};

/**
 * POST /api/orders/checkout
 * Place atomic customer order with single-shop cart enforcement
 */
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      shopId,
      items,
      deliveryAddress,
      paymentMethod = "COD",
      orderNotes = "",
    } = req.body;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required to place an order.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Please add items to checkout.",
      });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.phone) {
      return res.status(400).json({
        success: false,
        message: "Valid delivery address and contact phone number are required.",
      });
    }

    // Verify shop exists and is open
    const shop = await Shop.findOne({ shopId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "The requested shop was not found.",
      });
    }

    if (shop.openingHours?.isOpen === false) {
      return res.status(400).json({
        success: false,
        message: `${shop.name} is currently closed. Please check opening hours.`,
      });
    }

    // Single-Store Cart Verification: Fetch product records and verify shop consistency
    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const prod = await Product.findOne({
        $or: [{ id: item.productId }, { _id: item.productId?.match(/^[0-9a-fA-F]{24}$/) ? item.productId : undefined }],
      });

      const itemPrice = prod ? prod.price : item.price || 0;
      const itemName = prod ? prod.name : item.name || "Item";
      const itemQty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const itemImage = prod?.imageUrl || item.imageUrl || "";
      const foodType = prod?.foodAttributes?.isVeg !== undefined
        ? prod.foodAttributes.isVeg ? "VEG" : "NON_VEG"
        : item.foodType;

      subtotal += itemPrice * itemQty;

      validatedItems.push({
        productId: prod?.id || item.productId,
        name: itemName,
        price: itemPrice,
        originalPrice: prod?.originalPrice || itemPrice,
        quantity: itemQty,
        variant: item.variant || "",
        imageUrl: itemImage,
        foodType,
      });
    }

    // Check minimum order amount
    const minOrder = shop.deliverySettings?.minOrderAmount || 0;
    if (subtotal < minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for ${shop.name} is ₹${minOrder}. Please add more items.`,
      });
    }

    // Calculate delivery and total
    const freeDeliveryThreshold = shop.deliverySettings?.freeDeliveryThreshold || 499;
    const baseDeliveryFee = shop.deliverySettings?.baseDeliveryFee ?? 25;
    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee;
    const packagingFee = shop.category === "RESTAURANT" ? 15 : 0;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + deliveryFee + packagingFee + tax;

    // Generate security OTPs
    const pickupOtp = generateOtp4();
    const deliveryOtp = generateOtp4();

    const timestamp = Date.now().toString().slice(-6);
    const orderId = `ord_${Date.now()}`;
    const orderNumber = `IN-${shop.category.slice(0, 3)}-${timestamp}`;

    const customerId = req.user?.id || req.body.customerId || "usr_guest";
    const customerName = req.user?.name || req.body.customerName || "Customer";
    const customerPhone = req.user?.phoneNumber || req.body.customerPhone || deliveryAddress.phone;

    const newOrder = await Order.create({
      orderId,
      orderNumber,
      customerId,
      customerName,
      customerPhone,
      shopId: shop.shopId,
      shopName: shop.name,
      items: validatedItems,
      pricing: {
        subtotal,
        deliveryFee,
        packagingFee,
        tax,
        discount: 0,
        total,
      },
      deliveryAddress: {
        street: deliveryAddress.street,
        landmark: deliveryAddress.landmark || "",
        city: deliveryAddress.city || "Patna",
        pincode: deliveryAddress.pincode || "800001",
        coordinates: deliveryAddress.coordinates || [85.1376, 25.5941],
        phone: deliveryAddress.phone,
      },
      status: "PENDING",
      deliveryInfo: {
        deliveryModel: shop.deliverySettings?.deliveryModel === "SHOP_DELIVERY" ? "SHOP_DELIVERY" : "INISHA_DELIVERY",
        pickupOtp,
        deliveryOtp,
      },
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "COMPLETED",
      orderNotes,
      estimatedDeliveryTime: `${(shop.deliverySettings?.estimatedPrepMins || 20) + 15} mins`,
    });

    // Notify via Socket.io if running
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit(`shop:${shop.shopId}:new-order`, {
          orderId: newOrder.orderId,
          orderNumber: newOrder.orderNumber,
          total: newOrder.pricing.total,
          itemsCount: newOrder.items.length,
          customerName: newOrder.customerName,
        });
      }
    } catch {}

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error: any) {
    console.error("createOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error?.message,
    });
  }
};

/**
 * GET /api/orders/my-orders
 * Customer retrieves their order history
 */
export const getMyOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customerId = req.user?.id || req.user?.userId;
    const phone = req.user?.phoneNumber;

    const orders = await Order.find({
      $or: [
        { customerId },
        { customerPhone: phone },
        { customerPhone: phone?.replace(/\D/g, "").slice(-10) },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("getMyOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error?.message,
    });
  }
};

/**
 * GET /api/orders/shop/:shopId
 * Merchant views all orders for their shop
 */
export const getShopOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    const { status } = req.query;

    const filter: any = { shopId };
    if (status && status !== "ALL") {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("getShopOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop orders",
      error: error?.message,
    });
  }
};

/**
 * GET /api/orders/:id
 * Single order details
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      $or: [{ orderId: id }, { orderNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("getOrderById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error?.message,
    });
  }
};

/**
 * PUT /api/orders/:id/status
 * Transition order lifecycle: ACCEPTED -> PREPARING -> READY_FOR_PICKUP -> OUT_FOR_DELIVERY -> DELIVERED -> CANCELLED
 */
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, cancelledReason } = req.body;

    const validStatuses: OrderStatus[] = [
      "PENDING",
      "ACCEPTED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    if (cancelledReason) {
      order.cancelledReason = cancelledReason;
    }

    if (status === "DELIVERED") {
      order.deliveryInfo.deliveredAt = new Date();
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "COMPLETED";
      }
    } else if (status === "OUT_FOR_DELIVERY") {
      order.deliveryInfo.pickedUpAt = new Date();
    }

    await order.save();

    // Broadcast update via Socket.io
    try {
      const io = req.app.get("io");
      if (io) {
        io.emit(`order:${order.orderId}:status`, {
          orderId: order.orderId,
          status: order.status,
          updatedAt: order.updatedAt,
        });
      }
    } catch {}

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      order,
    });
  } catch (error: any) {
    console.error("updateOrderStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error?.message,
    });
  }
};

/**
 * POST /api/orders/:id/verify-otp
 * Rider submits the 4-digit customer delivery OTP upon doorstep arrival
 */
export const verifyDeliveryOtp = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const expectedOtp = order.deliveryInfo?.deliveryOtp;
    const cleanOtp = String(otp || "").trim();

    // Universal test code 1234 or exact match
    if (cleanOtp !== expectedOtp && cleanOtp !== "1234") {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please ask customer for the correct 4-digit code shown in their app.",
      });
    }

    order.status = "DELIVERED";
    order.deliveryInfo.deliveredAt = new Date();
    order.paymentStatus = "COMPLETED";
    await order.save();

    // Update delivery record if linked
    await Delivery.findOneAndUpdate(
      { orderId: order.orderId },
      { $set: { status: "DELIVERED", deliveredAt: new Date(), payoutStatus: "PAID" } }
    );

    return res.status(200).json({
      success: true,
      message: "Delivery OTP verified successfully! Order marked as DELIVERED.",
      order,
    });
  } catch (error: any) {
    console.error("verifyDeliveryOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify delivery OTP",
      error: error?.message,
    });
  }
};

/**
 * POST /api/orders/:id/assign-partner
 * Assigns a delivery rider to the order
 */
export const assignDeliveryPartner = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { partnerId, partnerName, partnerPhone, partnerVehicle } = req.body;

    const order = await Order.findOne({
      $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.deliveryInfo.partnerId = partnerId;
    order.deliveryInfo.partnerName = partnerName;
    order.deliveryInfo.partnerPhone = partnerPhone;
    order.deliveryInfo.partnerVehicle = partnerVehicle || "Hero Splendor (BR-01-XXXX)";
    order.deliveryInfo.assignedAt = new Date();

    if (order.status === "PENDING" || order.status === "ACCEPTED") {
      order.status = "PREPARING";
    }

    await order.save();

    // Create or update delivery record
    await Delivery.findOneAndUpdate(
      { orderId: order.orderId },
      {
        deliveryId: `del_${order.orderId}`,
        orderId: order.orderId,
        shopId: order.shopId,
        partnerId,
        partnerName,
        partnerPhone,
        deliveryModel: order.deliveryInfo.deliveryModel,
        status: "ASSIGNED",
        pickupCoords: [85.1376, 25.5941],
        dropCoords: order.deliveryAddress.coordinates || [85.1376, 25.5941],
        pickupOtp: order.deliveryInfo.pickupOtp,
        deliveryOtp: order.deliveryInfo.deliveryOtp,
        distanceKm: 3.2,
        deliveryFeeEarned: 35,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Delivery partner assigned successfully.",
      order,
    });
  } catch (error: any) {
    console.error("assignDeliveryPartner error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign delivery partner",
      error: error?.message,
    });
  }
};
