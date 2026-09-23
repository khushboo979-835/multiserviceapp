import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import {
  X,
  Building2,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Save,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BankAccountModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [accountHolder, setAccountHolder] = useState("Inisha Service Partner");
  const [bankName, setBankName] = useState("State Bank of India");
  const [accountNumber, setAccountNumber] = useState("394820194857");
  const [confirmAccount, setConfirmAccount] = useState("394820194857");
  const [ifscCode, setIfscCode] = useState("SBIN0001234");
  const [upiId, setUpiId] = useState("partner@oksbi");
  const [isSaved, setIsSaved] = useState(true);

  // Load saved bank details
  useEffect(() => {
    const loadBank = async () => {
      try {
        const data = await AsyncStorage.getItem("@partner_bank_details");
        if (data) {
          const parsed = JSON.parse(data);
          setAccountHolder(parsed.accountHolder || "");
          setBankName(parsed.bankName || "");
          setAccountNumber(parsed.accountNumber || "");
          setConfirmAccount(parsed.accountNumber || "");
          setIfscCode(parsed.ifscCode || "");
          setUpiId(parsed.upiId || "");
          setIsSaved(true);
        }
      } catch {}
    };
    loadBank();
  }, []);

  const handleSave = async () => {
    if (!accountHolder.trim()) {
      Alert.alert("Required", "Please enter Account Holder Name.");
      return;
    }
    if (!accountNumber.trim() || accountNumber.length < 8) {
      Alert.alert("Invalid Account Number", "Please enter a valid bank account number.");
      return;
    }
    if (accountNumber !== confirmAccount) {
      Alert.alert("Mismatch", "Account number and confirmation do not match.");
      return;
    }
    if (!ifscCode.trim() || ifscCode.length < 11) {
      Alert.alert("Invalid IFSC", "Please enter a valid 11-digit IFSC code (e.g. SBIN0001234).");
      return;
    }

    const bankDetails = {
      accountHolder: accountHolder.trim(),
      bankName: bankName.trim() || "Nationalized Bank",
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      upiId: upiId.trim(),
      updatedAt: Date.now(),
    };

    try {
      await AsyncStorage.setItem("@partner_bank_details", JSON.stringify(bankDetails));
      setIsSaved(true);
      Alert.alert(
        "Bank Details Verified & Saved! 🏛️",
        "Your bank account is linked for instant IMPS & NEFT earnings withdrawal."
      );
      onClose();
    } catch {
      Alert.alert("Error", "Could not save bank details. Please try again.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Bank Account & Payouts</Text>
              <Text style={styles.subtitle}>Direct IMPS withdrawal settlement account</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Verified Status Card */}
            <View style={styles.statusCard}>
              <ShieldCheck size={20} color="#16a34a" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>Bank Account Verified for IMPS</Text>
                <Text style={styles.statusSub}>
                  Payouts are settled within 5-15 minutes to your registered bank account.
                </Text>
              </View>
            </View>

            {/* Account Holder Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ACCOUNT HOLDER NAME (AS PER PASSBOOK)</Text>
              <View style={styles.inputWrapper}>
                <Building2 size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  value={accountHolder}
                  onChangeText={setAccountHolder}
                  placeholder="e.g. Rahul Kumar"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Bank Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>BANK NAME</Text>
              <View style={styles.inputWrapper}>
                <Building2 size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="e.g. State Bank of India / HDFC Bank"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>BANK ACCOUNT NUMBER</Text>
              <View style={styles.inputWrapper}>
                <CreditCard size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Enter Account Number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Confirm Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM BANK ACCOUNT NUMBER</Text>
              <View style={styles.inputWrapper}>
                <CreditCard size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  value={confirmAccount}
                  onChangeText={setConfirmAccount}
                  placeholder="Re-enter Account Number"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* IFSC Code */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>IFSC CODE</Text>
              <View style={styles.inputWrapper}>
                <Building2 size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  style={[styles.textInput, { textTransform: "uppercase" }]}
                  value={ifscCode}
                  onChangeText={setIfscCode}
                  placeholder="e.g. SBIN0001234"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* UPI ID */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>UPI ID FOR INSTANT QR (OPTIONAL)</Text>
              <View style={styles.inputWrapper}>
                <Smartphone size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="e.g. partner@okhdfcbank"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSave}
              style={styles.saveBtn}
            >
              <Save size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.saveBtnText}>Save & Verify Bank Account</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: "88%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    padding: 14,
    borderRadius: 16,
    marginBottom: 18,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },
  statusSub: {
    fontSize: 12,
    color: "#15803d",
    marginTop: 2,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
});
