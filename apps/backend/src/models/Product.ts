import mongoose, { Schema, Document } from "mongoose";

export interface IProductVariant {
  name: string;
  options: string[];
  price?: number;
  mrp?: number;
  image?: string;
}

export interface IProductSpecification {
  label: string;
  value: string;
}

export interface IProduct extends Document {
  id: string;
  name: string;
  category: "MOBILE_PHONES" | "MOBILE_ACCESSORIES" | "GROCERY" | "BEAUTY_PARLOUR" | "HOME_NEEDS" | "ELECTRONICS";
  categoryName: string;
  description: string;
  price: number;
  originalPrice: number;
  mrp?: number;
  discountPercentage: number;
  unit: string;
  imageUrl: string;
  images: string[];
  inStock: boolean;
  stock?: number;
  rating: number;
  ratingsCount?: number;
  deliveryTimeMins: number;
  sellerName?: string;
  brand?: string;
  variants?: IProductVariant[];
  specifications?: IProductSpecification[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["MOBILE_PHONES", "MOBILE_ACCESSORIES", "GROCERY", "BEAUTY_PARLOUR", "HOME_NEEDS", "ELECTRONICS"],
      required: true,
    },
    categoryName: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    mrp: { type: Number },
    discountPercentage: { type: Number, default: 0 },
    unit: { type: String, default: "1 Unit" },
    imageUrl: { type: String, required: true },
    images: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    stock: { type: Number, default: 100 },
    rating: { type: Number, default: 4.8 },
    ratingsCount: { type: Number, default: 120 },
    deliveryTimeMins: { type: Number, default: 30 },
    sellerName: { type: String, default: "Inisha Retail Partner" },
    brand: { type: String, default: "" },
    variants: [
      {
        name: { type: String, required: true },
        options: { type: [String], default: [] },
        price: { type: Number },
        mrp: { type: Number },
        image: { type: String },
      },
    ],
    specifications: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);

