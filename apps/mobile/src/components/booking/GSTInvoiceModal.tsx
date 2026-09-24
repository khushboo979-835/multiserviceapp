import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
} from "react-native";
import { Booking } from "../../types";
import {
  FileText,
  X,
  Download,
  Share2,
  CheckCircle,
  ShieldCheck,
  Building,
} from "lucide-react-native";

interface GSTInvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export default function GSTInvoiceModal({
  visible,
  onClose,
  booking,
}: GSTInvoiceModalProps) {
  if (!booking) return null;

  const invoiceNumber = `INV-${booking.id.replace("bk_", "")}-2026`;
  const invoiceDate = new Date(booking.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const basePrice = booking.pricing?.basePrice || 499;
  const cgst = Math.round(basePrice * 0.09);
  const sgst = Math.round(basePrice * 0.09);
  const convenienceFee = 29;
  const discount = booking.pricing?.couponDiscount || 0;
  const totalAmount = basePrice + cgst + sgst + convenienceFee - discount;

  const generateInvoiceText = () => {
    return `=========================================\n       INISHA CITY SERVICE PVT. LTD.\n  Main Road, Kankarbagh, Patna, Bihar - 800020\n          GSTIN: 10AAACI9876C1Z5\n=========================================\nTAX INVOICE: ${invoiceNumber}\nDATE: ${invoiceDate}\n\nBILLED TO (CUSTOMER):\nName: ${booking.customerName || "Customer"}\nPhone: ${booking.customerPhone || "Verified"}\nAddress: ${booking.selectedAddress?.formattedAddress || "Patna, Bihar"}\n\n-----------------------------------------\nSERVICE DESCRIPTION       SAC      AMOUNT\n-----------------------------------------\nDoorstep Certified Work   998713   ₹${basePrice}\nTaxable Value                      ₹${basePrice}\nCGST (9.0%)                        ₹${cgst}\nSGST / UTGST (9.0%)                ₹${sgst}\nPlatform Convenience Fee           ₹${convenienceFee}\n-----------------------------------------\nTOTAL INVOICE AMOUNT               ₹${totalAmount}\nPAYMENT STATUS: ${booking.paymentStatus || "COMPLETED"}\n=========================================\nThank you for choosing Inisha City Service!`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `GST Tax Invoice #${invoiceNumber}`,
        message: generateInvoiceText(),
      });
    } catch {}
  };

  const handleDownload = async () => {
    try {
      await Share.share({
        title: `Download GST Invoice #${invoiceNumber}`,
        message: generateInvoiceText(),
      });
      Alert.alert(
        "Invoice Exported 📄",
        `Tax Invoice #${invoiceNumber} is ready! You can save as PDF, print, or share via Drive/WhatsApp.`
      );
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <FileText size={20} color="#ef4444" />
              <Text style={styles.title}>GST Tax Invoice</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {/* Company Brand Header */}
            <View style={styles.invoiceHeaderBox}>
              <Text style={styles.companyName}>INISHA CITY SERVICE PVT. LTD.</Text>
              <Text style={styles.companyAddress}>
                Main Road, Kankarbagh, Patna, Bihar - 800020
              </Text>
              <View style={styles.gstinBadge}>
                <Text style={styles.gstinText}>GSTIN: 10AAACI9876C1Z5 (Bihar)</Text>
              </View>
            </View>

            {/* Meta Row */}
            <View style={styles.metaGrid}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Invoice No:</Text>
                <Text style={styles.metaVal}>{invoiceNumber}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Invoice Date:</Text>
                <Text style={styles.metaVal}>{invoiceDate}</Text>
              </View>
            </View>

            {/* Billed To */}
            <View style={styles.billedToCard}>
              <Text style={styles.sectionHeading}>Billed To (Customer):</Text>
              <Text style={styles.customerName}>{booking.customerName}</Text>
              <Text style={styles.customerPhone}>Phone: {booking.customerPhone}</Text>
              <Text style={styles.customerAddress} numberOfLines={2}>
                Address: {booking.selectedAddress?.formattedAddress || "Patna, Bihar"}
              </Text>
            </View>

            {/* Line Items Table */}
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCol, { flex: 2 }]}>Service Description</Text>
                <Text style={[styles.tableCol, { flex: 1, textAlign: "center" }]}>SAC Code</Text>
                <Text style={[styles.tableCol, { flex: 1, textAlign: "right" }]}>Amount</Text>
              </View>

              <View style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.itemTitle}>Doorstep Certified Service</Text>
                  <Text style={styles.itemSub}>Booking ID: #{booking.id}</Text>
                </View>
                <Text style={[styles.itemText, { flex: 1, textAlign: "center" }]}>998713</Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: "right", fontWeight: "700" }]}>
                  ₹{basePrice}
                </Text>
              </View>

              {/* Tax Calculations */}
              <View style={styles.divider} />
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Taxable Base Value</Text>
                <Text style={styles.calcVal}>₹{basePrice}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>CGST (9.0%)</Text>
                <Text style={styles.calcVal}>₹{cgst}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>SGST / UTGST (9.0%)</Text>
                <Text style={styles.calcVal}>₹{sgst}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Platform Convenience Fee</Text>
                <Text style={styles.calcVal}>₹{convenienceFee}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.calcRow}>
                  <Text style={[styles.calcLabel, { color: "#16a34a" }]}>Coupon Discount</Text>
                  <Text style={[styles.calcVal, { color: "#16a34a" }]}>-₹{discount}</Text>
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Invoice Amount</Text>
                <Text style={styles.totalVal}>₹{totalAmount}</Text>
              </View>
            </View>

            {/* Payment Badge */}
            <View style={styles.paymentStatusCard}>
              <CheckCircle size={18} color="#16a34a" />
              <Text style={styles.paymentStatusText}>
                Payment Status: {booking.paymentStatus === "SUCCESS" ? "PAID ONLINE" : "CASH AFTER SERVICE"}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={handleDownload} style={styles.downloadBtn} activeOpacity={0.85}>
                <Download size={16} color="#ffffff" />
                <Text style={styles.downloadText}>Download PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.85}>
                <Share2 size={16} color="#0f172a" />
                <Text style={styles.shareText}>Share</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    marginBottom: 10,
  },
  invoiceHeaderBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  companyAddress: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  gstinBadge: {
    backgroundColor: "#ef4444",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  gstinText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  metaVal: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 2,
  },
  billedToCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  customerPhone: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },
  customerAddress: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableCol: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  itemSub: {
    fontSize: 11,
    color: "#64748b",
  },
  itemText: {
    fontSize: 12,
    color: "#0f172a",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 8,
  },
  calcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  calcLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  calcVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1.5,
    borderTopColor: "#0f172a",
    paddingTop: 8,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  totalVal: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ef4444",
  },
  paymentStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    padding: 10,
    gap: 8,
    marginBottom: 16,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16a34a",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  downloadText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  shareText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
});
