import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  Share,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Package,
  Wrench,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Gift,
  Download,
  FileText,
  MapPin,
  ChevronRight,
  ShieldCheck,
  X,
  Share2,
  Sparkles,
  Truck,
  RotateCcw,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useCartStore } from "../../../src/store/useCartStore";
import { useBookingStore } from "../../../src/store/useBookingStore";
import { StoreOrder } from "../../../src/types";
import InishaHeader from "../../../src/components/common/InishaHeader";
import SafeImage from "../../../src/components/common/SafeImage";

const { width } = Dimensions.get("window");

export default function OrdersScreen() {
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState<"STORE" | "SERVICES">("STORE");
  const { orders } = useCartStore();
  const { bookingHistory, activeBooking } = useBookingStore();
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<StoreOrder | null>(null);

  const handleShareInvoice = async (order: StoreOrder) => {
    try {
      await Share.share({
        message: `Inisha Quick Delivery Invoice #${order.orderNumber}\nTotal Paid: ₹${order.totalAmount}\nDelivery OTP: ${order.otp}\nItems: ${order.items.length} items.\nThank you for choosing Inisha!`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <InishaHeader />

      {/* Segmented Control: Store Orders vs Service Bookings */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeSegment === "STORE" && styles.segmentBtnActive,
          ]}
          onPress={() => setActiveSegment("STORE")}
        >
          <Package
            size={16}
            color={activeSegment === "STORE" ? "#ffffff" : "#64748b"}
          />
          <Text
            style={[
              styles.segmentBtnText,
              activeSegment === "STORE" && styles.segmentBtnTextActive,
            ]}
          >
            Store Orders ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeSegment === "SERVICES" && styles.segmentBtnActive,
          ]}
          onPress={() => setActiveSegment("SERVICES")}
        >
          <Wrench
            size={16}
            color={activeSegment === "SERVICES" ? "#ffffff" : "#64748b"}
          />
          <Text
            style={[
              styles.segmentBtnText,
              activeSegment === "SERVICES" && styles.segmentBtnTextActive,
            ]}
          >
            Service Bookings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeSegment === "STORE" ? (
          /* ================= STORE ORDERS LIST ================= */
          orders.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Package size={50} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptySub}>
                Order groceries, mobile accessories, or parlour kits with 10-min delivery!
              </Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push("/(customer)/(tabs)/explore")}
              >
                <Text style={styles.actionBtnText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order) => {
              const isDelivered = order.status === "DELIVERED";
              const isOut = order.status === "OUT_FOR_DELIVERY";

              return (
                <View key={order.id} style={styles.orderCard}>
                  {/* Order Header */}
                  <View style={styles.orderCardHeader}>
                    <View>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <Text style={styles.orderTime}>{order.placedAt}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        isDelivered
                          ? styles.statusDelivered
                          : styles.statusInProgress,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isDelivered
                            ? styles.statusDeliveredText
                            : styles.statusInProgressText,
                        ]}
                      >
                        {order.status === "OUT_FOR_DELIVERY"
                          ? "🚴 Out for Delivery"
                          : order.status === "PLACED"
                          ? "🟢 Order Placed"
                          : order.status}
                      </Text>
                    </View>
                  </View>

                  {/* 🔐 Delivery OTP Banner */}
                  {!isDelivered && (
                    <View style={styles.otpBanner}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.otpLabel}>
                          Share this OTP with delivery agent:
                        </Text>
                        <Text style={styles.otpCode}>{order.otp}</Text>
                      </View>
                      <View style={styles.etaBox}>
                        <Clock size={14} color="#16a34a" />
                        <Text style={styles.etaText}>{order.estimatedDeliveryTime}</Text>
                      </View>
                    </View>
                  )}

                  {/* 🎁 Gift Pack Details if sent as gift */}
                  {order.isGift && (
                    <View style={styles.giftOrderBanner}>
                      <View style={styles.giftIconWrap}>
                        <Gift size={18} color="#ffffff" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.giftRecipientTitle}>
                          🎁 Gift Pack for {order.giftRecipientName || "Loved One"}
                        </Text>
                        {order.giftMessage ? (
                          <Text style={styles.giftMessageText}>
                            "{order.giftMessage}"
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  )}

                  {/* Order Timeline Stepper */}
                  <View style={styles.stepperWrap}>
                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepDot,
                          styles.stepDotActive,
                        ]}
                      >
                        <CheckCircle2 size={12} color="#ffffff" />
                      </View>
                      <Text style={styles.stepTextActive}>Placed</Text>
                    </View>
                    <View style={styles.stepLine} />

                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepDot,
                          styles.stepDotActive,
                        ]}
                      >
                        <CheckCircle2 size={12} color="#ffffff" />
                      </View>
                      <Text style={styles.stepTextActive}>Packed</Text>
                    </View>
                    <View style={styles.stepLine} />

                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepDot,
                          isOut || isDelivered
                            ? styles.stepDotActive
                            : styles.stepDotPending,
                        ]}
                      >
                        <Truck size={11} color="#ffffff" />
                      </View>
                      <Text
                        style={
                          isOut || isDelivered
                            ? styles.stepTextActive
                            : styles.stepTextPending
                        }
                      >
                        On the way
                      </Text>
                    </View>
                    <View style={styles.stepLine} />

                    <View style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepDot,
                          isDelivered
                            ? styles.stepDotActive
                            : styles.stepDotPending,
                        ]}
                      >
                        <CheckCircle2 size={12} color="#ffffff" />
                      </View>
                      <Text
                        style={
                          isDelivered
                            ? styles.stepTextActive
                            : styles.stepTextPending
                        }
                      >
                        Delivered
                      </Text>
                    </View>
                  </View>

                  {/* Items in this Order */}
                  <View style={styles.orderItemsList}>
                    {order.items.map((it, idx) => (
                      <View key={idx} style={styles.orderItemRow}>
                        <SafeImage uri={it?.product?.imageUrl} style={styles.orderItemThumb} resizeMode="cover" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.orderItemName} numberOfLines={1}>
                            {it.product.name}
                          </Text>
                          <Text style={styles.orderItemQty}>
                            Qty: {it.quantity} • {it.product.unit}
                          </Text>
                        </View>
                        <Text style={styles.orderItemPrice}>
                          ₹{it.product.price * it.quantity}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Delivery Partner Info */}
                  {order.deliveryPartner && (
                    <View style={styles.partnerCard}>
                      <SafeImage uri={order.deliveryPartner.photoUrl} style={styles.partnerPhoto} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.partnerName}>
                          {order.deliveryPartner.name}
                        </Text>
                        <Text style={styles.partnerVehicle}>
                          {order.deliveryPartner.vehicleNumber} • ⭐ {order.deliveryPartner.rating}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.partnerCallBtn}
                        onPress={() => router.push("/(customer)/(tabs)/profile")}
                      >
                        <Phone size={16} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Card Bottom Actions: Total & Invoice */}
                  <View style={styles.orderCardFooter}>
                    <View>
                      <Text style={styles.totalPaidLabel}>Total Amount Paid</Text>
                      <Text style={styles.totalPaidValue}>₹{order.totalAmount}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.invoiceBtn}
                      onPress={() => setSelectedInvoiceOrder(order)}
                    >
                      <FileText size={14} color="#0f172a" />
                      <Text style={styles.invoiceBtnText}>View GST Invoice</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )
        ) : (
          /* ================= SERVICE BOOKINGS LIST ================= */
          bookingHistory.length === 0 && !activeBooking ? (
            <View style={styles.emptyWrap}>
              <Wrench size={50} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No Service Bookings</Text>
              <Text style={styles.emptySub}>
                Book certified electricians, AC technicians, plumbers, or mobile doorstep repairs!
              </Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push("/(customer)/(tabs)")}
              >
                <Text style={styles.actionBtnText}>Book a Service</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {activeBooking && (
                <View style={[styles.orderCard, { borderColor: "#ef4444" }]}>
                  <View style={styles.orderCardHeader}>
                    <View>
                      <Text style={styles.orderNumber}>
                        Active: {activeBooking.subcategoryId || "Doorstep Service"}
                      </Text>
                      <Text style={styles.orderTime}>
                        Scheduled: {activeBooking.scheduledDate} {activeBooking.scheduledTime}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, styles.statusInProgress]}>
                      <Text style={[styles.statusBadgeText, styles.statusInProgressText]}>
                        {activeBooking.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.partnerCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.partnerName}>
                        {activeBooking.providerName || "Assigned Certified Expert"}
                      </Text>
                      <Text style={styles.partnerVehicle}>
                        OTP: {activeBooking.otp || "Pending"}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.liveTrackBtn}
                    onPress={() => router.push("/(customer)/booking/tracking")}
                  >
                    <MapPin size={16} color="#ffffff" />
                    <Text style={styles.liveTrackBtnText}>Track Service Partner Live</Text>
                  </TouchableOpacity>
                </View>
              )}

              {bookingHistory.map((b: any) => (
                <View key={b.id} style={styles.orderCard}>
                  <View style={styles.orderCardHeader}>
                    <View>
                      <Text style={styles.orderNumber}>
                        {b.subcategoryId || b.id}
                      </Text>
                      <Text style={styles.orderTime}>
                        {b.scheduledDate || "Past Booking"}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, styles.statusDelivered]}>
                      <Text style={[styles.statusBadgeText, styles.statusDeliveredText]}>
                        {b.status || "COMPLETED"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderCardFooter}>
                    <Text style={styles.totalPaidValue}>
                      ₹{b.pricing?.finalAmount || b.pricing?.basePrice || 499}
                    </Text>
                    <TouchableOpacity
                      style={styles.invoiceBtn}
                      onPress={() => router.push("/(customer)/(tabs)")}
                    >
                      <RotateCcw size={14} color="#0f172a" />
                      <Text style={styles.invoiceBtnText}>Book Again</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* 📄 GST Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedInvoiceOrder(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.invoiceModalContent}>
              <View style={styles.invoiceModalHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <FileText size={20} color="#ef4444" />
                  <Text style={styles.invoiceModalTitle}>Tax Invoice</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedInvoiceOrder(null)}
                  style={styles.closeBtn}
                >
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                {/* Company & Customer Details */}
                <View style={styles.invoiceMetaBox}>
                  <Text style={styles.invoiceCompanyName}>
                    INISHA MULTI-SERVICE PVT LTD
                  </Text>
                  <Text style={styles.invoiceCompanySub}>
                    GSTIN: 10AABCI9823P1Z4 • CIN: U74999BR2026PTC049128
                  </Text>
                  <Text style={styles.invoiceCompanySub}>
                    Regd Off: Boring Canal Road, Patna, Bihar - 800001
                  </Text>
                </View>

                <View style={styles.invoiceDetailsGrid}>
                  <View style={styles.invoiceCol}>
                    <Text style={styles.invLabel}>Invoice No:</Text>
                    <Text style={styles.invVal}>{selectedInvoiceOrder.orderNumber}</Text>
                  </View>
                  <View style={styles.invoiceCol}>
                    <Text style={styles.invLabel}>Date:</Text>
                    <Text style={styles.invVal}>{selectedInvoiceOrder.placedAt}</Text>
                  </View>
                  <View style={styles.invoiceCol}>
                    <Text style={styles.invLabel}>Payment:</Text>
                    <Text style={styles.invVal}>{selectedInvoiceOrder.paymentMethod}</Text>
                  </View>
                  <View style={styles.invoiceCol}>
                    <Text style={styles.invLabel}>Status:</Text>
                    <Text style={[styles.invVal, { color: "#16a34a" }]}>PAID</Text>
                  </View>
                </View>

                {/* Items Table */}
                <View style={styles.invTable}>
                  <View style={styles.invTableHeader}>
                    <Text style={[styles.invTh, { flex: 2 }]}>Item</Text>
                    <Text style={[styles.invTh, { flex: 0.8, textAlign: "center" }]}>Qty</Text>
                    <Text style={[styles.invTh, { flex: 1, textAlign: "right" }]}>Amount</Text>
                  </View>

                  {selectedInvoiceOrder.items.map((it, idx) => (
                    <View key={idx} style={styles.invTableRow}>
                      <Text style={[styles.invTd, { flex: 2 }]} numberOfLines={1}>
                        {it.product.name}
                      </Text>
                      <Text style={[styles.invTd, { flex: 0.8, textAlign: "center" }]}>
                        {it.quantity}
                      </Text>
                      <Text style={[styles.invTd, { flex: 1, textAlign: "right" }]}>
                        ₹{it.product.price * it.quantity}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Tax Breakdown */}
                <View style={styles.invSummaryWrap}>
                  <View style={styles.invSumRow}>
                    <Text style={styles.invSumLabel}>Subtotal</Text>
                    <Text style={styles.invSumVal}>₹{selectedInvoiceOrder.itemTotal}</Text>
                  </View>
                  {selectedInvoiceOrder.isGift && (
                    <View style={styles.invSumRow}>
                      <Text style={styles.invSumLabel}>Gift Pack & Greeting Box</Text>
                      <Text style={styles.invSumVal}>₹{selectedInvoiceOrder.giftWrapFee}</Text>
                    </View>
                  )}
                  {selectedInvoiceOrder.discountAmount > 0 && (
                    <View style={styles.invSumRow}>
                      <Text style={[styles.invSumLabel, { color: "#16a34a" }]}>Coupon Discount</Text>
                      <Text style={[styles.invSumVal, { color: "#16a34a" }]}>-₹{selectedInvoiceOrder.discountAmount}</Text>
                    </View>
                  )}
                  <View style={styles.invSumRow}>
                    <Text style={styles.invSumLabel}>CGST (9%)</Text>
                    <Text style={styles.invSumVal}>
                      ₹{Math.round(selectedInvoiceOrder.totalAmount * 0.09)}
                    </Text>
                  </View>
                  <View style={styles.invSumRow}>
                    <Text style={styles.invSumLabel}>SGST (9%)</Text>
                    <Text style={styles.invSumVal}>
                      ₹{Math.round(selectedInvoiceOrder.totalAmount * 0.09)}
                    </Text>
                  </View>
                  <View style={[styles.invSumRow, styles.invTotalBorder]}>
                    <Text style={styles.invGrandLabel}>Grand Total (Incl. GST)</Text>
                    <Text style={styles.invGrandVal}>₹{selectedInvoiceOrder.totalAmount}</Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.invActionButtonsRow}>
                <TouchableOpacity
                  style={styles.invShareBtn}
                  onPress={() => handleShareInvoice(selectedInvoiceOrder)}
                >
                  <Share2 size={16} color="#0f172a" />
                  <Text style={styles.invShareBtnText}>Share Invoice</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.invDownloadBtn}
                  onPress={() => {
                    handleShareInvoice(selectedInvoiceOrder);
                    setSelectedInvoiceOrder(null);
                  }}
                >
                  <Download size={16} color="#ffffff" />
                  <Text style={styles.invDownloadBtnText}>Save PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 10,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: "#ef4444",
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  segmentBtnTextActive: {
    color: "#ffffff",
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  orderCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  orderTime: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  statusInProgress: {
    backgroundColor: "#fef3c7",
  },
  statusInProgressText: {
    color: "#b45309",
    fontSize: 11,
    fontWeight: "800",
  },
  statusDelivered: {
    backgroundColor: "#dcfce7",
  },
  statusDeliveredText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "800",
  },
  otpBanner: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  otpLabel: {
    fontSize: 11,
    color: "#166534",
    fontWeight: "600",
  },
  otpCode: {
    fontSize: 20,
    fontWeight: "900",
    color: "#15803d",
    letterSpacing: 2,
  },
  etaBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  etaText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#16a34a",
  },
  giftOrderBanner: {
    backgroundColor: "#fff1f2",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#fecdd3",
    marginBottom: 12,
  },
  giftIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  giftRecipientTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#9f1239",
  },
  giftMessageText: {
    fontSize: 11,
    color: "#be123c",
    fontStyle: "italic",
    marginTop: 2,
  },
  stepperWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 12,
  },
  stepItem: {
    alignItems: "center",
    gap: 4,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: "#16a34a",
  },
  stepDotPending: {
    backgroundColor: "#cbd5e1",
  },
  stepTextActive: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16a34a",
  },
  stepTextPending: {
    fontSize: 10,
    color: "#94a3b8",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginBottom: 14,
  },
  orderItemsList: {
    gap: 8,
    marginBottom: 12,
  },
  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orderItemThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  orderItemName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  orderItemQty: {
    fontSize: 10,
    color: "#64748b",
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  partnerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
    marginBottom: 12,
  },
  partnerPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#cbd5e1",
  },
  partnerName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  partnerVehicle: {
    fontSize: 10,
    color: "#64748b",
  },
  partnerCallBtn: {
    backgroundColor: "#16a34a",
    padding: 8,
    borderRadius: 8,
  },
  orderCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  totalPaidLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  totalPaidValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
  },
  invoiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  invoiceBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
  liveTrackBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    marginTop: 8,
  },
  liveTrackBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  actionBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  invoiceModalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  invoiceModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  invoiceModalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  closeBtn: {
    padding: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
  },
  invoiceMetaBox: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  invoiceCompanyName: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  invoiceCompanySub: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
  },
  invoiceDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  invoiceCol: {
    width: "45%",
  },
  invLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  invVal: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
  invTable: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 14,
  },
  invTableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 8,
  },
  invTh: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
  },
  invTableRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  invTd: {
    fontSize: 11,
    color: "#0f172a",
  },
  invSummaryWrap: {
    gap: 4,
    marginBottom: 16,
  },
  invSumRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  invSumLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  invSumVal: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },
  invTotalBorder: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    marginTop: 4,
  },
  invGrandLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  invGrandVal: {
    fontSize: 15,
    fontWeight: "900",
    color: "#ef4444",
  },
  invActionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  invShareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  invShareBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  invDownloadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  invDownloadBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
});
