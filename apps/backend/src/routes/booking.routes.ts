import { Router } from "express";
import {
  createBooking,
  createRepairBooking,
  getMyBookings,
  getBookingById,
  getAllBookings,
  updateTelemetry,
  verifyStartOtp,
  updateStatus,
} from "../controllers/booking.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireAuth, createBooking);
router.post("/repair", requireAuth, createRepairBooking);
router.get("/my-bookings", requireAuth, getMyBookings);
router.get("/admin/all", requireAuth, requireRole("ADMIN"), getAllBookings);
router.get("/all", requireAuth, requireRole("ADMIN"), getAllBookings);
router.get("/:id", requireAuth, getBookingById);
router.post("/:id/telemetry", updateTelemetry);
router.post("/:id/verify-start-otp", verifyStartOtp);
router.put("/:id/status", requireAuth, updateStatus);

export default router;
