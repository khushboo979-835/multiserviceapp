import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Gift,
  Tag,
  MapPin,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Banknote,
  Sparkles,
  ArrowLeft,
  X,
  Clock,
  Crosshair,
  Check,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCartStore } from "../../../src/store/useCartStore";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { LocationService } from "../../../src/services/location.service";
import { db } from "../../../src/config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { MOCK_COUPONS } from "../../../src/constants/mockData";
import { Coupon } from "../../../src/types";
import InishaHeader from "../../../src/components/common/InishaHeader";
import SafeImage from "../../../src/components/common/SafeImage";
import { apiClient } from "../../../src/api/apiClient";

const { width } = Dimensions.get("window");

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    isGift,
    giftRecipientName,
    giftMessage,
    setGiftOptions,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    placeOrder,
    getSubtotal,
    getDiscount,
    getGiftWrapFee,
    getDeliveryFee,
    getFinalTotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Rahmatnagar, Dilgouri, Sultanganj, Bhagalpur, Bihar - 813213"
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD" | "WALLET">("UPI");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Load saved address from storage or user profile on mount
  useEffect(() => {
    async function loadAddress() {
      try {
        const stored = await AsyncStorage.getItem("@user_delivery_address");
        if (stored && stored.trim().length > 0) {
          setDeliveryAddress(stored.trim());
          setAddressInput(stored.trim());
        } else if (user?.address && user.address.trim().length > 0) {
          setDeliveryAddress(user.address.trim());
          setAddressInput(user.address.trim());
        } else {
          const defaultAddr = "Rahmatnagar, Dilgouri, Sultanganj, Bhagalpur, Bihar - 813213";
          setDeliveryAddress(defaultAddr);
          setAddressInput(defaultAddr);
        }
      } catch {
        // Fallback
      }
    }
    loadAddress();
  }, [user?.address]);

  const handleDetectGps = async () => {
    setDetectingGps(true);
    try {
      const loc = await LocationService.getCurrentLocation();
      if (loc?.formattedAddress) {
        setAddressInput(loc.formattedAddress);
      }
    } catch {
      const fallback = LocationService.getFallbackLocation();
      setAddressInput(fallback.formattedAddress);
    } finally {
      setDetectingGps(false);
    }
  };

  const handleSaveDeliveryAddress = async () => {
    const trimmed = addressInput.trim();
    if (!trimmed) {
      Alert.alert("Address Required", "Please enter your complete delivery address.");
      return;
    }

    setDeliveryAddress(trimmed);
    await AsyncStorage.setItem("@user_delivery_address", trimmed);

    // Update user profile in local store
    useAuthStore.getState().updateUser({ address: trimmed });

    // Sync to backend MongoDB Atlas
    try {
      const API_URL =
        process.env.EXPO_PUBLIC_API_URL ||
        "https://multiserviceapp-4pdw.onrender.com/api";
      const token = useAuthStore.getState().token;
      fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: user?.id,
          phone: user?.phoneNumber,
          address: trimmed,
        }),
      }).catch(() => {});
    } catch {}

    setIsAddressModalOpen(false);
  };

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const giftWrapFee = getGiftWrapFee();
  const deliveryFee = getDeliveryFee();
  const finalTotal = getFinalTotal();

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError("");

    const coupon = MOCK_COUPONS.find((c) => c.code === code);
    if (!coupon) {
      setCouponError("Invalid coupon code. Try INISHA50 or FIRST100.");
      return;
    }

    if (subtotal < coupon.minOrderValue) {
      setCouponError(
        `Minimum order value of ₹${coupon.minOrderValue} required for ${coupon.code}.`
      );
      return;
    }

    applyCoupon(coupon);
    setCouponInput("");
  };

  const handlePlaceOrder = () => {
    if (!user) {
      Alert.alert(
        "Login Required 🔐",
        "Please login with your mobile number to place your order and view your personal order history.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Login / Register",
            onPress: () => router.push("/(auth)/login"),
          },
        ]
      );
      return;
    }

    if (items.length === 0) {
      Alert.alert("Cart is empty", "Please add items to cart before checkout.");
      return;
    }

    if (isGift && !giftRecipientName.trim()) {
      Alert.alert(
        "Gift Recipient Missing",
        "Please provide recipient name for the gift pack."
      );
      return;
    }

    setIsPlacingOrder(true);
    const paymentLabel =
      paymentMethod === "UPI"
        ? "UPI Online (Paid)"
        : paymentMethod === "WALLET"
        ? "Inisha Wallet (Debited)"
        : "Cash on Delivery (COD)";

    const order = placeOrder(deliveryAddress, paymentLabel);
    setIsPlacingOrder(false);

    // 1. Instantly navigate to Blinkit-style Live Order Tracking screen
    router.push(`/(customer)/track-order/${order.id}` as any);

    // 1.5 Atomic Marketplace Multi-Vendor Checkout Dispatch
    try {
      apiClient.post("/orders/checkout", {
        shopId: useCartStore.getState().currentShopId || "shop_bihar_sweets_101",
        items: order.items.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          imageUrl: i.product.imageUrl,
          foodType: i.product.foodAttributes?.isVeg !== undefined ? (i.product.foodAttributes.isVeg ? "VEG" : "NON_VEG") : undefined,
        })),
        deliveryAddress: {
          street: deliveryAddress,
          city: user.city || "Bhagalpur",
          pincode: "813213",
          phone: user.phoneNumber,
        },
        paymentMethod: paymentMethod === "COD" ? "COD" : paymentMethod === "WALLET" ? "WALLET" : "ONLINE",
      }).catch((err) => console.warn("Marketplace order sync notice:", err.message));
    } catch {}

    // 2. Dispatch to backend MongoDB Atlas for Admin Order Management
    const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";
    fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: user.id,
        customerName: user.name || `Customer ${user.phoneNumber.slice(-4)}`,
        customerPhone: user.phoneNumber,
        categoryId: "INSHA_STORE",
        subcategoryId: "PRODUCT_ORDER",
        formValues: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          itemCount: order.items.length,
          items: order.items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
          deliveryAddress: deliveryAddress,
          isGift: isGift,
          giftRecipient: giftRecipientName,
          giftMessage: giftMessage,
        },
        selectedAddress: {
          formattedAddress: deliveryAddress,
          latitude: 25.6127,
          longitude: 85.1376,
        },
        pricing: {
          basePrice: order.itemTotal,
          tax: 0,
          commission: 0,
          couponDiscount: order.discountAmount,
          addOnPrice: order.giftWrapFee,
          providerEarnings: order.totalAmount,
          finalAmount: order.totalAmount,
        },
        paymentMethod: paymentMethod === "COD" ? "CASH_AFTER_SERVICE" : paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "SUCCESS",
        scheduledDate: new Date().toISOString().split("T")[0],
        scheduledTime: "15-20 Min Express Delivery",
      }),
    }).catch((err) => console.warn("Backend order sync notice:", err));

    // 3. Dispatch to Firestore so Admin panel's real-time listener sees it immediately
    try {
      setDoc(doc(db, "bookings", order.id), {
        id: order.id,
        bookingId: order.orderNumber,
        customerId: user.id,
        customerName: user.name || `Customer ${user.phoneNumber.slice(-4)}`,
        customerPhone: user.phoneNumber,
        serviceName: "Inisha Store Express Order",
        serviceTitle: `Order #${order.orderNumber} (${order.items.length} items)`,
        amount: order.totalAmount,
        address: deliveryAddress,
        paymentMethod: paymentLabel,
        paymentStatus: paymentMethod === "COD" ? "PENDING_COD" : "PAID",
        status: "PENDING",
        otp: order.otp,
        createdAt: Date.now(),
        items: order.items.map((i) => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
      }).catch((fsErr) => console.warn("Firestore order sync notice:", fsErr));
    } catch {}
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <InishaHeader />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <ShoppingBag size={54} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Explore thousands of 10-min groceries, mobiles, parlour kits & accessories!
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push("/(customer)/(tabs)/explore")}
          >
            <Text style={styles.exploreBtnText}>Explore Products & Services</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <InishaHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cart Title & Clear All */}
        <View style={styles.headerBar}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ShoppingBag size={20} color="#ef4444" />
            <View>
              <Text style={styles.cartHeading}>
                My Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
              </Text>
              {useCartStore.getState().currentShopName && (
                <Text style={{ fontSize: 11, color: "#ea580c", fontWeight: "700" }}>
                  Store: {useCartStore.getState().currentShopName}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* 10-Min Fast Delivery Guarantee Banner */}
        <View style={styles.fastBanner}>
          <Clock size={16} color="#16a34a" />
          <Text style={styles.fastBannerText}>
            ⚡ Delivering in <Text style={{ fontWeight: "900" }}>10-15 mins</Text> to your doorstep
          </Text>
        </View>

        {/* Cart Items List */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Items in Cart</Text>
          {items.map((item, index) => (
            <View
              key={item.product.id}
              style={[
                styles.itemRow,
                index < items.length - 1 && styles.itemRowBorder,
              ]}
            >
              <SafeImage uri={item?.product?.imageUrl} style={styles.itemImg} resizeMode="cover" />

              <View style={styles.itemInfo}>
                <Text style={styles.itemUnit}>{item.product.unit}</Text>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemPrice}>₹{item.product.price}</Text>
                  {item.product.originalPrice > item.product.price && (
                    <Text style={styles.itemMrp}>₹{item.product.originalPrice}</Text>
                  )}
                </View>
              </View>

              {/* Quantity Stepper */}
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                >
                  {item.quantity === 1 ? (
                    <Trash2 size={13} color="#ef4444" />
                  ) : (
                    <Minus size={13} color="#16a34a" strokeWidth={3} />
                  )}
                </TouchableOpacity>
                <Text style={styles.stepperQty}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                >
                  <Plus size={13} color="#16a34a" strokeWidth={3} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* 🎁 Send As A Gift Card Section */}
        <View style={styles.giftCardSection}>
          <View style={styles.giftHeader}>
            <View style={styles.giftTitleRow}>
              <View style={styles.giftIconWrap}>
                <Gift size={20} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.giftTitle}>🎁 Send as a Gift / Gift Pack</Text>
                <Text style={styles.giftSubtitle}>
                  Includes premium gift wrap & customized greeting card (+₹30)
                </Text>
              </View>
            </View>
            <Switch
              value={isGift}
              onValueChange={(val) => setGiftOptions(val)}
              trackColor={{ false: "#cbd5e1", true: "#fca5a5" }}
              thumbColor={isGift ? "#ef4444" : "#f1f5f9"}
            />
          </View>

          {isGift && (
            <View style={styles.giftInputsWrap}>
              <Text style={styles.giftInputLabel}>Recipient Name *</Text>
              <TextInput
                placeholder="e.g. Priya Sharma / Birthday Boy"
                placeholderTextColor="#94a3b8"
                style={styles.giftInput}
                value={giftRecipientName}
                onChangeText={(val) => setGiftOptions(true, val, giftMessage)}
              />

              <Text style={[styles.giftInputLabel, { marginTop: 10 }]}>
                Personalized Greeting Message
              </Text>
              <TextInput
                placeholder="e.g. Wishing you a very Happy Birthday! With love from Rahul."
                placeholderTextColor="#94a3b8"
                style={[styles.giftInput, { height: 60, textAlignVertical: "top" }]}
                multiline
                numberOfLines={2}
                value={giftMessage}
                onChangeText={(val) => setGiftOptions(true, giftRecipientName, val)}
              />

              <View style={styles.giftBadgeRibbon}>
                <Sparkles size={14} color="#b91c1c" />
                <Text style={styles.giftBadgeRibbonText}>
                  Your order will be packed in a glossy gift box with ribbon!
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 🏷️ Coupons & Offers */}
        <View style={styles.cardSection}>
          <View style={styles.couponHeader}>
            <Tag size={18} color="#2563eb" />
            <Text style={styles.sectionHeading}>Apply Coupon</Text>
          </View>

          {appliedCoupon ? (
            <View style={styles.appliedCouponCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.appliedCodeRow}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <Text style={styles.appliedCodeText}>{appliedCoupon.code} Applied</Text>
                </View>
                <Text style={styles.appliedDiscountText}>
                  You saved ₹{discount} with this coupon!
                </Text>
              </View>
              <TouchableOpacity style={styles.removeCouponBtn} onPress={removeCoupon}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.couponInputRow}>
                <TextInput
                  placeholder="Enter Coupon Code"
                  placeholderTextColor="#94a3b8"
                  style={styles.couponTextInput}
                  value={couponInput}
                  onChangeText={setCouponInput}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => handleApplyCoupon()}
                >
                  <Text style={styles.applyBtnText}>APPLY</Text>
                </TouchableOpacity>
              </View>

              {couponError ? (
                <Text style={styles.couponErrorText}>{couponError}</Text>
              ) : null}

              {/* Quick Coupon Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickCouponsScroll}
              >
                {MOCK_COUPONS.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={styles.quickCouponCard}
                    onPress={() => handleApplyCoupon(c.code)}
                  >
                    <View style={styles.quickCouponBadge}>
                      <Text style={styles.quickCouponCode}>{c.code}</Text>
                    </View>
                    <Text style={styles.quickCouponDesc} numberOfLines={2}>
                      {c.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </View>

        {/* 📍 Delivery Address */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            setAddressInput(deliveryAddress);
            setIsAddressModalOpen(true);
          }}
          style={styles.cardSection}
        >
          <View style={styles.addressHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MapPin size={18} color="#ef4444" />
              <Text style={styles.sectionHeading}>Delivery Address</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.changeAddressText}>Change</Text>
              <ChevronRight size={14} color="#ef4444" />
            </View>
          </View>
          <Text style={styles.addressText}>{deliveryAddress}</Text>
        </TouchableOpacity>

        {/* 💳 Payment Method Selection */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Payment Options</Text>
          <View style={styles.paymentOptionsList}>
            <TouchableOpacity
              style={[
                styles.paymentOptionItem,
                paymentMethod === "UPI" && styles.paymentOptionItemActive,
              ]}
              onPress={() => setPaymentMethod("UPI")}
            >
              <View style={styles.paymentOptionLeft}>
                <CreditCard size={18} color={paymentMethod === "UPI" ? "#ef4444" : "#64748b"} />
                <View>
                  <Text style={styles.paymentOptionTitle}>Instant UPI / QR Code</Text>
                  <Text style={styles.paymentOptionSub}>GPay, PhonePe, Paytm, BHIM</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  paymentMethod === "UPI" && styles.radioOuterActive,
                ]}
              >
                {paymentMethod === "UPI" && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentOptionItem,
                paymentMethod === "COD" && styles.paymentOptionItemActive,
              ]}
              onPress={() => setPaymentMethod("COD")}
            >
              <View style={styles.paymentOptionLeft}>
                <Banknote size={18} color={paymentMethod === "COD" ? "#ef4444" : "#64748b"} />
                <View>
                  <Text style={styles.paymentOptionTitle}>Cash on Delivery (COD)</Text>
                  <Text style={styles.paymentOptionSub}>Pay cash or scan QR at doorstep</Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  paymentMethod === "COD" && styles.radioOuterActive,
                ]}
              >
                {paymentMethod === "COD" && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🧾 Bill Details Breakdown */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionHeading}>Bill Breakdown</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={[styles.billValue, deliveryFee === 0 && { color: "#16a34a" }]}>
              {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
            </Text>
          </View>

          {isGift && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>🎁 Gift Packaging & Card</Text>
              <Text style={styles.billValue}>₹{giftWrapFee}</Text>
            </View>
          )}

          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: "#16a34a" }]}>Coupon Discount</Text>
              <Text style={[styles.billValue, { color: "#16a34a" }]}>-₹{discount}</Text>
            </View>
          )}

          <View style={styles.billDivider} />

          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLabel}>Grand Total</Text>
            <Text style={styles.billTotalValue}>₹{finalTotal}</Text>
          </View>

          <View style={styles.safetyGuaranteeRow}>
            <ShieldCheck size={14} color="#16a34a" />
            <Text style={styles.safetyGuaranteeText}>
              100% Genuine Items • Safe Contactless Delivery
            </Text>
          </View>
        </View>

        {/* Extra Bottom Spacing */}
        <View style={{ height: (Platform.OS === "android" ? Math.max(insets.bottom, 48) : Math.max(insets.bottom, 16)) + 90 }} />
      </ScrollView>

      {/* Fixed Bottom Checkout Bar (Sitting safely above Android 3-button navigation) */}
      <View
        style={[
          styles.bottomCheckoutBar,
          {
            paddingBottom:
              Platform.OS === "android"
                ? Math.max(insets.bottom, 48) + 16
                : Math.max(insets.bottom, 16) + 8,
          },
        ]}
      >
        <View>
          <Text style={styles.checkoutTotalLabel}>To Pay</Text>
          <Text style={styles.checkoutTotalAmount}>₹{finalTotal}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, isPlacingOrder && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
          activeOpacity={0.85}
        >
          <Text style={styles.placeOrderBtnText}>
            {isPlacingOrder ? "Processing..." : "Place Order & Pay"}
          </Text>
          <ChevronRight size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* 📍 Interactive Delivery Address Modal */}
      <Modal
        visible={isAddressModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddressModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.addressModalOverlay}
        >
          <View style={styles.addressModalCard}>
            {/* Header */}
            <View style={styles.addressModalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={styles.addressModalIconCircle}>
                  <MapPin size={20} color="#ef4444" />
                </View>
                <View>
                  <Text style={styles.addressModalTitle}>Change Delivery Address</Text>
                  <Text style={styles.addressModalSub}>Enter your exact doorstep location</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsAddressModalOpen(false)}
                style={styles.addressModalCloseBtn}
              >
                <X size={18} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              {/* GPS Live Detect Button */}
              <TouchableOpacity
                onPress={handleDetectGps}
                style={styles.gpsDetectBtn}
                activeOpacity={0.8}
                disabled={detectingGps}
              >
                {detectingGps ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <Crosshair size={18} color="#ef4444" />
                )}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.gpsDetectTitle}>
                    {detectingGps ? "Detecting Live Location..." : "Use Current GPS Location"}
                  </Text>
                  <Text style={styles.gpsDetectSub}>
                    Auto-detect address via device GPS
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Quick Area Suggestions */}
              <Text style={styles.quickAreaHeading}>QUICK AREA SELECT (SULTANGANJ / BHAGALPUR)</Text>
              <View style={styles.quickAreaContainer}>
                {[
                  "Rahmatnagar, Dilgouri, Sultanganj (813213)",
                  "Station Road, Sultanganj, Bhagalpur",
                  "Tilka Manjhi Chowk, Bhagalpur",
                  "Zero Mile, Barari, Bhagalpur",
                  "Adampur, Bhagalpur (812001)",
                  "Aliganj, Bhagalpur",
                ].map((area) => (
                  <TouchableOpacity
                    key={area}
                    style={styles.quickAreaChip}
                    onPress={() => setAddressInput(area)}
                    activeOpacity={0.7}
                  >
                    <MapPin size={12} color="#64748b" style={{ marginRight: 4 }} />
                    <Text style={styles.quickAreaChipText}>{area}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Address Input Box */}
              <Text style={styles.addressInputLabel}>COMPLETE DELIVERY ADDRESS</Text>
              <View style={styles.addressInputBox}>
                <TextInput
                  value={addressInput}
                  onChangeText={setAddressInput}
                  placeholder="House / Flat No., Landmark, Street, Sultanganj / Bhagalpur..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                  style={styles.addressTextInput}
                />
              </View>

              {/* Confirm / Deliver Here Button */}
              <TouchableOpacity
                onPress={handleSaveDeliveryAddress}
                style={styles.saveAddressBtn}
                activeOpacity={0.85}
              >
                <Check size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.saveAddressBtnText}>Deliver to this Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartHeading: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  clearText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ef4444",
  },
  fastBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 8,
  },
  fastBannerText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "600",
  },
  cardSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  itemImg: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
  },
  itemInfo: {
    flex: 1,
  },
  itemUnit: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
  },
  itemName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 18,
  },
  itemPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  itemMrp: {
    fontSize: 11,
    color: "#94a3b8",
    textDecorationLine: "line-through",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#16a34a",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  stepperBtn: {
    padding: 4,
  },
  stepperQty: {
    fontSize: 12,
    fontWeight: "900",
    color: "#16a34a",
    minWidth: 16,
    textAlign: "center",
  },
  giftCardSection: {
    backgroundColor: "#fff1f2",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#fecdd3",
  },
  giftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  giftTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  giftIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  giftTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#9f1239",
  },
  giftSubtitle: {
    fontSize: 11,
    color: "#be123c",
    fontWeight: "500",
    marginTop: 1,
  },
  giftInputsWrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#fecdd3",
  },
  giftInputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#881337",
    marginBottom: 4,
  },
  giftInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fda4af",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: "#0f172a",
  },
  giftBadgeRibbon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe4e6",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  giftBadgeRibbonText: {
    fontSize: 11,
    color: "#9f1239",
    fontWeight: "700",
    flex: 1,
  },
  couponHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  couponInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  couponTextInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  applyBtn: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
  },
  applyBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  couponErrorText: {
    fontSize: 11,
    color: "#ef4444",
    fontWeight: "600",
    marginTop: 4,
  },
  appliedCouponCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 10,
    padding: 12,
  },
  appliedCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  appliedCodeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#166534",
  },
  appliedDiscountText: {
    fontSize: 11,
    color: "#15803d",
    marginTop: 2,
  },
  removeCouponBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  removeCouponText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ef4444",
  },
  quickCouponsScroll: {
    gap: 8,
    paddingVertical: 10,
  },
  quickCouponCard: {
    width: 140,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
  },
  quickCouponBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  quickCouponCode: {
    fontSize: 10,
    fontWeight: "900",
    color: "#1d4ed8",
  },
  quickCouponDesc: {
    fontSize: 10,
    color: "#64748b",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  changeAddressText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ef4444",
  },
  addressText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
  },
  paymentOptionsList: {
    gap: 8,
  },
  paymentOptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  paymentOptionItemActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paymentOptionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  paymentOptionSub: {
    fontSize: 10,
    color: "#64748b",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: "#ef4444",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  billValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  billDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 8,
  },
  billTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  billTotalLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  billTotalValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ef4444",
  },
  safetyGuaranteeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f0fdf4",
    padding: 8,
    borderRadius: 8,
  },
  safetyGuaranteeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#166534",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  bottomCheckoutBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  checkoutTotalLabel: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "700",
  },
  checkoutTotalAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  placeOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  placeOrderBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  /* Delivery Address Modal */
  addressModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  addressModalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    maxHeight: "85%",
  },
  addressModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  addressModalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  addressModalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  addressModalSub: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  addressModalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  gpsDetectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  gpsDetectTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ef4444",
  },
  gpsDetectSub: {
    fontSize: 11,
    color: "#9f1239",
    fontWeight: "500",
    marginTop: 1,
  },
  quickAreaHeading: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  quickAreaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  quickAreaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  quickAreaChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  addressInputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  addressInputBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    padding: 12,
    minHeight: 90,
    marginBottom: 16,
  },
  addressTextInput: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    textAlignVertical: "top",
    minHeight: 65,
    padding: 0,
  },
  saveAddressBtn: {
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 16,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveAddressBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#ffffff",
  },
});
