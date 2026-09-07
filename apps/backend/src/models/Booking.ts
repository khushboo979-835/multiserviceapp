import { Schema, model, Document } from "mongoose";

export interface IBooking extends Document {
  customerId: string;
  customerName: string;
  customerPhone: string;
  providerId?: string;
  providerName?: string;
  providerPhone?: string;
  categoryId: string;
  subcategoryId: string;
  formValues: Record<string, any>;
  selectedAddress: {
    formattedAddress: string;
    landmark?: string;
    latitude: number;
    longitude: number;
  };
  status:
    | "DRAFT"
    | "PENDING_PROVIDER"
    | "ACCEPTED"
    | "EN_ROUTE"
    | "ARRIVED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  otp?: string;
  paymentMethod: "UPI" | "WALLET" | "CASH_AFTER_SERVICE";
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  pricing: {
    basePrice: number;
    tax: number;
    commission: number;
    couponDiscount: number;
    addOnPrice: number;
    providerEarnings: number;
    finalAmount: number;
  };
  timeline: {
    status: string;
    timestamp: Date;
    note?: string;
  }[];
  scheduledDate: string;
  scheduledTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    providerId: {
      type: String,
      index: true,
      default: null,
    },
    providerName: {
      type: String,
      default: "",
    },
    providerPhone: {
      type: String,
      default: "",
    },
    categoryId: {
      type: String,
      required: true,
    },
    subcategoryId: {
      type: String,
      required: true,
    },
    formValues: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    selectedAddress: {
      formattedAddress: { type: String, required: true },
      landmark: String,
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_PROVIDER",
        "ACCEPTED",
        "EN_ROUTE",
        "ARRIVED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      required: true,
      default: "DRAFT",
    },
    otp: String,
    paymentMethod: {
      type: String,
      enum: ["UPI", "WALLET", "CASH_AFTER_SERVICE"],
      required: true,
      default: "CASH_AFTER_SERVICE",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      required: true,
      default: "PENDING",
    },
    pricing: {
      basePrice: { type: Number, required: true },
      tax: { type: Number, required: true },
      commission: { type: Number, required: true },
      couponDiscount: { type: Number, default: 0 },
      addOnPrice: { type: Number, default: 0 },
      providerEarnings: { type: Number, required: true },
      finalAmount: { type: Number, required: true },
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    scheduledDate: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// GeoIndex on booking address coordinate parameters for geo query matches
BookingSchema.index({ "selectedAddress.latitude": 1, "selectedAddress.longitude": 1 });

export const Booking = model<IBooking>("Booking", BookingSchema);
