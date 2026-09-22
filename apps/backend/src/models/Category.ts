import { Schema, model, Document } from "mongoose";

export interface ISubcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  formConfig: {
    fields: Array<{
      id: string;
      label: string;
      type: string;
      placeholder?: string;
      options?: Array<{ label: string; value: string; priceModifier?: number }>;
      validation: { required: boolean; min?: number; max?: number };
      priceModifierField?: boolean;
    }>;
  };
}

export interface ICategory extends Document {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  subcategories: ISubcategory[];
  isActive: boolean;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema = new Schema<ISubcategory>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: "" },
    basePrice: { type: Number, required: true },
    imageUrl: { type: String, default: "sparkles" },
    formConfig: {
      type: Schema.Types.Mixed,
      default: { fields: [] },
    },
  },
  { _id: false }
);

const CategorySchema = new Schema<ICategory>(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "sparkles",
    },
    subcategories: {
      type: [SubcategorySchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const CategoryModel = model<ICategory>("Category", CategorySchema);
