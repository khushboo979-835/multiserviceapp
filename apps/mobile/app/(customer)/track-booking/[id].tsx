import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Alert, Modal, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { subscribeSingleBooking, submitReviewToFirestore } from "@/services/firestoreService";
import LiveTrackingMap from "@/components/booking/LiveTrackingMap";
import { useToast } from "@/components/ui/ToastProvider";
import { Booking, BookingStatus, GeoLocation } from "@/types";
import { ArrowLeft, Phone, MessageSquare, ShieldCheck, Compass, CheckCircle, Star, Sparkles, X } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function TrackBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { activeBooking, setActiveBooking, updateActiveBookingStatus } = useBookingStore();
  const { showSuccess, showError } = useToast();

  const [bookingData, setBookingData] = useState<Booking | null>(activeBooking);
  const [providerLoc, setProviderLoc] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Real-time Firestore subscription to this specific booking
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeSingleBooking(id, (booking) => {
      setLoading(false);
      if (booking) {
        setBookingData(booking);
        setActiveBooking(booking);

        // Compute simulated provider location near address
        const coords = typeof booking.address === "object" ? booking.address : { latitude: 28.4901, longitude: 77.0805 };
        setProviderLoc({
          latitude: coords.latitude - 0.003,
          longitude: coords.longitude - 0.003,
          heading: 45,
          timestamp: Date.now(),
        });

        // Prompt review if completed
        if (booking.status === "COMPLETED") {
          setIsReviewOpen(true);
        }
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [id]);

  const currentBooking = bookingData || activeBooking;

  const handleCallProvider = () => {
    const phone = currentBooking?.providerPhone || "+919876543210";
    Linking.openURL(`tel:${phone}`);
  };

  const handleSendMessage = () => {
    const phone = currentBooking?.providerPhone || "+919876543210";
    Linking.openURL(`sms:${phone}`);
  };

  const handleSubmitReview = async () => {
    if (!currentBooking) return;
    setSubmittingReview(true);
    try {
      await submitReviewToFirestore({
        bookingId: currentBooking.id,
        serviceId: currentBooking.serviceId || "srv_default",
        customerId: user?.id || user?.uid || "usr_guest",
        reviewerName: user?.name || user?.fullName || "Verified Customer",
        rating,
        comment: comment.trim() || "Great, prompt service!",
      });
      showSuccess("Thank you for your rating!");
      setIsReviewOpen(false);
    } catch (err) {
      showError("Failed to submit review. Thank you for your feedback!");
      setIsReviewOpen(false);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (!currentBooking) {
    return (
      <View className="flex-1 bg-dark-950 items-center justify-center p-6">
        <Text className="text-white text-lg font-bold text-center">No Active Booking Found</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.replace("/(customer)/(tabs)")}
          className="mt-6 bg-primary-600 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold">Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const steps: BookingStatus[] = ["PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];
  
  const getStepIndex = (status: BookingStatus) => {
    if (status === "PENDING_PROVIDER" || status === "PENDING") return 0;
    if (status === "ACCEPTED" || status === "EN_ROUTE" || status === "ARRIVED") return 1;
    if (status === "IN_PROGRESS") return 2;
    if (status === "COMPLETED") return 3;
    return 0;
  };
  
  const currentStepIdx = getStepIndex(currentBooking.status);

  const customerCoords = typeof currentBooking.address === "object" 
    ? { latitude: currentBooking.address.latitude, longitude: currentBooking.address.longitude }
    : { latitude: 28.4901, longitude: 77.0805 };

  return (
    <View className="flex-1 bg-dark-950">
      
      {/* Top Header Navigation Overlay */}
      <View style={{ position: "absolute", top: Math.max(insets.top + 8, 20), left: 24, right: 24, zIndex: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.replace("/(customer)/(tabs)")}
          className="w-11 h-11 bg-dark-900/90 border border-dark-800 rounded-full items-center justify-center shadow-lg shadow-black/50"
        >
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View className="bg-dark-900/90 border border-dark-800 px-4 py-2.5 rounded-full shadow-lg shadow-black/50">
          <Text className="text-white text-xs font-bold uppercase tracking-wider">Order #{currentBooking.id}</Text>
        </View>
        <View className="w-11" />
      </View>

      {/* Live Map Component */}
      <View className="flex-[0.55] min-h-[280px]">
        <LiveTrackingMap 
          customerCoords={customerCoords}
          providerCoords={providerLoc}
        />
      </View>

      {/* Booking Progress Tracker Card */}
      <Animated.View 
        entering={FadeInDown.duration(600)}
        className="flex-[0.45] bg-dark-900 border-t border-dark-800 rounded-t-[40px] px-6 py-5 shadow-2xl"
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* OTP Code Alert Panel */}
          {currentBooking.status !== "COMPLETED" && (
            <View className="flex-row items-center justify-between bg-primary-950/30 border border-primary-500/30 p-4 rounded-2xl mb-5">
              <View className="flex-row items-center flex-1 pr-3">
                <ShieldCheck size={20} color="#8b5cf6" />
                <View className="ml-3 flex-1">
                  <Text className="text-white text-xs font-bold">Start-Service Verification Code</Text>
                  <Text className="text-dark-400 text-2xs mt-0.5">Share this OTP with partner on arrival</Text>
                </View>
              </View>
              <Text className="text-primary-400 text-xl font-extrabold tracking-widest">{currentBooking.otp || "4912"}</Text>
            </View>
          )}

          {/* Provider Profile Summary */}
          <View className="flex-row items-center justify-between mb-5 border-b border-dark-800/50 pb-4">
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-12 h-12 bg-secondary-950 border border-secondary-500/30 rounded-xl items-center justify-center">
                <Compass size={24} color="#14b8a6" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-white text-sm font-bold" numberOfLines={1}>
                  {currentBooking.providerName || "Finding Nearby Professional..."}
                </Text>
                <Text className="text-dark-400 text-xs mt-0.5">
                  {currentBooking.providerPhone || "Verified Partner Assigned Soon"}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                activeOpacity={0.7}
                disabled={!currentBooking.providerId}
                onPress={handleCallProvider}
                className={`w-10 h-10 bg-dark-950 border border-dark-800 rounded-full items-center justify-center ${
                  !currentBooking.providerId ? "opacity-40" : ""
                }`}
              >
                <Phone size={16} color="#14b8a6" />
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.7}
                disabled={!currentBooking.providerId}
                onPress={handleSendMessage}
                className={`w-10 h-10 bg-dark-950 border border-dark-800 rounded-full items-center justify-center ${
                  !currentBooking.providerId ? "opacity-40" : ""
                }`}
              >
                <MessageSquare size={16} color="#8b5cf6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Step Timeline Progression */}
          <View className="mb-4">
            <Text className="text-white font-bold text-sm mb-4">Service Timeline</Text>
            <View className="space-y-4">
              {steps.map((step, idx) => {
                const isPassed = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                
                let stepLabel = "";
                switch (step) {
                  case "PENDING":
                    stepLabel = "Booking Confirmed";
                    break;
                  case "ACCEPTED":
                    stepLabel = "Partner Assigned & En Route";
                    break;
                  case "IN_PROGRESS":
                    stepLabel = "Service In Progress";
                    break;
                  case "COMPLETED":
                    stepLabel = "Completed";
                    break;
                }

                return (
                  <View key={step} className="flex-row items-start mb-3">
                    <View className="items-center mr-4">
                      <View className={`w-5 h-5 rounded-full items-center justify-center ${
                        isPassed ? "bg-primary-600" : isCurrent ? "bg-secondary-500 shadow-md shadow-secondary-500/50" : "bg-dark-800"
                      }`}>
                        {isPassed && <CheckCircle size={10} color="#fff" />}
                      </View>
                      {idx < steps.length - 1 && (
                        <View className={`w-[2px] h-6 ${isPassed ? "bg-primary-600" : "bg-dark-800"} mt-1`} />
                      )}
                    </View>
                    <View className="flex-1 mt-0.5">
                      <Text className={`font-semibold text-xs ${isCurrent ? "text-white text-sm" : "text-dark-400"}`}>
                        {stepLabel}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Customer Review & Rating Modal */}
      <Modal
        visible={isReviewOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReviewOpen(false)}
      >
        <View className="flex-1 bg-black/75 justify-center px-6">
          <View className="bg-dark-900 border border-dark-800 rounded-3xl p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Sparkles size={20} color="#10b981" />
                <Text className="text-white text-lg font-bold ml-2">Rate Your Experience</Text>
              </View>
              <TouchableOpacity onPress={() => setIsReviewOpen(false)}>
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text className="text-dark-400 text-xs mb-6">
              How was your {currentBooking.serviceName || "service"} experience with our professional partner?
            </Text>

            {/* Stars */}
            <View className="flex-row justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  activeOpacity={0.8}
                  onPress={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    size={32}
                    color="#f59e0b"
                    fill={star <= rating ? "#f59e0b" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Leave comments for the service partner..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={3}
              className="bg-dark-950 border border-dark-800 rounded-2xl p-4 text-white text-xs mb-6"
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmitReview}
              disabled={submittingReview}
              className="w-full bg-primary-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-primary-600/30"
            >
              {submittingReview ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-sm font-bold">Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

