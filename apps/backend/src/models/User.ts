import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  phoneNumber: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  name?: string;
  email?: string;
  avatarUrl?: string;
  // Provider specific details
  isAvailable?: boolean;
  kycStatus?: "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";
  servicesOffered?: string[];
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
    heading?: number;
    timestamp?: number;
  };
  averageRating?: number;
  reviewCount?: number;
  walletBalance?: number;
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
    isAvailable: {
      type: Boolean,
      default: false,
    },
    kycStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "NOT_SUBMITTED"],
      default: "NOT_SUBMITTED",
    },
    servicesOffered: [
      {
        type: String,
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      heading: Number,
      timestamp: Number,
    },
    averageRating: {
      type: Number,
      default: 5.0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create GeoJSON 2dsphere index for location proximity searches
UserSchema.index({ location: "2dsphere" });

export const User = model<IUser>("User", UserSchema);
