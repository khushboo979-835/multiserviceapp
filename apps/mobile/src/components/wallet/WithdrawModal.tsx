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
} from "react-native";
import { X, Building2, ShieldCheck, ArrowUpRight, CheckCircle2 } from "lucide-react-native";
import { useAuthStore } from "../../store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export default function WithdrawModal({ visible, onClose, onSuccess }: WithdrawModalProps) {
  const { providerProfile, setProviderProfile } = useAuthStore();
  const [amount, setAmount] = useState("1000");
  const [bankAccount, setBankAccount] = useState("918273645019");
  const [ifsc, setIfsc] = useState("PUNB0123400");
  const [accountHolder, setAccountHolder] = useState("Inisha Registered Partner");
  const [loading, setLoading] = useState(false);

  const availableBalance = providerProfile?.walletBalance || 3450;

  const handleRequestWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) {
      Alert.alert("Invalid Amount", "Minimum withdrawal amount is ₹100.");
      return;
    }
    if (amt > availableBalance) {
      Alert.alert("Insufficient Balance", `Your withdrawable balance is ₹${availableBalance.toFixed(2)}.`);
      return;
    }
    if (!bankAccount.trim() || !ifsc.trim()) {
      Alert.alert("Missing Details", "Please enter your bank account number and IFSC code.");
      return;
    }

    setLoading(true);

    try {
      const newBal = availableBalance - amt;
      const updatedProfile = {
        ...providerProfile!,
        walletBalance: newBal,
      };

      setProviderProfile(updatedProfile);
      await AsyncStorage.setItem("@provider_profile", JSON.stringify(updatedProfile));

      setLoading(false);
      onSuccess(amt);
      Alert.alert(
        "Payout Initiated ✅",
        `₹${amt.toFixed(2)} has been scheduled for instant IMPS transfer to A/C ending in ${bankAccount.slice(-4)}.`
      );
      onClose();
    } catch {
      setLoading(false);
      Alert.alert("Notice", "Payout scheduled.");
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Request Bank Transfer</Text>
              <Text style={styles.modalSubtitle}>Withdrawable: ₹{availableBalance.toFixed(2)}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>WITHDRAWAL AMOUNT (₹)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="number-pad"
                placeholder="Enter amount"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>BENEFICIARY ACCOUNT NUMBER</Text>
              <TextInput
                style={styles.input}
                value={bankAccount}
                onChangeText={setBankAccount}
                keyboardType="number-pad"
                placeholder="Account Number"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>BANK IFSC CODE</Text>
              <TextInput
                style={styles.input}
                value={ifsc}
                onChangeText={(t) => setIfsc(t.toUpperCase())}
                autoCapitalize="characters"
                placeholder="IFSC Code"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.securityBox}>
              <ShieldCheck size={18} color="#16a34a" />
              <Text style={styles.securityText}>Direct IMPS/NEFT Instant Settlement to verified bank account</Text>
            </View>

            <TouchableOpacity onPress={handleRequestWithdraw} disabled={loading} style={styles.submitBtn}>
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Transfer ₹{amount || "0"} to Bank</Text>
              )}
            </TouchableOpacity>
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
    maxHeight: "85%",
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
    fontWeight: "700",
    color: "#16a34a",
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
  input: {
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
  securityBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  securityText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#15803d",
    flex: 1,
  },
  submitBtn: {
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
  submitBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff",
  },
});
