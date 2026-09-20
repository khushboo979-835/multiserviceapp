import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/store/useAuthStore";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react-native";

import BrandLogo from "../../src/components/common/BrandLogo";

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
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
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
      className="flex-1 bg-white px-5" 
      style={{ paddingTop: insets.top + 10 }}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 40 }}
      showsVerticalScrollIndicator={false}
    >
      
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-full items-center justify-center active:bg-slate-200"
        >
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <BrandLogo size="sm" showText={false} />
          <Text className="text-slate-900 text-base font-black ml-2">Document Verification</Text>
        </View>
        <View className="w-11" />
      </View>

      {/* KYC status details */}
      {kycStatus === "PENDING" && (
        <View className="flex-row items-center bg-amber-50 border border-amber-200 p-4.5 rounded-3xl mb-5 shadow-2xs">
          <AlertTriangle size={24} color="#d97706" />
          <View className="ml-3.5 flex-1">
            <Text className="text-amber-800 font-extrabold text-sm">KYC Under Verification</Text>
            <Text className="text-amber-700 text-xs mt-0.5 leading-relaxed">
              We are reviewing your uploaded documents. Approval usually takes under 2 hours.
            </Text>
          </View>
        </View>
      )}

      {kycStatus === "APPROVED" && (
        <View className="flex-row items-center bg-emerald-50 border border-emerald-200 p-4.5 rounded-3xl mb-5 shadow-2xs">
          <CheckCircle size={24} color="#16a34a" />
          <View className="ml-3.5 flex-1">
            <Text className="text-emerald-800 font-extrabold text-sm">KYC Approved & Active</Text>
            <Text className="text-emerald-700 text-xs mt-0.5 leading-relaxed">
              Your partner account is verified. You can accept unlimited customer requests.
            </Text>
          </View>
        </View>
      )}

      <View className="space-y-5">
        <View className="mb-2">
          <Text className="text-slate-900 text-2xl font-black mb-0.5">Government ID Proofs</Text>
          <Text className="text-slate-500 text-xs font-semibold">Upload clear photos of government documents.</Text>
        </View>

        {/* Aadhaar */}
        <View className="mb-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm shadow-slate-200">
          <Text className="text-slate-900 font-extrabold text-sm mb-2.5">Aadhaar Card (Front & Back)</Text>
          <TouchableOpacity 
            onPress={() => handleDocumentSelect("AADHAAR")}
            className="border-2 border-dashed border-slate-300 bg-slate-50 p-5 rounded-2xl items-center justify-center flex-row"
          >
            {aadhaarUrl ? (
              <>
                <FileText size={20} color="#16a34a" />
                <Text className="text-emerald-700 font-bold text-xs ml-2">aadhaar_verified.jpg attached</Text>
              </>
            ) : (
              <>
                <Upload size={20} color="#ef4444" />
                <Text className="text-slate-700 font-bold text-xs ml-2">Upload Front & Back Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* PAN */}
        <View className="mb-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm shadow-slate-200">
          <Text className="text-slate-900 font-extrabold text-sm mb-2.5">Permanent Account Number (PAN)</Text>
          <TouchableOpacity 
            onPress={() => handleDocumentSelect("PAN")}
            className="border-2 border-dashed border-slate-300 bg-slate-50 p-5 rounded-2xl items-center justify-center flex-row"
          >
            {panUrl ? (
              <>
                <FileText size={20} color="#16a34a" />
                <Text className="text-emerald-700 font-bold text-xs ml-2">pan_card.jpg attached</Text>
              </>
            ) : (
              <>
                <Upload size={20} color="#ef4444" />
                <Text className="text-slate-700 font-bold text-xs ml-2">Upload PAN Card Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Driving License */}
        <View className="mb-5 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm shadow-slate-200">
          <Text className="text-slate-900 font-extrabold text-sm mb-2.5">Driving License / Trade Certificate</Text>
          <TouchableOpacity 
            onPress={() => handleDocumentSelect("LICENSE")}
            className="border-2 border-dashed border-slate-300 bg-slate-50 p-5 rounded-2xl items-center justify-center flex-row"
          >
            {licenseUrl ? (
              <>
                <FileText size={20} color="#16a34a" />
                <Text className="text-emerald-700 font-bold text-xs ml-2">license_document.jpg attached</Text>
              </>
            ) : (
              <>
                <Upload size={20} color="#ef4444" />
                <Text className="text-slate-700 font-bold text-xs ml-2">Upload License or Certificate</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmitKyc}
          disabled={loading || kycStatus === "APPROVED"}
          className={`w-full bg-brand-500 active:bg-brand-600 py-4.5 rounded-2xl items-center justify-center shadow-lg shadow-brand-500/30 mb-8 ${
            loading || kycStatus === "APPROVED" ? "opacity-50" : ""
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-extrabold text-base">Submit Documents for Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
