import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  Star,
  MapPin,
  Clock,
  Truck,
  Plus,
  Minus,
  ShoppingCart,
  Phone,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react-native";
import { Product, Shop } from "../../../src/types";
import { useCartStore } from "../../../src/store/useCartStore";
import { apiClient } from "../../../src/api/apiClient";
import SafeImage from "../../../src/components/common/SafeImage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ShopStorefrontScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCat, setSelectedSubCat] = useState("ALL");
  const [vegOnlyFilter, setVegOnlyFilter] = useState(false);

  // Single-Store Cart Conflict Modal State
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [existingStoreName, setExistingStoreName] = useState("");

  const cartStore = useCartStore();
  const totalCartCount = cartStore.getItemCount();
  const totalCartPrice = cartStore.getSubtotal();

  const safeBottomPadding =
    Platform.OS === "android"
      ? Math.max(insets.bottom, 48) + 24
      : Math.max(insets.bottom, 20) + 16;

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/shops/${id}`);
      if (res.data?.success) {
        setShop(res.data.shop);
        setProducts(res.data.products || []);
      }
    } catch (err: any) {
      console.warn("Error loading shop:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchShopDetails();
    }
  }, [id]);

  const handleAddItem = (product: Product) => {
    const res = cartStore.addItem(product, shop?.shopId, shop?.name);
    if (res.conflict) {
      setExistingStoreName(res.existingShopName || "Another Store");
      setPendingProduct(product);
      setConflictModalVisible(true);
    }
  };

  const handleConfirmClearCartAndAdd = () => {
    if (pendingProduct) {
      cartStore.forceAddItem(pendingProduct, shop?.shopId, shop?.name);
      setConflictModalVisible(false);
      setPendingProduct(null);
    }
  };

  const subCategories = useMemo(() => {
    if (!shop?.subCategories || shop.subCategories.length === 0) {
      const uniqueCats = Array.from(new Set(products.map((p) => p.categoryName || p.category)));
      return ["ALL", ...uniqueCats];
    }
    return ["ALL", ...shop.subCategories];
  }, [shop, products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubCat =
        selectedSubCat === "ALL" ||
        p.categoryName === selectedSubCat ||
        p.category === selectedSubCat;

      const matchesVeg = !vegOnlyFilter || p.foodAttributes?.isVeg === true;

      return matchesSearch && matchesSubCat && matchesVeg;
    });
  }, [products, searchQuery, selectedSubCat, vegOnlyFilter]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Opening store catalog...</Text>
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundTitle}>Shop Not Found</Text>
        <Text style={styles.notFoundDesc}>The requested local store is not active or unavailable.</Text>
        <TouchableOpacity style={styles.backBtnAction} onPress={() => router.back()}>
          <Text style={styles.backBtnActionText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isRestaurant = shop.category === "RESTAURANT";

  return (
    <View style={styles.container}>
      {/* Cover Image & Header Nav */}
      <View style={styles.headerContainer}>
        <Image
          source={{
            uri:
              shop.coverImageUrl ||
              "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1000&q=80",
          }}
          style={styles.coverImage}
        />
        <View style={[styles.headerOverlay, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.navCircleBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#1e293b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: totalCartCount > 0 ? 110 : safeBottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Shop Info Card */}
        <View style={styles.shopInfoCard}>
          <View style={styles.shopTopRow}>
            <Image
              source={{
                uri:
                  shop.logoUrl ||
                  "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=200&q=80",
              }}
              style={styles.logoImage}
            />
            <View style={styles.shopTitleBox}>
              <Text style={styles.shopName} numberOfLines={2}>
                {shop.name}
              </Text>
              <Text style={styles.shopCategoryBadge}>{shop.category.replace("_", " ")}</Text>
            </View>
          </View>

          <Text style={styles.shopDescription}>{shop.description}</Text>

          {/* Key Badges (Rating, Delivery Time, Distance) */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Star size={15} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.metricBold}>{shop.rating || 4.8}</Text>
              <Text style={styles.metricMuted}>({shop.ratingsCount || 100}+)</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Clock size={15} color="#64748b" />
              <Text style={styles.metricBold}>
                {shop.deliverySettings?.estimatedPrepMins || 20} mins
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Truck size={15} color="#2563eb" />
              <Text style={styles.metricBold}>
                {shop.deliverySettings?.baseDeliveryFee ? `₹${shop.deliverySettings.baseDeliveryFee}` : "Free"}
              </Text>
            </View>
          </View>

          {/* Status and Location Bar */}
          <View style={styles.addressBar}>
            <MapPin size={14} color="#dc2626" />
            <Text style={styles.addressText} numberOfLines={1}>
              {shop.address.street}, {shop.address.city}
            </Text>
            <View
              style={[
                styles.openStatusPill,
                { backgroundColor: shop.openingHours?.isOpen ? "#dcfce7" : "#fee2e2" },
              ]}
            >
              <Text
                style={[
                  styles.openStatusText,
                  { color: shop.openingHours?.isOpen ? "#15803d" : "#b91c1c" },
                ]}
              >
                {shop.openingHours?.isOpen ? "Open Now" : "Closed"}
              </Text>
            </View>
          </View>
        </View>

        {/* In-Store Search & Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search dishes or products in ${shop.name}...`}
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={16} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Veg Only Toggle for Restaurants */}
          {isRestaurant && (
            <TouchableOpacity
              style={[
                styles.vegFilterButton,
                vegOnlyFilter && styles.vegFilterButtonActive,
              ]}
              onPress={() => setVegOnlyFilter(!vegOnlyFilter)}
            >
              <View style={[styles.vegSquare, vegOnlyFilter && styles.vegSquareActive]}>
                <View style={styles.vegDot} />
              </View>
              <Text
                style={[
                  styles.vegFilterText,
                  vegOnlyFilter && styles.vegFilterTextActive,
                ]}
              >
                Pure Veg
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Subcategories Horizontal Filter Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subCatScroll}
        >
          {subCategories.map((cat) => {
            const isSelected = selectedSubCat === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.subCatPill, isSelected && styles.subCatPillActive]}
                onPress={() => setSelectedSubCat(cat)}
              >
                <Text
                  style={[
                    styles.subCatText,
                    isSelected && styles.subCatTextActive,
                  ]}
                >
                  {cat === "ALL" ? "All Items" : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Products / Menu Items List */}
        <View style={styles.productsList}>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyProductsBox}>
              <Text style={styles.emptyProductsText}>No items found in this section.</Text>
            </View>
          ) : (
            filteredProducts.map((prod) => {
              const qty = cartStore.getItemQuantity(prod.id);
              const isVeg = prod.foodAttributes?.isVeg;

              return (
                <View key={prod.id} style={styles.productCard}>
                  <View style={styles.productInfoCol}>
                    {isRestaurant && isVeg !== undefined && (
                      <View
                        style={[
                          styles.vegIndicator,
                          { borderColor: isVeg ? "#16a34a" : "#dc2626" },
                        ]}
                      >
                        <View
                          style={[
                            styles.vegDotSmall,
                            { backgroundColor: isVeg ? "#16a34a" : "#dc2626" },
                          ]}
                        />
                      </View>
                    )}

                    <Text style={styles.productName}>{prod.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceCurrent}>₹{prod.price}</Text>
                      {prod.originalPrice > prod.price && (
                        <Text style={styles.priceOriginal}>₹{prod.originalPrice}</Text>
                      )}
                      {prod.discountPercentage > 0 && (
                        <Text style={styles.discountBadge}>
                          {prod.discountPercentage}% OFF
                        </Text>
                      )}
                    </View>

                    {prod.description ? (
                      <Text style={styles.productDesc} numberOfLines={2}>
                        {prod.description}
                      </Text>
                    ) : null}

                    {prod.unit ? (
                      <Text style={styles.unitText}>Unit: {prod.unit}</Text>
                    ) : null}
                  </View>

                  <View style={styles.productImageCol}>
                    <SafeImage
                      uri={prod.imageUrl}
                      style={styles.productThumb}
                      resizeMode="cover"
                    />

                    {/* Quantity Selector / Add Button */}
                    <View style={styles.addBtnContainer}>
                      {qty > 0 ? (
                        <View style={styles.qtyControlBox}>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => cartStore.updateQuantity(prod.id, qty - 1)}
                          >
                            <Minus size={14} color="#dc2626" />
                          </TouchableOpacity>
                          <Text style={styles.qtyNum}>{qty}</Text>
                          <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => handleAddItem(prod)}
                          >
                            <Plus size={14} color="#dc2626" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addBtn}
                          onPress={() => handleAddItem(prod)}
                        >
                          <Text style={styles.addBtnText}>ADD +</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom View Cart Bar */}
      {totalCartCount > 0 && (
        <View style={[styles.floatingCartBar, { paddingBottom: safeBottomPadding }]}>
          <TouchableOpacity
            style={styles.floatingCartButton}
            onPress={() => router.push("/(customer)/(tabs)/cart")}
            activeOpacity={0.9}
          >
            <View style={styles.floatingCartLeft}>
              <View style={styles.cartCountCircle}>
                <Text style={styles.cartCountText}>{totalCartCount}</Text>
              </View>
              <div>
                <Text style={styles.floatingCartSubtotal}>₹{totalCartPrice}</Text>
                <Text style={styles.floatingCartStoreName}>
                  From {cartStore.currentShopName || shop.name}
                </Text>
              </div>
            </View>

            <View style={styles.floatingCartRight}>
              <Text style={styles.viewCartText}>View Cart</Text>
              <ShoppingCart size={18} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Cart Conflict Modal (Single-Shop Cart Enforcement) */}
      <Modal
        visible={conflictModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConflictModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.conflictCard}>
            <View style={styles.conflictHeader}>
              <AlertCircle size={28} color="#ea580c" />
              <Text style={styles.conflictTitle}>Replace items in cart?</Text>
            </View>

            <Text style={styles.conflictMessage}>
              Your cart already contains items from{" "}
              <Text style={{ fontWeight: "700" }}>{existingStoreName}</Text>. Would you like to
              discard those items and start a fresh cart with{" "}
              <Text style={{ fontWeight: "700" }}>{shop.name}</Text>?
            </Text>

            <View style={styles.conflictActions}>
              <TouchableOpacity
                style={styles.conflictCancelBtn}
                onPress={() => {
                  setConflictModalVisible(false);
                  setPendingProduct(null);
                }}
              >
                <Text style={styles.conflictCancelText}>Keep Previous</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.conflictConfirmBtn}
                onPress={handleConfirmClearCartAndAdd}
              >
                <Text style={styles.conflictConfirmText}>Discard & Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  notFoundDesc: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  backBtnAction: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnActionText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  },
  headerContainer: {
    position: "relative",
    width: "100%",
    height: 180,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  shopInfoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginTop: -40,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  shopTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    resizeMode: "cover",
  },
  shopTitleBox: {
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  shopCategoryBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#dc2626",
    textTransform: "uppercase",
  },
  shopDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginTop: 10,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metricBold: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  metricMuted: {
    fontSize: 11,
    color: "#94a3b8",
  },
  metricDivider: {
    width: 1,
    height: 16,
    backgroundColor: "#cbd5e1",
  },
  addressBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  openStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  openStatusText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a",
  },
  vegFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    gap: 6,
  },
  vegFilterButtonActive: {
    borderColor: "#16a34a",
    backgroundColor: "#f0fdf4",
  },
  vegSquare: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  vegSquareActive: {
    borderColor: "#16a34a",
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16a34a",
  },
  vegFilterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  vegFilterTextActive: {
    color: "#16a34a",
  },
  subCatScroll: {
    paddingVertical: 14,
    gap: 8,
  },
  subCatPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  subCatPillActive: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  subCatText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  subCatTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  productsList: {
    gap: 12,
  },
  emptyProductsBox: {
    padding: 32,
    alignItems: "center",
  },
  emptyProductsText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    gap: 12,
  },
  productInfoCol: {
    flex: 1,
    justifyContent: "center",
  },
  vegIndicator: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  vegDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  priceCurrent: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  priceOriginal: {
    fontSize: 12,
    color: "#94a3b8",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16a34a",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  productDesc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
  },
  unitText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    marginTop: 4,
  },
  productImageCol: {
    alignItems: "center",
    justifyContent: "center",
  },
  productThumb: {
    width: 100,
    height: 95,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
  },
  addBtnContainer: {
    marginTop: -16,
  },
  addBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#dc2626",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#dc2626",
  },
  qtyControlBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#dc2626",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: "hidden",
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyNum: {
    fontSize: 13,
    fontWeight: "800",
    color: "#dc2626",
    paddingHorizontal: 4,
  },
  floatingCartBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  floatingCartButton: {
    backgroundColor: "#dc2626",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#dc2626",
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  floatingCartLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cartCountCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  cartCountText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 13,
  },
  floatingCartSubtotal: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
  },
  floatingCartStoreName: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 10,
    fontWeight: "500",
  },
  floatingCartRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewCartText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  conflictCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxWidth: 380,
    elevation: 8,
  },
  conflictHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  conflictTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  conflictMessage: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
    marginBottom: 20,
  },
  conflictActions: {
    flexDirection: "row",
    gap: 10,
  },
  conflictCancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  conflictCancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  conflictConfirmBtn: {
    flex: 1,
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  conflictConfirmText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
