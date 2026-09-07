import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebaseConfig";
import { getUserProfile, seedInitialServicesIfEmpty } from "@/services/firestoreService";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/types";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import "@/global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false,
    },
  },
});

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const { setAuth, logout, setIsLoading } = useAuthStore();

  useEffect(() => {
    // 1. Preload service catalog into Firestore if not present
    seedInitialServicesIfEmpty().catch((err) => {
      console.warn("Initial services seed error:", err);
    });

    // 2. Immediate cold-start check from AsyncStorage for zero-delay restoration
    const restoreCachedSession = async () => {
      try {
        const cachedUser = await AsyncStorage.getItem("@inisha_auth_user");
        const cachedToken = await AsyncStorage.getItem("@inisha_auth_token");
        if (cachedUser && cachedToken) {
          const parsedUser: User = JSON.parse(cachedUser);
          setAuth(parsedUser, cachedToken);
        }
      } catch (e) {
        console.warn("AsyncStorage session cache restore warning:", e);
      } finally {
        setIsLoading(false);
      }
    };

    restoreCachedSession();

    // 3. Listen to live Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const firestoreProfile = await getUserProfile(firebaseUser.uid);

          const userProfile: User = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            phoneNumber: firestoreProfile?.phoneNumber || firebaseUser.phoneNumber || "",
            phone: firestoreProfile?.phone || firebaseUser.phoneNumber || "",
            role: firestoreProfile?.role || "CUSTOMER",
            name: firestoreProfile?.name || firebaseUser.displayName || "User",
            fullName: firestoreProfile?.fullName || firebaseUser.displayName || "User",
            email: firestoreProfile?.email || firebaseUser.email || "",
            address: firestoreProfile?.address || [],
            savedAddresses: firestoreProfile?.savedAddresses || [],
            selectedLocation: firestoreProfile?.selectedLocation || "Cyber City, Gurugram",
            isVerified: true,
            verified: true,
            createdAt: firestoreProfile?.createdAt || firebaseUser.metadata.creationTime || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await AsyncStorage.setItem("@inisha_auth_user", JSON.stringify(userProfile));
          await AsyncStorage.setItem("@inisha_auth_token", token);

          setAuth(userProfile, token);
        } catch (error) {
          console.error("Error restoring session:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // If not logged in and no cached user, ensure clean state
        const cachedUser = await AsyncStorage.getItem("@inisha_auth_user");
        if (!cachedUser) {
          logout();
        }
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ToastProvider>
              <StatusBar style="light" />
              <OfflineBanner onRetry={() => queryClient.invalidateQueries()} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#0f172a" },
                  animation: "slide_from_right",
                }}
              >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(customer)" options={{ headerShown: false }} />
                <Stack.Screen name="(provider)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
              </Stack>
            </ToastProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

