import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { Wallet, ArrowDownRight, ArrowUpRight, TrendingUp, Building2, ShieldCheck } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BrandLogo from "../../../src/components/common/BrandLogo";

export default function ProviderWalletScreen() {
  const insets = useSafeAreaInsets();
  const { providerProfile } = useAuthStore();
  const balance = providerProfile?.walletBalance ?? 3450;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 10 }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 60 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <BrandLogo size="sm" showText={false} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Partner Earnings</Text>
          <Text style={styles.headerSubtitle}>Wallet balance & payout settlement</Text>
        </View>
      </View>

      {/* Provider Hero Earnings Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroLabel}>WITHDRAWABLE BALANCE</Text>
          <View style={styles.walletIconCircle}>
            <Wallet size={20} color="#ffffff" />
          </View>
        </View>
        <Text style={styles.heroValue}>₹{balance.toFixed(2)}</Text>
        <TouchableOpacity activeOpacity={0.85} style={styles.withdrawBtn}>
          <Building2 size={18} color="#ef4444" style={{ marginRight: 6 }} />
          <Text style={styles.withdrawText}>Request Instant Bank Transfer</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Growth Card */}
      <View style={styles.growthCard}>
        <View style={styles.growthLeft}>
          <TrendingUp size={22} color="#16a34a" />
          <Text style={styles.growthTitle}>Weekly Earnings Growth</Text>
        </View>
        <Text style={styles.growthPercent}>+24%</Text>
      </View>

      {/* Security Guarantee Pill */}
      <View style={styles.securityPill}>
        <ShieldCheck size={16} color="#16a34a" />
        <Text style={styles.securityPillText}>Direct NEFT/IMPS settlement to registered bank account</Text>
      </View>

      {/* History */}
      <Text style={styles.sectionTitle}>Earnings History</Text>
      <View style={styles.txList}>
        <View style={styles.txCard}>
          <View style={styles.txLeft}>
            <View style={[styles.txIconBox, { backgroundColor: "#f0fdf4" }]}>
              <ArrowDownRight size={20} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.txTitle}>Doorstep Screen Repair Payout</Text>
              <Text style={styles.txSub}>Booking Ref: #bk_screen</Text>
            </View>
          </View>
          <Text style={styles.txCredit}>+₹1,699.00</Text>
        </View>

        <View style={styles.txCard}>
          <View style={styles.txLeft}>
            <View style={[styles.txIconBox, { backgroundColor: "#fef2f2" }]}>
              <ArrowUpRight size={20} color="#ef4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.txTitle}>Bank Withdrawal Settlement</Text>
              <Text style={styles.txSub}>HDFC Bank • Completed</Text>
            </View>
          </View>
          <Text style={styles.txDebit}>-₹1,000.00</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: "#ef4444",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 14,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heroLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  walletIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroValue: {
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 20,
  },
  withdrawBtn: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "800",
  },
  growthCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  growthLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  growthTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginLeft: 10,
  },
  growthPercent: {
    fontSize: 15,
    fontWeight: "900",
    color: "#16a34a",
  },
  securityPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  securityPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803d",
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 12,
  },
  txList: {
    gap: 10,
  },
  txCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    padding: 16,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  txSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  txCredit: {
    fontSize: 16,
    fontWeight: "900",
    color: "#16a34a",
  },
  txDebit: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ef4444",
  },
});
