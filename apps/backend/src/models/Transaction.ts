import { Schema, model, Document } from "mongoose";

export interface ITransaction extends Document {
  transactionId: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  providerId?: string;
  providerName?: string;
  amount: number;
  upiId: string;
  merchantName: string;
  utrNumber: string;
  status: "PENDING" | "VERIFIED" | "FAILED";
  paymentMethod: "UPI" | "WALLET" | "CASH";
  commissionRate: number; // e.g. 15%
  commissionAmount: number;
  providerPayout: number;
  verifiedAt?: Date;
  verifiedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookingId: {
      type: String,
      required: true,
      index: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
    },
    providerId: {
      type: String,
    },
    providerName: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    upiId: {
      type: String,
      default: "7352082614-3@ybl",
    },
    merchantName: {
      type: String,
      default: "Inisha City Service",
    },
    utrNumber: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "WALLET", "CASH"],
      default: "UPI",
    },
    commissionRate: {
      type: Number,
      default: 15,
    },
    commissionAmount: {
      type: Number,
      default: 0,
    },
    providerPayout: {
      type: Number,
      default: 0,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = model<ITransaction>("Transaction", TransactionSchema);
