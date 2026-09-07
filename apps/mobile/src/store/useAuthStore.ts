import { create } from "zustand";
import { User, ProviderProfile, GeoLocation, KycStatus } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  providerProfile: ProviderProfile | null;
  currentLocation: GeoLocation | null;
  confirmationResult: any | null;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  setProviderProfile: (profile: ProviderProfile | null) => void;
  updateProviderProfile: (profile: Partial<ProviderProfile>) => void;
  setCurrentLocation: (location: GeoLocation) => void;
  setAvailability: (isAvailable: boolean) => void;
  setKycStatus: (status: KycStatus) => void;
  setIsLoading: (isLoading: boolean) => void;
  setConfirmationResult: (result: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  providerProfile: null,
  currentLocation: null,
  confirmationResult: null,
  setConfirmationResult: (result) => set({ confirmationResult: result }),

  setAuth: (user, token) =>
    set({
      user: {
        ...user,
        uid: user.uid || user.id,
        name: user.name || user.fullName || "User",
        fullName: user.fullName || user.name || "User",
        phoneNumber: user.phoneNumber || user.phone || "",
        phone: user.phone || user.phoneNumber || "",
        address: user.address || [],
        isVerified: user.isVerified ?? true,
        verified: user.verified ?? true,
      },
      token,
      isAuthenticated: true,
      isLoading: false,
    }),

  updateUser: (updatedUser) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            ...updatedUser,
            name: updatedUser.name || updatedUser.fullName || state.user.name,
            fullName: updatedUser.fullName || updatedUser.name || state.user.fullName,
          }
        : null,
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

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      providerProfile: null,
      confirmationResult: null,
    }),
}));

