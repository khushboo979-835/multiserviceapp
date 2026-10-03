import { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";
import { Slot } from "expo-router";
import AppErrorBoundary from "../../src/components/common/AppErrorBoundary";

export default function AuthLayout() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator /></View>}>
        <Slot />
      </Suspense>
    </AppErrorBoundary>
  );
}

