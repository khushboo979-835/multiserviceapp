import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type OrderPaymentMethod = "COD" | "ONLINE" | "WALLET";
export type OrderPaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  variant?: string;
  imageUrl?: string;
  foodType?: "VEG" | "NON_VEG";
}

export interface IOrderPricing {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  packagingFee: number;
  total: number;
}

export interface IOrderDeliveryAddress {
  street: string;
  landmark?: string;
  city: string;
  pincode: string;
  coordinates?: [number, number]; // [lng, lat]
  phone: string;
}

export interface IOrderDeliveryInfo {
  deliveryModel: "SHOP_DELIVERY" | "INISHA_DELIVERY";
  partnerId?: string;
  partnerName?: string;
  partnerPhone?: string;
  partnerVehicle?: string;
  pickupOtp?: string; // 4-digit security code for shop pickup
  deliveryOtp?: string; // 4-digit code customer gives to delivery boy
  assignedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
}

export interface IOrder extends Document {
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  shopId: string;
  shopName: string;
  items: IOrderItem[];
  pricing: IOrderPricing;
  deliveryAddress: IOrderDeliveryAddress;
  status: OrderStatus;
  deliveryInfo: IOrderDeliveryInfo;
  paymentMethod: OrderPaymentMethod;
  paymentStatus: OrderPaymentStatus;
  paymentTransactionId?: string;
  orderNotes?: string;
  cancelledReason?: string;
  estimatedDeliveryTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shopId: { type: String, required: true, index: true },
    shopName: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        quantity: { type: Number, required: true, min: 1 },
        variant: { type: String, default: "" },
        imageUrl: { type: String, default: "" },
        foodType: { type: String, enum: ["VEG", "NON_VEG"], default: undefined },
      },
    ],
    pricing: {
      subtotal: { type: Number, required: true },
      deliveryFee: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      packagingFee: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    deliveryAddress: {
      street: { type: String, required: true },
      landmark: { type: String, default: "" },
      city: { type: String, default: "Patna" },
      pincode: { type: String, default: "800001" },
      coordinates: { type: [Number], default: [85.1376, 25.5941] },
      phone: { type: String, required: true },
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "PREPARING",
        "READY_FOR_PICKUP",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
      index: true,
    },
    deliveryInfo: {
      deliveryModel: {
        type: String,
        enum: ["SHOP_DELIVERY", "INISHA_DELIVERY"],
        default: "INISHA_DELIVERY",
      },
      partnerId: { type: String, default: "" },
      partnerName: { type: String, default: "" },
      partnerPhone: { type: String, default: "" },
      partnerVehicle: { type: String, default: "" },
      pickupOtp: { type: String, default: "" },
      deliveryOtp: { type: String, default: "" },
      assignedAt: { type: Date },
      pickedUpAt: { type: Date },
      deliveredAt: { type: Date },
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE", "WALLET"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    paymentTransactionId: { type: String, default: "" },
    orderNotes: { type: String, default: "" },
    cancelledReason: { type: String, default: "" },
    estimatedDeliveryTime: { type: String, default: "30-45 mins" },
  },
  { timestamps: true }
);

OrderSchema.index({ shopId: 1, status: 1 });
OrderSchema.index({ customerId: 1, createdAt: -1 });

export default mongoose.model<IOrder>("Order", OrderSchema);
