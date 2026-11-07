import mongoose, { Schema, Document } from "mongoose";

export type ShopCategoryType =
  | "RESTAURANT"
  | "GROCERY"
  | "MOBILE_ELECTRONICS"
  | "SWEETS_BAKERY"
  | "BEAUTY_WELLNESS"
  | "GENERAL";

export type DeliveryModelType = "SHOP_DELIVERY" | "INISHA_DELIVERY" | "HYBRID";

export interface IShopAddress {
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IShopOpeningHours {
  openTime: string; // e.g. "09:00 AM"
  closeTime: string; // e.g. "10:00 PM"
  isOpen: boolean;
  daysOpen?: string[];
}

export interface IShopDeliverySettings {
  deliveryModel: DeliveryModelType;
  radiusKm: number;
  minOrderAmount: number;
  baseDeliveryFee: number;
  freeDeliveryThreshold: number;
  estimatedPrepMins: number;
}

export interface IShop extends Document {
  shopId: string;
  ownerId?: string;
  name: string;
  legalName?: string;
  category: ShopCategoryType;
  subCategories: string[];
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  phone: string;
  email?: string;
  address: IShopAddress;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  openingHours: IShopOpeningHours;
  deliverySettings: IShopDeliverySettings;
  commissionRate: number;
  rating: number;
  ratingsCount: number;
  fssaiNumber?: string;
  gstin?: string;
  isVerified: boolean;
  isActive: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShopSchema: Schema = new Schema(
  {
    shopId: { type: String, required: true, unique: true, index: true },
    ownerId: { type: String, default: "", index: true },
    name: { type: String, required: true },
    legalName: { type: String, default: "" },
    category: {
      type: String,
      enum: [
        "RESTAURANT",
        "GROCERY",
        "MOBILE_ELECTRONICS",
        "SWEETS_BAKERY",
        "BEAUTY_WELLNESS",
        "GENERAL",
      ],
      required: true,
      index: true,
    },
    subCategories: { type: [String], default: [] },
    description: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    coverImageUrl: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    address: {
      street: { type: String, required: true },
      landmark: { type: String, default: "" },
      city: { type: String, default: "Patna" },
      state: { type: String, default: "Bihar" },
      pincode: { type: String, default: "800001" },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [85.1376, 25.5941],
        required: true,
      },
    },
    openingHours: {
      openTime: { type: String, default: "09:00 AM" },
      closeTime: { type: String, default: "10:00 PM" },
      isOpen: { type: Boolean, default: true },
      daysOpen: {
        type: [String],
        default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
    },
    deliverySettings: {
      deliveryModel: {
        type: String,
        enum: ["SHOP_DELIVERY", "INISHA_DELIVERY", "HYBRID"],
        default: "INISHA_DELIVERY",
      },
      radiusKm: { type: Number, default: 10 },
      minOrderAmount: { type: Number, default: 99 },
      baseDeliveryFee: { type: Number, default: 25 },
      freeDeliveryThreshold: { type: Number, default: 499 },
      estimatedPrepMins: { type: Number, default: 20 },
    },
    commissionRate: { type: Number, default: 8 },
    rating: { type: Number, default: 4.8 },
    ratingsCount: { type: Number, default: 1 },
    fssaiNumber: { type: String, default: "" },
    gstin: { type: String, default: "" },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ShopSchema.index({ location: "2dsphere" });
ShopSchema.index({ category: 1, isActive: 1 });

export default mongoose.model<IShop>("Shop", ShopSchema);
