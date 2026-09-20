import { Schema, model, Document } from "mongoose";

export interface IService extends Document {
  title: string;
  category: string;
  description: string;
  price: number;
  discountedPrice?: number;
  duration: string;
  mediaUrls: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: "45-60 mins",
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Service = model<IService>("Service", ServiceSchema);
