import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to customer home immediately without showing error screen
    try {
      router.replace("/(customer)/(tabs)");
    } catch {
      router.replace("/");
    }
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: "#061329", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#ea580c" />
    </View>
  );
}
