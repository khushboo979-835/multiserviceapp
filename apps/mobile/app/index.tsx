import React, { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/store/useAuthStore";
import BrandLogo from "../src/components/common/BrandLogo";
import { ArrowRight, Sparkles } from "lucide-react-native";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized, initAuth } = useAuthStore();
  const [navigated, setNavigated] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const performNavigation = () => {
    if (navigated) return;
    setNavigated(true);

    try {
      if (isAuthenticated && user) {
        if (user.role === "PROVIDER") {
          router.replace("/(provider)/(tabs)/dashboard");
        } else {
          router.replace("/(customer)/(tabs)");
        }
      } else {
        router.replace("/(auth)/login");
      }
    } catch {
      // Fallback
      router.replace("/(auth)/login");
    }
  };

  useEffect(() => {
    if (!isInitialized) return;

    // 1000ms branded splash intro displaying Inisha City logo
    navigationTimeoutRef.current = setTimeout(() => {
      performNavigation();
    }, 1000);

    return () => {
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
    };
  }, [isInitialized, isAuthenticated, user]);

  return (
    <View style={styles.container}>
      {/* Centered Brand Logo */}
      <View style={styles.centerContent}>
        <BrandLogo size="hero" showText={true} showTagline={true} textColor="#0f172a" />
        <View style={styles.taglineBox}>
          <Sparkles size={14} color="#ef4444" />
          <Text style={styles.taglineText}>On-Demand Multi-Service Marketplace</Text>
        </View>
      </View>

      {/* Bottom Loading Indicator & Manual Override Button */}
      <View style={styles.bottomContainer}>
        <ActivityIndicator size="small" color="#ef4444" />
        <Text style={styles.loadingText}>INITIALIZING INISHA PLATFORM...</Text>

        <TouchableOpacity
          onPress={performNavigation}
          activeOpacity={0.8}
          style={styles.manualButton}
        >
          <Text style={styles.manualButtonText}>Get Started</Text>
          <ArrowRight size={16} color="#ef4444" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 50,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  taglineBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 18,
  },
  taglineText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ef4444",
    marginLeft: 6,
  },
  bottomContainer: {
    alignItems: "center",
    width: "100%",
    paddingBottom: 20,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 12,
    letterSpacing: 1.5,
  },
  manualButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  manualButtonText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "800",
  },
});

