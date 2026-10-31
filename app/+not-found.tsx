import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import BrandLogo from "../src/components/common/BrandLogo";

export default function NotFoundScreen() {
  const router = useRouter();

  const handleNavigateHome = () => {
    try {
      router.replace("/(customer)/(tabs)");
    } catch {
      try {
        router.replace("/");
      } catch {
        // Fallback
      }
    }
  };

  useEffect(() => {
    // Automatically redirect immediately
    const timer = setTimeout(() => {
      handleNavigateHome();
    }, 50);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <BrandLogo size="medium" showText={true} />
      <ActivityIndicator size="large" color="#ef4444" style={{ marginTop: 28 }} />
      <TouchableOpacity onPress={handleNavigateHome} style={styles.homeBtn} activeOpacity={0.85}>
        <Text style={styles.homeBtnText}>Return to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061329",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  homeBtn: {
    marginTop: 24,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  homeBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
});
