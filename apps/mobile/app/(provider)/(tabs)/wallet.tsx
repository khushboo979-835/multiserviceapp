import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { Wallet, ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react-native";

export default function ProviderWalletScreen() {
  const insets = useSafeAreaInsets();
  const { providerProfile } = useAuthStore();
  const balance = providerProfile?.walletBalance ?? 0;

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#020617", paddingHorizontal: 20, paddingTop: Math.max(insets.top + 8, 20) }} 
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-white text-3xl font-extrabold tracking-tight mb-6">Earnings Hub</Text>

      {/* Provider earnings card */}
      <View className="bg-secondary-600 rounded-3xl p-6 shadow-xl shadow-secondary-600/20 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-secondary-100 text-sm font-semibold uppercase tracking-wider">Withdrawable Earnings</Text>
          <Wallet size={24} color="#ccfbf1" />
        </View>
        <Text className="text-white text-4xl font-extrabold mb-6">₹{balance.toFixed(2)}</Text>
        <TouchableOpacity activeOpacity={0.8} className="w-full bg-white/20 py-3.5 rounded-2xl items-center">
          <Text className="text-white font-bold text-sm">Request Withdrawal</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between items-center bg-dark-900 border border-dark-800 p-5 rounded-3xl mb-6">
        <View className="flex-row items-center">
          <TrendingUp size={20} color="#14b8a6" />
          <Text className="text-white font-bold text-sm ml-3">This Week's Growth</Text>
        </View>
        <Text className="text-emerald-400 font-extrabold text-sm">+24%</Text>
      </View>

      {/* Transactions list */}
      <Text className="text-white text-lg font-bold mb-4">Earning Logs</Text>
      <View className="space-y-4">
        {balance > 350 && (
          <View className="flex-row justify-between items-center bg-dark-900 border border-dark-800 p-4.5 rounded-2xl mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-secondary-950 rounded-xl justify-center items-center mr-3">
                <ArrowDownRight size={18} color="#14b8a6" />
              </View>
              <View>
                <Text className="text-white font-bold text-sm">Job Completed payout</Text>
                <Text className="text-dark-400 text-xs mt-0.5">Booking Ref: #bk_screen</Text>
              </View>
            </View>
            <Text className="text-emerald-400 font-extrabold text-base">+₹1,699.00</Text>
          </View>
        )}

        <View className="flex-row justify-between items-center bg-dark-900 border border-dark-800 p-4.5 rounded-2xl mb-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-rose-950 rounded-xl justify-center items-center mr-3">
              <ArrowUpRight size={18} color="#f43f5e" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm">Wallet Withdrawal</Text>
              <Text className="text-dark-400 text-xs mt-0.5">Transferred to Bank account</Text>
            </View>
          </View>
          <Text className="text-rose-500 font-extrabold text-base">-₹1,000.00</Text>
        </View>
      </View>
    </ScrollView>
  );
}
