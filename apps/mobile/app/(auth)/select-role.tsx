import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Wrench, Users, ArrowRight } from "lucide-react-native";
import { auth } from "@/config/firebaseConfig";
import { syncUserProfile } from "@/services/firestoreService";
import { useAuthStore } from "@/store/useAuthStore";
import { useToast } from "@/components/ui/ToastProvider";
import { UserRole, ProviderProfile } from "@/types";

export default function SelectRoleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, updateUser, setProviderProfile } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const handleConfirmRole = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await syncUserProfile({
          id: currentUser.uid,
          role: selectedRole,
          name: user?.name || currentUser.displayName || "User",
          email: user?.email || currentUser.email || "",
          phone: user?.phoneNumber || currentUser.phoneNumber || "",
        });
      }

      updateUser({ role: selectedRole });

      if (selectedRole === "PROVIDER") {
        const dummyProvider: ProviderProfile = {
          id: `prov_${currentUser?.uid || "mock123"}`,
          userId: currentUser?.uid || "usr_mock123",
          servicesOffered: ["srv_1", "srv_2", "srv_3"],
          kycStatus: "APPROVED",
          documents: [],
          isAvailable: true,
          averageRating: 4.9,
          reviewCount: 48,
          walletBalance: 1250,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProviderProfile(dummyProvider);
        showSuccess("Switched to Provider workspace");
        router.replace("/(provider)/(tabs)/dashboard");
      } else {
        showSuccess("Welcome to the Marketplace!");
        router.replace("/(customer)/(tabs)");
      }
    } catch (err: any) {
      console.error("Error setting role:", err);
      showError("Failed to save profile role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#020617", paddingHorizontal: 24, paddingTop: Math.max(insets.top + 8, 20), paddingBottom: Math.max(insets.bottom + 8, 20), justifyContent: "space-between" }}>
      <View className="items-center mt-6">
        <Animated.Text 
          entering={FadeInUp.delay(100).duration(600)}
          className="text-white text-3xl font-bold tracking-tight text-center"
        >
          Choose Your Profile
        </Animated.Text>
        <Animated.Text 
          entering={FadeInUp.delay(200).duration(600)}
          className="text-dark-400 text-base text-center mt-3 px-8"
        >
          Select how you want to experience the Multi-Service Marketplace
        </Animated.Text>
      </View>

      <View className="my-auto space-y-4">
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedRole("CUSTOMER")}
            className={`flex-row items-center bg-dark-900 border ${
              selectedRole === "CUSTOMER" 
                ? "border-primary-500 bg-primary-950/20 shadow-lg shadow-primary-500/20" 
                : "border-dark-800"
            } rounded-3xl p-6 mb-4`}
          >
            <View className={`w-14 h-14 rounded-2xl items-center justify-center ${
              selectedRole === "CUSTOMER" ? "bg-primary-600" : "bg-dark-950"
            }`}>
              <Users size={24} color={selectedRole === "CUSTOMER" ? "#ffffff" : "#6366f1"} />
            </View>
            <View className="flex-1 ml-5">
              <Text className="text-white text-lg font-bold">I am a Customer</Text>
              <Text className="text-dark-400 text-sm mt-1">Book professional doorstep utilities, repairs, salons, and more.</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedRole("PROVIDER")}
            className={`flex-row items-center bg-dark-900 border ${
              selectedRole === "PROVIDER" 
                ? "border-secondary-500 bg-secondary-950/20 shadow-lg shadow-secondary-500/20" 
                : "border-dark-800"
            } rounded-3xl p-6`}
          >
            <View className={`w-14 h-14 rounded-2xl items-center justify-center ${
              selectedRole === "PROVIDER" ? "bg-secondary-600" : "bg-dark-950"
            }`}>
              <Wrench size={24} color={selectedRole === "PROVIDER" ? "#ffffff" : "#14b8a6"} />
            </View>
            <View className="flex-1 ml-5">
              <Text className="text-white text-lg font-bold">I am a Provider</Text>
              <Text className="text-dark-400 text-sm mt-1">Register your services, accept bookings, manage earnings.</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(500).duration(600)}>
        <TouchableOpacity
          onPress={handleConfirmRole}
          disabled={!selectedRole || loading}
          className={`w-full py-4.5 rounded-2xl flex-row items-center justify-center shadow-lg ${
            selectedRole
              ? selectedRole === "CUSTOMER"
                ? "bg-primary-600 shadow-primary-600/30"
                : "bg-secondary-600 shadow-secondary-600/30"
              : "bg-dark-800 opacity-50"
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
          ) : (
            <>
              <Text className="text-white text-base font-bold mr-2">
                {selectedRole ? `Proceed as ${selectedRole === "CUSTOMER" ? "Customer" : "Provider"}` : "Select a Profile"}
              </Text>
              {selectedRole && <ArrowRight size={18} color="#ffffff" />}
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
