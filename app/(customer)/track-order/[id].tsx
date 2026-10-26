import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCartStore } from "../../../src/store/useCartStore";
import LiveTrackingMap from "../../../src/components/booking/LiveTrackingMap";
import { GeoLocation, StoreOrder, StoreOrderStatus } from "../../../src/types";
import {
  ArrowLeft,
  Phone,
  ShieldCheck,
  Star,
  CheckCircle2,
  Bike,
  Package,
  ShoppingBag,
  Clock,
  MapPin,
  Check,
  Gift,
} from "lucide-react-native";
import { LocationService } from "../../../src/services/location.service";
import SafeImage from "../../../src/components/common/SafeImage";

export default function TrackOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, updateOrderStatus } = useCartStore();

  const order = useMemo(() => {
    return (
      orders.find((o) => o.id === id || o.orderNumber === id) ||
      orders[0] ||
      null
    );
  }, [orders, id]);

  const [driverLoc, setDriverLoc] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);

  const customerCoords = useMemo(() => {
    return {
      latitude: 25.6127,
      longitude: 85.1376,
    };
  }, []);

  // Initialize simulated driver location and movement
  useEffect(() => {
    const startLoc: GeoLocation = {
      latitude: customerCoords.latitude - 0.009,
      longitude: customerCoords.longitude - 0.007,
      heading: LocationService.calculateBearing(
        customerCoords.latitude - 0.009,
        customerCoords.longitude - 0.007,
        customerCoords.latitude,
        customerCoords.longitude
      ),
      timestamp: Date.now(),
    };
    setDriverLoc(startLoc);

    const interval = setInterval(() => {
      setDriverLoc((prev) => {
        if (!prev) return null;

        const diffLat = customerCoords.latitude - prev.latitude;
        const diffLon = customerCoords.longitude - prev.longitude;
        const distKm = LocationService.calculateDistanceKm(
          prev.latitude,
          prev.longitude,
          customerCoords.latitude,
          customerCoords.longitude
        );

        if (distKm < 0.04) {
          if (order && order.status !== "DELIVERED") {
            updateOrderStatus(order.id, "DELIVERED");
          }
          return {
            latitude: customerCoords.latitude,
            longitude: customerCoords.longitude,
            heading: prev.heading,
            timestamp: Date.now(),
          };
        }

        const bearing = LocationService.calculateBearing(
          prev.latitude,
          prev.longitude,
          customerCoords.latitude,
          customerCoords.longitude
        );

        return {
          latitude: prev.latitude + diffLat * 0.15,
          longitude: prev.longitude + diffLon * 0.15,
          heading: bearing,
          timestamp: Date.now(),
        };
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [customerCoords, order?.id]);

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <ShoppingBag size={48} color="#94a3b8" />
        <Text style={styles.noOrderTitle}>Order Not Found</Text>
        <Text style={styles.noOrderSubtitle}>
          We couldn't locate this order in your history.
        </Text>
        <TouchableOpacity
          style={styles.backHomeBtn}
          onPress={() => router.replace("/(customer)/(tabs)")}
        >
          <Text style={styles.backHomeText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const steps: { label: string; status: StoreOrderStatus; note: string }[] = [
    {
      label: "Order Placed",
      status: "PLACED",
      note: "Your order has been received by Inisha Express Store.",
    },
    {
      label: "Accepted & Packed",
      status: "ACCEPTED",
      note: "Items verified, quality checked and packed securely.",
    },
    {
      label: "Partner Assigned",
      status: "PACKED",
      note: "Delivery partner assigned at store dispatch hub.",
    },
    {
      label: "Out for Delivery",
      status: "OUT_FOR_DELIVERY",
      note: "Driver is on the way with your order.",
    },
    {
      label: "Delivered",
      status: "DELIVERED",
      note: "Order delivered safely to your doorstep.",
    },
  ];

  const getStepIndex = (status: StoreOrderStatus) => {
    switch (status) {
      case "PLACED":
        return 0;
      case "ACCEPTED":
        return 1;
      case "PACKED":
        return 2;
      case "OUT_FOR_DELIVERY":
        return 3;
      case "DELIVERED":
        return 4;
      default:
        return 3;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  const handleCallDriver = () => {
    const phone = order.deliveryPartner?.phone || "+919123456789";
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      {/* Top Floating Back & Order Status Bar */}
      <View style={[styles.topHeader, { top: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.replace("/(customer)/(tabs)")}
          style={styles.backButtonCircle}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>

        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>{order.orderNumber}</Text>
        </View>

        <View style={styles.fastPill}>
          <Clock size={12} color="#16a34a" />
          <Text style={styles.fastPillText}>10-15 Min</Text>
        </View>
      </View>

      {/* Live Map with Route Polyline */}
      <View style={styles.mapContainer}>
        <LiveTrackingMap
          customerCoords={customerCoords}
          providerCoords={driverLoc}
          statusText={
            order.status === "DELIVERED"
              ? "Order Delivered"
              : "Driver is on the way"
          }
          vehicleNumber={order.deliveryPartner?.vehicleNumber || "BR 01 EV 9081"}
        />
      </View>

      {/* Order Progress & Details Bottom Sheet */}
      <View
        style={[
          styles.bottomSheet,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          {/* Delivery OTP Card */}
          {order.status !== "DELIVERED" && (
            <View style={styles.otpCard}>
              <View style={styles.otpLeft}>
                <ShieldCheck size={24} color="#16a34a" />
                <View style={styles.otpTexts}>
                  <Text style={styles.otpTitle}>Delivery Verification OTP</Text>
                  <Text style={styles.otpSubtitle}>
                    Share this 4-digit code with driver upon delivery
                  </Text>
                </View>
              </View>
              <Text style={styles.otpCode}>{order.otp}</Text>
            </View>
          )}

          {/* Delivery Partner Info Box */}
          {order.deliveryPartner && (
            <View style={styles.driverProfileCard}>
              <View style={styles.driverInfoRow}>
                <Image
                  source={{ uri: order.deliveryPartner.photoUrl }}
                  style={styles.driverAvatarImg}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.driverName}>
                      {order.deliveryPartner.name}
                    </Text>
                    <View style={styles.ratingBadge}>
                      <Star size={11} color="#f59e0b" fill="#f59e0b" />
                      <Text style={styles.ratingText}>
                        {order.deliveryPartner.rating}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.vehicleNoText}>
                    Vehicle: {order.deliveryPartner.vehicleNumber}
                  </Text>
                  <Text style={styles.phoneSubtext}>
                    Inisha Verified Express Rider
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCallDriver}
                style={styles.callPartnerBtn}
                activeOpacity={0.85}
              >
                <Phone size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.callPartnerText}>Call Delivery Partner</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 5-Step Order Progress Stepper */}
          <Text style={styles.sectionHeading}>Order Status Progress</Text>
          <View style={styles.timelineList}>
            {steps.map((step, index) => {
              const isPast = index <= currentStepIdx;
              const isCurrent = index === currentStepIdx;

              return (
                <View key={step.status} style={styles.timelineItem}>
                  <View style={styles.dotColumn}>
                    <View
                      style={[
                        styles.dotCircle,
                        isCurrent
                          ? styles.dotCurrent
                          : isPast
                          ? styles.dotPast
                          : styles.dotFuture,
                      ]}
                    >
                      {isPast ? (
                        <Check size={12} color="#ffffff" strokeWidth={3} />
                      ) : (
                        <View style={styles.dotInnerSmall} />
                      )}
                    </View>
                    {index < steps.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          isPast ? styles.linePast : styles.lineFuture,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent
                          ? styles.stepLabelCurrent
                          : isPast
                          ? styles.stepLabelPast
                          : styles.stepLabelFuture,
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text style={styles.stepNote}>{step.note}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Ordered Items Breakdown */}
          <Text style={[styles.sectionHeading, { marginTop: 20 }]}>
            Items Ordered ({order.items.length})
          </Text>
          <View style={styles.itemsCard}>
            {order.items.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.itemRow,
                  idx < order.items.length - 1 && styles.itemRowBorder,
                ]}
              >
                <SafeImage
                  uri={item.product.imageUrl}
                  style={styles.itemImg}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemQty}>
                    {item.quantity} x ₹{item.product.price} ({item.product.unit})
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  ₹{item.quantity * item.product.price}
                </Text>
              </View>
            ))}
          </View>

          {/* Delivery Address & Payment Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.addressRow}>
              <MapPin size={16} color="#ef4444" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.addressTitle}>Delivery Destination</Text>
                <Text style={styles.addressSub}>{order.deliveryAddress}</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Total</Text>
              <Text style={styles.billValue}>₹{order.itemTotal}</Text>
            </View>

            {order.discountAmount > 0 && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: "#16a34a" }]}>
                  Coupon Discount
                </Text>
                <Text style={[styles.billValue, { color: "#16a34a" }]}>
                  -₹{order.discountAmount}
                </Text>
              </View>
            )}

            {order.isGift && (
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>🎁 Gift Packing</Text>
                <Text style={styles.billValue}>₹{order.giftWrapFee}</Text>
              </View>
            )}

            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text
                style={[
                  styles.billValue,
                  order.deliveryFee === 0 && { color: "#16a34a" },
                ]}
              >
                {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Total Paid</Text>
                <Text style={styles.paymentMethodLabel}>
                  {order.paymentMethod}
                </Text>
              </View>
              <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  noOrderTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 12,
  },
  noOrderSubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  backHomeBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backHomeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  topHeader: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButtonCircle: {
    width: 42,
    height: 42,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderBadge: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0f172a",
  },
  fastPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  fastPillText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#166534",
  },
  mapContainer: {
    flex: 0.5,
    minHeight: 280,
  },
  bottomSheet: {
    flex: 0.5,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1.5,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 20,
    paddingTop: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  otpCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#bbf7d0",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  otpLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  otpTexts: {
    marginLeft: 10,
    flex: 1,
  },
  otpTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  otpSubtitle: {
    fontSize: 10,
    color: "#15803d",
    marginTop: 2,
  },
  otpCode: {
    fontSize: 22,
    fontWeight: "900",
    color: "#166534",
    letterSpacing: 2,
  },
  driverProfileCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  driverInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  driverAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  driverName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#b45309",
    marginLeft: 3,
  },
  vehicleNoText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  phoneSubtext: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 1,
  },
  callPartnerBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  callPartnerText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 12,
  },
  timelineList: {
    gap: 10,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dotColumn: {
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  dotCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dotCurrent: {
    backgroundColor: "#ef4444",
  },
  dotPast: {
    backgroundColor: "#16a34a",
  },
  dotFuture: {
    backgroundColor: "#e2e8f0",
  },
  dotInnerSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#94a3b8",
  },
  timelineLine: {
    width: 2,
    height: 24,
    marginTop: 2,
  },
  linePast: {
    backgroundColor: "#16a34a",
  },
  lineFuture: {
    backgroundColor: "#e2e8f0",
  },
  timelineContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "800",
  },
  stepLabelCurrent: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "900",
  },
  stepLabelPast: {
    color: "#0f172a",
  },
  stepLabelFuture: {
    color: "#94a3b8",
  },
  stepNote: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  itemsCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  itemImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  itemName: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  itemQty: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0f172a",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  addressSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 15,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 10,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  billLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  billValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  paymentMethodLabel: {
    fontSize: 10,
    color: "#16a34a",
    fontWeight: "700",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ef4444",
  },
});
