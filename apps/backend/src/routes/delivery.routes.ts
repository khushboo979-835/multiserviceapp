import { Router } from "express";
import {
  getActiveDelivery,
  updateRiderLocation,
  pickupOrder,
  getRiderHistory,
  getAvailableOrders,
  acceptOrder,
  updateDeliveryOrderStatus,
} from "../controllers/delivery.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/active", requireAuth, getActiveDelivery);
router.post("/location", requireAuth, updateRiderLocation);
router.post("/pickup", requireAuth, pickupOrder);
router.get("/history", requireAuth, getRiderHistory);

// Driver order dispatch & status flow (Phase 2)
router.get("/available-orders", requireAuth, getAvailableOrders);
router.put("/orders/:id/accept", requireAuth, acceptOrder);
router.put("/orders/:id/status", requireAuth, updateDeliveryOrderStatus);

export default router;
