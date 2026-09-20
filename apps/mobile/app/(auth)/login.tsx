import React, { useState, useRef } from "react";
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
  Keyboard,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowRight, ShieldCheck, Sparkles, Briefcase } from "lucide-react-native";
import BrandLogo from "../../src/components/common/BrandLogo";
import {
  auth,
  firebaseConfig,
  setConfirmationResult,
} from "../../src/config/firebase";
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import FirebaseRecaptchaVerifierModal, {
  FirebaseRecaptchaVerifierRef,
} from "../../src/components/common/FirebaseRecaptchaVerifierModal";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Dedicated ref for Firebase Recaptcha Verifier Modal
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierRef>(null);

  // Strictly validate 10-digit Indian mobile number
  const validatePhone = (phone: string): boolean => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone);
  };

  // Strip leading zeros, +91 prefixes, and non-numeric characters
  const sanitizePhoneNumber = (raw: string): string => {
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length > 10) {
      digits = digits.slice(2);
    }
    if (digits.startsWith("0")) {
      digits = digits.replace(/^0+/, "");
    }
    return digits.slice(0, 10);
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = sanitizePhoneNumber(text);
    setPhoneNumber(cleaned);
    if (error) setError("");

    if (cleaned.length === 10) {
      Keyboard.dismiss();
    }
  };

  const handleSendOtp = async () => {
    setError("");
    const cleanNumber = sanitizePhoneNumber(phoneNumber);

    if (!cleanNumber) {
      setError("Please enter your 10-digit mobile number");
      return;
    }
    if (!validatePhone(cleanNumber)) {
      setError("Please enter a valid 10-digit Indian phone number (starting with 6, 7, 8, or 9)");
      return;
    }

    const formattedE164 = `+91${cleanNumber}`;
    setLoading(true);

    try {
      let confirmation: any = null;

      // 1. Attempt Firebase Phone Auth
      try {
        if (Platform.OS === "web" && typeof window !== "undefined" && (window as any).document) {
          if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(
              auth,
              "recaptcha-container",
              {
                size: "invisible",
                callback: () => {},
              }
            );
          }
          const appVerifier = (window as any).recaptchaVerifier;
          confirmation = await signInWithPhoneNumber(auth, formattedE164, appVerifier);
        } else if (recaptchaVerifier.current) {
          confirmation = await signInWithPhoneNumber(
            auth,
            formattedE164,
            recaptchaVerifier.current
          );
        }

        if (confirmation) {
          setConfirmationResult(confirmation, confirmation.verificationId);
        }
      } catch (fbErr: any) {
        console.warn(
          "[Firebase Phone Notice]: Firebase threw " +
            (fbErr?.code || fbErr?.message) +
            ". Automatically falling back to telecom SMS gateway."
        );
      }

      // 2. High-Speed Telecom SMS Gateway Dispatch via Backend
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.88.242.61:5000/api";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      let devOtp = "";
      try {
        const smsRes = await fetch(`${API_URL}/auth/customer/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: cleanNumber,
            phoneNumber: formattedE164,
          }),
          signal: controller.signal,
        });
        const resData = await smsRes.json();
        console.log("[Backend SMS Gateway Response]:", resData);
        if (resData?.otp) {
          devOtp = String(resData.otp);
        }
      } catch (backendErr: any) {
        console.warn("[Backend SMS Gateway Notice]:", backendErr?.message);
      } finally {
        clearTimeout(timeoutId);
      }

      setLoading(false);
      router.push({
        pathname: "/(auth)/verify-otp",
        params: {
          phone: cleanNumber,
          fullPhone: formattedE164,
          ...(devOtp ? { devOtp } : {}),
        },
      });
    } catch (err: any) {
      setLoading(false);
      const errorMsg = err?.message || "Failed to send verification code. Please try again.";
      setError(errorMsg);
      Alert.alert("Authentication Notice", errorMsg);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Firebase Recaptcha Verifier Modal for Real Telecom SMS on Android & iOS */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        title="Security Verification"
        cancelLabel="Close"
        attemptInvisibleVerification={true}
      />

      {/* Invisible container for Firebase Web reCAPTCHA */}
      {Platform.OS === "web" && <View id="recaptcha-container" style={{ display: "none" }} />}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.innerContainer,
            {
              paddingTop: insets.top + 20,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          {/* Header with Official Logo */}
          <View style={styles.header}>
            <BrandLogo size="hero" showText={true} showTagline={true} textColor="#0f172a" />
            <Text style={styles.subtitle}>
              On-Demand Doorstep Repairs, Home Services & Salon Experience
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <View style={styles.badgeRow}>
              <Sparkles size={14} color="#ef4444" />
              <Text style={styles.badgeText}>CUSTOMER VERIFIED ACCESS</Text>
            </View>
            <Text style={styles.cardTitle}>Welcome</Text>
            <Text style={styles.cardSubtitle}>
              Enter your mobile number to get instant OTP access
            </Text>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>MOBILE NUMBER</Text>

              <View style={[styles.inputContainer, error ? styles.inputContainerError : null]}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.flagEmoji}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>

                <TextInput
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  style={styles.phoneInput}
                  editable={!loading}
                  autoFocus
                />

                {phoneNumber.length === 10 && (
                  <View style={styles.validCheck}>
                    <ShieldCheck size={18} color="#16a34a" />
                  </View>
                )}
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={loading || phoneNumber.length < 10}
              activeOpacity={0.85}
              style={[
                styles.primaryButton,
                loading || phoneNumber.length < 10 ? styles.primaryButtonDisabled : null,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Send Verification Code</Text>
                  <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.securityBadge}>
              <ShieldCheck size={16} color="#16a34a" />
              <Text style={styles.securityText}>100% Secure Telecom SMS Delivery</Text>
            </View>

            {/* Dedicated Service Partner Login Link */}
            <View style={styles.providerLinkBox}>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/provider-login")}
                activeOpacity={0.7}
                style={styles.providerButton}
              >
                <Briefcase size={16} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={styles.providerButtonText}>
                  Are you a Technician / Partner?{" "}
                  <Text style={{ color: "#ef4444", fontWeight: "900" }}>Partner Login →</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By proceeding, you agree to our Terms of Service & Privacy Policy
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
  header: {
    alignItems: "center",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 28,
    padding: 24,
    marginVertical: 16,
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
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 20,
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
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
    height: 56,
  },
  inputContainerError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  countryCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRightWidth: 1.5,
    borderRightColor: "#cbd5e1",
    paddingRight: 12,
    marginRight: 12,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  phoneInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    padding: 0,
  },
  validCheck: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ef4444",
    marginTop: 6,
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: "#ef4444",
    borderRadius: 18,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  securityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 6,
  },
  providerLinkBox: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignItems: "center",
  },
  providerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  providerButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 16,
  },
});
