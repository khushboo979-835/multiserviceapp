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
        return;
      }
    } catch (err) {
      console.warn("Error hydrating auth store:", err);
    }
    set({ isInitialized: true, isLoading: false });
  },

  setAuth: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    }),

  updateUser: (updatedUser) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedUser } : null,
    })),

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
    AsyncStorage.multiRemove(["@auth_token", "@user_profile", "@provider_profile"]).catch(() => {});
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      providerProfile: null,
      isInitialized: true,
    });
  },
}));

