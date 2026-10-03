import { Schema, model, Document } from "mongoose";

export interface IBanner extends Document {
  title: string;
  subtitle: string;
  tag: string;
  imageUrl: string;
  targetCategory: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    tag: { type: String, default: "OFFER", trim: true },
    imageUrl: { type: String, required: true, trim: true },
    targetCategory: { type: String, default: "All Services", trim: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BannerModel = model<IBanner>("Banner", BannerSchema);