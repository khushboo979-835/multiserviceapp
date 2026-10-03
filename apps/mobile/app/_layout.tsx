import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppState } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { io } from "socket.io-client";
import AppErrorBoundary from "../src/components/common/AppErrorBoundary";
import { catalogKeys } from "../src/api/catalog";
import "../global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function CatalogSocketBridge() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || "https://multiserviceapp-4pdw.onrender.com";
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
    const pendingInvalidations = new Map<string, ReturnType<typeof setTimeout>>();
    const scheduleInvalidation = (name: keyof typeof catalogKeys) => {
      const existing = pendingInvalidations.get(name);
      if (existing) clearTimeout(existing);
      pendingInvalidations.set(name, setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: catalogKeys[name] });
        pendingInvalidations.delete(name);
      }, 60));
    };
    const refreshAll = () => {
      scheduleInvalidation("categories");
      scheduleInvalidation("products");
      scheduleInvalidation("banners");
    };

    socket.on("connect", refreshAll);
    socket.on("category:updated", () => scheduleInvalidation("categories"));
    socket.on("service:updated", () => scheduleInvalidation("categories"));
    socket.on("product:updated", () => scheduleInvalidation("products"));
    socket.on("banner:updated", () => scheduleInvalidation("banners"));
    socket.on("catalog_updated", refreshAll);
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshAll();
    });

    return () => {
      appStateSubscription.remove();
      pendingInvalidations.forEach(clearTimeout);
      pendingInvalidations.clear();
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [queryClient]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <CatalogSocketBridge />
          <SafeAreaProvider>
            <StatusBar style="light" />
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
          </SafeAreaProvider>
        </QueryClientProvider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}
