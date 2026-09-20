import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  phoneNumber: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  name?: string;
  email?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isBlocked: boolean;
  walletBalance: number;
  kycStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["CUSTOMER", "PROVIDER", "ADMIN"],
      required: true,
      default: "CUSTOMER",
      index: true,
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    walletBalance: {
      type: Number,
      default: 250,
    },
    kycStatus: {
      type: String,
      default: "APPROVED",
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, createdAt: -1 });

export const User = model<IUser>("User", UserSchema);
