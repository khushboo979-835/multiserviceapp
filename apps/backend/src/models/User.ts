import { Schema, model, Document } from "mongoose";

export type AppUserRole =
  | "CUSTOMER"
  | "PROVIDER"
  | "ADMIN"
  | "SHOP_OWNER"
  | "SHOP_DELIVERY"
  | "INISHA_DELIVERY"
  | "TECHNICIAN";

export interface IUser extends Document {
  phoneNumber: string;
  role: AppUserRole;
  name?: string;
  email?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isBlocked: boolean;
  walletBalance: number;
  kycStatus?: string;
  shopId?: string;
  assignedPartnerId?: string;
  deliveryVehicleType?: "BIKE" | "SCOOTER" | "BICYCLE" | "VAN";
  deliveryVehicleNumber?: string;
  isOnline?: boolean;
  currentLocation?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
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
      enum: [
        "CUSTOMER",
        "PROVIDER",
        "ADMIN",
        "SHOP_OWNER",
        "SHOP_DELIVERY",
        "INISHA_DELIVERY",
        "TECHNICIAN",
      ],
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
    shopId: {
      type: String,
      default: "",
      index: true,
    },
    assignedPartnerId: {
      type: String,
      default: "",
      index: true,
    },
    deliveryVehicleType: {
      type: String,
      enum: ["BIKE", "SCOOTER", "BICYCLE", "VAN"],
      default: "BIKE",
    },
    deliveryVehicleNumber: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [85.1376, 25.5941], // Default Patna coordinates
      },
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ currentLocation: "2dsphere" });

export const User = model<IUser>("User", UserSchema);
