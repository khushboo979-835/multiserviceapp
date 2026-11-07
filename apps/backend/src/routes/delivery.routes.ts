import { Router } from "express";
import {
  getActiveDelivery,
  updateRiderLocation,
  pickupOrder,
  getRiderHistory,
} from "../controllers/delivery.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/active", requireAuth, getActiveDelivery);
router.post("/location", requireAuth, updateRiderLocation);
router.post("/pickup", requireAuth, pickupOrder);
router.get("/history", requireAuth, getRiderHistory);

export default router;
