import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../src/store/useAuthStore";
import BrandLogo from "../src/components/common/BrandLogo";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized, initAuth } = useAuthStore();
  const [navigated, setNavigated] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initAuth();
    const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";
    fetch(`${API_URL}/health`).catch(() => {});
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
      router.replace("/(auth)/login");
    }
  };

  useEffect(() => {
    if (!isInitialized) return;

    // 1600ms branded splash showing the new glowing Inisha theme
    navigationTimeoutRef.current = setTimeout(() => {
      performNavigation();
    }, 1600);

    return () => {
      if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current);
    };
  }, [isInitialized, isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Decorative Radial Glow Spots */}
      <View style={styles.topGlow} />
      <View style={styles.bottomWarmGlow} />

      {/* Hero Center Brand Branding */}
      <View style={styles.centerContent}>
        <View style={styles.logoHalo}>
          <BrandLogo
            size="hero"
            showText={true}
            showTagline={true}
            textColor="#ffffff"
            taglineText="Your Daily Services & Delivery"
          />
        </View>

        {/* 3 Glowing Dots from Design Mockup */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Bottom CTA / Loading Area */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={performNavigation}
          activeOpacity={0.88}
          style={styles.getStartedBtn}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <View style={styles.badgeRow}>
          <ShieldCheck size={14} color="#f59e0b" />
          <Text style={styles.badgeText}>Verified Doorstep Home Services & Repairs</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061329",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 45,
  },
  topGlow: {
    position: "absolute",
    top: -80,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: (width * 1.2) / 2,
    backgroundColor: "rgba(14, 43, 92, 0.45)",
  },
  bottomWarmGlow: {
    position: "absolute",
    bottom: -100,
    width: width * 1.4,
    height: width * 1.1,
    borderRadius: (width * 1.4) / 2,
    backgroundColor: "rgba(234, 88, 12, 0.22)",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoHalo: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 36,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#f97316",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  getStartedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ea580c",
    width: "100%",
    height: 54,
    borderRadius: 20,
    shadowColor: "#ea580c",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
  },
});
