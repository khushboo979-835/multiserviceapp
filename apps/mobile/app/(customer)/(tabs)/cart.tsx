import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useCartStore } from "../../../src/store/useCartStore";
import { MOCK_COUPONS } from "../../../src/constants/mockData";
import { Coupon } from "../../../src/types";
import InishaHeader from "../../../src/components/common/InishaHeader";
import SafeImage from "../../../src/components/common/SafeImage";

const { width } = Dimensions.get("window");

export default function CartScreen() {
  const router = useRouter();
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
    "Flat 402, Shivam Residency, Boring Road, Patna - 800001"
  );
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD" | "WALLET">("UPI");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

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
    setTimeout(() => {
      const paymentLabel =
        paymentMethod === "UPI"
          ? "UPI Online (Paid)"
          : paymentMethod === "WALLET"
          ? "Inisha Wallet (Debited)"
          : "Cash on Delivery (COD)";

      const order = placeOrder(deliveryAddress, paymentLabel);
      setIsPlacingOrder(false);

      Alert.alert(
        "🎉 Order Placed Successfully!",
        `Order ${order.orderNumber} is confirmed.\nDelivery in 10-15 minutes! Delivery OTP: ${order.otp}`,
        [
          {
            text: "Track Live Order",
            onPress: () => router.push("/(customer)/(tabs)/orders"),
          },
        ]
      );
    }, 1200);
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
            <Text style={styles.cartHeading}>
              My Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </Text>
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
        <View style={styles.cardSection}>
          <View style={styles.addressHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MapPin size={18} color="#ef4444" />
              <Text style={styles.sectionHeading}>Delivery Address</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.changeAddressText}>Change</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.addressText}>{deliveryAddress}</Text>
        </View>

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
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Fixed Bottom Checkout Bar */}
      <View style={styles.bottomCheckoutBar}>
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
});
