import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Vibration,
} from "react-native";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { useBookingStore } from "../../../src/store/useBookingStore";
import { Booking } from "../../../src/types";
import {
  Wallet,
  Briefcase,
  Star,
  MapPin,
  Wrench,
  X,
  Check,
  Clock,
  Zap,
  Navigation,
  BellRing,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BrandLogo from "../../../src/components/common/BrandLogo";

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, providerProfile, setAvailability } = useAuthStore();
  const { activeBooking, setActiveBooking, addBookingToHistory, bookingHistory } = useBookingStore();

  const [incomingBooking, setIncomingBooking] = useState<Partial<Booking> | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [showIncoming, setShowIncoming] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAvailable = providerProfile?.isAvailable ?? true;

  const triggerIncomingOrder = () => {
    try {
      Vibration.vibrate([0, 250, 150, 250]);
    } catch {}

    const mockRequest: Partial<Booking> = {
      id: `bk_${Math.floor(100000 + Math.random() * 900000)}`,
      customerId: "usr_cust123",
      customerName: "Rohan Sharma",
      customerPhone: "+91 98123 45678",
      categoryId: "cat_mobile",
      subcategoryId: "sub_mob_doorstep",
      formValues: {
        device_model: "iPhone 13",
        repair_type: "screen",
      },
      selectedAddress: {
        formattedAddress: "H-45, Phase II, DLF Cyber City, Gurugram, 122002",
        latitude: 28.4905,
        longitude: 77.0815,
      },
      pricing: {
        basePrice: 499,
        tax: 360,
        commission: 300,
        couponDiscount: 0,
        addOnPrice: 1500,
        providerEarnings: 1699,
        finalAmount: 2359,
      },
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: "Immediate Doorstep Visit",
    };

    setIncomingBooking(mockRequest);
    setCountdown(30);
    setShowIncoming(true);
  };

  // Automatically trigger incoming request after 5 seconds when online
  useEffect(() => {
    if (!isAvailable || activeBooking || showIncoming) return;

    const timer = setTimeout(() => {
      triggerIncomingOrder();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isAvailable, activeBooking, showIncoming]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showIncoming && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && showIncoming) {
      setShowIncoming(false);
      setIncomingBooking(null);
    }
    return () => clearInterval(interval);
  }, [showIncoming, countdown]);

  const handleAccept = async () => {
    if (!incomingBooking) return;

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const acceptedBooking: Booking = {
        ...(incomingBooking as Booking),
        providerId: providerProfile?.id || "prov_mock123",
        providerName: user?.name || "Service Tech",
        providerPhone: user?.phoneNumber || "+91 99998 88877",
        status: "ACCEPTED",
        paymentMethod: "CASH_AFTER_SERVICE",
        paymentStatus: "PENDING",
        timeline: [
          { status: "DRAFT", timestamp: new Date().toISOString(), note: "Booking Drafted" },
          { status: "PENDING_PROVIDER", timestamp: new Date().toISOString(), note: "Searching for professional" },
          { status: "ACCEPTED", timestamp: new Date().toISOString(), note: "Booking accepted by partner." },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        otp: "5273",
      };

      setActiveBooking(acceptedBooking);
      addBookingToHistory(acceptedBooking);
      setShowIncoming(false);
      setIncomingBooking(null);

      router.push("/(provider)/(tabs)/orders");
    } catch (error) {
      console.error("Accepting booking error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    setShowIncoming(false);
    setIncomingBooking(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={[styles.scroll, { paddingTop: insets.top + 10 }]}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header containing brand logo and status toggle */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BrandLogo size="sm" showText={false} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.headerTitle}>Partner Panel</Text>
              <Text style={styles.headerSubtitle}>Manage availability & live jobs</Text>
            </View>
          </View>

          {/* Availability Status Toggle */}
          <View style={styles.toggleBox}>
            <Text style={[styles.toggleText, isAvailable ? styles.onlineText : styles.offlineText]}>
              {isAvailable ? "ONLINE" : "OFFLINE"}
            </Text>
            <Switch
              value={isAvailable}
              onValueChange={setAvailability}
              trackColor={{ false: "#e2e8f0", true: "#ef4444" }}
              thumbColor={isAvailable ? "#ffffff" : "#94a3b8"}
            />
          </View>
        </View>

        {/* Live Incoming Order Simulation Banner (Ola / Uber Style) */}
        {isAvailable && !activeBooking && (
          <TouchableOpacity
            onPress={triggerIncomingOrder}
            style={styles.incomingRequestBanner}
            activeOpacity={0.85}
          >
            <View style={styles.radarIconBox}>
              <BellRing size={20} color="#ffffff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.radarTitle}>Live Dispatch Radar Active</Text>
              <Text style={styles.radarSubtitle}>Tap to test incoming customer order popup</Text>
            </View>
            <Zap size={18} color="#f59e0b" />
          </TouchableOpacity>
        )}

        {/* Dashboard Stat Cards Grid */}
        <View style={styles.statsGrid}>
          {/* Earnings Card */}
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Wallet size={22} color="#ef4444" />
            </View>
            <Text style={styles.statLabel}>TODAY'S EARNINGS</Text>
            <Text style={styles.statValue}>₹3,450</Text>
          </View>

          {/* Jobs Card */}
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Briefcase size={22} color="#ef4444" />
            </View>
            <Text style={styles.statLabel}>JOBS COMPLETED</Text>
            <Text style={styles.statValue}>12 Orders</Text>
          </View>
        </View>

        {/* Rating Card */}
        <View style={styles.ratingCard}>
          <View style={styles.ratingLeft}>
            <View style={styles.starBox}>
              <Star size={22} color="#f59e0b" fill="#f59e0b" />
            </View>
            <View>
              <Text style={styles.statLabel}>RATING & REVIEWS</Text>
              <Text style={styles.ratingValue}>4.90 ★ (28 Reviews)</Text>
            </View>
          </View>
        </View>

        {/* Guidelines Card */}
        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Partner Availability Guidelines</Text>
          <Text style={styles.guidelinesText}>
            Keep your status <Text style={{ color: "#ef4444", fontWeight: "800" }}>ONLINE</Text> to receive incoming job requests across your city.
            When a customer books, you will have 30 seconds to review the address and payout before accepting.
          </Text>
        </View>
      </ScrollView>

      {/* Ola/Uber Style Incoming Request Fullscreen Drawer */}
      <Modal visible={showIncoming} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Countdown Badge */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.countdownBadge}>
                <Clock size={15} color="#ef4444" />
                <Text style={styles.countdownText}>{countdown}s to respond</Text>
              </View>
              <TouchableOpacity onPress={handleReject} style={styles.closeBtn}>
                <X size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.incomingSub}>⚡ NEW LIVE SERVICE REQUEST</Text>
            <Text style={styles.incomingTitle}>Doorstep Mobile Screen Repair</Text>

            {/* Address & Distance metadata */}
            <View style={styles.requestDetailsBox}>
              <View style={styles.detailRow}>
                <MapPin size={18} color="#ef4444" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.detailLabel}>PICKUP LOCATION • 1.8 KM (5 MIN DRIVE)</Text>
                  <Text style={styles.detailValue}>{incomingBooking?.selectedAddress?.formattedAddress}</Text>
                </View>
              </View>

              <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10, marginTop: 10 }]}>
                <Wrench size={18} color="#ef4444" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.detailLabel}>SERVICE REQUIREMENT</Text>
                  <Text style={styles.detailValue}>iPhone 13 (Screen Replacement)</Text>
                </View>
              </View>
            </View>

            {/* Payout Details */}
            <View style={styles.payoutCard}>
              <View>
                <Text style={styles.payoutLabel}>GUARANTEED EARNINGS</Text>
                <Text style={styles.payoutSub}>Credited immediately to partner wallet</Text>
              </View>
              <Text style={styles.payoutAmount}>₹{incomingBooking?.pricing?.providerEarnings || 1699}</Text>
            </View>

            {/* Accept / Decline Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={handleReject} disabled={loading} style={styles.declineBtn}>
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAccept} disabled={loading} style={styles.acceptBtn}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Check size={20} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.acceptText}>Accept Order</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
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
  toggleBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: "900",
    marginRight: 6,
  },
  onlineText: {
    color: "#16a34a",
  },
  offlineText: {
    color: "#94a3b8",
  },
  incomingRequestBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  radarIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  radarTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
  },
  radarSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94a3b8",
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 4,
  },
  ratingCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  ratingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  starBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 2,
  },
  guidelinesCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  guidelinesText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  countdownBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#ef4444",
    marginLeft: 6,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  incomingSub: {
    fontSize: 11,
    fontWeight: "900",
    color: "#ef4444",
    letterSpacing: 1,
  },
  incomingTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 4,
    marginBottom: 16,
  },
  requestDetailsBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  payoutCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  payoutLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#b91c1c",
    letterSpacing: 0.5,
  },
  payoutSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  payoutAmount: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f172a",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  declineText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#475569",
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
});
