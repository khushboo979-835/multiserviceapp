import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { LogOut, ChevronRight, FileText, Settings, Shield, HelpCircle, Phone, Award, ShoppingBag } from "lucide-react-native";
import { useRouter } from "expo-router";
import BrandLogo from "../../../src/components/common/BrandLogo";

export default function ProviderProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, providerProfile, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const handleKycPress = () => {
    router.push("/(provider)/kyc-upload");
  };

  const handleSwitchToCustomer = () => {
    router.push("/(auth)/select-role");
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 10 }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <BrandLogo size="md" showText={false} />
        <Text style={styles.partnerName}>{user?.name || "Verified Partner"}</Text>
        <View style={styles.phonePill}>
          <Phone size={13} color="#64748b" />
          <Text style={styles.partnerPhone}>{user?.phoneNumber || "+91 9876543210"}</Text>
        </View>
        <View style={styles.kycBadge}>
          <Award size={14} color="#dc2626" />
          <Text style={styles.kycBadgeText}>
            {providerProfile?.kycStatus === "APPROVED" ? "VERIFIED PARTNER" : "KYC UNDER REVIEW"}
          </Text>
        </View>
      </View>

      {/* Switch to Customer Marketplace Card */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleSwitchToCustomer}
        style={styles.switchRoleCard}
      >
        <View style={styles.switchRoleLeft}>
          <View style={styles.switchRoleIconBox}>
            <ShoppingBag size={22} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchRoleTitle}>Switch to Customer Mode</Text>
            <Text style={styles.switchRoleSubtitle}>Book home repairs & salon services</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#ef4444" />
      </TouchableOpacity>

      {/* Menu Options */}
      <View style={styles.menuCard}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleKycPress} style={styles.menuRow}>
          <View style={styles.menuRowLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#fef2f2" }]}>
              <FileText size={18} color="#ef4444" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.menuTitle}>KYC Documents</Text>
              <Text style={styles.kycStatusText}>
                Status: {providerProfile?.kycStatus || "NOT_SUBMITTED"}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={styles.menuRow}>
          <View style={styles.menuRowLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#f8fafc" }]}>
              <Settings size={18} color="#475569" />
            </View>
            <Text style={[styles.menuTitle, { marginLeft: 12 }]}>Service Parameters</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={styles.menuRow}>
          <View style={styles.menuRowLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#f8fafc" }]}>
              <Shield size={18} color="#475569" />
            </View>
            <Text style={[styles.menuTitle, { marginLeft: 12 }]}>Privacy & Security</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} style={[styles.menuRow, { borderBottomWidth: 0 }]}>
          <View style={styles.menuRowLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#f8fafc" }]}>
              <HelpCircle size={18} color="#475569" />
            </View>
            <Text style={[styles.menuTitle, { marginLeft: 12 }]}>Help & Partner Support</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity activeOpacity={0.85} onPress={handleLogout} style={styles.signOutBtn}>
        <LogOut size={18} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  partnerName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 12,
  },
  phonePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
  },
  partnerPhone: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 6,
  },
  kycBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
  },
  kycBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#b91c1c",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  switchRoleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  switchRoleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  switchRoleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  switchRoleTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
  },
  switchRoleSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  kycStatusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ef4444",
    marginTop: 2,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 20,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#ef4444",
    marginLeft: 8,
  },
});
