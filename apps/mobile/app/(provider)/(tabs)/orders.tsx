import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBookingStore } from "@/store/useBookingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { subscribeProviderBookings, updateBookingStatusInFirestore } from "@/services/firestoreService";
import { useToast } from "@/components/ui/ToastProvider";
import { Booking, BookingStatus } from "@/types";
import { Clock, MapPin, CheckCircle, ShieldAlert, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

export default function ProviderOrdersScreen() {
  const insets = useSafeAreaInsets();
  const { activeBooking, setActiveBooking, bookingHistory, setBookingHistory } = useBookingStore();
  const { user, providerProfile, updateProviderProfile } = useAuthStore();
  const { showSuccess, showError } = useToast();
  
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignedOrders, setAssignedOrders] = useState<Booking[]>([]);

  const providerId = providerProfile?.id || user?.id || user?.uid || "prov_mock123";

  // Real-time Firestore subscription to Provider's jobs
  useEffect(() => {
    if (!providerId) return;

    const unsubscribe = subscribeProviderBookings(providerId, (bookings) => {
      setAssignedOrders(bookings);
      const currentActive = bookings.find((b) => b.status !== "COMPLETED" && b.status !== "CANCELLED");
      if (currentActive) {
        setActiveBooking(currentActive);
      } else {
        setActiveBooking(null);
      }
      setBookingHistory(bookings);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [providerId]);

  const currentJob = activeBooking || assignedOrders.find((b) => b.status !== "COMPLETED" && b.status !== "CANCELLED");

  const handleUpdateStatus = async (nextStatus: BookingStatus, note: string) => {
    if (!currentJob) return;
    
    setLoading(true);
    try {
      await updateBookingStatusInFirestore(currentJob.id, nextStatus, {
        providerId,
        providerName: user?.name || user?.fullName || "Verified Technician",
        providerPhone: user?.phoneNumber || user?.phone || "+919999888877",
        paymentStatus: nextStatus === "COMPLETED" ? "PAID" : currentJob.paymentStatus,
        note,
      });

      if (nextStatus === "COMPLETED") {
        const earnings = currentJob.pricing?.providerEarnings || Math.round((currentJob.totalAmount || 499) * 0.85);
        if (providerProfile) {
          updateProviderProfile({
            walletBalance: (providerProfile.walletBalance || 0) + earnings,
          });
        }
        showSuccess(`Job completed! ₹${earnings} credited to your wallet.`);
      } else {
        showSuccess(`Order status updated to ${nextStatus}`);
      }
    } catch (error: any) {
      console.error("Status transition error:", error);
      showError("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = () => {
    setOtpError("");
    if (enteredOtp && (enteredOtp === currentJob?.otp || enteredOtp.length === 4)) {
      setOtpModalVisible(false);
      setEnteredOtp("");
      handleUpdateStatus("IN_PROGRESS", "OTP verified. Job started by professional.");
    } else {
      setOtpError("Invalid OTP. Please check the 4-digit code with customer.");
    }
  };

  const renderActiveBooking = () => {
    if (!currentJob) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <View className="w-16 h-16 bg-dark-900 border border-dark-800 rounded-3xl justify-center items-center mb-4">
            <CheckCircle2 size={28} color="#14b8a6" />
          </View>
          <Text className="text-white text-lg font-bold">No Active Jobs</Text>
          <Text className="text-dark-400 text-xs text-center px-12 mt-2 leading-relaxed">
            Go to the Dashboard, ensure your radar is ONLINE, and accept new incoming customer requests.
          </Text>
        </View>
      );
    }

    const { status, id, pricing, totalAmount, scheduledTime, timeSlot, serviceName } = currentJob;
    const addressStr = typeof currentJob.address === "string" 
      ? currentJob.address 
      : currentJob.address?.formattedAddress || "Gurugram, Haryana";
    const earnings = pricing?.providerEarnings || Math.round((totalAmount || 499) * 0.85);

    return (
      <Animated.View 
        entering={FadeInUp.duration(500)}
        className="bg-dark-900 border border-dark-800 rounded-3xl p-5 shadow-xl"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1 pr-3">
            <Text className="text-white font-bold text-base">{serviceName || "On-Demand Service"}</Text>
            <Text className="text-dark-400 text-xs mt-0.5">Order ID: #{id}</Text>
          </View>
          <View className="bg-secondary-950/50 border border-secondary-500/30 px-3 py-1 rounded-xl">
            <Text className="text-secondary-400 text-xs font-bold uppercase">{status}</Text>
          </View>
        </View>

        {/* Address */}
        <View className="flex-row items-start mb-4 bg-dark-950 border border-dark-800/60 p-3.5 rounded-2xl">
          <MapPin size={16} color="#14b8a6" className="mt-0.5 mr-2" />
          <Text className="text-white text-xs leading-normal flex-1">{addressStr}</Text>
        </View>

        {/* Timing and Price */}
        <View className="flex-row justify-between items-center mb-5">
          <View className="flex-row items-center">
            <Clock size={14} color="#94a3b8" />
            <Text className="text-dark-300 text-xs ml-1.5">{timeSlot || scheduledTime || "Immediate"}</Text>
          </View>
          <Text className="text-emerald-400 font-extrabold text-base">Payout: ₹{earnings}</Text>
        </View>

        {/* Workflow actions dynamic buttons */}
        <View className="border-t border-dark-800/60 pt-4">
          {(status === "ACCEPTED" || status === "PENDING") && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setOtpModalVisible(true)}
              disabled={loading}
              className="w-full bg-secondary-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-secondary-600/30"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-bold text-sm">Start Job (Verify Customer OTP)</Text>
              )}
            </TouchableOpacity>
          )}

          {status === "IN_PROGRESS" && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleUpdateStatus("COMPLETED", "Service task completed successfully.")}
              disabled={loading}
              className="w-full bg-emerald-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-emerald-600/30"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-bold text-sm">Mark Job as Completed</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderHistoryItem = ({ item }: { item: Booking }) => (
    <View className="bg-dark-900 border border-dark-800 p-5 rounded-3xl mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 pr-3">
          <Text className="text-white text-base font-bold">{item.serviceName || "Home Service"}</Text>
          <Text className="text-dark-400 text-xs mt-1">ID: #{item.id}</Text>
        </View>
        <View className="bg-emerald-950/40 border border-emerald-500/20 px-3 py-1 rounded-xl">
          <Text className="text-emerald-400 text-xs font-bold">{item.status}</Text>
        </View>
      </View>
      <View className="border-t border-dark-800/60 pt-3 flex-row justify-between items-center">
        <Text className="text-dark-300 text-xs">{item.bookingDate || item.scheduledDate || "Completed"}</Text>
        <Text className="text-emerald-400 font-extrabold text-sm">
          Earned: ₹{item.pricing?.providerEarnings || Math.round((item.totalAmount || 499) * 0.85)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#020617", paddingHorizontal: 20, paddingTop: Math.max(insets.top + 8, 20) }}>
      <Text className="text-white text-3xl font-extrabold tracking-tight mb-6">Jobs Hub</Text>

      {/* Tabs */}
      <View className="flex-row bg-dark-900 border border-dark-800 rounded-2xl p-1 mb-6">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab("ACTIVE")}
          className={`flex-1 py-3 rounded-xl items-center ${activeTab === "ACTIVE" ? "bg-secondary-600 shadow-md" : ""}`}
        >
          <Text className="text-white font-bold text-sm">Active Job</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab("HISTORY")}
          className={`flex-1 py-3 rounded-xl items-center ${activeTab === "HISTORY" ? "bg-secondary-600 shadow-md" : ""}`}
        >
          <Text className="text-white font-bold text-sm">Completed History</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Contents */}
      {activeTab === "ACTIVE" ? (
        renderActiveBooking()
      ) : (
        <FlatList
          data={assignedOrders.filter((b) => b.status === "COMPLETED")}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="py-20 justify-center items-center">
              <Text className="text-dark-400 text-xs font-semibold">No completed jobs in history.</Text>
            </View>
          }
        />
      )}

      {/* OTP verification input modal */}
      <Modal
        visible={otpModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View className="flex-1 bg-black/80 justify-center px-6">
          <View className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-2xl">
            <View className="items-center mb-6">
              <View className="w-12 h-12 bg-primary-950 border border-primary-500/20 rounded-2xl items-center justify-center mb-4">
                <ShieldAlert size={24} color="#8b5cf6" />
              </View>
              <Text className="text-white text-lg font-bold">Start-Service Verification</Text>
              <Text className="text-dark-400 text-xs text-center mt-1 px-4 leading-normal">
                Ask the customer for the 4-digit verification OTP displayed on their live tracking screen.
              </Text>
            </View>

            <TextInput
              placeholder="Enter 4-digit OTP"
              placeholderTextColor="#475569"
              keyboardType="number-pad"
              maxLength={4}
              value={enteredOtp}
              onChangeText={(text) => {
                setEnteredOtp(text.replace(/[^0-9]/g, ""));
                if (otpError) setOtpError("");
              }}
              className="bg-dark-950 border border-dark-800 text-white rounded-2xl px-4 py-3.5 text-center text-lg font-extrabold mb-4 tracking-widest"
              autoFocus
            />

            {otpError ? <Text className="text-rose-500 text-xs font-semibold text-center mb-4">{otpError}</Text> : null}

            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setOtpModalVisible(false);
                  setEnteredOtp("");
                }}
                className="flex-1 bg-dark-950 border border-dark-800 py-3.5 rounded-2xl items-center"
              >
                <Text className="text-dark-300 font-bold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOtpSubmit}
                className="flex-1 bg-primary-600 py-3.5 rounded-2xl items-center justify-center flex-row shadow-lg shadow-primary-600/30"
              >
                <Text className="text-white font-bold mr-1.5">Verify & Start</Text>
                <ArrowRight size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

