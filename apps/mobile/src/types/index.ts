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

export type ProductTypeCategory =
  | "MOBILE_PHONES"
  | "MOBILE_ACCESSORIES"
  | "GROCERY"
  | "HOME_NEEDS"
  | "ELECTRONICS";

export interface Product {
  id: string;
  name: string;
  category: ProductTypeCategory;
  categoryName: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  unit: string;
  imageUrl: string;
  inStock: boolean;
  rating: number;
  deliveryTimeMins: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  description: string;
  expiresAt: string;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  actionPayload?: {
    type: "OPEN_SERVICE" | "OPEN_PRODUCT" | "APPLY_COUPON";
    targetId: string;
    title: string;
  };
}

export interface GSTInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  companyName: string;
  companyGstin: string;
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  serviceName: string;
  hsnSacCode: string;
  basePrice: number;
  cgstAmount: number; // 9%
  sgstAmount: number; // 9%
  convenienceFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
}

export interface WithdrawalRequest {
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
  requestedAt: string;
  processedAt?: string;
}

export interface FranchiseCity {
  id: string;
  cityName: string;
  state: string;
  isActive: boolean;
  managerName: string;
  managerPhone: string;
  totalProviders: number;
  monthlyGmv: number;
}

export interface DisputeTicket {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  providerId?: string;
  issueType: "POOR_SERVICE" | "OVERCHARGED" | "NO_SHOW" | "DAMAGED_ITEM" | "OTHER";
  description: string;
  status: "OPEN" | "INVESTIGATING" | "REFUNDED" | "RESOLVED";
  refundAmount?: number;
  createdAt: string;
}

export interface AttendanceRecord {
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  totalHours: number;
  status: "PRESENT" | "HALF_DAY" | "ABSENT";
}

