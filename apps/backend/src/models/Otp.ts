import { Schema, model, Document } from "mongoose";

export interface IOtp extends Document {
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // MongoDB TTL index automatically purges expired OTP documents
    },
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

OtpSchema.index({ phone: 1, createdAt: -1 });

export const Otp = model<IOtp>("Otp", OtpSchema);
