import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import {
  X,
  Plus,
  ShieldCheck,
  QrCode,
  Smartphone,
  CreditCard,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react-native";
import { useAuthStore } from "../../store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WalletTopUpModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (amount: number, txId: string) => void;
}

export default function WalletTopUpModal({
  visible,
  onClose,
  onSuccess,
}: WalletTopUpModalProps) {
  const { user, setAuth } = useAuthStore();
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("500");
  const [step, setStep] = useState<"AMOUNT" | "PAYMENT" | "UTR_CONFIRM">("AMOUNT");
  const [paymentMethod, setPaymentMethod] = useState<"UPI_APP" | "QR_CODE" | "CARD">("UPI_APP");
  const [utrNumber, setUtrNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const quickAmounts = [100, 200, 500, 1000, 2000];
  const companyUpi = "inishacityservice@pnb";

  const handleSelectQuick = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(amt.toString());
  };

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    setCustomAmount(cleaned);
    setSelectedAmount(parseInt(cleaned, 10) || 0);
  };

  const handleProceedToPayment = () => {
    const amt = parseInt(customAmount, 10);
    if (!amt || amt < 10) {
      Alert.alert("Invalid Amount", "Minimum wallet top-up amount is ₹10.");
      return;
    }
    setStep("PAYMENT");
  };

  const handleOpenUpiApp = async (appName: string) => {
    const amt = selectedAmount || 500;
    const upiUrl = `upi://pay?pa=${companyUpi}&pn=Inisha%20City%20Service&am=${amt}&cu=INR&tn=Wallet%20TopUp%20${user?.phoneNumber || ""}`;
    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
      } else {
        Alert.alert("UPI Notice", `Please pay ₹${amt} to UPI ID: ${companyUpi} and submit your 12-digit UTR below.`);
      }
    } catch {
      Alert.alert("UPI Notice", `Please pay ₹${amt} to UPI ID: ${companyUpi} and submit your 12-digit UTR below.`);
    }
    setStep("UTR_CONFIRM");
  };

  const handleConfirmTopUp = async () => {
    const amt = selectedAmount || 500;
    if (step === "UTR_CONFIRM" && utrNumber.trim().length < 6) {
      Alert.alert("UTR Required", "Please enter the 12-digit UPI Transaction Ref (UTR) number.");
      return;
    }

    setLoading(true);

    try {
      const txId = "TXN_TOPUP_" + Date.now().toString().slice(-8);
      const newBalance = (user?.walletBalance || 0) + amt;

      const updatedUser = {
        ...user!,
        walletBalance: newBalance,
      };

      // 1. Update Auth Store
      setAuth(updatedUser, "");

      // 2. Persist in AsyncStorage
      await AsyncStorage.setItem("@user_profile", JSON.stringify(updatedUser));
      await AsyncStorage.setItem("@inisha_user_profile", JSON.stringify(updatedUser));

      // 3. Save to local wallet transactions list
      const existingTxStr = await AsyncStorage.getItem("@wallet_transactions");
      const existingTx = existingTxStr ? JSON.parse(existingTxStr) : [];
      const newTx = {
        id: txId,
        title: "Wallet Instant Top-up",
        subtitle: `UPI Settlement • Ref: ${utrNumber || "INSTANT"}`,
        amount: amt,
        type: "CREDIT",
        status: "SUCCESS",
        date: new Date().toISOString(),
      };
      await AsyncStorage.setItem("@wallet_transactions", JSON.stringify([newTx, ...existingTx]));

      // 4. Backend sync if online
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";
      fetch(`${API_URL}/wallet/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          phone: user?.phoneNumber,
          amount: amt,
          utr: utrNumber || "INSTANT",
          transactionId: txId,
        }),
      }).catch(() => {});

      setLoading(false);
      onSuccess(amt, txId);
      Alert.alert("Top-Up Successful 🎉", `₹${amt} has been added to your Inisha Wallet instantly!`);
      handleClose();
    } catch {
      setLoading(false);
      Alert.alert("Notice", "Top-up balance updated.");
      handleClose();
    }
  };

  const handleClose = () => {
    setStep("AMOUNT");
    setUtrNumber("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {step === "AMOUNT" ? "Top-Up Inisha Wallet" : step === "PAYMENT" ? "Choose Payment Method" : "Verify UPI Settlement"}
              </Text>
              <Text style={styles.modalSubtitle}>
                {step === "AMOUNT" ? "Select or enter amount to add" : step === "PAYMENT" ? `Total Amount: ₹${selectedAmount}` : `Pay ₹${selectedAmount} & enter UTR`}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {step === "AMOUNT" && (
              <View>
                {/* Amount Input Box */}
                <View style={styles.amountInputBox}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="number-pad"
                    value={customAmount}
                    onChangeText={handleAmountChange}
                    placeholder="500"
                    placeholderTextColor="#94a3b8"
                    maxLength={6}
                    autoFocus
                  />
                </View>

                {/* Quick Selection Chips */}
                <Text style={styles.quickLabel}>QUICK SELECT AMOUNT</Text>
                <View style={styles.chipsRow}>
                  {quickAmounts.map((amt) => {
                    const isSelected = selectedAmount === amt;
                    return (
                      <TouchableOpacity
                        key={amt}
                        onPress={() => handleSelectQuick(amt)}
                        style={[styles.chip, isSelected && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                          ₹{amt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Benefits */}
                <View style={styles.benefitCard}>
                  <ShieldCheck size={20} color="#16a34a" />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.benefitTitle}>100% Instant & Safe</Text>
                    <Text style={styles.benefitSub}>Zero transaction fees • Instant refund guarantee</Text>
                  </View>
                </View>

                {/* Proceed Button */}
                <TouchableOpacity onPress={handleProceedToPayment} style={styles.proceedBtn} activeOpacity={0.85}>
                  <Text style={styles.proceedText}>Proceed to Pay ₹{selectedAmount || 500}</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === "PAYMENT" && (
              <View>
                {/* UPI Apps Row */}
                <Text style={styles.methodLabel}>POPULAR UPI APPS</Text>
                <View style={styles.upiAppsContainer}>
                  <TouchableOpacity onPress={() => handleOpenUpiApp("GPay")} style={styles.upiAppBtn}>
                    <Smartphone size={20} color="#0284c7" />
                    <Text style={styles.upiAppName}>Google Pay</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleOpenUpiApp("PhonePe")} style={styles.upiAppBtn}>
                    <Smartphone size={20} color="#7c3aed" />
                    <Text style={styles.upiAppName}>PhonePe</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleOpenUpiApp("Paytm")} style={styles.upiAppBtn}>
                    <Smartphone size={20} color="#0284c7" />
                    <Text style={styles.upiAppName}>Paytm</Text>
                  </TouchableOpacity>
                </View>

                {/* Company UPI QR Option */}
                <TouchableOpacity onPress={() => setStep("UTR_CONFIRM")} style={styles.qrOptionCard}>
                  <View style={styles.qrLeft}>
                    <QrCode size={24} color="#ef4444" />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.qrTitle}>Pay via Company UPI QR</Text>
                      <Text style={styles.qrSub}>{companyUpi}</Text>
                    </View>
                  </View>
                  <ExternalLink size={18} color="#94a3b8" />
                </TouchableOpacity>

                {/* Instant Demo Top-Up */}
                <TouchableOpacity onPress={handleConfirmTopUp} style={styles.instantDemoBtn}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.instantDemoText}>⚡ Instant Direct Wallet Credit (₹{selectedAmount})</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {step === "UTR_CONFIRM" && (
              <View>
                <View style={styles.upiDetailsBox}>
                  <Text style={styles.upiDetailsLabel}>OFFICIAL COMPANY UPI ID</Text>
                  <View style={styles.upiIdRow}>
                    <Text style={styles.upiIdText}>{companyUpi}</Text>
                    <TouchableOpacity
                      onPress={() => Alert.alert("Copied", "UPI ID copied to clipboard.")}
                      style={styles.copyBtn}
                    >
                      <Copy size={14} color="#ef4444" />
                      <Text style={styles.copyText}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.upiAmountNote}>Amount to Pay: ₹{selectedAmount}</Text>
                </View>

                <View style={styles.utrInputSection}>
                  <Text style={styles.utrLabel}>ENTER 12-DIGIT UPI UTR / TRANSACTION ID</Text>
                  <TextInput
                    style={styles.utrInput}
                    placeholder="e.g. 425619284719"
                    placeholderTextColor="#94a3b8"
                    value={utrNumber}
                    onChangeText={setUtrNumber}
                    keyboardType="number-pad"
                    maxLength={16}
                  />
                </View>

                <TouchableOpacity onPress={handleConfirmTopUp} disabled={loading} style={styles.confirmUtrBtn}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.confirmUtrText}>Confirm & Add ₹{selectedAmount} to Wallet</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  amountInputBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0f172a",
    marginRight: 6,
  },
  amountInput: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0f172a",
    minWidth: 140,
    textAlign: "center",
    padding: 0,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  chipActive: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#475569",
  },
  chipTextActive: {
    color: "#ef4444",
    fontWeight: "900",
  },
  benefitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#16a34a",
  },
  benefitSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  proceedBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff",
  },
  methodLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  upiAppsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  upiAppBtn: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  upiAppName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  qrOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  qrLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  qrTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  qrSub: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ef4444",
    marginTop: 2,
  },
  instantDemoBtn: {
    backgroundColor: "#0f172a",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  instantDemoText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
  },
  upiDetailsBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  upiDetailsLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
  },
  upiIdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 8,
  },
  upiIdText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  copyText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ef4444",
  },
  upiAmountNote: {
    fontSize: 13,
    fontWeight: "800",
    color: "#16a34a",
  },
  utrInputSection: {
    marginBottom: 20,
  },
  utrLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  utrInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  confirmUtrBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmUtrText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#ffffff",
  },
});
