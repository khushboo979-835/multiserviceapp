import { create } from "zustand";
import { Booking, BookingStatus, ProviderProfile, PaymentMethod, PricingDetail, BookingTimelineEvent } from "../types";

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderRole: "CUSTOMER" | "PROVIDER";
  senderName: string;
  text: string;
  timestamp: string;
}

interface BookingState {
  activeBooking: Booking | null;
  draftBooking: Partial<Booking> | null;
  nearbyProviders: ProviderProfile[];
  bookingHistory: Booking[];
  isTracking: boolean;
  messages: ChatMessage[];

  // Actions
  initDraftBooking: (categoryId: string, subcategoryId: string, basePrice: number) => void;
  updateDraftFormValues: (values: Record<string, any>) => void;
  updateDraftAddress: (address: Booking["selectedAddress"]) => void;
  updateDraftSlot: (date: string, time: string) => void;
  updateDraftPricing: (pricing: PricingDetail) => void;
  updateDraftPaymentMethod: (method: PaymentMethod) => void;
  setDraftBooking: (booking: Partial<Booking> | null) => void;
  setActiveBooking: (booking: Booking | null) => void;
  updateActiveBookingStatus: (status: BookingStatus, timeline: BookingTimelineEvent[]) => void;
  setNearbyProviders: (providers: ProviderProfile[]) => void;
  setBookingHistory: (bookings: Booking[]) => void;
  addBookingToHistory: (booking: Booking) => void;
  setTracking: (isTracking: boolean) => void;
  sendMessage: (bookingId: string, text: string, senderRole: "CUSTOMER" | "PROVIDER", senderName?: string) => void;
  clearMessages: () => void;
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

export const useBookingStore = create<BookingState>((set, get) => ({
  activeBooking: null,
  draftBooking: null,
  nearbyProviders: [],
  bookingHistory: [],
  isTracking: false,
  messages: [],

  initDraftBooking: (categoryId, subcategoryId, basePrice) =>
    set({
      draftBooking: {
        categoryId,
        subcategoryId,
        formValues: {},
        pricing: {
          ...initialPricing,
          basePrice,
          finalAmount: basePrice,
        },
        paymentMethod: "CASH_AFTER_SERVICE",
        status: "DRAFT",
      },
    }),

  updateDraftFormValues: (formValues) =>
    set((state) => ({
      draftBooking: state.draftBooking
        ? { ...state.draftBooking, formValues: { ...state.draftBooking.formValues, ...formValues } }
        : null,
    })),

  updateDraftAddress: (selectedAddress) =>
    set((state) => ({
      draftBooking: state.draftBooking
        ? { ...state.draftBooking, selectedAddress }
        : null,
    })),

  updateDraftSlot: (scheduledDate, scheduledTime) =>
    set((state) => ({
      draftBooking: state.draftBooking
        ? { ...state.draftBooking, scheduledDate, scheduledTime }
        : null,
    })),

  updateDraftPricing: (pricing) =>
    set((state) => ({
      draftBooking: state.draftBooking ? { ...state.draftBooking, pricing } : null,
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
            timeline,
          }
        : null,
    })),

  setNearbyProviders: (nearbyProviders) => set({ nearbyProviders }),

  setBookingHistory: (bookingHistory) => set({ bookingHistory }),

  addBookingToHistory: (booking) =>
    set((state) => ({
      bookingHistory: [
        booking,
        ...state.bookingHistory.filter((b) => b.id !== booking.id),
      ],
    })),

  setTracking: (isTracking) => set({ isTracking }),

  sendMessage: (bookingId, text, senderRole, senderName) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      bookingId,
      senderRole,
      senderName: senderName || (senderRole === "CUSTOMER" ? "Customer" : "Service Partner"),
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    set((state) => ({
      messages: [...state.messages, newMsg],
    }));

    if (senderRole === "CUSTOMER") {
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: `msg_${Date.now()}_reply`,
          bookingId,
          senderRole: "PROVIDER",
          senderName: "Service Partner",
          text: "Got it! Reaching your doorstep shortly.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        set((state) => ({
          messages: [...state.messages, replyMsg],
        }));
      }, 1500);
    }
  },

  clearMessages: () => set({ messages: [] }),

  resetBookingStore: () =>
    set({
      activeBooking: null,
      draftBooking: null,
      nearbyProviders: [],
      isTracking: false,
      messages: [],
    }),
}));
