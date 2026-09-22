import { Router } from "express";
import {
  createBooking,
  getBookingById,
  getAllBookings,
  updateTelemetry,
  verifyStartOtp,
  updateStatus,
} from "../controllers/booking.controller";

const router = Router();

router.post("/", createBooking);
router.get("/admin/all", getAllBookings);
router.get("/all", getAllBookings);
router.get("/:id", getBookingById);
router.post("/:id/telemetry", updateTelemetry);
router.post("/:id/verify-start-otp", verifyStartOtp);
router.put("/:id/status", updateStatus);

export default router;
