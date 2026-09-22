import mongoose, { Schema, Document } from "mongoose";

export interface IWithdrawal extends Document {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  payoutMethod: "UPI" | "BANK_TRANSFER";
  upiId?: string;
  bankAccount?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolder: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: Date;
  processedAt?: Date;
}

const WithdrawalSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    providerId: { type: String, required: true },
    providerName: { type: String, required: true },
    amount: { type: Number, required: true },
    payoutMethod: { type: String, enum: ["UPI", "BANK_TRANSFER"], default: "UPI" },
    upiId: { type: String },
    bankAccount: {
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
      accountHolder: { type: String },
    },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema);
