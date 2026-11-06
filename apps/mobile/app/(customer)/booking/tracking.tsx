import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function BookingTrackingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(customer)/(tabs)/bookings");
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#ef4444" />
    </View>
  );
}
