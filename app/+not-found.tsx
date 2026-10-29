import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to home index immediately without showing error screen
    const timer = setTimeout(() => {
      try {
        router.replace("/");
      } catch {
        router.replace("/(customer)/(tabs)");
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: "#061329", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#ea580c" />
    </View>
  );
}
