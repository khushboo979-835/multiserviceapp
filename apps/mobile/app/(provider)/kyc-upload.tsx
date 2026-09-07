import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function KycUploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setKycStatus, providerProfile } = useAuthStore();
  
  const [aadhaarUrl, setAadhaarUrl] = useState<string | null>(null);
  const [panUrl, setPanUrl] = useState<string | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const kycStatus = providerProfile?.kycStatus ?? "NOT_SUBMITTED";

  const handleDocumentSelect = (docType: "AADHAAR" | "PAN" | "LICENSE") => {
    // Simulating file upload URL selection
    const mockUrl = `https://s3.amazonaws.com/kyc-docs/${docType.toLowerCase()}_mock.jpg`;
    if (docType === "AADHAAR") setAadhaarUrl(mockUrl);
    if (docType === "PAN") setPanUrl(mockUrl);
    if (docType === "LICENSE") setLicenseUrl(mockUrl);
  };

  const handleSubmitKyc = async () => {
    if (!aadhaarUrl || !panUrl || !licenseUrl) {
      Alert.alert("Error", "Please upload all required KYC documents to submit verification request.");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setKycStatus("PENDING");
      Alert.alert("Verification Pending", "KYC documents submitted successfully. Verification takes up to 24 hours.");
      router.back();
    } catch (error) {
      console.error("KYC submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#020617", paddingHorizontal: 20, paddingTop: Math.max(insets.top + 8, 20) }} 
      showsVerticalScrollIndicator={false}
    >
      
      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-dark-900 border border-dark-800 rounded-full items-center justify-center"
        >
          <ArrowLeft size={18} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-base font-semibold">Document Verification</Text>
        <View className="w-10" />
      </View>

      {/* KYC status details */}
      {kycStatus === "PENDING" && (
        <View className="flex-row items-center bg-amber-950/20 border border-amber-500/20 p-5 rounded-3xl mb-6">
          <AlertTriangle size={24} color="#f59e0b" />
          <View className="ml-4 flex-1">
            <Text className="text-amber-400 font-bold text-sm">KYC Verification Pending</Text>
            <Text className="text-dark-400 text-xs mt-0.5 leading-relaxed">
              We are verifying your documents. You can continue updating them below if needed.
            </Text>
          </View>
        </View>
      )}

      {kycStatus === "APPROVED" && (
        <View className="flex-row items-center bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-3xl mb-6">
          <CheckCircle size={24} color="#10b981" />
          <View className="ml-4 flex-1">
            <Text className="text-emerald-400 font-bold text-sm">KYC Approved</Text>
            <Text className="text-dark-400 text-xs mt-0.5 leading-relaxed">
              Your account is fully verified. You can now start receiving customer booking requests.
            </Text>
          </View>
        </View>
      )}

      <Animated.View entering={FadeInDown.duration(600)} className="space-y-6">
        <Text className="text-white text-xl font-bold mb-1">Upload Documents</Text>
        <Text className="text-dark-400 text-xs mb-6">Submit scanned documents to verify your business credentials.</Text>

        {/* Aadhaar */}
        <View className="mb-5 bg-dark-900 border border-dark-800 p-5 rounded-3xl">
          <Text className="text-white font-bold text-sm mb-3">Aadhaar Card (Front & Back)</Text>
          <TouchableOpacity 
            onPress={() => handleDocumentSelect("AADHAAR")}
            className="border border-dashed border-dark-700 bg-dark-950 p-6 rounded-2xl items-center justify-center flex-row"
          >
            {aadhaarUrl ? (
              <>
                <FileText size={18} color="#10b981" />
                <Text className="text-emerald-400 font-bold text-xs ml-2">aadhaar_document.jpg loaded</Text>
              </>
            ) : (
              <>
                <Upload size={18} color="#64748b" />
                <Text className="text-dark-400 font-semibold text-xs ml-2">Upload Front & Back Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* PAN */}
        <View className="mb-5 bg-dark-900 border border-dark-800 p-5 rounded-3xl">
          <Text className="text-white font-bold text-sm mb-3">Permanent Account Number (PAN)</Text>
          <TouchableOpacity 
            onPress={() => handleDocumentSelect("PAN")}
            className="border border-dashed border-dark-700 bg-dark-950 p-6 rounded-2xl items-center justify-center flex-row"
          >
            {panUrl ? (
              <>
                <FileText size={18} color="#10b981" />
                <Text className="text-emerald-400 font-bold text-xs ml-2">pan_card.jpg loaded</Text>
              </>
            ) : (
              <>
                <Upload size={18} color="#64748b" />
                <Text className="text-dark-400 font-semibold text-xs ml-2">Upload PAN card photograph</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Driving License */}
        <View className="mb-6 bg-dark-900 border border-dark-800 p-5 rounded-3xl">
          <Text className="text-white font-bold text-sm mb-3">Driving License (Optional)</Text>
          <TouchableOpacity 
            onPress={() => handleDocumentSelect("LICENSE")}
            className="border border-dashed border-dark-700 bg-dark-950 p-6 rounded-2xl items-center justify-center flex-row"
          >
            {licenseUrl ? (
              <>
                <FileText size={18} color="#10b981" />
                <Text className="text-emerald-400 font-bold text-xs ml-2">driving_license.jpg loaded</Text>
              </>
            ) : (
              <>
                <Upload size={18} color="#64748b" />
                <Text className="text-dark-400 font-semibold text-xs ml-2">Upload DL photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmitKyc}
          disabled={loading || kycStatus === "APPROVED"}
          className={`w-full bg-secondary-600 py-4.5 rounded-2xl items-center justify-center shadow-lg mb-12 ${
            loading || kycStatus === "APPROVED" ? "opacity-50" : ""
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Submit Documents</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}
