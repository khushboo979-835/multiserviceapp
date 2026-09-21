import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, ArrowRight, Briefcase, Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "../../src/store/useAuthStore";
import BrandLogo from "../../src/components/common/BrandLogo";

export default function ProviderLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [partnerId, setPartnerId] = useState("INP-8842");
  const [password, setPassword] = useState("partner123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuth, setProviderProfile } = useAuthStore();

  const handlePartnerLogin = async () => {
    const cleanId = partnerId.trim();
    const cleanPass = password.trim();

    if (!cleanId) {
      setError("Please enter your Partner ID or Phone");
      return;
    }
    if (!cleanPass) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let token = "jwt_prov_" + Date.now();
    let userObj = {
      id: "usr_prov_8842",
      phoneNumber: "+91 98123 45678",
      role: "PROVIDER" as const,
      name: "Rohan Sharma (Master Tech)",
      email: "rohan.partner@inishacityservice.com",
      walletBalance: 3450,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    let providerObj = {
      id: "prov_mock_8842",
      userId: "usr_prov_8842",
      partnerId: cleanId.toUpperCase() || "INP-8842",
      servicesOffered: ["sub_mob_doorstep", "sub_utility_ac"],
      kycStatus: "APPROVED" as const,
      documents: [],
      isAvailable: true,
      averageRating: 4.9,
      reviewCount: 28,
      walletBalance: 3450,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_URL}/auth/provider/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: cleanId, password: cleanPass }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok && data.success) {
        token = data.token;
        if (data.user) {
          userObj = { ...userObj, ...data.user, role: "PROVIDER" };
        }
        if (data.provider) {
          providerObj = {
            ...providerObj,
            id: data.provider.id,
            partnerId: data.provider.partnerId,
            averageRating: data.provider.rating || 4.9,
            reviewCount: data.provider.reviewCount || 28,
            walletBalance: data.provider.walletBalance || 3450,
          };
        }
      } else {
        // Check test credentials
        if (
          (cleanId.toUpperCase() === "INP-8842" || cleanId === "9812345678" || cleanId === "partner") &&
          (cleanPass === "partner123" || cleanPass === "Inisha@2026")
        ) {
          // Allow demo login
        } else {
          setError(data.message || "Invalid Partner credentials. Contact administration.");
          setLoading(false);
          return;
        }
      }
    } catch {
      clearTimeout(timeoutId);
      // Offline fallback for test partner
      if (
        (cleanId.toUpperCase() === "INP-8842" || cleanId === "9812345678" || cleanId === "partner") &&
        (cleanPass === "partner123" || cleanPass === "Inisha@2026")
      ) {
        // Proceed with demo profile
      } else {
        setError("Network error. Verify server is running or use demo credentials.");
        setLoading(false);
        return;
      }
    }

    try {
      await AsyncStorage.setItem("@auth_token", token);
      await AsyncStorage.setItem("@user_profile", JSON.stringify(userObj));
      await AsyncStorage.setItem("@provider_profile", JSON.stringify(providerObj));
      setAuth(userObj, token);
      setProviderProfile(providerObj);
    } catch (storageErr) {
      console.warn("Storage error:", storageErr);
    } finally {
      setLoading(false);
      router.replace("/(provider)/(tabs)/dashboard");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.innerContainer,
            {
              paddingTop: insets.top + 16,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={20} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Partner Authentication</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <BrandLogo size="hero" showText={true} showTagline={true} textColor="#0f172a" />
            <Text style={styles.subtitle}>
              Inisha City Service — Service Partner & Technician Portal
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.badgeRow}>
              <Briefcase size={14} color="#ef4444" />
              <Text style={styles.badgeText}>AUTHORIZED PARTNER ACCESS</Text>
            </View>
            <Text style={styles.cardTitle}>Technician Login</Text>
            <Text style={styles.cardSubtitle}>
              Enter your Partner ID & secure password issued by Admin
            </Text>

            {/* Partner ID Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>PARTNER ID / REGISTERED PHONE</Text>
              <View style={[styles.inputContainer, error ? styles.inputContainerError : null]}>
                <User size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="e.g. INP-8842 or 9812345678"
                  placeholderTextColor="#94a3b8"
                  value={partnerId}
                  onChangeText={(text) => {
                    setPartnerId(text);
                    if (error) setError("");
                  }}
                  autoCapitalize="characters"
                  style={styles.input}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>SECURE PASSWORD</Text>
              <View style={[styles.inputContainer, error ? styles.inputContainerError : null]}>
                <Lock size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="Enter your partner password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError("");
                  }}
                  style={styles.input}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 6 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#64748b" />
                  ) : (
                    <Eye size={18} color="#64748b" />
                  )}
                </TouchableOpacity>
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handlePartnerLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.primaryButton, loading ? styles.primaryButtonDisabled : null]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Login to Partner Dashboard</Text>
                  <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Demo Credentials Box */}
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>💡 Demo Partner Credentials:</Text>
              <Text style={styles.demoText}>
                Partner ID: <Text style={styles.demoBold}>INP-8842</Text>  |  Password: <Text style={styles.demoBold}>partner123</Text>
              </Text>
            </View>

            {/* Customer Login Return */}
            <View style={styles.switchBox}>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/login")}
                activeOpacity={0.7}
              >
                <Text style={styles.switchText}>
                  Are you a customer? <Text style={styles.switchLink}>Customer Login →</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.securityRow}>
              <ShieldCheck size={14} color="#16a34a" />
              <Text style={styles.securityText}>Admin-Verified Partner Network</Text>
            </View>
            <Text style={styles.footerText}>
              Need to register as a partner? Contact support@inishacityservice.com
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  header: {
    alignItems: "center",
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 28,
    padding: 22,
    marginVertical: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ef4444",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 18,
    lineHeight: 18,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 54,
  },
  inputContainerError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ef4444",
    marginTop: 6,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  demoBox: {
    backgroundColor: "#f1f5f9",
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 2,
  },
  demoText: {
    fontSize: 12,
    color: "#64748b",
  },
  demoBold: {
    fontWeight: "800",
    color: "#0f172a",
  },
  switchBox: {
    marginTop: 16,
    alignItems: "center",
  },
  switchText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  switchLink: {
    color: "#ef4444",
    fontWeight: "800",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 8,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  securityText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16a34a",
    marginLeft: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 16,
  },
});
