import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBookingStore } from "../../../src/store/useBookingStore";
import LiveTrackingMap from "../../../src/components/booking/LiveTrackingMap";
import ChatModal from "../../../src/components/chat/ChatModal";
import { io, Socket } from "socket.io-client";
import { BookingStatus, GeoLocation } from "../../../src/types";
import { ArrowLeft, Phone, MessageSquare, ShieldCheck, Star, CheckCircle2, Bike, CreditCard, Sparkles, QrCode } from "lucide-react-native";
import { LocationService } from "../../../src/services/location.service";
import PaymentModal from "../../../src/components/payment/PaymentModal";

export default function TrackBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeBooking, setActiveBooking, updateActiveBookingStatus } = useBookingStore();
  const [providerLoc, setProviderLoc] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatVisible, setChatVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

  const vehicleNo = "DL 01 AB 8842";
  const partnerRating = "4.9 ★";

  useEffect(() => {
    if (!activeBooking) {
      setLoading(false);
      return;
    }

    setLoading(false);

    const startLoc: GeoLocation = {
      latitude: activeBooking.selectedAddress.latitude - 0.008,
      longitude: activeBooking.selectedAddress.longitude - 0.006,
      heading: LocationService.calculateBearing(
        activeBooking.selectedAddress.latitude - 0.008,
        activeBooking.selectedAddress.longitude - 0.006,
        activeBooking.selectedAddress.latitude,
        activeBooking.selectedAddress.longitude
      ),
      timestamp: Date.now(),
    };
    setProviderLoc(startLoc);

    let socketClient: Socket | null = null;
    try {
      const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || "http://10.88.242.61:5000";
      socketClient = io(socketUrl, {
        transports: ["websocket"],
        autoConnect: true,
      });

      socketClient.on("connect", () => {
        socketClient?.emit("booking:join-room", { bookingId: id });
      });

      socketClient.on("provider:location-changed", (data: { providerId: string; location: GeoLocation }) => {
        setProviderLoc(data.location);
      });

      socketClient.on("booking:status-changed", (data: { bookingId: string; status: BookingStatus; timeline: any[] }) => {
        updateActiveBookingStatus(data.status, data.timeline);
      });
    } catch {
      // Offline fallback
    }

    return () => {
      socketClient?.disconnect();
    };
  }, [id, activeBooking]);

  // Smooth Movement Simulation
  useEffect(() => {
    if (!activeBooking || !providerLoc) return;

    const interval = setInterval(() => {
      if (activeBooking.status !== "ACCEPTED" && activeBooking.status !== "EN_ROUTE") return;

      setProviderLoc((prev) => {
        if (!prev) return null;

        const destLat = activeBooking.selectedAddress.latitude;
        const destLon = activeBooking.selectedAddress.longitude;

        const diffLat = destLat - prev.latitude;
        const diffLon = destLon - prev.longitude;

        const distKm = LocationService.calculateDistanceKm(prev.latitude, prev.longitude, destLat, destLon);

        if (distKm < 0.05) {
          clearInterval(interval);
          if (activeBooking.status !== "ARRIVED") {
            updateActiveBookingStatus("ARRIVED", [
              ...activeBooking.timeline,
              { status: "ARRIVED", timestamp: new Date().toISOString(), note: "Professional has arrived at doorstep." },
            ]);
          }
          return {
            latitude: destLat,
            longitude: destLon,
            heading: prev.heading,
            timestamp: Date.now(),
          };
        }

        const bearing = LocationService.calculateBearing(prev.latitude, prev.longitude, destLat, destLon);

        return {
          latitude: prev.latitude + diffLat * 0.18,
          longitude: prev.longitude + diffLon * 0.18,
          heading: bearing,
          timestamp: Date.now(),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeBooking, providerLoc]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  if (!activeBooking) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noBookingText}>No Active Booking Found</Text>
        <TouchableOpacity
          onPress={() => router.replace("/(customer)/(tabs)")}
          style={styles.backHomeBtn}
        >
          <Text style={styles.backHomeText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusDescription = () => {
    switch (activeBooking.status) {
      case "ACCEPTED":
        return "Partner assigned • En route soon";
      case "EN_ROUTE":
        return "Partner is moving towards your location";
      case "ARRIVED":
        return "Partner has arrived at your doorstep";
      case "IN_PROGRESS":
        return "Doorstep service in progress";
      case "COMPLETED":
        return "Service completed successfully";
      default:
        return "Tracking live partner location";
    }
  };

  const steps: { label: string; status: BookingStatus }[] = [
    { label: "Assigned", status: "ACCEPTED" },
    { label: "En-Route", status: "EN_ROUTE" },
    { label: "Arrived", status: "ARRIVED" },
    { label: "In Progress", status: "IN_PROGRESS" },
    { label: "Completed", status: "COMPLETED" },
  ];

  const getStepIndex = (status: BookingStatus) => steps.findIndex((s) => s.status === status);
  const currentStepIdx = Math.max(0, getStepIndex(activeBooking.status));

  const handleCallProvider = () => {
    const phone = activeBooking.providerPhone || "+919876543210";
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      {/* Top Floating Header */}
      <View style={[styles.topHeader, { top: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.replace("/(customer)/(tabs)")}
          style={styles.backButtonCircle}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>Order #{activeBooking.id.slice(-6)}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Live Map with Google Maps */}
      <View style={styles.mapContainer}>
        <LiveTrackingMap
          customerCoords={{
            latitude: activeBooking.selectedAddress.latitude,
            longitude: activeBooking.selectedAddress.longitude,
          }}
          providerCoords={providerLoc}
          statusText={getStatusDescription()}
          vehicleNumber={vehicleNo}
        />
      </View>

      {/* Driver/Technician Bottom Sheet Card */}
      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* OTP Verification Box */}
          {activeBooking.status !== "COMPLETED" && (
            <View style={styles.otpCard}>
              <View style={styles.otpLeft}>
                <ShieldCheck size={22} color="#ef4444" />
                <View style={styles.otpTexts}>
                  <Text style={styles.otpTitle}>Start-Service Verification OTP</Text>
                  <Text style={styles.otpSubtitle}>Share with partner upon doorstep arrival</Text>
                </View>
              </View>
              <Text style={styles.otpCode}>{activeBooking.otp || "5273"}</Text>
            </View>
          )}

          {/* Driver Name, Vehicle No, Rating (4.9 ⭐), and Call Button */}
          <View style={styles.driverProfileCard}>
            <View style={styles.driverInfoRow}>
              <View style={styles.driverAvatar}>
                <Bike size={22} color="#ef4444" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.driverName}>{activeBooking.providerName || "Rohan Sharma"}</Text>
                  <View style={styles.ratingBadge}>
                    <Star size={11} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.ratingText}>{partnerRating}</Text>
                  </View>
                </View>
                <Text style={styles.vehicleNoText}>Vehicle: {vehicleNo} • Electric Scooter</Text>
                <Text style={styles.phoneSubtext}>{activeBooking.providerPhone || "+91 98123 45678"}</Text>
              </View>
            </View>

            {/* Contact Action Buttons */}
            <View style={styles.contactButtonsRow}>
              <TouchableOpacity
                onPress={handleCallProvider}
                style={styles.callPartnerBtn}
                activeOpacity={0.85}
              >
                <Phone size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.callPartnerText}>Call Partner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setChatVisible(true)}
                style={styles.chatPartnerBtn}
                activeOpacity={0.85}
              >
                <MessageSquare size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Doorstep Direct UPI Payment Card */}
          <View style={styles.paymentTriggerCard}>
            <View style={styles.paymentCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentCardTitle}>Payment & Bill Settlement</Text>
                <Text style={styles.paymentCardSub}>
                  {activeBooking.paymentStatus === "SUCCESS"
                    ? "Paid & Verified via UPI"
                    : activeBooking.paymentStatus === "UNDER_REVIEW"
                    ? `UTR Submitted: ${activeBooking.utrNumber || "Verification in progress"}`
                    : "Pay directly to Company UPI (Punjab National Bank)"}
                </Text>
              </View>
              <Text style={styles.paymentCardAmount}>
                ₹{activeBooking.pricing?.finalAmount || 1599}
              </Text>
            </View>

            {activeBooking.paymentStatus === "SUCCESS" ? (
              <View style={styles.paymentSuccessPill}>
                <CheckCircle2 size={16} color="#16a34a" />
                <Text style={styles.paymentSuccessText}>Payment Verified • Bill Settled</Text>
              </View>
            ) : activeBooking.paymentStatus === "UNDER_REVIEW" ? (
              <View style={styles.paymentReviewPill}>
                <ShieldCheck size={16} color="#0284c7" />
                <Text style={styles.paymentReviewText}>
                  UTR Verification Pending with Partner
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setPaymentModalVisible(true)}
                style={styles.payNowBtn}
                activeOpacity={0.85}
              >
                <QrCode size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.payNowText}>
                  Pay via UPI / QR Code (₹{activeBooking.pricing?.finalAmount || 1599})
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Timeline */}
          <Text style={styles.timelineHeading}>Live Service Progression</Text>
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
                        <CheckCircle2 size={12} color="#ffffff" />
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
                    {isCurrent && (
                      <Text style={styles.stepNote}>
                        {activeBooking.timeline[activeBooking.timeline.length - 1]?.note ||
                          "In progress..."}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Live Chat Modal */}
      <ChatModal
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        bookingId={activeBooking.id}
        currentRole="CUSTOMER"
        recipientName={activeBooking.providerName || "Rohan Sharma (Partner)"}
      />

      {/* Doorstep UPI Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        bookingId={activeBooking.id}
        pricing={
          activeBooking.pricing || {
            basePrice: 1599,
            tax: 288,
            commission: 240,
            couponDiscount: 0,
            addOnPrice: 0,
            providerEarnings: 1359,
            finalAmount: 1599,
          }
        }
        onPaymentSuccess={(method, utr) => {
          if (utr) {
            updateActiveBookingStatus("COMPLETED", [
              ...activeBooking.timeline,
              {
                status: "COMPLETED",
                timestamp: new Date().toISOString(),
                note: `UPI Payment submitted. 12-digit UTR: ${utr}`,
              },
            ]);
          }
        }}
      />
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
  noBookingText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  backHomeBtn: {
    marginTop: 20,
    backgroundColor: "#ef4444",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  backHomeText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
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
    width: 44,
    height: 44,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 22,
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
    paddingHorizontal: 16,
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
    textTransform: "uppercase",
  },
  mapContainer: {
    flex: 0.52,
    minHeight: 280,
  },
  bottomSheet: {
    flex: 0.48,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
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
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    borderRadius: 20,
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
    color: "#0f172a",
  },
  otpSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  otpCode: {
    fontSize: 22,
    fontWeight: "900",
    color: "#ef4444",
    letterSpacing: 2,
  },
  driverProfileCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
  },
  driverInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  driverName: {
    fontSize: 16,
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
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 3,
  },
  phoneSubtext: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  contactButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  callPartnerBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  callPartnerText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  chatPartnerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineHeading: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 12,
  },
  timelineList: {
    gap: 12,
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
    width: 22,
    height: 22,
    borderRadius: 11,
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
    height: 22,
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
    fontSize: 13,
    fontWeight: "800",
  },
  stepLabelCurrent: {
    color: "#ef4444",
    fontSize: 14,
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
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
  },
  paymentTriggerCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  paymentCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentCardTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  paymentCardSub: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
    lineHeight: 16,
  },
  paymentCardAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginLeft: 12,
  },
  paymentSuccessPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  paymentSuccessText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16a34a",
  },
  paymentReviewPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  paymentReviewText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0284c7",
  },
  payNowBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  payNowText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffffff",
  },
});

