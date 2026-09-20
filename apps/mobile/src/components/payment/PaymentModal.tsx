import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Image,
  Linking,
  StyleSheet,
} from "react-native";
import { useAuthStore } from "../../store/useAuthStore";
import {
  CreditCard,
  Wallet,
  Smartphone,
  ShieldCheck,
  X,
  Copy,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Sparkles,
} from "lucide-react-native";
import { PricingDetail, PaymentMethod } from "../../types";
import { PaymentService } from "../../services/payment.service";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  pricing: PricingDetail;
  bookingId?: string;
  onPaymentSuccess: (method: PaymentMethod, utr?: string) => void;
}

export default function PaymentModal({
  visible,
  onClose,
  pricing,
  bookingId = "bk_884291",
  onPaymentSuccess,
}: PaymentModalProps) {
  const { user } = useAuthStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("UPI");
  const [loading, setLoading] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrSubmitted, setUtrSubmitted] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"SELECT" | "UPI_PAY">("UPI_PAY");

  const companyUpiId = PaymentService.COMPANY_UPI_ID;
  const merchantName = PaymentService.MERCHANT_NAME;
  const bankName = PaymentService.BANK_NAME;

  const subtotal = pricing.basePrice + pricing.addOnPrice;
  const gstTax = Math.round(subtotal * 0.18);
  const platformFee = 29;
  const finalAmount = Math.max(0, pricing.finalAmount || subtotal + gstTax + platformFee);

  const upiIntent = PaymentService.generateUpiIntent(
    bookingId,
    finalAmount,
    merchantName,
    companyUpiId
  );

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    upiIntent
  )}&bgcolor=ffffff&color=0f172a&margin=2`;

  const handleCopyUpiId = () => {
    setCopiedUpi(true);
    Alert.alert("✅ UPI ID Copied", `${companyUpiId} copied to clipboard.`);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleOpenUpiApp = async () => {
    try {
      const supported = await Linking.canOpenURL(upiIntent);
      if (supported) {
        await Linking.openURL(upiIntent);
      } else {
        await Linking.openURL(upiIntent).catch(() => {
          Alert.alert(
            "UPI Apps",
            `Please open Google Pay, PhonePe, or Paytm and send ₹${finalAmount} to ${companyUpiId}`
          );
        });
      }
    } catch {
      Alert.alert(
        "UPI Intent",
        `Please open Google Pay, PhonePe, or Paytm and send ₹${finalAmount} to ${companyUpiId}`
      );
    }
  };

  const handleSubmitUtr = async () => {
    const cleanUtr = utrNumber.trim().replace(/\D/g, "");
    if (cleanUtr.length !== 12) {
      setError("UTR must be exactly 12 numeric digits (e.g., 402812345678)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await PaymentService.submitUtr({
        bookingId,
        utrNumber: cleanUtr,
        amount: finalAmount,
        customerId: user?.id,
        customerName: user?.name,
        customerPhone: user?.phoneNumber || user?.phone,
      });

      if (res.success) {
        setUtrSubmitted(true);
        Alert.alert(
          "🎉 Payment Submitted!",
          `12-digit UTR ${cleanUtr} submitted. The technician will verify and finalize your service receipt.`,
          [
            {
              text: "Done",
              onPress: () => {
                onPaymentSuccess("UPI", cleanUtr);
                onClose();
              },
            },
          ]
        );
      } else {
        setError(res.message || "Failed to verify UTR. Please retry.");
      }
    } catch {
      setUtrSubmitted(true);
      onPaymentSuccess("UPI", cleanUtr);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCashCheckout = () => {
    onPaymentSuccess("CASH_AFTER_SERVICE");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Top Grabber */}
          <View style={styles.dragPill} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Doorstep UPI Checkout</Text>
              <Text style={styles.headerSub}>
                Direct settlement to {merchantName} ({bankName})
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={18} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Amount Banner */}
            <View style={styles.amountCard}>
              <View style={styles.amountLeft}>
                <Text style={styles.amountLabel}>Total Payable Amount</Text>
                <Text style={styles.amountValue}>₹{finalAmount}</Text>
              </View>
              <View style={styles.badgeBox}>
                <Sparkles size={12} color="#16a34a" />
                <Text style={styles.badgeText}>Direct UPI</Text>
              </View>
            </View>

            {/* Dynamic UPI QR Code Card */}
            <View style={styles.qrCard}>
              <View style={styles.qrHeaderRow}>
                <QrCode size={18} color="#ef4444" />
                <Text style={styles.qrHeaderTitle}>Scan Dynamic UPI QR Code</Text>
              </View>
              <Text style={styles.qrHeaderSub}>
                Scan with Google Pay, PhonePe, Paytm, BHIM, or any banking app
              </Text>

              {/* QR Image Visual */}
              <View style={styles.qrImageBox}>
                <Image
                  source={{ uri: qrImageUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>

              {/* Company UPI ID with Copy Button */}
              <View style={styles.upiCopyBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upiLabel}>OFFICIAL COMPANY UPI ID</Text>
                  <Text style={styles.upiIdText}>{companyUpiId}</Text>
                  <Text style={styles.upiBankName}>Bank: {bankName} (Current A/C)</Text>
                </View>
                <TouchableOpacity
                  onPress={handleCopyUpiId}
                  style={styles.copyBtn}
                  activeOpacity={0.8}
                >
                  <Copy size={14} color="#0f172a" style={{ marginRight: 4 }} />
                  <Text style={styles.copyBtnText}>
                    {copiedUpi ? "Copied!" : "Copy ID"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 1-Tap Pay via UPI App Intent Button */}
              <TouchableOpacity
                onPress={handleOpenUpiApp}
                style={styles.openUpiBtn}
                activeOpacity={0.85}
              >
                <Smartphone size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.openUpiText}>
                  1-Tap Pay via UPI App (GPay / PhonePe)
                </Text>
                <ExternalLink size={16} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>

            {/* 12-Digit UTR Submission Section */}
            <View style={styles.utrCard}>
              <View style={styles.utrHeaderRow}>
                <ShieldCheck size={20} color="#16a34a" />
                <Text style={styles.utrHeaderTitle}>
                  Step 2: Enter 12-Digit UTR Number
                </Text>
              </View>
              <Text style={styles.utrSub}>
                After successful transfer, paste the 12-digit Bank Reference / UTR Number from your payment receipt.
              </Text>

              <View style={styles.utrInputRow}>
                <TextInput
                  placeholder="12-digit UTR (e.g. 402891827364)"
                  placeholderTextColor="#94a3b8"
                  keyboardType="number-pad"
                  maxLength={12}
                  value={utrNumber}
                  onChangeText={(text) => {
                    setUtrNumber(text.replace(/\D/g, ""));
                    if (error) setError("");
                  }}
                  style={styles.utrInput}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                onPress={handleSubmitUtr}
                disabled={loading || utrNumber.length !== 12}
                style={[
                  styles.submitUtrBtn,
                  utrNumber.length !== 12 ? styles.btnDisabled : null,
                ]}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <CheckCircle2 size={18} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.submitUtrText}>
                      Submit 12-Digit UTR & Confirm
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Cash After Service Alternative */}
            <TouchableOpacity
              onPress={handleCashCheckout}
              style={styles.cashFallbackBtn}
              activeOpacity={0.7}
            >
              <CreditCard size={16} color="#64748b" style={{ marginRight: 6 }} />
              <Text style={styles.cashFallbackText}>
                Prefer Cash to Partner at Doorstep? Pay ₹{finalAmount} in Cash
              </Text>
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
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderTopWidth: 1.5,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  dragPill: {
    width: 44,
    height: 5,
    backgroundColor: "#cbd5e1",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    paddingBottom: 20,
  },
  amountCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  amountLeft: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 2,
  },
  badgeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#16a34a",
  },
  qrCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  qrHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  qrHeaderTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    marginLeft: 6,
  },
  qrHeaderSub: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "center",
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  qrImageBox: {
    width: 200,
    height: 200,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  upiCopyBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 12,
    width: "100%",
    marginBottom: 12,
  },
  upiLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#64748b",
    letterSpacing: 0.8,
  },
  upiIdText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
    fontFamily: "monospace",
    marginTop: 2,
  },
  upiBankName: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 1,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
  openUpiBtn: {
    width: "100%",
    backgroundColor: "#ef4444",
    paddingVertical: 13,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  openUpiText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffffff",
  },
  utrCard: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#bbf7d0",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  utrHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  utrHeaderTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#166534",
    marginLeft: 6,
  },
  utrSub: {
    fontSize: 11,
    fontWeight: "500",
    color: "#15803d",
    marginBottom: 12,
    lineHeight: 16,
  },
  utrInputRow: {
    marginBottom: 10,
  },
  utrInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#86efac",
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    fontFamily: "monospace",
    letterSpacing: 1.5,
  },
  errorText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ef4444",
    marginBottom: 8,
  },
  submitUtrBtn: {
    backgroundColor: "#16a34a",
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitUtrText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffffff",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  cashFallbackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 4,
  },
  cashFallbackText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
});

