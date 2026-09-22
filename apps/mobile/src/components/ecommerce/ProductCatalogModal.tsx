import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Search,
  CheckCircle,
  Tag,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";
import { Product, CartItem, Coupon } from "../../types";
import { MOCK_PRODUCTS, MOCK_COUPONS } from "../../constants/mockData";

interface ProductCatalogModalProps {
  visible: boolean;
  onClose: () => void;
  onOrderPlaced: (order: any) => void;
}

const CATEGORIES_FILTER = [
  { key: "ALL", label: "🔥 All" },
  { key: "MOBILE_PHONES", label: "📱 Mobiles" },
  { key: "MOBILE_ACCESSORIES", label: "🔌 Accessories" },
  { key: "GROCERY", label: "🛒 Grocery" },
  { key: "HOME_NEEDS", label: "🏠 Home Needs" },
  { key: "ELECTRONICS", label: "🎧 Electronics" },
];

export default function ProductCatalogModal({
  visible,
  onClose,
  onOrderPlaced,
}: ProductCatalogModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(MOCK_COUPONS[0]);
  const [couponInput, setCouponInput] = useState("");

  const filteredProducts = MOCK_PRODUCTS.filter((prod) => {
    const matchesCat = selectedCategory === "ALL" || prod.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (productId: string) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  const totalCartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const cartItems: CartItem[] = Object.entries(cart).map(([pId, qty]) => ({
    product: MOCK_PRODUCTS.find((p) => p.id === pId)!,
    quantity: qty,
  })).filter(item => Boolean(item.product));

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = appliedCoupon
    ? Math.min(
        appliedCoupon.discountType === "PERCENTAGE"
          ? Math.round((subtotal * appliedCoupon.discountValue) / 100)
          : appliedCoupon.discountValue,
        appliedCoupon.maxDiscount || 200
      )
    : 0;
  const deliveryFee = subtotal > 499 ? 0 : 29;
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyCoupon = () => {
    const found = MOCK_COUPONS.find(
      (c) => c.code.toLowerCase() === couponInput.trim().toLowerCase()
    );
    if (found) {
      setAppliedCoupon(found);
      Alert.alert("Coupon Applied! 🎉", `Saved ₹${discount} with ${found.code}`);
    } else {
      Alert.alert("Invalid Code", "Please check your promo code.");
    }
  };

  const handlePlaceOrder = () => {
    const orderId = `ord_${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      id: orderId,
      items: cartItems,
      totalAmount: finalTotal,
      discount,
      status: "CONFIRMED",
      deliveryTime: "30 Mins",
      createdAt: new Date().toISOString(),
    };

    onOrderPlaced(newOrder);
    setCart({});
    setIsCheckoutOpen(false);
    onClose();
    Alert.alert(
      "Order Confirmed! 🚀",
      `Order #${orderId} placed successfully. Delivery in 30 minutes to your address.`
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.titleRow}>
            <ShoppingBag size={22} color="#ef4444" />
            <Text style={styles.headerTitle}>Inisha Store & Quick Delivery</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search phones, chargers, grocery, oil, atta..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES_FILTER.map((c) => (
            <TouchableOpacity
              key={c.key}
              onPress={() => setSelectedCategory(c.key)}
              style={[styles.catPill, selectedCategory === c.key && styles.catPillActive]}
            >
              <Text style={[styles.catPillText, selectedCategory === c.key && styles.catPillTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <ScrollView style={styles.productsScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => {
              const qty = cart[product.id] || 0;
              return (
                <View key={product.id} style={styles.productCard}>
                  <Image source={{ uri: product.imageUrl }} style={styles.productImg} />
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{product.discountPercentage}% OFF</Text>
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productUnit}>{product.unit}</Text>

                    <View style={styles.deliveryRow}>
                      <Clock size={12} color="#16a34a" />
                      <Text style={styles.deliveryTime}>{product.deliveryTimeMins} mins delivery</Text>
                    </View>

                    <View style={styles.priceRow}>
                      <View>
                        <Text style={styles.priceText}>₹{product.price}</Text>
                        <Text style={styles.originalPriceText}>₹{product.originalPrice}</Text>
                      </View>

                      {qty === 0 ? (
                        <TouchableOpacity
                          onPress={() => addToCart(product.id)}
                          style={styles.addBtn}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.addBtnText}>ADD</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.qtyControl}>
                          <TouchableOpacity onPress={() => removeFromCart(product.id)} style={styles.qtyBtn}>
                            <Minus size={14} color="#ffffff" />
                          </TouchableOpacity>
                          <Text style={styles.qtyText}>{qty}</Text>
                          <TouchableOpacity onPress={() => addToCart(product.id)} style={styles.qtyBtn}>
                            <Plus size={14} color="#ffffff" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Floating Cart Bar */}
        {totalCartCount > 0 && (
          <View style={styles.floatingCartBar}>
            <View>
              <Text style={styles.cartItemsCount}>
                {totalCartCount} {totalCartCount === 1 ? "Item" : "Items"} • ₹{subtotal}
              </Text>
              <Text style={styles.cartDeliveryNote}>Free 30 Mins Doorstep Delivery</Text>
            </View>

            <TouchableOpacity
              onPress={() => setIsCheckoutOpen(true)}
              style={styles.viewCartBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.viewCartText}>View Cart & Pay</Text>
              <ArrowRight size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Checkout Modal */}
        <Modal visible={isCheckoutOpen} animationType="slide" transparent onRequestClose={() => setIsCheckoutOpen(false)}>
          <View style={styles.checkoutOverlay}>
            <View style={styles.checkoutContainer}>
              <View style={styles.checkoutHeader}>
                <Text style={styles.checkoutTitle}>Cart & Instant Checkout</Text>
                <TouchableOpacity onPress={() => setIsCheckoutOpen(false)} style={styles.closeBtn}>
                  <X size={18} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
                {/* Cart Items */}
                {cartItems.map((item) => (
                  <View key={item.product.id} style={styles.checkoutItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.checkoutItemName}>{item.product.name}</Text>
                      <Text style={styles.checkoutItemPrice}>
                        ₹{item.product.price} x {item.quantity} = ₹{item.product.price * item.quantity}
                      </Text>
                    </View>
                    <View style={styles.qtyControlSmall}>
                      <TouchableOpacity onPress={() => removeFromCart(item.product.id)}>
                        <Minus size={12} color="#0f172a" />
                      </TouchableOpacity>
                      <Text style={styles.qtyTextSmall}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => addToCart(item.product.id)}>
                        <Plus size={12} color="#0f172a" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Coupon Box */}
                <View style={styles.couponBox}>
                  <Tag size={16} color="#ef4444" />
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter Coupon (e.g. INISHA50)"
                    placeholderTextColor="#94a3b8"
                    value={couponInput}
                    onChangeText={setCouponInput}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity onPress={handleApplyCoupon} style={styles.applyCouponBtn}>
                    <Text style={styles.applyCouponText}>Apply</Text>
                  </TouchableOpacity>
                </View>

                {/* Bill Summary */}
                <View style={styles.billBox}>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Item Total</Text>
                    <Text style={styles.billVal}>₹{subtotal}</Text>
                  </View>
                  {discount > 0 && (
                    <View style={styles.billRow}>
                      <Text style={[styles.billLabel, { color: "#16a34a" }]}>Promo Discount</Text>
                      <Text style={[styles.billVal, { color: "#16a34a" }]}>-₹{discount}</Text>
                    </View>
                  )}
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Delivery Fee (30 mins)</Text>
                    <Text style={styles.billVal}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</Text>
                  </View>
                  <View style={[styles.billRow, styles.billTotalRow]}>
                    <Text style={styles.billTotalLabel}>Grand Total</Text>
                    <Text style={styles.billTotalVal}>₹{finalTotal}</Text>
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity onPress={handlePlaceOrder} style={styles.placeOrderBtn} activeOpacity={0.85}>
                <Text style={styles.placeOrderText}>Place Order • ₹{finalTotal}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const screenWidth = Dimensions.get("window").width;
const cardWidth = (screenWidth - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 50,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    marginLeft: 8,
  },
  catScroll: {
    maxHeight: 44,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  catPill: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  catPillActive: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  catPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  catPillTextActive: {
    color: "#ffffff",
  },
  productsScroll: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 18,
    gap: 12,
    paddingBottom: 100,
  },
  productCard: {
    width: cardWidth,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    overflow: "hidden",
  },
  productImg: {
    width: "100%",
    height: 120,
    backgroundColor: "#f1f5f9",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    height: 36,
  },
  productUnit: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  deliveryTime: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16a34a",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  originalPriceText: {
    fontSize: 11,
    color: "#94a3b8",
    textDecorationLine: "line-through",
  },
  addBtn: {
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#ef4444",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 10,
  },
  addBtnText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "900",
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    padding: 3,
  },
  qtyText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 12,
    marginHorizontal: 6,
  },
  floatingCartBar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#0f172a",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  cartItemsCount: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  cartDeliveryNote: {
    color: "#22c55e",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 1,
  },
  viewCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  viewCartText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  checkoutOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  checkoutContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  checkoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  checkoutTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0f172a",
  },
  checkoutItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  checkoutItemName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  checkoutItemPrice: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  qtyControlSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  qtyTextSmall: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  couponBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 12,
  },
  couponInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginLeft: 8,
  },
  applyCouponBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  applyCouponText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  billBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  billLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  billVal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  billTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    marginTop: 6,
  },
  billTotalLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  billTotalVal: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ef4444",
  },
  placeOrderBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  placeOrderText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
});
