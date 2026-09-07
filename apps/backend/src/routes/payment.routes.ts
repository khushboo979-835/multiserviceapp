import { Router } from "express";
import {
  initializePayment,
  verifyPayment,
  walletRecharge,
  walletDeduct,
} from "../controllers/payment.controller";

const router = Router();

// Checkout and Razorpay payment triggers
router.post("/checkout/initiate", initializePayment);
router.post("/checkout/verify", verifyPayment);

// Wallet actions
router.post("/wallet/recharge", walletRecharge);
router.post("/wallet/deduct", walletDeduct);

export default router;
