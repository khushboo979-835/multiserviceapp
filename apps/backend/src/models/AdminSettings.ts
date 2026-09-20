import { Schema, model, Document } from "mongoose";

export interface IAdminSettings extends Document {
  companyUpiId: string;
  merchantName: string;
  commissionRate: number;
  supportContact: string;
  supportEmail: string;
  enableAutoDispatch: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSettingsSchema = new Schema<IAdminSettings>(
  {
    companyUpiId: {
      type: String,
      default: "7352082614-3@ybl",
    },
    merchantName: {
      type: String,
      default: "Inisha City Service",
    },
    commissionRate: {
      type: Number,
      default: 15, // 15% platform commission
    },
    supportContact: {
      type: String,
      default: "+91 98765 43210",
    },
    supportEmail: {
      type: String,
      default: "support@inishacityservice.com",
    },
    enableAutoDispatch: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const AdminSettings = model<IAdminSettings>(
  "AdminSettings",
  AdminSettingsSchema
);
