import { Schema, model, Document } from "mongoose";

export interface IService extends Document {
  serviceId?: string;
  serviceName: string;
  title: string;
  category: string;
  subCategory?: string;
  description: string;
  price: number;
  discountedPrice?: number;
  duration: string;
  imageUrl?: string;
  mediaUrls: string[];
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    serviceId: {
      type: String,
      index: true,
      default: "",
    },
    serviceName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      index: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    subCategory: {
      type: String,
      default: "",
      index: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: "30 min",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
    reviewCount: {
      type: Number,
      default: 42,
    },
  },
  { timestamps: true }
);

// Pre-save to sync title with serviceName and imageUrl with mediaUrls
ServiceSchema.pre("save", function (next) {
  if (!this.title && this.serviceName) {
    this.title = this.serviceName;
  } else if (!this.serviceName && this.title) {
    this.serviceName = this.title;
  }
  if (this.imageUrl && (!this.mediaUrls || this.mediaUrls.length === 0)) {
    this.mediaUrls = [this.imageUrl];
  } else if (this.mediaUrls && this.mediaUrls.length > 0 && !this.imageUrl) {
    this.imageUrl = this.mediaUrls[0];
  }
  next();
});

ServiceSchema.index({ category: 1, subCategory: 1, isActive: 1 });

export const Service = model<IService>("Service", ServiceSchema);
export default Service;
