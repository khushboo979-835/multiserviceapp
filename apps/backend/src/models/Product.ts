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

export type ProductType = "RETAIL" | "FOOD" | "GROCERY" | "ELECTRONICS";

export interface IFoodAttributes {
  isVeg: boolean;
  prepTimeMins?: number;
  spicyLevel?: "MILD" | "MEDIUM" | "SPICY";
  calories?: number;
}

export interface IGroceryAttributes {
  shelfLifeDays?: number;
  isPerishable?: boolean;
  originCountry?: string;
}

export interface IElectronicsAttributes {
  warrantyMonths?: number;
  brand?: string;
  modelNumber?: string;
  inTheBox?: string[];
}

export interface IProduct extends Document {
  id: string;
  shopId: string;
  shopName: string;
  productType: ProductType;
  name: string;
  category: string;
  offerTitle?: string;
  couponCode?: string;
  offerDescription?: string;
  badgeText?: string;
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
  foodAttributes?: IFoodAttributes;
  groceryAttributes?: IGroceryAttributes;
  electronicsAttributes?: IElectronicsAttributes;
  variants?: IProductVariant[];
  specifications?: IProductSpecification[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    shopId: { type: String, default: "inisha_official", index: true },
    shopName: { type: String, default: "Inisha Central Store" },
    productType: {
      type: String,
      enum: ["RETAIL", "FOOD", "GROCERY", "ELECTRONICS"],
      default: "RETAIL",
      index: true,
    },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      index: true,
    },
    offerTitle: { type: String, default: "" },
    couponCode: { type: String, default: "" },
    offerDescription: { type: String, default: "" },
    badgeText: { type: String, default: "" },
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
    foodAttributes: {
      isVeg: { type: Boolean, default: true },
      prepTimeMins: { type: Number, default: 20 },
      spicyLevel: { type: String, enum: ["MILD", "MEDIUM", "SPICY"], default: "MILD" },
      calories: { type: Number },
    },
    groceryAttributes: {
      shelfLifeDays: { type: Number, default: 180 },
      isPerishable: { type: Boolean, default: false },
      originCountry: { type: String, default: "India" },
    },
    electronicsAttributes: {
      warrantyMonths: { type: Number, default: 12 },
      brand: { type: String, default: "" },
      modelNumber: { type: String, default: "" },
      inTheBox: { type: [String], default: [] },
    },
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

ProductSchema.index({ shopId: 1, category: 1 });

export default mongoose.model<IProduct>("Product", ProductSchema);
