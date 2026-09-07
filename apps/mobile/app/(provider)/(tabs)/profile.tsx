import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { User, LogOut, ChevronRight, FileText, Settings, Shield, HelpCircle } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function ProviderProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, providerProfile, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const handleKycPress = () => {
    router.push("/(provider)/kyc-upload");
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#020617", paddingHorizontal: 20, paddingTop: Math.max(insets.top + 8, 20) }} 
      showsVerticalScrollIndicator={false}
    >
      
      {/* Profile summary header */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-dark-900 border border-dark-800 rounded-full justify-center items-center mb-4 overflow-hidden">
          <View className="w-22 h-22 bg-secondary-950 rounded-full justify-center items-center">
            <User size={44} color="#14b8a6" />
          </View>
        </View>
        <Text className="text-white text-2xl font-bold">{user?.name || "Service Professional"}</Text>
        <Text className="text-dark-400 text-sm mt-1">{user?.phoneNumber || "+91 XXXXXXXXXX"}</Text>
      </View>

      {/* KYC navigation item */}
      <View className="bg-dark-900 border border-dark-800 rounded-3xl p-2 mb-6">
        <TouchableOpacity 
          onPress={handleKycPress}
          className="flex-row items-center justify-between p-4 border-b border-dark-800/50"
        >
          <View className="flex-row items-center">
            <FileText size={20} color="#14b8a6" />
            <View className="ml-3.5">
              <Text className="text-white font-semibold text-base">KYC Documents</Text>
              <Text className="text-dark-400 text-2xs mt-0.5 uppercase font-bold tracking-wider">
                Status: {providerProfile?.kycStatus || "NOT_SUBMITTED"}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#475569" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-dark-800/50">
          <View className="flex-row items-center">
            <Settings size={20} color="#8b5cf6" />
            <Text className="text-white font-semibold text-base ml-3.5">Service Parameters</Text>
          </View>
          <ChevronRight size={18} color="#475569" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-dark-800/50">
          <View className="flex-row items-center">
            <Shield size={20} color="#0d9488" />
            <Text className="text-white font-semibold text-base ml-3.5">Privacy settings</Text>
          </View>
          <ChevronRight size={18} color="#475569" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center">
            <HelpCircle size={20} color="#f43f5e" />
            <Text className="text-white font-semibold text-base ml-3.5">Support & Help Desk</Text>
          </View>
          <ChevronRight size={18} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Logout button */}
      <TouchableOpacity
        onPress={handleLogout}
        className="flex-row items-center justify-center bg-rose-950/20 border border-rose-500/30 py-4.5 rounded-2xl mb-12"
      >
        <LogOut size={18} color="#f43f5e" />
        <Text className="text-rose-500 font-bold ml-2 text-base">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
