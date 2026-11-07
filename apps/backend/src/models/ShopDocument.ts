import mongoose, { Schema, Document } from "mongoose";

export interface IShopDocument extends Document {
  shopId: string;
  panNumber?: string;
  panDocUrl?: string;
  gstin?: string;
  gstDocUrl?: string;
  fssaiNumber?: string;
  fssaiDocUrl?: string;
  msmeUdyamNumber?: string;
  msmeDocUrl?: string;
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName?: string;
  };
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShopDocumentSchema: Schema = new Schema(
  {
    shopId: { type: String, required: true, unique: true, index: true },
    panNumber: { type: String, default: "" },
    panDocUrl: { type: String, default: "" },
    gstin: { type: String, default: "" },
    gstDocUrl: { type: String, default: "" },
    fssaiNumber: { type: String, default: "" },
    fssaiDocUrl: { type: String, default: "" },
    msmeUdyamNumber: { type: String, default: "" },
    msmeDocUrl: { type: String, default: "" },
    bankAccount: {
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      accountHolderName: { type: String, default: "" },
      bankName: { type: String, default: "" },
    },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: String, default: "" },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IShopDocument>("ShopDocument", ShopDocumentSchema);
