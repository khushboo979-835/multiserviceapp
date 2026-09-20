import React, { useMemo } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useBookingStore } from "../../../src/store/useBookingStore";
import { Calendar, Clock, ArrowRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import BrandLogo from "../../../src/components/common/BrandLogo";

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bookingHistory, activeBooking } = useBookingStore();

  // Deduplicate bookings by ID so keys are strictly unique
  const displayBookings = useMemo(() => {
    const list: any[] = [];
    const seenIds = new Set<string>();

    if (activeBooking && activeBooking.id) {
      list.push(activeBooking);
      seenIds.add(activeBooking.id);
    }

    bookingHistory.forEach((item) => {
      if (item && item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        list.push(item);
      }
    });

    return list;
  }, [activeBooking, bookingHistory]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/(customer)/track-booking/${item.id}` as any)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.serviceName}>
            {item.subcategoryId === "sub_mob_doorstep"
              ? "Doorstep Mobile Repair"
              : item.subcategoryId === "sub_utility_ac"
              ? "AC Jet Cleaning & Service"
              : "Doorstep Home Service"}
          </Text>
          <Text style={styles.bookingId}>Order #{item.id.slice(-6)}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status.replace(/_/g, " ")}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.timeRow}>
          <Clock size={15} color="#ef4444" />
          <Text style={styles.timeText}>
            {item.scheduledDate || "Today"} • {item.scheduledTime || "Immediate"}
          </Text>
        </View>
        <Text style={styles.priceText}>₹{item.pricing?.finalAmount || 499}</Text>
      </View>

      <View style={styles.trackActionRow}>
        <Text style={styles.trackActionText}>View Details & Live Tracking</Text>
        <ArrowRight size={14} color="#ef4444" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 10,
          paddingBottom: Math.max(insets.bottom, 24) + 60,
        },
      ]}
    >
      <View style={styles.header}>
        <BrandLogo size="sm" showText={false} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Your Bookings</Text>
          <Text style={styles.headerSubtitle}>Active & past doorstep service orders</Text>
        </View>
      </View>

      {displayBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Calendar size={32} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySubtitle}>
            You haven't scheduled any services. Go to the Home tab to book your doorstep repair or salon service!
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.replace("/(customer)/(tabs)")}
          >
            <Text style={styles.browseButtonText}>Book a Service Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayBookings}
          keyExtractor={(item, index) => `${item.id || "bk"}_${index}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTextContainer: {
    marginLeft: 12,
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
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    lineHeight: 22,
  },
  bookingId: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#ef4444",
    textTransform: "uppercase",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginLeft: 6,
  },
  priceText: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0f172a",
  },
  trackActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
  },
  trackActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ef4444",
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
