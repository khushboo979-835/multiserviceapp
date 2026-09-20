import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Home, AlertCircle } from "lucide-react-native";
import BrandLogo from "../src/components/common/BrandLogo";

export default function NotFoundScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        paddingTop: insets.top + 20,
        paddingBottom: Math.max(insets.bottom, 24),
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <BrandLogo size="md" showText={false} />

      <View className="items-center px-4">
        <View className="w-20 h-20 bg-red-50 border border-brand-200 rounded-3xl items-center justify-center mb-4">
          <AlertCircle size={40} color="#ef4444" />
        </View>
        <Text className="text-slate-900 text-3xl font-black text-center tracking-tight">
          Page Not Found
        </Text>
        <Text className="text-slate-500 text-sm font-medium text-center mt-2 leading-relaxed">
          The requested screen or service route could not be found. Please return to the home screen.
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.replace("/(customer)/(tabs)")}
        className="w-full bg-brand-500 active:bg-brand-600 py-4.5 rounded-2xl items-center justify-center flex-row shadow-lg shadow-brand-500/30"
      >
        <Home size={20} color="#ffffff" />
        <Text className="text-white text-base font-extrabold ml-2">Back to Home Screen</Text>
      </TouchableOpacity>
    </View>
  );
}
