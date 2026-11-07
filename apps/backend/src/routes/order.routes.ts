import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getShopOrders,
  getOrderById,
  updateOrderStatus,
  verifyDeliveryOtp,
  assignDeliveryPartner,
} from "../controllers/order.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// Customer checkout & orders
router.post("/checkout", createOrder);
router.get("/my-orders", requireAuth, getMyOrders);

// Shop Orders
router.get("/shop/:shopId", requireAuth, getShopOrders);

// Order lookup & status
router.get("/:id", getOrderById);
router.put("/:id/status", requireAuth, updateOrderStatus);

// OTP Verification & Rider Assignment
router.post("/:id/verify-otp", requireAuth, verifyDeliveryOtp);
router.post("/:id/assign-partner", requireAuth, assignDeliveryPartner);

export default router;
