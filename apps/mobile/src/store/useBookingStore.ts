import { create } from "zustand";
import { Booking, BookingStatus, ProviderProfile, PaymentMethod, PricingDetail, BookingTimelineEvent, ServiceItem } from "../types";

interface BookingState {
  servicesCatalog: ServiceItem[];
  activeBooking: Booking | null;
  draftBooking: Partial<Booking> | null;
  nearbyProviders: ProviderProfile[];
  bookingHistory: Booking[];
  isTracking: boolean;

  // Actions
  setServicesCatalog: (services: ServiceItem[]) => void;
  initDraftBooking: (categoryId: string, subcategoryId: string, basePrice: number, serviceName?: string) => void;
  updateDraftFormValues: (values: Record<string, any>) => void;
  updateDraftAddress: (address: any) => void;
  updateDraftSlot: (date: string, time: string) => void;
  updateDraftPricing: (pricing: PricingDetail) => void;
  updateDraftPaymentMethod: (method: PaymentMethod) => void;
  setDraftBooking: (booking: Partial<Booking> | null) => void;
  setActiveBooking: (booking: Booking | null) => void;
  updateActiveBookingStatus: (status: BookingStatus, timeline?: BookingTimelineEvent[]) => void;
  setNearbyProviders: (providers: ProviderProfile[]) => void;
  setBookingHistory: (bookings: Booking[]) => void;
  setTracking: (isTracking: boolean) => void;
  resetBookingStore: () => void;
}

const initialPricing: PricingDetail = {
  basePrice: 0,
  tax: 0,
  commission: 0,
  couponDiscount: 0,
  addOnPrice: 0,
  providerEarnings: 0,
  finalAmount: 0,
};

export const useBookingStore = create<BookingState>((set) => ({
  servicesCatalog: [],
  activeBooking: null,
  draftBooking: null,
  nearbyProviders: [],
  bookingHistory: [],
  isTracking: false,

  setServicesCatalog: (servicesCatalog) => set({ servicesCatalog }),

  initDraftBooking: (categoryId, subcategoryId, basePrice, serviceName) =>
    set({
      draftBooking: {
        categoryId,
        subcategoryId,
        serviceId: subcategoryId,
        serviceName: serviceName || "On-Demand Service",
        formValues: {},
        pricing: {
          ...initialPricing,
          basePrice,
          tax: Math.round(basePrice * 0.18),
          commission: Math.round(basePrice * 0.15),
          providerEarnings: Math.round(basePrice * 0.85),
          finalAmount: Math.round(basePrice * 1.18),
        },
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        status: "PENDING",
      },
    }),

  updateDraftFormValues: (formValues) =>
    set((state) => ({
      draftBooking: state.draftBooking
        ? { ...state.draftBooking, formValues: { ...state.draftBooking.formValues, ...formValues } }
        : null,
    })),

  updateDraftAddress: (address) =>
    set((state) => ({
      draftBooking: state.draftBooking
        ? { ...state.draftBooking, address, selectedAddress: typeof address === "object" ? address : undefined }
        : null,
    })),

  updateDraftSlot: (scheduledDate, scheduledTime) =>
    set((state) => ({
      draftBooking: state.draftBooking
        ? { ...state.draftBooking, scheduledDate, scheduledTime, bookingDate: scheduledDate, timeSlot: scheduledTime }
        : null,
    })),

  updateDraftPricing: (pricing) =>
    set((state) => ({
      draftBooking: state.draftBooking ? { ...state.draftBooking, pricing, totalAmount: pricing.finalAmount } : null,
    })),

  updateDraftPaymentMethod: (paymentMethod) =>
    set((state) => ({
      draftBooking: state.draftBooking ? { ...state.draftBooking, paymentMethod } : null,
    })),

  setDraftBooking: (draftBooking) => set({ draftBooking }),

  setActiveBooking: (activeBooking) => set({ activeBooking, isTracking: !!activeBooking }),

  updateActiveBookingStatus: (status, timeline) =>
    set((state) => ({
      activeBooking: state.activeBooking
        ? {
            ...state.activeBooking,
            status,
            timeline: timeline || state.activeBooking.timeline,
          }
        : null,
    })),

  setNearbyProviders: (nearbyProviders) => set({ nearbyProviders }),

  setBookingHistory: (bookingHistory) => set({ bookingHistory }),

  setTracking: (isTracking) => set({ isTracking }),

  resetBookingStore: () =>
    set({
      activeBooking: null,
      draftBooking: null,
      nearbyProviders: [],
      isTracking: false,
    }),
}));

