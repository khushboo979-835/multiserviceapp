import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  description: string;
  isActive: boolean;
  expiresAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ["PERCENTAGE", "FLAT"], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICoupon>("Coupon", CouponSchema);
