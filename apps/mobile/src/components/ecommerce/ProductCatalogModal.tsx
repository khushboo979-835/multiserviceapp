import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  Eye,
  ChevronRight,
} from "lucide-react-native";
import { Product, CartItem, Coupon } from "../../types";
import { MOCK_COUPONS, MOCK_PRODUCTS } from "../../constants/mockData";
import SafeImage from "../common/SafeImage";
import { catalogKeys, fetchCatalogProducts } from "../../api/catalog";
import { useCartStore } from "../../store/useCartStore";

interface ProductCatalogModalProps {
  visible: boolean;
  onClose: () => void;
  onOrderPlaced: (order: any) => void;
}

const CATEGORIES_FILTER = [
  { key: "ALL", label: "🔥 All" },
  { key: "FOOTWEAR", label: "🩴 Footwear" },
  { key: "MENS_FASHION", label: "👕 Men's Wear" },
  { key: "WOMENS_FASHION", label: "👗 Sarees & Ethnic" },
  { key: "BEAUTY_PARLOUR", label: "💄 Beauty & Care" },
  { key: "MOBILE_ACCESSORIES", label: "🔌 Accessories" },
  { key: "MOBILE_PHONES", label: "📱 Mobiles" },
  { key: "ELECTRONICS", label: "🎧 Electronics" },
  { key: "GROCERY", label: "🛒 Grocery" },
  { key: "HOME_NEEDS", label: "🏠 Home Needs" },
];

export default function ProductCatalogModal({
  visible,
  onClose,
  onOrderPlaced,
}: ProductCatalogModalProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem, updateQuantity: updateStoreQty, getItemQuantity } = useCartStore();

  const productsQuery = useQuery<Product[]>({
    queryKey: catalogKeys.products,
    queryFn: () => fetchCatalogProducts(),
    staleTime: 0,
  });
  const products: Product[] = (productsQuery.data && productsQuery.data.length > 0) ? productsQuery.data : MOCK_PRODUCTS;
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(MOCK_COUPONS[0]);
  const [couponInput, setCouponInput] = useState("");

  const filteredProducts = products.filter((prod) => {
    const catUpper = selectedCategory.toUpperCase();
    const prodCat = (prod.category || "").toUpperCase();
    const prodCatName = (prod.categoryName || "").toUpperCase();
    const matchesCat =
      selectedCategory === "ALL" ||
      prodCat === catUpper ||
      prodCatName.includes(catUpper) ||
      (catUpper === "FOOTWEAR" && (prodCatName.includes("FOOT") || prodCatName.includes("SLIPPER") || prodCatName.includes("SANDAL") || prod.name.toLowerCase().includes("slipper") || prod.name.toLowerCase().includes("sandal"))) ||
      (catUpper === "MENS_FASHION" && (prodCatName.includes("MEN") || prod.name.toLowerCase().includes("men") || prod.name.toLowerCase().includes("shirt") || prod.name.toLowerCase().includes("socks"))) ||
      (catUpper === "WOMENS_FASHION" && (prodCatName.includes("WOMEN") || prodCatName.includes("SAREE") || prod.name.toLowerCase().includes("saree") || prod.name.toLowerCase().includes("women")));
    const matchesSearch =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.brand && prod.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleOpenProduct = (productId: string) => {
    onClose();
    setTimeout(() => {
      try {
        router.push(`/product/${productId}` as any);
      } catch {
        try {
          router.push(`/(customer)/product/${productId}` as any);
        } catch {
          router.push({
            pathname: "/product/[id]",
            params: { id: productId },
          } as any);
        }
      }
    }, 80);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
    addItem(product);
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
    const currentQty = getItemQuantity(productId);
    updateStoreQty(productId, Math.max(0, currentQty - 1));
  };

  const totalCartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const cartItems: CartItem[] = Object.entries(cart).map(([pId, qty]) => ({
    product: products.find((product) => product.id === pId)!,
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

    // Instant Blinkit-style Live Order Tracking navigation
    setTimeout(() => {
      try {
        router.push(`/(customer)/track-order/${orderId}` as any);
      } catch {
        router.push(`/track-order/${orderId}` as any);
      }
    }, 150);

    // Non-blocking persistence to backend
    const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";
    fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: `ORD-${orderId.slice(-6).toUpperCase()}`,
        serviceName: `Quick Delivery (${cartItems.length} Items)`,
        serviceTitle: `Quick Delivery (${cartItems.length} Items)`,
        amount: finalTotal,
        customerName: "Customer",
        customerPhone: "+91 95078 60048",
        status: "CONFIRMED",
        createdAt: Date.now(),
      }),
    }).catch(() => {});
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
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
          <View
            style={[
              styles.productsGrid,
              {
                paddingBottom:
                  Platform.OS === "android"
                    ? Math.max(insets.bottom, 48) + 120
                    : Math.max(insets.bottom, 20) + 100,
              },
            ]}
          >
            {filteredProducts.map((product) => {
              const qty = cart[product.id] || 0;
              const originalMrp = product.originalPrice || product.mrp || product.price;
              const discountDiff = originalMrp - product.price;
              const discountLabel = product.badgeText || (discountDiff > 0 ? `₹${discountDiff} OFF` : (product.discountPercentage ? `${product.discountPercentage}% OFF` : ""));

              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  activeOpacity={0.92}
                  onPress={() => handleOpenProduct(product.id)}
                >
                  {/* Product Image Box */}
                  <View style={styles.imageTouchable}>
                    <SafeImage uri={product.imageUrl} style={styles.productImg} />
                    
                    {/* Green Discount Badge (Matching Image 1) */}
                    {discountLabel ? (
                      <View style={styles.greenDiscountBadge}>
                        <Text style={styles.greenDiscountBadgeText}>{discountLabel}</Text>
                      </View>
                    ) : null}

                    {/* View Details floating pill */}
                    <View style={styles.viewDetailsBadge}>
                      <Eye size={10} color="#ffffff" />
                      <Text style={styles.viewDetailsBadgeText}>View</Text>
                    </View>
                  </View>

                  <View style={styles.productInfo}>
                    {/* The Iconic Split Price Bar (Matching Client Reference Image 1) */}
                    <View style={styles.splitPriceBar}>
                      <View style={styles.splitPriceLeft}>
                        <Text style={styles.splitPriceLeftText}>₹{product.price}</Text>
                      </View>
                      <View style={styles.splitPriceRight}>
                        <Text style={styles.splitPriceRightText} numberOfLines={1}>
                          MRP ₹{originalMrp}
                        </Text>
                      </View>
                    </View>

                    {/* Unit / Pack Size */}
                    <Text style={styles.productUnit}>{product.unit || "1 Pcs"}</Text>

                    {/* Product Title */}
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>

                    {/* Delivery & Seller Tag */}
                    <View style={styles.deliveryRow}>
                      <Clock size={11} color="#16a34a" />
                      <Text style={styles.deliveryTime}>{product.deliveryTimeMins || 20} mins delivery</Text>
                    </View>

                    {/* Action Row: 'See more like this' + Outlined ADD / Stepper */}
                    <View style={styles.cardActionRow}>
                      <View style={styles.seeMoreBtn}>
                        <Text style={styles.seeMoreBtnText}>See more like this</Text>
                        <ChevronRight size={11} color="#dc2626" />
                      </View>

                      {qty === 0 ? (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation?.();
                            addToCart(product);
                          }}
                          style={styles.refAddBtn}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.refAddBtnText}>ADD</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.refQtyControl}>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation?.();
                              removeFromCart(product.id);
                            }}
                            style={styles.refQtyBtn}
                          >
                            <Minus size={12} color="#ffffff" strokeWidth={3} />
                          </TouchableOpacity>
                          <Text style={styles.refQtyText}>{qty}</Text>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation?.();
                              addToCart(product);
                            }}
                            style={styles.refQtyBtn}
                          >
                            <Plus size={12} color="#ffffff" strokeWidth={3} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Floating Cart Bar (Sitting cleanly above Android navigation) */}
        {totalCartCount > 0 && (
          <View
            style={[
              styles.floatingCartBar,
              {
                bottom:
                  Platform.OS === "android"
                    ? Math.max(insets.bottom, 48) + 28
                    : Math.max(insets.bottom, 16) + 14,
              },
            ]}
          >
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

        {/* Checkout Modal (With Safe Area padding for Android 3-button navigation) */}
        <Modal visible={isCheckoutOpen} animationType="slide" transparent onRequestClose={() => setIsCheckoutOpen(false)}>
          <View style={styles.checkoutOverlay}>
            <View
              style={[
                styles.checkoutContainer,
                {
                  paddingBottom:
                    Platform.OS === "android"
                      ? Math.max(insets.bottom, 48) + 40
                      : Math.max(insets.bottom, 20) + 24,
                },
              ]}
            >
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
                      <TouchableOpacity onPress={() => addToCart(item.product)}>
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
  },
  productCard: {
    width: cardWidth,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    overflow: "hidden",
  },
  imageTouchable: {
    position: "relative",
    width: "100%",
  },
  productImg: {
    width: "100%",
    height: 120,
    backgroundColor: "#f1f5f9",
  },
  greenDiscountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#16a34a",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  greenDiscountBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  splitPriceBar: {
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1.5,
    borderColor: "#dc2626",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 4,
    backgroundColor: "#ffffff",
  },
  splitPriceLeft: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 7,
    paddingVertical: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  splitPriceLeftText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  splitPriceRight: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  splitPriceRightText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    textDecorationLine: "line-through",
  },
  cardActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  seeMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 4,
  },
  seeMoreBtnText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#dc2626",
  },
  refAddBtn: {
    borderWidth: 1.5,
    borderColor: "#dc2626",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  refAddBtnText: {
    color: "#dc2626",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  refQtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  refQtyBtn: {
    padding: 3,
  },
  refQtyText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 11,
    marginHorizontal: 5,
  },
  viewDetailsBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewDetailsBadgeText: {
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
  viewProductRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  viewProductRowText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
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
    marginBottom: Platform.OS === "android" ? 18 : 8,
  },
  placeOrderText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
});
