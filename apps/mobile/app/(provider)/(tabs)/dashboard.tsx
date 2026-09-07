import React, { useState, useEffect } from "react";
import { View, Text, Switch, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { subscribePendingBookings, updateBookingStatusInFirestore } from "@/services/firestoreService";
import { useToast } from "@/components/ui/ToastProvider";
import { Booking, BookingStatus } from "@/types";
import { LayoutDashboard, Wallet, Briefcase, Star, MapPin, Wrench, X, Check, Clock, Radio, Sparkles } from "lucide-react-native";
import Animated, { FadeInUp, FadeInDown, SlideInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, providerProfile, setAvailability } = useAuthStore();
  const { activeBooking, setActiveBooking, setBookingHistory, bookingHistory } = useBookingStore();
  const { showSuccess, showError } = useToast();
  
  const [incomingBooking, setIncomingBooking] = useState<Booking | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [showIncoming, setShowIncoming] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAvailable = providerProfile?.isAvailable ?? true;

  // Real-time Firestore subscription to pending bookings (Radar)
  useEffect(() => {
    if (!isAvailable) {
      setIncomingBooking(null);
      setShowIncoming(false);
      return;
    }

    const unsubscribe = subscribePendingBookings((pendingBookings) => {
      // Find a pending booking not yet assigned to any provider
      const unassigned = pendingBookings.find((b) => !b.providerId || b.status === "PENDING" || b.status === "PENDING_PROVIDER");
      if (unassigned && (!incomingBooking || incomingBooking.id !== unassigned.id)) {
        setIncomingBooking(unassigned);
        setCountdown(30);
        setShowIncoming(true);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isAvailable, incomingBooking?.id]);

  // Countdown timer logic
  useEffect(() => {
    if (!showIncoming || countdown <= 0) {
      if (countdown === 0) {
        handleReject();
      }
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showIncoming, countdown]);

  const handleAccept = async () => {
    if (!incomingBooking) return;

    setLoading(true);
    try {
      const providerId = providerProfile?.id || user?.id || user?.uid || "prov_mock123";
      const providerName = user?.name || user?.fullName || "Verified Technician";
      const providerPhone = user?.phoneNumber || user?.phone || "+919999888877";

      // Update in Firestore
      await updateBookingStatusInFirestore(incomingBooking.id, "ACCEPTED", {
        providerId,
        providerName,
        providerPhone,
        note: `Job accepted by ${providerName}`,
      });

      const updated: Booking = {
        ...incomingBooking,
        providerId,
        providerName,
        providerPhone,
        status: "ACCEPTED",
      };

      setActiveBooking(updated);
      setBookingHistory([updated, ...bookingHistory]);
      setShowIncoming(false);
      setIncomingBooking(null);
      showSuccess("Job accepted! Head over to Orders to start trip.");

      router.push("/(provider)/(tabs)/orders");
    } catch (error) {
      console.error("Accepting booking error:", error);
      showError("Failed to accept booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    setShowIncoming(false);
    setIncomingBooking(null);
  };

  const totalEarnings = (providerProfile?.walletBalance || 1250) + 2200;

  return (
    <View className="flex-1 bg-dark-950">
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 20, paddingTop: Math.max(insets.top + 8, 20) }} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header containing status toggle */}
        <Animated.View 
          entering={FadeInUp.delay(100).duration(600)}
          className="flex-row justify-between items-center mb-6"
        >
          <View>
            <Text className="text-white text-2xl font-extrabold tracking-tight">Partner Panel</Text>
            <Text className="text-dark-400 text-xs mt-1">Manage availability & jobs</Text>
          </View>
          
          {/* Availability Status Toggle */}
          <View className="flex-row items-center bg-dark-900 border border-dark-800 px-4 py-2 rounded-2xl">
            <Text className={`text-xs font-bold mr-3 ${isAvailable ? "text-emerald-400" : "text-dark-400"}`}>
              {isAvailable ? "ONLINE" : "OFFLINE"}
            </Text>
            <Switch
              value={isAvailable}
              onValueChange={setAvailability}
              trackColor={{ false: "#1e293b", true: "#14b8a6" }}
              thumbColor={isAvailable ? "#fff" : "#64748b"}
            />
          </View>
        </Animated.View>

        {/* Online Radar Indicator */}
        {isAvailable ? (
          <View className="bg-secondary-950/30 border border-secondary-500/30 rounded-2xl p-4 mb-6 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Radio size={20} color="#14b8a6" />
              <View className="ml-3">
                <Text className="text-white text-xs font-bold">Radar Active (Gurugram)</Text>
                <Text className="text-dark-400 text-3xs mt-0.5">Listening for nearby customer requests...</Text>
              </View>
            </View>
            <View className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </View>
        ) : (
          <View className="bg-dark-900 border border-dark-800 rounded-2xl p-4 mb-6 flex-row items-center">
            <Text className="text-dark-400 text-xs">You are currently offline. Toggle ONLINE to receive jobs.</Text>
          </View>
        )}

        {/* Dashboard Stat Cards Grid */}
        <Animated.View 
          entering={FadeInUp.delay(250).duration(600)}
          className="flex-row flex-wrap justify-between gap-y-4 mb-6"
        >
          {/* Earnings Card */}
          <View className="w-[47%] bg-dark-900 border border-dark-800 rounded-3xl p-5 shadow-md shadow-black/20">
            <View className="w-10 h-10 bg-secondary-950/40 border border-secondary-500/20 rounded-xl items-center justify-center mb-4">
              <Wallet size={20} color="#14b8a6" />
            </View>
            <Text className="text-dark-400 text-xs font-semibold">Total Earnings</Text>
            <Text className="text-white text-xl font-extrabold mt-1">₹{totalEarnings}</Text>
          </View>

          {/* Jobs Card */}
          <View className="w-[47%] bg-dark-900 border border-dark-800 rounded-3xl p-5 shadow-md shadow-black/20">
            <View className="w-10 h-10 bg-primary-950/40 border border-primary-500/20 rounded-xl items-center justify-center mb-4">
              <Briefcase size={20} color="#8b5cf6" />
            </View>
            <Text className="text-dark-400 text-xs font-semibold">Jobs Completed</Text>
            <Text className="text-white text-xl font-extrabold mt-1">{providerProfile?.reviewCount || 18} Jobs</Text>
          </View>

          {/* Rating Card */}
          <View className="w-full bg-dark-900 border border-dark-800 rounded-3xl p-5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-amber-950/40 border border-amber-500/20 rounded-xl items-center justify-center mr-3">
                <Star size={20} color="#f59e0b" />
              </View>
              <View>
                <Text className="text-dark-400 text-xs font-semibold">Professional Rating</Text>
                <Text className="text-white text-base font-extrabold mt-0.5">
                  {providerProfile?.averageRating || 4.9} Stars ({providerProfile?.reviewCount || 24} Reviews)
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Dynamic Status instructions helper */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          className="bg-dark-900 border border-dark-800 rounded-3xl p-5 mb-8"
        >
          <Text className="text-white font-bold text-sm mb-2">Partner Guidelines</Text>
          <Text className="text-dark-400 text-xs leading-normal">
            Keep your location enabled and maintain a completion rate above 90% to receive priority high-ticket repair & utility orders.
          </Text>
        </Animated.View>

      </ScrollView>

      {/* Incoming Request Overlay Drawer */}
      <Modal
        visible={showIncoming && !!incomingBooking}
        transparent={true}
        animationType="none"
      >
        <View className="flex-1 bg-black/75 justify-end">
          <Animated.View 
            entering={SlideInDown.duration(400)}
            className="bg-dark-900 border-t border-dark-800 rounded-t-[40px] p-6 pb-10 shadow-2xl"
          >
            {/* Countdown timer strip */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center bg-rose-950/40 border border-rose-500/20 px-3 py-1.5 rounded-full">
                <Clock size={14} color="#f43f5e" />
                <Text className="text-rose-500 text-xs font-extrabold ml-1.5">{countdown}s remaining</Text>
              </View>
              <TouchableOpacity 
                onPress={handleReject}
                className="w-8 h-8 bg-dark-950 border border-dark-800 rounded-full items-center justify-center"
              >
                <X size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Request Header Details */}
            <Text className="text-white text-xs font-semibold uppercase tracking-wider text-secondary-400 mb-1">New Incoming Order</Text>
            <Text className="text-white text-xl font-bold mb-4">{incomingBooking?.serviceName || "On-Demand Service"}</Text>

            {/* Customer coordinates metadata */}
            <View className="space-y-3 mb-6 bg-dark-950 border border-dark-800 p-4.5 rounded-2xl">
              <View className="flex-row items-start">
                <MapPin size={16} color="#14b8a6" className="mt-0.5 mr-2" />
                <View className="flex-1">
                  <Text className="text-dark-400 text-2xs uppercase tracking-wider font-semibold">Service Address</Text>
                  <Text className="text-white text-xs font-medium mt-1 leading-normal" numberOfLines={2}>
                    {typeof incomingBooking?.address === "string" 
                      ? incomingBooking.address 
                      : incomingBooking?.address?.formattedAddress || "Cyber City, Gurugram"}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center border-t border-dark-800/60 pt-3">
                <Wrench size={16} color="#8b5cf6" className="mr-2" />
                <View>
                  <Text className="text-dark-400 text-2xs uppercase tracking-wider font-semibold">Customer</Text>
                  <Text className="text-white text-xs font-semibold mt-1">
                    {incomingBooking?.customerName || "Verified Customer"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Payout Details */}
            <View className="flex-row justify-between items-center mb-6 bg-secondary-950/20 border border-secondary-500/20 p-5 rounded-2xl">
              <View>
                <Text className="text-secondary-400 text-xs font-bold uppercase tracking-wider">Estimated Payout</Text>
                <Text className="text-dark-400 text-2xs mt-1">After 15% platform commission</Text>
              </View>
              <Text className="text-white text-3xl font-extrabold">
                ₹{incomingBooking?.pricing?.providerEarnings || Math.round((incomingBooking?.totalAmount || 499) * 0.85)}
              </Text>
            </View>

            {/* Response actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleReject}
                disabled={loading}
                className="flex-1 bg-dark-950 border border-dark-800 py-4.5 rounded-2xl items-center justify-center"
              >
                <Text className="text-dark-300 font-bold text-base">Decline</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleAccept}
                disabled={loading}
                className="flex-1 bg-secondary-600 py-4.5 rounded-2xl items-center justify-center flex-row shadow-lg shadow-secondary-600/30"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Check size={18} color="#fff" className="mr-1.5" />
                    <Text className="text-white font-bold text-base">Accept Order</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

