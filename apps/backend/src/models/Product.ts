import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  id: string;
  name: string;
  category: "MOBILE_PHONES" | "MOBILE_ACCESSORIES" | "GROCERY" | "HOME_NEEDS" | "ELECTRONICS";
  categoryName: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  unit: string;
  imageUrl: string;
  inStock: boolean;
  rating: number;
  deliveryTimeMins: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["MOBILE_PHONES", "MOBILE_ACCESSORIES", "GROCERY", "HOME_NEEDS", "ELECTRONICS"],
      required: true,
    },
    categoryName: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    unit: { type: String, default: "1 Unit" },
    imageUrl: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    deliveryTimeMins: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
