import { Request, Response } from "express";
import { User } from "../models/User";
import crypto from "crypto";

interface OtpEntry {
  otp: string;
  expiresAt: number;
}
const otpStore = new Map<string, OtpEntry>();

export const sendOtp = async (req: Request, res: Response) => {
  return res.status(410).json({
    success: false,
    message: "This legacy OTP endpoint is disabled. Use /api/auth/customer/send-otp.",
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp, role } = req.body;
    const cleanPhone = (phoneNumber || "").replace(/\D/g, "").slice(-10);
    if (!cleanPhone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP code are required",
      });
    }

    const stored = otpStore.get(cleanPhone);
    const isValid = Boolean(stored && stored.otp === otp && stored.expiresAt > Date.now());

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP code. Please check and try again.",
      });
    }

    otpStore.delete(cleanPhone);

    let user = await User.findOne({ phoneNumber: "+91" + cleanPhone });
    if (!user) {
      user = await User.create({
        phoneNumber: "+91" + cleanPhone,
        role: role || "CUSTOMER",
        name: "Partner " + cleanPhone.slice(-4),
        kycStatus: "NOT_SUBMITTED",
        walletBalance: 500,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id.toString(),
        phoneNumber: user.phoneNumber,
        role: user.role,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
        kycStatus: user.kycStatus,
      },
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};
