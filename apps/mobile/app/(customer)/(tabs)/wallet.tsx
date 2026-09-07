import React, { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput, 
  ActivityIndicator, 
  StyleSheet 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ui/ToastProvider";
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle, 
  X,
  Clock,
  Banknote
} from "lucide-react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

interface WalletTransaction {
  id: string;
  type: "CREDIT" | "DEBIT";
  title: string;
  description: string;
  amount: number;
  timestamp: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
}

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "tx_topup_101",
    type: "CREDIT",
    title: "Wallet Top-up",
    description: "Via UPI (Google Pay) • #UPI-892147",
    amount: 500,
    timestamp: "Today, 11:30 AM",
    status: "SUCCESS",
  },
  {
    id: "tx_booking_102",
    type: "DEBIT",
    title: "AC Foam Jet Service",
    description: "Paid for Order #bk_98234",
    amount: 499,
    timestamp: "Yesterday, 03:45 PM",
    status: "SUCCESS",
  },
  {
    id: "tx_cashback_103",
    type: "CREDIT",
    title: "Inisha First Order Cashback",
    description: "Promotional bonus credit",
    amount: 150,
    timestamp: "3 days ago",
    status: "SUCCESS",
  },
  {
    id: "tx_booking_104",
    type: "DEBIT",
    title: "Home Deep Cleaning",
    description: "Advance deposit for Order #bk_91044",
    amount: 400,
    timestamp: "1 week ago",
    status: "SUCCESS",
  },
];

const LOCAL_WALLET_BALANCE_KEY = "@inisha_wallet_balance";
const LOCAL_WALLET_TX_KEY = "@inisha_wallet_transactions";

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const [balance, setBalance] = useState<number>(1250);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [filterType, setFilterType] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");

  // Add Money Modal State
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("500");
  const [paymentOption, setPaymentOption] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Load persistent wallet data
  useEffect(() => {
    const loadWalletData = async () => {
      try {
        const savedBal = await AsyncStorage.getItem(LOCAL_WALLET_BALANCE_KEY);
        if (savedBal) {
          setBalance(Number(savedBal));
        }
        const savedTx = await AsyncStorage.getItem(LOCAL_WALLET_TX_KEY);
        if (savedTx) {
          setTransactions(JSON.parse(savedTx));
        }
      } catch (e) {
        console.warn("Wallet storage load error:", e);
      }
    };
    loadWalletData();
  }, []);

  const handleAddMoney = async () => {
    const numAmount = parseInt(customAmount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      showError("Please enter a valid amount (Minimum ₹100)");
      return;
    }
    if (numAmount < 100) {
      showError("Minimum top-up amount is ₹100");
      return;
    }

    setIsAddingFunds(true);
    try {
      // Simulate real bank/UPI gateway processing
      await new Promise((res) => setTimeout(res, 900));

      const newBal = balance + numAmount;
      const newTx: WalletTransaction = {
        id: `tx_add_${Date.now()}`,
        type: "CREDIT",
        title: "Wallet Top-up",
        description: `Via ${paymentOption} • Ref #${Math.floor(100000 + Math.random() * 900000)}`,
        amount: numAmount,
        timestamp: "Just now",
        status: "SUCCESS",
      };

      const updatedTxList = [newTx, ...transactions];
      setBalance(newBal);
      setTransactions(updatedTxList);

      await AsyncStorage.setItem(LOCAL_WALLET_BALANCE_KEY, String(newBal));
      await AsyncStorage.setItem(LOCAL_WALLET_TX_KEY, JSON.stringify(updatedTxList));

      showSuccess(`₹${numAmount} successfully added to your Inisha Wallet!`);
      setIsAddMoneyOpen(false);
      setCustomAmount("500");
    } catch (err) {
      showError("Payment failed. Please try again.");
    } finally {
      setIsAddingFunds(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "ALL") return true;
    return tx.type === filterType;
  });

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top + 8, 20) }]}>
      <ScrollView 
        style={styles.mainScroll} 
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Header */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>Inisha Wallet</Text>
          <Text style={styles.headerSubtitle}>1-Tap instant checkout & hassle-free refunds</Text>
        </View>

        {/* Available Balance Hero Card */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ShieldCheck size={16} color="#c4b5fd" />
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            </View>
            <View style={styles.walletIconCircle}>
              <Wallet size={20} color="#ffffff" />
            </View>
          </View>

          <Text style={styles.balanceAmount}>₹{balance.toLocaleString("en-IN")}.00</Text>

          {/* Quick Add Money Action */}
          <View style={styles.cardActionsRow}>
            <TouchableOpacity 
              activeOpacity={0.85}
              onPress={() => setIsAddMoneyOpen(true)}
              style={styles.addMoneyBtn}
            >
              <Plus size={16} color="#7c3aed" />
              <Text style={styles.addMoneyBtnText}>Add Money</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.85}
              onPress={() => showSuccess("Instant refund guarantee is active on all bookings")}
              style={styles.rewardsPill}
            >
              <Sparkles size={14} color="#fcd34d" />
              <Text style={styles.rewardsPillText}>Instant Refunds</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Quick Amount Pills */}
        <View style={styles.quickPillsRow}>
          {[100, 250, 500, 1000, 2000].map((amt) => (
            <TouchableOpacity
              key={amt}
              activeOpacity={0.8}
              onPress={() => {
                setCustomAmount(String(amt));
                setIsAddMoneyOpen(true);
              }}
              style={styles.quickPill}
            >
              <Text style={styles.quickPillText}>+₹{amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions Section with Filter Tabs */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          
          {/* Segmented Filter */}
          <View style={styles.filterPillsContainer}>
            {(["ALL", "CREDIT", "DEBIT"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                activeOpacity={0.7}
                onPress={() => setFilterType(t)}
                style={[
                  styles.filterPill,
                  filterType === t ? styles.filterPillActive : null
                ]}
              >
                <Text style={[styles.filterPillText, filterType === t ? styles.filterPillTextActive : null]}>
                  {t === "ALL" ? "All" : t === "CREDIT" ? "Credits" : "Debits"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Clock size={28} color="#64748b" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptySubtitle}>No records found for the selected filter.</Text>
          </View>
        ) : (
          filteredTransactions.map((tx) => {
            const isCredit = tx.type === "CREDIT";
            return (
              <Animated.View 
                key={tx.id} 
                entering={FadeInDown.duration(400)}
                style={styles.transactionItem}
              >
                <View style={[styles.txIconBox, isCredit ? styles.txCreditIcon : styles.txDebitIcon]}>
                  {isCredit ? (
                    <ArrowDownLeft size={18} color="#10b981" />
                  ) : (
                    <ArrowUpRight size={18} color="#f43f5e" />
                  )}
                </View>

                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                  <Text style={styles.txTime}>{tx.timestamp}</Text>
                </View>

                <Text style={[styles.txAmount, isCredit ? styles.txAmountCredit : styles.txAmountDebit]}>
                  {isCredit ? "+" : "-"}₹{tx.amount}.00
                </Text>
              </Animated.View>
            );
          })
        )}

      </ScrollView>

      {/* Add Money Modal */}
      <Modal
        visible={isAddMoneyOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddMoneyOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Add Money to Wallet</Text>
                <Text style={styles.modalHeaderSub}>Instant UPI & Card Top-up</Text>
              </View>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setIsAddMoneyOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              
              {/* Amount Input */}
              <Text style={styles.inputLabel}>ENTER AMOUNT (₹)</Text>
              <View style={styles.amountInputBox}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  value={customAmount}
                  onChangeText={(t) => setCustomAmount(t.replace(/[^0-9]/g, ""))}
                  placeholder="500"
                  placeholderTextColor="#475569"
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.amountTextInput}
                />
              </View>

              {/* Quick Amount Suggestion Chips */}
              <View style={{ flexDirection: "row", gap: 8, marginVertical: 12 }}>
                {[200, 500, 1000, 2000].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    activeOpacity={0.8}
                    onPress={() => setCustomAmount(String(amt))}
                    style={[
                      styles.suggestionChip,
                      customAmount === String(amt) ? styles.suggestionChipSelected : null
                    ]}
                  >
                    <Text style={[styles.suggestionChipText, customAmount === String(amt) ? { color: "#ffffff" } : null]}>
                      +₹{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Payment Mode Selector */}
              <Text style={styles.inputLabel}>SELECT PAYMENT METHOD</Text>
              <View style={{ gap: 8, marginBottom: 18 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPaymentOption("UPI")}
                  style={[styles.paymentMethodRow, paymentOption === "UPI" ? styles.paymentMethodSelected : null]}
                >
                  <View style={styles.methodIconBox}>
                    <Sparkles size={16} color="#8b5cf6" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.methodTitle}>UPI (Google Pay, PhonePe, Paytm)</Text>
                    <Text style={styles.methodSub}>Instant 100% zero surcharge</Text>
                  </View>
                  {paymentOption === "UPI" && <CheckCircle size={16} color="#8b5cf6" />}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPaymentOption("CARD")}
                  style={[styles.paymentMethodRow, paymentOption === "CARD" ? styles.paymentMethodSelected : null]}
                >
                  <View style={styles.methodIconBox}>
                    <CreditCard size={16} color="#38bdf8" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.methodTitle}>Debit / Credit Card</Text>
                    <Text style={styles.methodSub}>Visa, MasterCard, RuPay</Text>
                  </View>
                  {paymentOption === "CARD" && <CheckCircle size={16} color="#38bdf8" />}
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleAddMoney}
                disabled={isAddingFunds}
                style={styles.modalAddBtn}
              >
                {isAddingFunds ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalAddBtnText}>
                    Pay ₹{customAmount || "0"} & Top-up Wallet
                  </Text>
                )}
              </TouchableOpacity>

            </ScrollView>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
  },
  mainScroll: {
    flex: 1,
  },
  headerBox: {
    marginBottom: 16,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: "#7c3aed",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 14,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    color: "#ede9fe",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 6,
  },
  walletIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceAmount: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginVertical: 14,
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addMoneyBtn: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addMoneyBtnText: {
    color: "#7c3aed",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },
  rewardsPill: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  rewardsPillText: {
    color: "#f3e8ff",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },
  quickPillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickPill: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  quickPillText: {
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  filterPillsContainer: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 12,
    padding: 3,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
  },
  filterPillActive: {
    backgroundColor: "#7c3aed",
  },
  filterPillText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "700",
  },
  filterPillTextActive: {
    color: "#ffffff",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  txIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  txCreditIcon: {
    backgroundColor: "rgba(2, 44, 34, 0.8)",
    borderColor: "#10b981",
    borderWidth: 1,
  },
  txDebitIcon: {
    backgroundColor: "rgba(69, 10, 10, 0.8)",
    borderColor: "#f43f5e",
    borderWidth: 1,
  },
  txTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  txDesc: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 1,
  },
  txTime: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "800",
  },
  txAmountCredit: {
    color: "#10b981",
  },
  txAmountDebit: {
    color: "#f43f5e",
  },
  emptyCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeaderTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  modalHeaderSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  amountInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  currencyPrefix: {
    color: "#7c3aed",
    fontSize: 24,
    fontWeight: "900",
    marginRight: 6,
  },
  amountTextInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    paddingVertical: 10,
  },
  suggestionChip: {
    flex: 1,
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  suggestionChipSelected: {
    backgroundColor: "#7c3aed",
    borderColor: "#8b5cf6",
  },
  suggestionChipText: {
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: "700",
  },
  paymentMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  paymentMethodSelected: {
    borderColor: "#7c3aed",
    backgroundColor: "rgba(124, 58, 237, 0.1)",
  },
  methodIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  methodTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  methodSub: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 1,
  },
  modalAddBtn: {
    backgroundColor: "#7c3aed",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  modalAddBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
});

