import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  Dimensions, 
  StatusBar 
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  ZoomIn, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from "react-native-reanimated";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  ShieldCheck, 
  Zap, 
  Truck, 
  Wrench, 
  Sparkles, 
  Scissors, 
  ShoppingCart, 
  Activity, 
  ArrowRight,
  Award
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const [canNavigate, setCanNavigate] = useState(false);

  // Subtle pulsing glow animation for logo
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    glowScale.value = withRepeat(
      withTiming(1.12, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withTiming(0.8, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Auto-advance after 2.8 seconds
    const timer = setTimeout(() => {
      setCanNavigate(true);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canNavigate || isLoading) return;

    if (isAuthenticated && user) {
      if (user.role === "PROVIDER") {
        router.replace("/(provider)/(tabs)/dashboard");
      } else {
        router.replace("/(customer)/(tabs)");
      }
    } else {
      router.replace("/(auth)/login");
    }
  }, [canNavigate, isAuthenticated, user, isLoading, router]);

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glowScale.value }],
      opacity: glowOpacity.value,
    };
  });

  const handleManualProceed = () => {
    if (isAuthenticated && user) {
      if (user.role === "PROVIDER") {
        router.replace("/(provider)/(tabs)/dashboard");
      } else {
        router.replace("/(customer)/(tabs)");
      }
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background radial gradient glow aura */}
      <Animated.View style={[styles.glowAura, animatedGlowStyle]} />

      <View style={[styles.innerContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
        
        {/* Top Mini Badge */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.topPill}>
          <Sparkles size={13} color="#f59e0b" />
          <Text style={styles.topPillText}>ALL-IN-ONE DOORSTEP SERVICES</Text>
        </Animated.View>

        {/* Center Section: App Logo & Animated Monogram */}
        <View style={styles.centerLogoSection}>
          <Animated.View entering={ZoomIn.delay(300).duration(900)} style={styles.logoWrapper}>
            <Image 
              source={require("../assets/logo.png")} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* App Title & Subtitle */}
          <Animated.Text entering={FadeInUp.delay(500).duration(800)} style={styles.brandTitle}>
            INISHA
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(600).duration(800)} style={styles.brandCategory}>
            CITY SERVICE
          </Animated.Text>

          {/* Slogan with Accent */}
          <Animated.View entering={FadeInUp.delay(700).duration(800)} style={styles.taglineBox}>
            <View style={styles.taglineLine} />
            <Text style={styles.taglineText}>Your Need, Our Service</Text>
            <View style={styles.taglineLine} />
          </Animated.View>
        </View>

        {/* 6 Circular Services Badges representing the Logo Icons */}
        <Animated.View entering={FadeInUp.delay(800).duration(800)} style={styles.iconsRow}>
          <View style={[styles.miniBadge, { backgroundColor: "#451a03", borderColor: "#f59e0b" }]}>
            <Truck size={14} color="#f59e0b" />
          </View>
          <View style={[styles.miniBadge, { backgroundColor: "#082f49", borderColor: "#0284c7" }]}>
            <Wrench size={14} color="#38bdf8" />
          </View>
          <View style={[styles.miniBadge, { backgroundColor: "#022c22", borderColor: "#10b981" }]}>
            <Sparkles size={14} color="#10b981" />
          </View>
          <View style={[styles.miniBadge, { backgroundColor: "#500724", borderColor: "#ec4899" }]}>
            <Scissors size={14} color="#f472b6" />
          </View>
          <View style={[styles.miniBadge, { backgroundColor: "#450a0a", borderColor: "#ef4444" }]}>
            <ShoppingCart size={14} color="#f87171" />
          </View>
          <View style={[styles.miniBadge, { backgroundColor: "#042f2e", borderColor: "#14b8a6" }]}>
            <Activity size={14} color="#2dd4bf" />
          </View>
        </Animated.View>

        {/* Feature Highlights Card */}
        <Animated.View entering={FadeInUp.delay(950).duration(800)} style={styles.featuresCard}>
          <View style={styles.featureLine}>
            <Zap size={14} color="#f59e0b" />
            <Text style={styles.featureLineText}>30-Min Doorstep Delivery & Verified Techs</Text>
          </View>
          <View style={styles.featureLine}>
            <ShieldCheck size={14} color="#10b981" />
            <Text style={styles.featureLineText}>100% Background-Checked Professionals</Text>
          </View>
          <View style={styles.featureLine}>
            <Award size={14} color="#8b5cf6" />
            <Text style={styles.featureLineText}>Upfront Fixed Pricing • 30-Day Warranty</Text>
          </View>
        </Animated.View>

        {/* Bottom Progress & Get Started Button */}
        <Animated.View entering={FadeInUp.delay(1100).duration(800)} style={styles.bottomActionBox}>
          <TouchableOpacity 
            activeOpacity={0.85}
            onPress={handleManualProceed}
            style={styles.getStartedButton}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <View style={styles.loaderRow}>
            <ActivityIndicator size="small" color="#8b5cf6" />
            <Text style={styles.loadingStatusText}>Initializing Inisha Smart Hub...</Text>
          </View>
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712",
    alignItems: "center",
    justifyContent: "center",
  },
  glowAura: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: "#1e3a8a",
  },
  innerContent: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 24,
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  topPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderColor: "#334155",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  topPillText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 6,
  },
  centerLogoSection: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  logoWrapper: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#0f172a",
    borderWidth: 3,
    borderColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 16,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  brandTitle: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 3,
  },
  brandCategory: {
    color: "#f59e0b",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 4,
    marginTop: 2,
  },
  taglineBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  taglineLine: {
    width: 24,
    height: 1.5,
    backgroundColor: "#f97316",
  },
  taglineText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "600",
    marginHorizontal: 10,
    letterSpacing: 0.5,
  },
  iconsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 8,
  },
  miniBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  featuresCard: {
    width: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  featureLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureLineText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomActionBox: {
    width: "100%",
    alignItems: "center",
  },
  getStartedButton: {
    width: "100%",
    backgroundColor: "#2563eb",
    paddingVertical: 15,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 12,
  },
  getStartedText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingStatusText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 8,
  },
});

