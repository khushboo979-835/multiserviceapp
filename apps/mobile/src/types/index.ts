export type UserRole = "CUSTOMER" | "PROVIDER" | "ADMIN";

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";

export interface GeoLocation {
  latitude: number;
  longitude: number;
  heading?: number | null;
  speed?: number | null;
  accuracy?: number | null;
  timestamp: number;
}

export interface User {
  id: string;
  phoneNumber: string;
  phone?: string;
  role: UserRole;
  name?: string;
  email?: string;
  avatarUrl?: string;
  walletBalance?: number;
  kycStatus?: KycStatus;
  createdAt: string;
  updatedAt: string;
}

export interface KycDocument {
  id: string;
  documentType: "AADHAAR" | "PAN" | "DRIVING_LICENSE" | "BUSINESS_REGISTRATION";
  documentUrl: string;
  status: KycStatus;
  rejectionReason?: string;
  uploadedAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  businessName?: string;
  servicesOffered: string[]; // Category IDs or Subcategory IDs
  kycStatus: KycStatus;
  documents: KycDocument[];
  isAvailable: boolean;
  currentLocation?: GeoLocation;
  averageRating: number;
  reviewCount: number;
  walletBalance: number;
  activeBookingId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  subcategories: Subcategory[];
  isActive: boolean;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  formConfig: BookingFormConfig;
}

export type FormFieldType =
  | "TEXT"
  | "NUMBER"
  | "SELECT"
  | "MULTI_SELECT"
  | "DATE"
  | "TIME_SLOT"
  | "ADDRESS_GPS"
  | "IMAGE";

export interface FormFieldOption {
  label: string;
  value: string;
  priceModifier?: number; // Adjusts base price (e.g. tablet repair is +$10)
}

export interface FormValidationRules {
  required: boolean;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  options?: FormFieldOption[];
  validation: FormValidationRules;
  priceModifierField?: boolean; // If selections in this field adjust the total price
}

export interface BookingFormConfig {
  fields: FormField[];
}

export type BookingStatus =
  | "DRAFT"
  | "PENDING_PROVIDER"
  | "ACCEPTED"
  | "EN_ROUTE"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "UPI" | "WALLET" | "CASH_AFTER_SERVICE";

export type PaymentStatus = "PENDING" | "UNDER_REVIEW" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface PricingDetail {
  basePrice: number;
  tax: number;
  commission: number;
  couponDiscount: number;
  addOnPrice: number;
  providerEarnings: number;
  finalAmount: number;
}

export interface BookingTimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  providerId?: string | null;
  providerName?: string | null;
  providerPhone?: string | null;
  categoryId: string;
  subcategoryId: string;
  formValues: Record<string, any>;
  selectedAddress: {
    formattedAddress: string;
    landmark?: string;
    latitude: number;
    longitude: number;
  };
  status: BookingStatus;
  otp?: string; // OTP to verify service completion or arrival
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  utrNumber?: string;
  transactionId?: string;
  pricing: PricingDetail;
  timeline: BookingTimelineEvent[];
  scheduledDate: string;
  scheduledTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  isAvailable: boolean;
}

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "BOOKING_PAYMENT"
  | "COMMISSION"
  | "REFUND"
  | "BONUS";

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  status: "PENDING" | "SUCCESS" | "FAILED";
  referenceId?: string; // Booking ID or Withdrawal request ID
  description: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
  targetId: string; // Provider ID or Customer ID
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

// Socket Events Payload types
export interface SocketEventPayloads {
  // Provider Update Location
  "provider:update-location": {
    providerId: string;
    location: GeoLocation;
  };
  // Location updated broadcast to customer
  "provider:location-changed": {
    providerId: string;
    location: GeoLocation;
  };
  // Join booking tracking room
  "booking:join-room": {
    bookingId: string;
  };
  // Status change event
  "booking:status-changed": {
    bookingId: string;
    status: BookingStatus;
    timeline: BookingTimelineEvent[];
  };
  // Provider accepts booking request
  "booking:accepted": {
    bookingId: string;
    providerId: string;
    providerName: string;
    providerPhone: string;
    providerLocation: GeoLocation;
  };
  // Real-time Chat
  "chat:send-message": {
    bookingId: string;
    senderId: string;
    text: string;
    timestamp: string;
  };
  "chat:message-received": {
    bookingId: string;
    senderId: string;
    text: string;
    timestamp: string;
  };
}
