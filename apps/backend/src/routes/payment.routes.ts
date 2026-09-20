import { Router } from "express";
import {
  createPaymentIntent,
  submitUtr,
  getBookingPaymentStatus,
  getAdminTransactions,
  verifyTransactionAndSettle,
  walletRecharge,
  walletDeduct,
} from "../controllers/payment.controller";

const router = Router();

// Direct UPI Payment Collection & UTR Submission
router.post("/create-intent", createPaymentIntent);
router.post("/submit-utr", submitUtr);
router.get("/booking/:bookingId/status", getBookingPaymentStatus);

// Admin Ledger & Settlement Routes
router.get("/admin/transactions", getAdminTransactions);
router.patch("/admin/transactions/:id/verify", verifyTransactionAndSettle);
router.put("/admin/transactions/:id/verify", verifyTransactionAndSettle);

// Legacy checkout fallback routes
router.post("/checkout/initiate", createPaymentIntent);
router.post("/checkout/verify", submitUtr);

// Wallet actions
router.post("/wallet/recharge", walletRecharge);
router.post("/wallet/deduct", walletDeduct);

export default router;

