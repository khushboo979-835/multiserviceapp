import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, ProviderProfile, GeoLocation, KycStatus } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  providerProfile: ProviderProfile | null;
  currentLocation: GeoLocation | null;
  
  // Actions
  initAuth: () => Promise<void>;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  setProviderProfile: (profile: ProviderProfile | null) => void;
  updateProviderProfile: (profile: Partial<ProviderProfile>) => void;
  setCurrentLocation: (location: GeoLocation) => void;
  setAvailability: (isAvailable: boolean) => void;
  setKycStatus: (status: KycStatus) => void;
  setIsLoading: (isLoading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  providerProfile: null,
  currentLocation: null,

  initAuth: async () => {
    try {
      const [storedToken, storedUser, storedProvider] = await Promise.all([
        AsyncStorage.getItem("@auth_token"),
        AsyncStorage.getItem("@user_profile"),
        AsyncStorage.getItem("@provider_profile"),
      ]);

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const parsedProvider = storedProvider ? JSON.parse(storedProvider) : null;
        set({
          token: storedToken,
          user: parsedUser,
          providerProfile: parsedProvider,
          isAuthenticated: true,
          isInitialized: true,
          isLoading: false,
        });

        // Hydrate latest user profile from backend MongoDB in background
        try {
          const API_URL =
            process.env.EXPO_PUBLIC_API_URL ||
            "https://multiserviceapp-4pdw.onrender.com/api";
          fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data?.success && data?.user) {
                set((state) => {
                  const merged = { ...state.user, ...data.user };
                  AsyncStorage.setItem("@user_profile", JSON.stringify(merged)).catch(() => {});
                  AsyncStorage.setItem("@inisha_user_profile", JSON.stringify(merged)).catch(() => {});
                  if (data.user.address) {
                    AsyncStorage.setItem("@user_delivery_address", data.user.address).catch(() => {});
                  }
                  if (data.user.city) {
                    AsyncStorage.setItem("@user_selected_city", data.user.city).catch(() => {});
                  }
                  return { user: merged };
                });
              }
            })
            .catch(() => {});
        } catch {}

        return;
      }
    } catch (err) {
      console.warn("Error hydrating auth store:", err);
    }
    set({ isInitialized: true, isLoading: false });
  },

  setAuth: (user, token) => {
    if (token) {
      AsyncStorage.setItem("@auth_token", token).catch(() => {});
    }
    if (user) {
      AsyncStorage.setItem("@user_profile", JSON.stringify(user)).catch(() => {});
      AsyncStorage.setItem("@inisha_user_profile", JSON.stringify(user)).catch(() => {});
    }
    try {
      const { useCartStore } = require("./useCartStore");
      useCartStore.getState().clearCartStore();
    } catch {}
    set((state) => ({
      user,
      token: token || state.token,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    }));
  },

  updateUser: (updatedUser) =>
    set((state) => {
      const newUser = state.user ? { ...state.user, ...updatedUser } : null;
      if (newUser) {
        AsyncStorage.setItem("@user_profile", JSON.stringify(newUser)).catch(() => {});
        AsyncStorage.setItem("@inisha_user_profile", JSON.stringify(newUser)).catch(() => {});
      }
      return { user: newUser };
    }),

  setProviderProfile: (profile) => set({ providerProfile: profile }),

  updateProviderProfile: (updatedProfile) =>
    set((state) => ({
      providerProfile: state.providerProfile
        ? { ...state.providerProfile, ...updatedProfile }
        : null,
    })),

  setCurrentLocation: (location) => set({ currentLocation: location }),

  setAvailability: (isAvailable) =>
    set((state) => ({
      providerProfile: state.providerProfile
        ? { ...state.providerProfile, isAvailable }
        : null,
    })),

  setKycStatus: (kycStatus) =>
    set((state) => ({
      providerProfile: state.providerProfile
        ? { ...state.providerProfile, kycStatus }
        : null,
      user: state.user
        ? { ...state.user }
        : null,
    })),

  setIsLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    AsyncStorage.multiRemove([
      "@auth_token",
      "@user_profile",
      "@inisha_auth_token",
      "@inisha_user_profile",
      "@provider_profile",
      "@cart_items",
      "@user_orders",
      "@booking_history",
      "@active_booking",
    ]).catch(() => {});

    try {
      const { useCartStore } = require("./useCartStore");
      useCartStore.getState().clearCartStore();
    } catch {}

    try {
      const { useBookingStore } = require("./useBookingStore");
      useBookingStore.getState().resetBookingStore();
    } catch {}

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      providerProfile: null,
      isInitialized: true,
    });
  },
}));

