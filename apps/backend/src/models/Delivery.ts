import mongoose, { Schema, Document } from "mongoose";

export type DeliveryStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "AT_STORE"
  | "PICKED_UP"
  | "ARRIVED_DOORSTEP"
  | "DELIVERED"
  | "CANCELLED";

export interface IDelivery extends Document {
  deliveryId: string;
  orderId: string;
  shopId: string;
  partnerId: string;
  partnerName: string;
  partnerPhone: string;
  deliveryModel: "SHOP_DELIVERY" | "INISHA_DELIVERY";
  status: DeliveryStatus;
  pickupCoords: [number, number]; // [lng, lat]
  dropCoords: [number, number]; // [lng, lat]
  currentLocation?: {
    type: "Point";
    coordinates: [number, number];
  };
  pickupOtp: string;
  deliveryOtp: string;
  distanceKm: number;
  deliveryFeeEarned: number;
  payoutStatus: "PENDING" | "PAID";
  acceptedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema: Schema = new Schema(
  {
    deliveryId: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    shopId: { type: String, required: true, index: true },
    partnerId: { type: String, required: true, index: true },
    partnerName: { type: String, required: true },
    partnerPhone: { type: String, required: true },
    deliveryModel: {
      type: String,
      enum: ["SHOP_DELIVERY", "INISHA_DELIVERY"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "ASSIGNED",
        "ACCEPTED",
        "AT_STORE",
        "PICKED_UP",
        "ARRIVED_DOORSTEP",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "ASSIGNED",
      index: true,
    },
    pickupCoords: { type: [Number], required: true },
    dropCoords: { type: [Number], required: true },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [85.1376, 25.5941],
      },
    },
    pickupOtp: { type: String, required: true },
    deliveryOtp: { type: String, required: true },
    distanceKm: { type: Number, default: 2.5 },
    deliveryFeeEarned: { type: Number, default: 35 },
    payoutStatus: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

DeliverySchema.index({ currentLocation: "2dsphere" });
DeliverySchema.index({ partnerId: 1, status: 1 });

export default mongoose.model<IDelivery>("Delivery", DeliverySchema);
