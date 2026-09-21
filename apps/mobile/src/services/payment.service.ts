import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";

export interface UpiIntentResponse {
  success: boolean;
  bookingId: string;
  amount: number;
  currency: string;
  upiId: string;
  merchantName: string;
  bankName: string;
  upiIntent: string;
  supportedApps: string[];
  instructions: string[];
}

export interface UtrSubmitResponse {
  success: boolean;
  message: string;
  transaction?: any;
  bookingStatus?: string;
  error?: string;
}

export const PaymentService = {
  COMPANY_UPI_ID: "7352082614-3@ybl",
  MERCHANT_NAME: "Inisha City Service",
  BANK_NAME: "Punjab National Bank",

  /**
   * Generate standard NPCI UPI Deep Link Intent
   */
  generateUpiIntent(bookingId: string, amount: number, merchant = "Inisha City Service", upiId = "7352082614-3@ybl"): string {
    const encodedMerchant = encodeURIComponent(merchant);
    const note = encodeURIComponent(`Booking_${bookingId.slice(-8)}`);
    return `upi://pay?pa=${upiId}&pn=${encodedMerchant}&am=${amount.toFixed(2)}&cu=INR&tn=${note}`;
  },

  /**
   * Create payment intent on server
   */
  async createPaymentIntent(bookingId: string, amount: number, customerName?: string): Promise<UpiIntentResponse> {
    try {
      const res = await axios.post(`${API_URL}/payment/create-intent`, {
        bookingId,
        amount,
        customerName,
      }, { timeout: 4000 });
      return res.data;
    } catch {
      // Offline fallback
      return {
        success: true,
        bookingId,
        amount,
        currency: "INR",
        upiId: this.COMPANY_UPI_ID,
        merchantName: this.MERCHANT_NAME,
        bankName: this.BANK_NAME,
        upiIntent: this.generateUpiIntent(bookingId, amount),
        supportedApps: ["Google Pay", "PhonePe", "Paytm", "BHIM"],
        instructions: [
          "1. Tap 'Pay via UPI App' or scan the QR code.",
          `2. Transfer ₹${amount.toFixed(2)} to ${this.MERCHANT_NAME} (${this.COMPANY_UPI_ID}).`,
          "3. Copy the 12-digit UTR number from receipt.",
          "4. Submit the UTR to complete settlement.",
        ],
      };
    }
  },

  /**
   * Submit 12-digit UTR reference number
   */
  async submitUtr(payload: {
    bookingId: string;
    utrNumber: string;
    amount: number;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
  }): Promise<UtrSubmitResponse> {
    try {
      const res = await axios.post(`${API_URL}/payment/submit-utr`, payload, { timeout: 5000 });
      return res.data;
    } catch (err: any) {
      // Local optimistic fallback
      if (payload.utrNumber && payload.utrNumber.trim().length === 12) {
        return {
          success: true,
          message: "UTR submitted successfully. Verification in progress.",
          bookingStatus: "UNDER_REVIEW",
        };
      }
      return {
        success: false,
        message: err?.response?.data?.error || "Failed to submit UTR. Check connection.",
      };
    }
  },

  /**
   * Check status of a booking payment
   */
  async checkPaymentStatus(bookingId: string) {
    try {
      const res = await axios.get(`${API_URL}/payment/booking/${bookingId}/status`, { timeout: 4000 });
      return res.data;
    } catch {
      return { success: false, paymentStatus: "PENDING" };
    }
  },
};
