import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

function hashDeliveryPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(plain, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyDeliveryPassword(plain: string, stored: string): boolean {
  if (!stored) return false;
  const parts = stored.split(":");
  if (parts.length !== 2) {
    return plain === stored;
  }
  const [salt, originalHash] = parts;
  const testHash = crypto.pbkdf2Sync(plain, salt, 1000, 64, "sha512").toString("hex");
  return testHash === originalHash;
}

export type VehicleType = "Bike" | "Scooter" | "Van" | "Bicycle";

export interface IDeliveryPartner extends Document {
  partnerId: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  licenseNumber: string;
  aadhaarNumber: string;
  profilePhoto: string;
  isAvailable: boolean;
  isVerified: boolean;
  role: string;
  currentLocation?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  walletBalance: number;
  totalDeliveries: number;
  rating: number;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryPartnerSchema = new Schema<IDeliveryPartner>(
  {
    partnerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: ["Bike", "Scooter", "Van", "Bicycle"],
      default: "Bike",
    },
    vehicleNumber: {
      type: String,
      default: "",
      trim: true,
    },
    licenseNumber: {
      type: String,
      default: "",
      trim: true,
    },
    aadhaarNumber: {
      type: String,
      default: "",
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
      index: true,
    },
    role: {
      type: String,
      default: "delivery",
      index: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [86.7381, 25.2425], // Sultanganj default
      },
    },
    walletBalance: {
      type: Number,
      default: 500,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
  },
  { timestamps: true }
);

// Hash password before saving using built-in Node crypto (PBKDF2-SHA512)
DeliveryPartnerSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = hashDeliveryPassword(this.password);
    next();
  } catch (err: any) {
    next(err);
  }
});

DeliveryPartnerSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return verifyDeliveryPassword(candidate, this.password);
};

DeliveryPartnerSchema.index({ currentLocation: "2dsphere" });

export const DeliveryPartner = mongoose.model<IDeliveryPartner>(
  "DeliveryPartner",
  DeliveryPartnerSchema
);

export default DeliveryPartner;
