import { Schema, model, Document } from "mongoose";

export interface IProviderProfile extends Document {
  userId: string;
  partnerId: string;
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  isOnline: boolean;
  isApproved: boolean;
  currentCoords?: {
    latitude: number;
    longitude: number;
  };
  documents: string[];
  activeBookingId?: string | null;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProviderProfileSchema = new Schema<IProviderProfile>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    partnerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      default: "",
    },
    passwordHash: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: ["Mobile Repair", "Home Utility"],
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    currentCoords: {
      latitude: { type: Number, default: 28.4905 },
      longitude: { type: Number, default: 77.0815 },
    },
    documents: {
      type: [String],
      default: [],
    },
    activeBookingId: {
      type: String,
      default: null,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const ProviderProfile = model<IProviderProfile>(
  "ProviderProfile",
  ProviderProfileSchema
);
