import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  Alert,
  StyleSheet 
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { subscribeCustomerBookings, updateBookingStatusInFirestore } from "@/services/firestoreService";
import { BookingCardSkeleton } from "@/components/ui/SkeletonLoader";
import { useToast } from "@/components/ui/ToastProvider";
import { Booking, BookingStatus } from "@/types";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight, 
  CheckCircle, 
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Compass,
  AlertCircle
} from "lucide-react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

export default function BookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { bookingHistory, setBookingHistory, setActiveBooking } = useBookingStore();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time Firestore subscription to user's bookings
  useEffect(() => {
    const customerId = user?.id || user?.uid || "demo_customer_inisha";

    setLoading(true);
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 600);

    const unsubscribe = subscribeCustomerBookings(customerId, (bookings) => {
      clearTimeout(safetyTimer);
      setBookingHistory(bookings);
      setLoading(false);
      setRefreshing(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user?.id, user?.uid]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // Split bookings into Active vs Past
  const { activeBookings, pastBookings } = useMemo(() => {
    const active: Booking[] = [];
    const past: Booking[] = [];

    bookingHistory.forEach((b) => {
      if (b.status === "COMPLETED" || b.status === "CANCELLED") {
        past.push(b);
      } else {
        active.push(b);
      }
    });

    return { activeBookings: active, pastBookings: past };
  }, [bookingHistory]);

  const displayedBookings = activeTab === "active" ? activeBookings : pastBookings;

  const handleCancelBooking = useCallback((booking: Booking) => {
    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") return;

    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking request?",
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: async () => {
            try {
              await updateBookingStatusInFirestore(booking.id, "CANCELLED", {
                note: "Booking cancelled by customer",
              });
              showSuccess("Booking has been cancelled");
            } catch (err) {
              showError("Failed to cancel booking. Please try again.");
            }
          },
        },
      ]
    );
  }, [showSuccess, showError]);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "COMPLETED":
        return { bg: "#022c22", border: "#10b981", text: "#34d399", label: "Completed" };
      case "IN_PROGRESS":
        return { bg: "#172554", border: "#3b82f6", text: "#60a5fa", label: "In Progress" };
      case "ACCEPTED":
      case "EN_ROUTE":
      case "ARRIVED":
        return { bg: "#042f2e", border: "#14b8a6", text: "#2dd4bf", label: "Partner En Route" };
      case "CANCELLED":
        return { bg: "#450a0a", border: "#f43f5e", text: "#fda4af", label: "Cancelled" };
      default:
        return { bg: "#451a03", border: "#f59e0b", text: "#fbbf24", label: "Finding Partner" };
    }
  };

  const renderBookingItem = useCallback(({ item }: { item: Booking }) => {
    const badge = getStatusBadge(item.status);
    const dateDisplay = item.bookingDate || item.scheduledDate || "Scheduled";
    const timeDisplay = item.timeSlot || item.scheduledTime || "Flexible";
    const total = item.totalAmount || item.pricing?.finalAmount || 499;
    const isOngoing = item.status !== "COMPLETED" && item.status !== "CANCELLED";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setActiveBooking(item);
          router.push({
            pathname: "/(customer)/track-booking/[id]",
            params: { id: item.id },
          });
        }}
        style={styles.bookingCard}
      >
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.serviceNameText} numberOfLines={1}>
              {item.serviceName || "On-Demand Doorstep Service"}
            </Text>
            <Text style={styles.bookingIdText}>Order ID: #{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
          </View>
        </View>

        {/* Schedule & Address Info */}
        <View style={styles.metaRow}>
          <Clock size={13} color="#94a3b8" />
          <Text style={styles.metaText}>{dateDisplay} • {timeDisplay}</Text>
        </View>

        {typeof item.address === "string" && (
          <View style={styles.metaRow}>
            <MapPin size={13} color="#94a3b8" />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        )}

        {/* OTP Highlight for ongoing orders */}
        {isOngoing && item.otp && (
          <View style={styles.otpBanner}>
            <ShieldCheck size={14} color="#8b5cf6" />
            <Text style={styles.otpBannerLabel}>Handover OTP: </Text>
            <Text style={styles.otpBannerCode}>{item.otp}</Text>
          </View>
        )}

        {/* Card Footer: Pricing & Action Buttons */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>₹{total}</Text>
          </View>

          <View style={styles.actionsRow}>
            {item.status === "PENDING" && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleCancelBooking(item)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}

            {isOngoing ? (
              <View style={styles.trackBtn}>
                <Compass size={13} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.trackBtnText}>Live Tracker</Text>
                <ChevronRight size={13} color="#ffffff" />
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  router.push({
                    pathname: "/(customer)/service/[id]",
                    params: { id: item.serviceId || "srv_1" },
                  });
                }}
                style={styles.rebookBtn}
              >
                <RotateCcw size={12} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.rebookBtnText}>Book Again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleCancelBooking, setActiveBooking, router]);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top + 8, 20) }]}>
      
      {/* Screen Title */}
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>Track live status and order history</Text>
      </View>

      {/* Segmented Tab Switcher: Active vs Past Bookings */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab("active")}
          style={[styles.segmentBtn, activeTab === "active" ? styles.segmentBtnActive : null]}
        >
          <Text style={[styles.segmentText, activeTab === "active" ? styles.segmentTextActive : styles.segmentTextInactive]}>
            Active Orders ({activeBookings.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab("past")}
          style={[styles.segmentBtn, activeTab === "past" ? styles.segmentBtnActive : null]}
        >
          <Text style={[styles.segmentText, activeTab === "past" ? styles.segmentTextActive : styles.segmentTextInactive]}>
            Past Bookings ({pastBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={{ paddingTop: 10 }}>
          <BookingCardSkeleton />
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </View>
      ) : displayedBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Calendar size={32} color="#8b5cf6" />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === "active" ? "No Active Bookings" : "No Past Orders"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === "active"
              ? "You don't have any ongoing service requests right now. Book verified professionals from Home!"
              : "Completed and cancelled bookings will appear here."}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/(customer)/(tabs)")}
            style={styles.exploreBtn}
          >
            <Sparkles size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.exploreBtnText}>Explore Doorstep Services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayedBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8b5cf6"
              colors={["#8b5cf6"]}
            />
          }
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
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
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#7c3aed",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#ffffff",
  },
  segmentTextInactive: {
    color: "#64748b",
  },
  bookingCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  serviceNameText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  bookingIdText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 6,
  },
  addressText: {
    color: "#94a3b8",
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
  },
  otpBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124, 58, 237, 0.15)",
    borderColor: "rgba(139, 92, 246, 0.3)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 8,
  },
  otpBannerLabel: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 6,
  },
  otpBannerCode: {
    color: "#a78bfa",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(30, 41, 59, 0.8)",
    paddingTop: 12,
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  amountValue: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: "rgba(69, 10, 10, 0.6)",
    borderColor: "rgba(244, 63, 94, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  cancelBtnText: {
    color: "#fda4af",
    fontSize: 11,
    fontWeight: "700",
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7c3aed",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  trackBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  rebookBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  rebookBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7c3aed",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exploreBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
});


