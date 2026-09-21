import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Clock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { useBookingStore } from "../../../src/store/useBookingStore";
import BrandLogo from "../../../src/components/common/BrandLogo";
import WalletTopUpModal from "../../../src/components/wallet/WalletTopUpModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface TransactionItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  status: string;
  date: string;
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { bookingHistory } = useBookingStore();
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [customTransactions, setCustomTransactions] = useState<TransactionItem[]>([]);

  const walletBalance = user?.walletBalance ?? 250;

  const loadTransactions = async () => {
    try {
      const stored = await AsyncStorage.getItem("@wallet_transactions");
      if (stored) {
        setCustomTransactions(JSON.parse(stored));
      }
    } catch {}
  };

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const handleTopUpSuccess = (amt: number, txId: string) => {
    loadTransactions();
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 10 }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <BrandLogo size="sm" showText={false} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <Text style={styles.headerSubtitle}>Balance, Top-ups & Payments</Text>
        </View>
      </View>

      {/* Hero Balance Card */}
      <View style={styles.heroCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <View style={styles.walletIconCircle}>
            <Wallet size={20} color="#ffffff" />
          </View>
        </View>
        <Text style={styles.balanceValue}>₹{walletBalance.toFixed(2)}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setTopUpModalVisible(true)}
            style={styles.addMoneyBtn}
          >
            <Plus size={18} color="#ef4444" />
            <Text style={styles.addMoneyText}>Add Money (UPI / Cards)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Guarantee Pill */}
      <View style={styles.securityPill}>
        <ShieldCheck size={16} color="#16a34a" />
        <Text style={styles.securityPillText}>Instant Refunds & 100% Encrypted Wallet</Text>
      </View>

      {/* Transactions Section */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      <View style={styles.transactionsList}>
        {/* Custom top-ups */}
        {customTransactions.map((tx) => (
          <View key={tx.id} style={styles.txCard}>
            <View style={styles.txLeft}>
              <View style={[styles.txIconBox, { backgroundColor: tx.type === "CREDIT" ? "#f0fdf4" : "#fef2f2" }]}>
                {tx.type === "CREDIT" ? (
                  <ArrowDownLeft size={20} color="#16a34a" />
                ) : (
                  <ArrowUpRight size={20} color="#ef4444" />
                )}
              </View>
              <View style={styles.txDetails}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txSubtitle}>{tx.subtitle}</Text>
              </View>
            </View>
            <Text style={tx.type === "CREDIT" ? styles.txCredit : styles.txDebit}>
              {tx.type === "CREDIT" ? "+" : "-"}₹{tx.amount.toFixed(2)}
            </Text>
          </View>
        ))}

        {/* Welcome Credit */}
        <View style={styles.txCard}>
          <View style={styles.txLeft}>
            <View style={[styles.txIconBox, { backgroundColor: "#f0fdf4" }]}>
              <ArrowDownLeft size={20} color="#16a34a" />
            </View>
            <View style={styles.txDetails}>
              <Text style={styles.txTitle}>Welcome Promotional Credit</Text>
              <Text style={styles.txSubtitle}>Account Activation Bonus</Text>
            </View>
          </View>
          <Text style={styles.txCredit}>+₹250.00</Text>
        </View>

        {/* Real User Bookings Ledger */}
        {bookingHistory.map((booking, index) => (
          <View key={`${booking.id}_${index}`} style={styles.txCard}>
            <View style={styles.txLeft}>
              <View style={[styles.txIconBox, { backgroundColor: "#fef2f2" }]}>
                <ArrowUpRight size={20} color="#ef4444" />
              </View>
              <View style={styles.txDetails}>
                <Text style={styles.txTitle}>
                  {booking.subcategoryId === "sub_mob_doorstep"
                    ? "Doorstep Mobile Repair"
                    : "Doorstep Service Order"}
                </Text>
                <Text style={styles.txSubtitle}>Booking #{booking.id.slice(-6)} • {booking.status}</Text>
              </View>
            </View>
            <Text style={styles.txDebit}>-₹{booking.pricing?.finalAmount || 499}.00</Text>
          </View>
        ))}
      </View>

      {/* Top Up Modal */}
      <WalletTopUpModal
        visible={topUpModalVisible}
        onClose={() => setTopUpModalVisible(false)}
        onSuccess={handleTopUpSuccess}
      />
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
  headerTextContainer: {
    marginLeft: 12,
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
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
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
  balanceValue: {
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: "row",
  },
  addMoneyBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addMoneyText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
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
    fontSize: 12,
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
  transactionsList: {
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
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  txSubtitle: {
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
