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

export interface UserSavedAddress {
  id: string;
  type: "Home" | "Work" | "Other";
  flatNo: string;
  street: string;
  landmark?: string;
  city: string;
  pincode: string;
  formattedAddress: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  uid?: string;
  phoneNumber: string;
  phone?: string;
  fullName?: string;
  name?: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  address?: string[];
  savedAddresses?: UserSavedAddress[];
  selectedLocation?: string;
  isVerified?: boolean;
  verified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceAddOn {
  id: string;
  title: string;
  price: number;
  duration?: string;
}

export interface ServiceStep {
  step: number;
  title: string;
  description: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceReviewItem {
  user: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  price: number;
  duration: string;
  image: string;
  imageUrl?: string;
  description: string;
  isAvailable: boolean;
  rating?: number;
  reviewCount?: number;
  warranty?: string;
  inclusions?: string[];
  exclusions?: string[];
  addOns?: ServiceAddOn[];
  steps?: ServiceStep[];
  faq?: ServiceFAQ[];
  reviewsList?: ServiceReviewItem[];
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
  servicesOffered: string[]; // Category IDs or Service IDs
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
  priceModifier?: number;
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
  priceModifierField?: boolean;
}

export interface BookingFormConfig {
  fields: FormField[];
}

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "DRAFT"
  | "PENDING_PROVIDER"
  | "EN_ROUTE"
  | "ARRIVED";

export type PaymentMethod = "UPI" | "WALLET" | "CASH_AFTER_SERVICE" | "COD" | "ONLINE";

export type PaymentStatus = "PENDING" | "PAID" | "COD" | "SUCCESS" | "FAILED" | "REFUNDED";

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
  status: BookingStatus;
  timestamp: string;
  note?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  providerId?: string | null;
  providerName?: string | null;
  providerPhone?: string | null;
  serviceId?: string;
  serviceName?: string;
  categoryId?: string;
  subcategoryId?: string;
  bookingDate?: string;
  timeSlot?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  formValues?: Record<string, any>;
  address: string | {
    formattedAddress: string;
    landmark?: string;
    latitude: number;
    longitude: number;
  };
  selectedAddress?: {
    formattedAddress: string;
    landmark?: string;
    latitude: number;
    longitude: number;
  };
  status: BookingStatus;
  otp?: string;
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  pricing?: PricingDetail;
  timeline?: BookingTimelineEvent[];
  createdAt: string;
  updatedAt?: string;
}

export interface Slot {
  id: string;
  date: string;
  time: string;
  isAvailable: boolean;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: "DEPOSIT" | "WITHDRAWAL" | "BOOKING_PAYMENT" | "COMMISSION" | "REFUND" | "BONUS";
  status: "PENDING" | "SUCCESS" | "FAILED";
  referenceId?: string;
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
  serviceId: string;
  customerId: string;
  reviewerName?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

