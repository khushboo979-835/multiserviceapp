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
  Building2,
  CalendarCheck2,
  TrendingUp,
  FileBarChart,
  ShieldCheck,
  Timer,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BrandLogo from "../../../src/components/common/BrandLogo";
import { sendNewJobDispatchNotification } from "../../../src/utils/notifications";
import AttendanceModal from "../../../src/components/provider/AttendanceModal";
import BankAccountModal from "../../../src/components/provider/BankAccountModal";
import PerformanceReportsModal from "../../../src/components/provider/PerformanceReportsModal";

import { db } from "../../../src/config/firebase";
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc } from "firebase/firestore";

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, providerProfile, setAvailability } = useAuthStore();
  const { activeBooking, setActiveBooking, addBookingToHistory, bookingHistory } = useBookingStore();

  const [incomingBooking, setIncomingBooking] = useState<Partial<Booking> | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [showIncoming, setShowIncoming] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Provider Modal States
  const [attendanceVisible, setAttendanceVisible] = useState(false);
  const [bankVisible, setBankVisible] = useState(false);
  const [reportsVisible, setReportsVisible] = useState(false);

  const isAvailable = providerProfile?.isAvailable ?? true;

  // 1. Dual Real-time Listeners: Firestore + WebSocket Dispatch
  useEffect(() => {
    let socketClient: any = null;
    let unsubFirestore: any = null;

    try {
      // A. Socket connection
      const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || "https://multiserviceapp-4pdw.onrender.com";
      const io = require("socket.io-client").io;
      socketClient = io(socketUrl, { transports: ["websocket"], autoConnect: true });

      socketClient.on("connect", () => {
        socketClient.emit("provider:join", { providerId: providerProfile?.id || user?.id });
      });

      socketClient.on("job:dispatch", (jobData: any) => {
        if (!isAvailable || activeBooking) return;
        try {
          Vibration.vibrate([0, 400, 200, 400, 200, 600]);
        } catch {}

        sendNewJobDispatchNotification(
          jobData?.id || "DISPATCH",
          jobData?.serviceName || "New Inisha Doorstep Service",
          jobData?.pricing?.providerEarnings || 1499
        ).catch(() => {});

        setIncomingBooking(jobData);
        setCountdown(30);
        setShowIncoming(true);
      });

      // B. Firestore Real-Time Listener for New & Assigned Bookings
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(5));
      unsubFirestore = onSnapshot(q, (snapshot) => {
        if (!isAvailable || activeBooking) return;

        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" || change.type === "modified") {
            const data = change.doc.data();
            const isFresh = Date.now() - (data.createdAt || Date.now()) < 60000;
            const isAssignedToMe =
              data.providerId === providerProfile?.id ||
              data.partnerId === providerProfile?.id ||
              data.partnerPhone === user?.phoneNumber;

            if (isFresh && (data.status === "PENDING" || data.status === "PENDING_PROVIDER" || isAssignedToMe)) {
              try {
                Vibration.vibrate([0, 400, 200, 400, 200, 600]);
              } catch {}

              const formattedJob: Partial<Booking> = {
                id: change.doc.id,
                customerId: data.customerId || "usr_customer",
                customerName: data.customerName || "Verified Customer",
                customerPhone: data.customerPhone || "+91 9876543210",
                categoryId: data.categoryId || "cat_repair",
                subcategoryId: data.subcategoryId || "sub_doorstep",
                formValues: data.formValues || { service_type: data.serviceTitle || "Doorstep Service" },
                selectedAddress: {
                  formattedAddress: data.address || data.customerAddress || "Patna, Bihar",
                  latitude: data.selectedAddress?.latitude || 25.5941,
                  longitude: data.selectedAddress?.longitude || 85.1376,
                },
                pricing: {
                  basePrice: data.amount || 499,
                  tax: Math.round((data.amount || 499) * 0.18),
                  commission: Math.round((data.amount || 499) * 0.15),
                  couponDiscount: 0,
                  addOnPrice: 0,
                  providerEarnings: Math.round((data.amount || 499) * 0.85),
                  finalAmount: data.amount || 499,
                },
                scheduledDate: data.scheduledDate || new Date().toISOString().split("T")[0],
                scheduledTime: data.scheduledTime || "Immediate Doorstep Visit",
                otp: data.otp || "5273",
              };

              setIncomingBooking(formattedJob);
              setCountdown(30);
              setShowIncoming(true);
            }
          }
        });
      });
    } catch {}

    return () => {
      try {
        socketClient?.disconnect();
        if (unsubFirestore) unsubFirestore();
      } catch {}
    };
  }, [isAvailable, providerProfile, user, activeBooking]);

  const triggerIncomingOrder = () => {
    try {
      Vibration.vibrate([0, 400, 200, 400, 200, 600]);
    } catch {}

    const newRequest: Partial<Booking> = {
      id: `bk_${Math.floor(100000 + Math.random() * 900000)}`,
      customerId: "usr_verified",
      customerName: "Verified Customer Request",
      customerPhone: "+91 78570 23438",
      categoryId: "cat_repair",
      subcategoryId: "sub_doorstep_service",
      formValues: {
        service_type: "Doorstep Repair & Inspection",
      },
      selectedAddress: {
        formattedAddress: "Service Location • Assigned City Area",
        latitude: 25.5941,
        longitude: 85.1376,
      },
      pricing: {
        basePrice: 499,
        tax: 90,
        commission: 90,
        couponDiscount: 0,
        addOnPrice: 500,
        providerEarnings: 899,
        finalAmount: 1089,
      },
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: "Immediate Doorstep Visit",
    };

    sendNewJobDispatchNotification(
      newRequest.id || "NEW",
      "Doorstep Service Request",
      newRequest.pricing?.providerEarnings || 899
    ).catch(() => {});

    setIncomingBooking(newRequest);
    setCountdown(30);
    setShowIncoming(true);
  };

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

      // Sync accepted status to Firestore
      try {
        if (incomingBooking.id) {
          await updateDoc(doc(db, "bookings", incomingBooking.id), {
            status: "ACCEPTED",
            providerId: acceptedBooking.providerId,
            providerName: acceptedBooking.providerName,
            providerPhone: acceptedBooking.providerPhone,
            partnerId: acceptedBooking.providerId,
            partnerName: acceptedBooking.providerName,
            partnerPhone: acceptedBooking.providerPhone,
            updatedAt: Date.now(),
          });
        }
      } catch (fsErr) {
        console.warn("Firestore accept sync notice:", fsErr);
      }

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

        {/* Live Incoming Order Status Banner */}
        {isAvailable && !activeBooking && (
          <View style={styles.incomingRequestBanner}>
            <View style={styles.radarIconBox}>
              <BellRing size={20} color="#ffffff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.radarTitle}>Live Dispatch Radar Active</Text>
              <Text style={styles.radarSubtitle}>Listening for doorstep customer service requests in your area</Text>
            </View>
            <Zap size={18} color="#22c55e" />
          </View>
        )}

        {/* Dashboard Stat Cards Grid */}
        <View style={styles.statsGrid}>
          {/* Earnings Card */}
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Wallet size={22} color="#ef4444" />
            </View>
            <Text style={styles.statLabel}>WALLET BALANCE</Text>
            <Text style={styles.statValue}>₹{providerProfile?.walletBalance ?? 0}</Text>
          </View>

          {/* Jobs Card */}
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Briefcase size={22} color="#ef4444" />
            </View>
            <Text style={styles.statLabel}>JOBS COMPLETED</Text>
            <Text style={styles.statValue}>
              {bookingHistory.filter((b) => b.status === "COMPLETED").length} Orders
            </Text>
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
              <Text style={styles.ratingValue}>
                {providerProfile?.averageRating ? `${providerProfile.averageRating.toFixed(2)} ★` : "5.00 ★"} ({providerProfile?.reviewCount ?? 0} Reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Operational Management Grid */}
        <Text style={styles.sectionHeaderTitle}>Operational Tools & Services</Text>
        <View style={styles.toolsGrid}>
          {/* Daily Attendance & Shift Punch */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setAttendanceVisible(true)}
            style={styles.toolCard}
          >
            <View style={[styles.toolIconBox, { backgroundColor: "#f0fdf4" }]}>
              <CalendarCheck2 size={22} color="#16a34a" />
            </View>
            <Text style={styles.toolTitle}>Attendance & Shifts</Text>
            <Text style={styles.toolSub}>Daily punch-in, duty hours & logs</Text>
          </TouchableOpacity>

          {/* Daily / Weekly Reports & Telemetry */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setReportsVisible(true)}
            style={styles.toolCard}
          >
            <View style={[styles.toolIconBox, { backgroundColor: "#eff6ff" }]}>
              <FileBarChart size={22} color="#3b82f6" />
            </View>
            <Text style={styles.toolTitle}>Performance Reports</Text>
            <Text style={styles.toolSub}>Weekly earnings & ratings analytics</Text>
          </TouchableOpacity>

          {/* Bank Account Management */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setBankVisible(true)}
            style={styles.toolCard}
          >
            <View style={[styles.toolIconBox, { backgroundColor: "#fef2f2" }]}>
              <Building2 size={22} color="#ef4444" />
            </View>
            <Text style={styles.toolTitle}>Bank Account</Text>
            <Text style={styles.toolSub}>IMPS settlement details & UPI</Text>
          </TouchableOpacity>

          {/* Incoming Dispatch Simulator */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={triggerIncomingOrder}
            style={styles.toolCard}
          >
            <View style={[styles.toolIconBox, { backgroundColor: "#fffbeb" }]}>
              <Zap size={22} color="#f59e0b" />
            </View>
            <Text style={styles.toolTitle}>Test Dispatch</Text>
            <Text style={styles.toolSub}>Simulate live customer order alert</Text>
          </TouchableOpacity>
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

      {/* 1. Daily Attendance & Shift Modal */}
      <AttendanceModal
        visible={attendanceVisible}
        onClose={() => setAttendanceVisible(false)}
      />

      {/* 2. Bank Account Setup Modal */}
      <BankAccountModal
        visible={bankVisible}
        onClose={() => setBankVisible(false)}
      />

      {/* 3. Performance Analytics & Weekly Reports Modal */}
      <PerformanceReportsModal
        visible={reportsVisible}
        onClose={() => setReportsVisible(false)}
      />

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
            <Text style={styles.incomingTitle}>
              {(incomingBooking as any)?.serviceName || incomingBooking?.formValues?.service_type || "Doorstep Service Request"}
            </Text>

            {/* Address & Distance metadata */}
            <View style={styles.requestDetailsBox}>
              <View style={styles.detailRow}>
                <MapPin size={18} color="#ef4444" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.detailLabel}>CUSTOMER LOCATION</Text>
                  <Text style={styles.detailValue}>
                    {incomingBooking?.selectedAddress?.formattedAddress || "Customer Address • Inisha City Service"}
                  </Text>
                </View>
              </View>

              <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10, marginTop: 10 }]}>
                <Wrench size={18} color="#ef4444" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.detailLabel}>CUSTOMER DETAILS</Text>
                  <Text style={styles.detailValue}>
                    {incomingBooking?.customerName || "Verified Customer"} ({incomingBooking?.customerPhone || "+91 Customer"})
                  </Text>
                </View>
              </View>
            </View>

            {/* Payout Details */}
            <View style={styles.payoutCard}>
              <View>
                <Text style={styles.payoutLabel}>GUARANTEED EARNINGS</Text>
                <Text style={styles.payoutSub}>Credited immediately to partner wallet</Text>
              </View>
              <Text style={styles.payoutAmount}>₹{incomingBooking?.pricing?.providerEarnings || 899}</Text>
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
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 18,
    marginBottom: 12,
  },
  toolsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  toolCard: {
    width: "48%",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  toolIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  toolTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  toolSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 14,
  },
});
