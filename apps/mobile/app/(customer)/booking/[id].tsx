import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function BookingRouteRedirect() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    router.replace({
      pathname: "/(customer)/(tabs)",
      params: { ...params, action: "book" },
    });
  }, [router, params]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#ef4444" />
    </View>
  );
}
