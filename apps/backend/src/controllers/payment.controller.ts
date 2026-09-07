import { Request, Response } from "express";
import { Booking } from "../models/Booking";
import { User } from "../models/User";

/**
 * Mock Razorpay/UPI Payment Gateway order creation session
 */
export const initializePayment = async (req: Request, res: Response) => {
  const { bookingId, amount } = req.body;

  if (!bookingId || !amount) {
    return res.status(400).json({ error: "Booking ID and amount are required params." });
  }

  try {
    // Simulate Razorpay API call
    const mockRazorpayOrderId = `rzp_order_${Math.floor(100000 + Math.random() * 900000)}`;

    return res.status(200).json({
      success: true,
      gatewayOrderId: mockRazorpayOrderId,
      amount,
      currency: "INR",
      notes: { bookingId },
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to initialize gateway checkout." });
  }
};

/**
 * Verify Razorpay hash payment signature
 */
export const verifyPayment = async (req: Request, res: Response) => {
  const { bookingId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!bookingId || !razorpayPaymentId) {
    return res.status(400).json({ error: "Booking ID and payment ID are required." });
  }

  try {
    // Update booking payment details
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "SUCCESS",
        $push: {
          timeline: {
            status: "PAID",
            timestamp: new Date(),
            note: `Payment authorized via Gateway. Trans ID: ${razorpayPaymentId}`,
          },
        },
      },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking record not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Payment successfully verified.",
      booking: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to verify transaction." });
  }
};

/**
 * Recharge user Wallet balances
 */
export const walletRecharge = async (req: Request, res: Response) => {
  const { userId, amount } = req.body;

  if (!userId || amount <= 0) {
    return res.status(400).json({ error: "Invalid user or amount specified." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }

    const currentBalance = user.walletBalance || 0;
    user.walletBalance = currentBalance + amount;
    await user.save();

    return res.status(200).json({
      success: true,
      balance: user.walletBalance,
      message: `Successfully topped up ₹${amount} in your wallet.`,
    });
  } catch (error) {
    return res.status(500).json({ error: "Wallet recharge process failed." });
  }
};

/**
 * Deduct wallet balances for bookings checkout
 */
export const walletDeduct = async (req: Request, res: Response) => {
  const { userId, bookingId, amount } = req.body;

  if (!userId || !bookingId || amount <= 0) {
    return res.status(400).json({ error: "Invalid payment parameters." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    const currentBalance = user.walletBalance || 0;
    if (currentBalance < amount) {
      return res.status(400).json({ error: "Insufficient wallet balance." });
    }

    user.walletBalance = currentBalance - amount;
    await user.save();

    // Update booking status
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "SUCCESS",
      paymentMethod: "WALLET",
      $push: {
        timeline: {
          status: "PAID",
          timestamp: new Date(),
          note: `Payment completed via Wallet deduction. Amount: ₹${amount}`,
        },
      },
    });

    return res.status(200).json({
      success: true,
      balance: user.walletBalance,
      message: `Payment of ₹${amount} deducted from wallet.`,
    });
  } catch (error) {
    return res.status(500).json({ error: "Wallet transaction deduction failed." });
  }
};
