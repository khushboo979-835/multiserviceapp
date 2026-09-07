import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Alert, TextInput } from "react-native";
import { useBookingStore } from "@/store/useBookingStore";
import { useAuthStore } from "@/store/useAuthStore";
import { CreditCard, Wallet, Smartphone, ShieldCheck, X, CheckCircle, Percent } from "lucide-react-native";
import { PricingDetail, PaymentMethod } from "@/types";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  pricing: PricingDetail;
  onPaymentSuccess: (method: PaymentMethod) => void;
}

export default function PaymentModal({
  visible,
  onClose,
  pricing,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { providerProfile, updateProviderProfile } = useAuthStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("CASH_AFTER_SERVICE");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const walletBalance = 1250; // Mock current wallet balance for customer
  const platformFee = 29;
  const subtotal = pricing.basePrice + pricing.addOnPrice;
  const gstTax = Math.round(subtotal * 0.18);
  const finalAmount = Math.max(0, subtotal + gstTax + platformFee - discount);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "WELCOME100") {
      setDiscount(100);
      Alert.alert("Coupon Applied", "₹100 discount applied to your booking amount.");
    } else {
      Alert.alert("Invalid Coupon", "Try applying WELCOME100 for simulated coupon discount.");
    }
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      // Simulate Payment API Gateway Authorization
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (selectedMethod === "WALLET" && walletBalance < finalAmount) {
        Alert.alert("Insufficient Balance", "Your wallet balance is insufficient. Choose a different payment method.");
        setLoading(false);
        return;
      }

      onPaymentSuccess(selectedMethod);
      onClose();
    } catch (error) {
      Alert.alert("Payment Failed", "An error occurred during verification. Try Cash after Service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-dark-900 border-t border-dark-800 rounded-t-[40px] px-6 pt-5 pb-8 max-h-[90%] shadow-2xl">
          <View className="w-12 h-1 bg-dark-700 rounded-full align-self-center mx-auto mb-4" />

          {/* Modal Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-white text-xl font-bold">Secure Checkout</Text>
              <Text className="text-dark-400 text-xs mt-1">Review pricing breakup & select payment option</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 bg-dark-950 border border-dark-800 rounded-full items-center justify-center"
            >
              <X size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Price Breakup Card */}
          <View className="bg-dark-950 border border-dark-800 rounded-2xl p-4.5 mb-6">
            <Text className="text-white font-bold text-sm mb-3">Price Breakdown</Text>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-dark-400 text-xs">Item Subtotal</Text>
              <Text className="text-white text-xs font-semibold">₹{subtotal}</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-dark-400 text-xs">GST Tax (18%)</Text>
              <Text className="text-white text-xs font-semibold">₹{gstTax}</Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="text-dark-400 text-xs">Convenience Platform Fee</Text>
              <Text className="text-white text-xs font-semibold">₹{platformFee}</Text>
            </View>

            {discount > 0 && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-emerald-400 text-xs">Coupon Discount</Text>
                <Text className="text-emerald-400 text-xs font-bold">-₹{discount}</Text>
              </View>
            )}

            <View className="border-t border-dark-800 mt-3 pt-3 flex-row justify-between items-center">
              <Text className="text-white font-bold text-sm">Total Payable</Text>
              <Text className="text-primary-400 font-extrabold text-lg">₹{finalAmount}</Text>
            </View>
          </View>

          {/* Coupon Code Input */}
          <View className="flex-row gap-2 mb-6">
            <View className="flex-1 flex-row items-center bg-dark-950 border border-dark-800 rounded-2xl px-4 py-3">
              <Percent size={16} color="#64748b" />
              <TextInput
                placeholder="Promo Code (WELCOME100)"
                placeholderTextColor="#475569"
                value={couponCode}
                onChangeText={setCouponCode}
                className="flex-1 text-white text-xs font-semibold ml-2 h-5 p-0"
              />
            </View>
            <TouchableOpacity
              onPress={handleApplyCoupon}
              className="bg-primary-600 px-5 rounded-2xl justify-center items-center active:bg-primary-700"
            >
              <Text className="text-white font-bold text-xs">Apply</Text>
            </TouchableOpacity>
          </View>

          {/* Payment Methods */}
          <Text className="text-white font-bold text-sm mb-3">Choose Payment Mode</Text>
          <View className="space-y-3 mb-6">
            {/* UPI */}
            <TouchableOpacity
              onPress={() => setSelectedMethod("UPI")}
              className={`flex-row items-center justify-between bg-dark-950 border ${
                selectedMethod === "UPI" ? "border-primary-500" : "border-dark-800"
              } rounded-2xl p-4`}
            >
              <View className="flex-row items-center">
                <Smartphone size={20} color="#8b5cf6" />
                <Text className="text-white font-bold text-xs ml-3">Instant UPI (GPay / PhonePe / Cards)</Text>
              </View>
              <View className={`w-4 h-4 rounded-full border ${selectedMethod === "UPI" ? "border-primary-500 bg-primary-600" : "border-dark-700"}`} />
            </TouchableOpacity>

            {/* Wallet */}
            <TouchableOpacity
              onPress={() => setSelectedMethod("WALLET")}
              className={`flex-row items-center justify-between bg-dark-950 border ${
                selectedMethod === "WALLET" ? "border-primary-500" : "border-dark-800"
              } rounded-2xl p-4`}
            >
              <View className="flex-row items-center">
                <Wallet size={20} color="#14b8a6" />
                <View className="ml-3">
                  <Text className="text-white font-bold text-xs">Hub Wallet Balance</Text>
                  <Text className="text-dark-400 text-2xs mt-0.5">Available: ₹{walletBalance.toFixed(2)}</Text>
                </View>
              </View>
              <View className={`w-4 h-4 rounded-full border ${selectedMethod === "WALLET" ? "border-primary-500 bg-primary-600" : "border-dark-700"}`} />
            </TouchableOpacity>

            {/* Cash after Service */}
            <TouchableOpacity
              onPress={() => setSelectedMethod("CASH_AFTER_SERVICE")}
              className={`flex-row items-center justify-between bg-dark-950 border ${
                selectedMethod === "CASH_AFTER_SERVICE" ? "border-primary-500" : "border-dark-800"
              } rounded-2xl p-4`}
            >
              <View className="flex-row items-center">
                <CreditCard size={20} color="#f43f5e" />
                <Text className="text-white font-bold text-xs ml-3">Cash / UPI After Delivery</Text>
              </View>
              <View className={`w-4 h-4 rounded-full border ${selectedMethod === "CASH_AFTER_SERVICE" ? "border-primary-500 bg-primary-600" : "border-dark-700"}`} />
            </TouchableOpacity>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            onPress={handlePay}
            disabled={loading}
            className={`w-full bg-primary-600 active:bg-primary-700 py-4.5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary-600/30 ${
              loading ? "opacity-50" : ""
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <View className="mr-1.5">
                  <ShieldCheck size={18} color="#fff" />
                </View>
                <Text className="text-white font-bold text-base">Pay & Confirm Booking</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
