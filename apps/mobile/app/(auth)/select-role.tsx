import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Wrench, Users, ArrowRight, CheckCircle2 } from "lucide-react-native";
import { useAuthStore } from "../../src/store/useAuthStore";
import { UserRole, ProviderProfile } from "../../src/types";
import BrandLogo from "../../src/components/common/BrandLogo";

export default function SelectRoleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { updateUser, setProviderProfile } = useAuthStore();

  const handleConfirmRole = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      const currentUser = useAuthStore.getState().user;
      updateUser({ role: selectedRole });

      if (selectedRole === "PROVIDER") {
        const providerData: ProviderProfile = {
          id: `prov_${currentUser?.id || Date.now()}`,
          userId: currentUser?.id || `usr_${Date.now()}`,
          servicesOffered: ["sub_mob_doorstep", "sub_utility_ac"],
          kycStatus: "APPROVED",
          documents: [],
          isAvailable: true,
          averageRating: 5.0,
          reviewCount: 1,
          walletBalance: currentUser?.walletBalance || 250,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProviderProfile(providerData);
        router.replace("/(provider)/(tabs)/dashboard");
      } else {
        router.replace("/(customer)/(tabs)");
      }
    } catch (err) {
      console.error("Error setting role:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 20,
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
    >
      {/* Header with Logo */}
      <View style={styles.header}>
        <BrandLogo size="md" showText={false} />
        <Text style={styles.headerTitle}>Choose Your Profile</Text>
        <Text style={styles.headerSubtitle}>
          Select how you want to use INISHA CITY SERVICE
        </Text>
      </View>

      {/* Role Selection Cards */}
      <View style={styles.cardsContainer}>
        {/* Customer Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedRole("CUSTOMER")}
          style={[
            styles.roleCard,
            selectedRole === "CUSTOMER" ? styles.roleCardActive : null,
          ]}
        >
          <View
            style={[
              styles.iconBox,
              selectedRole === "CUSTOMER" ? styles.iconBoxActive : null,
            ]}
          >
            <Users size={28} color={selectedRole === "CUSTOMER" ? "#ffffff" : "#ef4444"} />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>I am a Customer</Text>
              {selectedRole === "CUSTOMER" ? (
                <CheckCircle2 size={22} color="#ef4444" />
              ) : (
                <View style={styles.radioPlaceholder} />
              )}
            </View>
            <Text style={styles.cardDescription}>
              Book doorstep mobile repair, salon, AC service, electricians & plumbers with live tracking.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Provider Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedRole("PROVIDER")}
          style={[
            styles.roleCard,
            selectedRole === "PROVIDER" ? styles.roleCardActive : null,
          ]}
        >
          <View
            style={[
              styles.iconBox,
              selectedRole === "PROVIDER" ? styles.iconBoxActive : null,
            ]}
          >
            <Wrench size={28} color={selectedRole === "PROVIDER" ? "#ffffff" : "#ef4444"} />
          </View>
          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>I am a Partner</Text>
              {selectedRole === "PROVIDER" ? (
                <CheckCircle2 size={22} color="#ef4444" />
              ) : (
                <View style={styles.radioPlaceholder} />
              )}
            </View>
            <Text style={styles.cardDescription}>
              Accept live job orders, navigate to customer doorsteps, track jobs and receive instant earnings.
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Proceed Action Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          onPress={handleConfirmRole}
          disabled={!selectedRole || loading}
          activeOpacity={0.85}
          style={[
            styles.proceedButton,
            selectedRole ? styles.proceedButtonActive : styles.proceedButtonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
          ) : (
            <>
              <Text
                style={[
                  styles.proceedButtonText,
                  selectedRole ? styles.proceedTextActive : styles.proceedTextDisabled,
                ]}
              >
                {selectedRole
                  ? `Proceed as ${selectedRole === "CUSTOMER" ? "Customer" : "Partner"}`
                  : "Select a Profile"}
              </Text>
              {selectedRole && <ArrowRight size={20} color="#ffffff" style={{ marginLeft: 8 }} />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
    marginTop: 16,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  cardsContainer: {
    marginVertical: "auto",
    gap: 16,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  roleCardActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
  },
  radioPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
  },
  cardDescription: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 4,
    lineHeight: 17,
  },
  bottomSection: {
    paddingBottom: 8,
  },
  proceedButton: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  proceedButtonActive: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  proceedButtonDisabled: {
    backgroundColor: "#f1f5f9",
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  proceedTextActive: {
    color: "#ffffff",
  },
  proceedTextDisabled: {
    color: "#94a3b8",
  },
});

