import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  Sparkles,
  ShoppingBag,
  Clock,
  Star,
  Plus,
  Minus,
  Check,
  Smartphone,
  ChevronRight,
  Filter,
  X,
  Zap,
  ArrowUpDown,
  Tag,
  Gift,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { MOCK_BRANDS } from "../../../src/constants/mockData";
import { MobileBrand } from "../../../src/types";
import { useCartStore } from "../../../src/store/useCartStore";
import InishaHeader from "../../../src/components/common/InishaHeader";
import SafeImage from "../../../src/components/common/SafeImage";
import { catalogKeys, fetchCatalogProducts } from "../../../src/api/catalog";

const { width } = Dimensions.get("window");

const EXPLORE_TABS = [
  { id: "ALL", label: "🌟 All" },
  { id: "GROCERY", label: "🥦 Grocery (10 Min)" },
  { id: "MOBILE_PHONES", label: "📱 Mobiles" },
  { id: "MOBILE_ACCESSORIES", label: "🔌 Accessories" },
  { id: "BEAUTY_PARLOUR", label: "💄 Beauty & Parlour" },
  { id: "HOME_NEEDS", label: "🏠 Home Needs" },
  { id: "ELECTRONICS", label: "🎧 Electronics" },
];

export default function ExploreScreen() {
  const router = useRouter();
  const productsQuery = useQuery({ queryKey: catalogKeys.products, queryFn: fetchCatalogProducts, staleTime: 0 });
  const products = productsQuery.data ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState<MobileBrand | null>(null);
  const [sortBy, setSortBy] = useState<"POPULAR" | "PRICE_LOW" | "PRICE_HIGH" | "RATING">("POPULAR");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedBrandModal, setSelectedBrandModal] = useState<MobileBrand | null>(null);

  const { items, addItem, updateQuantity, getItemQuantity, getItemCount } = useCartStore();
  const totalCartItems = getItemCount();

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "ALL") {
      if (selectedCategory === "GROCERY") {
        result = result.filter(
          (p) =>
            p.category === "GROCERY" ||
            p.category === "FRESH_VEGGIES_FRUITS" ||
            p.category === "SNACKS_BEVERAGES"
        );
      } else {
        result = result.filter((p) => p.category === selectedCategory);
      }
    }

    if (selectedBrand) {
      result = result.filter(
        (p) => p.brand?.toLowerCase() === selectedBrand.name.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }

    if (sortBy === "PRICE_LOW") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "PRICE_HIGH") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "RATING") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, selectedBrand, searchQuery, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Top App Header with Brand Logo */}
      <InishaHeader />

      {/* Search & Filter Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#ef4444" />
          <TextInput
            placeholder="Search 10-Min Groceries, Mobiles, Parlour, Accessories..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, sortBy !== "POPULAR" && styles.filterBtnActive]}
          onPress={() => setIsFilterModalOpen(true)}
        >
          <ArrowUpDown size={18} color={sortBy !== "POPULAR" ? "#ffffff" : "#0f172a"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Selector Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsContainer}
        >
          {EXPLORE_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                onPress={() => {
                  setSelectedCategory(tab.id);
                  setSelectedBrand(null);
                }}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 📱 Mobile Top Brands Horizontal Bar */}
        <View style={styles.brandsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Smartphone size={18} color="#ef4444" />
              <Text style={styles.sectionTitle}>Top Mobile Brands & Repairs</Text>
            </View>
            <Text style={styles.sectionBadge}>Doorstep 60m</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.brandsScroll}
          >
            {MOCK_BRANDS.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={styles.brandCard}
                onPress={() => setSelectedBrandModal(brand)}
                activeOpacity={0.7}
              >
                <View style={styles.brandLogoBox}>
                  <SafeImage uri={brand.logoUrl} style={styles.brandLogoImg} resizeMode="contain" />
                </View>
                <Text style={styles.brandName} numberOfLines={1}>
                  {brand.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 🎁 Send as Gift Promo Banner */}
        <TouchableOpacity
          style={styles.giftPromoCard}
          activeOpacity={0.85}
          onPress={() => router.push("/(customer)/(tabs)/cart")}
        >
          <View style={styles.giftPromoLeft}>
            <View style={styles.giftIconWrap}>
              <Gift size={22} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.giftPromoTitle}>🎁 Send Any Order As A Gift!</Text>
              <Text style={styles.giftPromoSubtitle}>
                Add custom greeting card, message & premium packaging for ₹30
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#dc2626" />
        </TouchableOpacity>

        {/* Results Counter & Active Category */}
        <View style={styles.resultsInfoRow}>
          <Text style={styles.resultsCountText}>
            Showing <Text style={{ fontWeight: "800", color: "#0f172a" }}>{filteredProducts.length}</Text> items
          </Text>
          <View style={styles.fastDeliveryTag}>
            <Zap size={12} color="#16a34a" />
            <Text style={styles.fastDeliveryTagText}>Blinkit 10-Min Delivery</Text>
          </View>
        </View>

        {/* Product Grid */}
        <View style={styles.productGrid}>
          {filteredProducts.map((product) => {
            const qty = getItemQuantity(product.id);
            return (
              <View key={product.id} style={styles.productCard}>
                {/* Product Image & Badges */}
                <View style={styles.productImgContainer}>
                  <SafeImage uri={product.imageUrl} style={styles.productImg} resizeMode="cover" />
                  {product.discountPercentage > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>
                        {product.discountPercentage}% OFF
                      </Text>
                    </View>
                  )}
                  <View style={styles.deliveryTimeBadge}>
                    <Clock size={10} color="#ffffff" />
                    <Text style={styles.deliveryTimeText}>
                      {product.deliveryTimeMins}m
                    </Text>
                  </View>
                </View>

                {/* Product Details */}
                <View style={styles.productDetails}>
                  <Text style={styles.productUnit}>{product.unit}</Text>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>

                  {/* Rating */}
                  <View style={styles.ratingRow}>
                    <Star size={11} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.ratingScore}>{product.rating}</Text>
                    <Text style={styles.ratingCategory}>• {product.categoryName}</Text>
                  </View>

                  {/* Price & Action Button */}
                  <View style={styles.priceActionRow}>
                    <View>
                      <Text style={styles.productPrice}>₹{product.price}</Text>
                      {product.originalPrice > product.price && (
                        <Text style={styles.productMrp}>₹{product.originalPrice}</Text>
                      )}
                    </View>

                    {qty === 0 ? (
                      <TouchableOpacity
                        style={styles.addBtn}
                        onPress={() => addItem(product)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.addBtnText}>ADD</Text>
                        <Plus size={14} color="#16a34a" strokeWidth={3} />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.qtyStepper}>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => updateQuantity(product.id, qty - 1)}
                        >
                          <Minus size={14} color="#ffffff" strokeWidth={3} />
                        </TouchableOpacity>
                        <Text style={styles.stepperQtyText}>{qty}</Text>
                        <TouchableOpacity
                          style={styles.stepperBtn}
                          onPress={() => updateQuantity(product.id, qty + 1)}
                        >
                          <Plus size={14} color="#ffffff" strokeWidth={3} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating View Cart Bar */}
      {totalCartItems > 0 && (
        <View style={styles.floatingCartBar}>
          <View style={styles.floatingCartLeft}>
            <View style={styles.floatingBadge}>
              <Text style={styles.floatingBadgeText}>{totalCartItems}</Text>
            </View>
            <View>
              <Text style={styles.floatingCartTotal}>
                ₹{useCartStore.getState().getSubtotal()}
              </Text>
              <Text style={styles.floatingCartSub}>Extra ₹30 off on gift pack</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.floatingCartBtn}
            onPress={() => router.push("/(customer)/(tabs)/cart")}
            activeOpacity={0.85}
          >
            <Text style={styles.floatingCartBtnText}>View Cart & Gifts</Text>
            <ChevronRight size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Brand Model & Repair Selection Modal */}
      {selectedBrandModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedBrandModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.brandModalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.brandModalTitleRow}>
                  <SafeImage uri={selectedBrandModal.logoUrl} style={styles.modalBrandLogo} resizeMode="contain" />
                  <View>
                    <Text style={styles.modalBrandTitle}>
                      {selectedBrandModal.name} Official Services
                    </Text>
                    <Text style={styles.modalBrandSub}>
                      Doorstep Repair • 15 Days Warranty
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedBrandModal(null)}
                >
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                <Text style={styles.modalSectionTitle}>Popular Models</Text>
                <View style={styles.modelsGrid}>
                  {selectedBrandModal.models.map((model, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.modelPill}
                      onPress={() => {
                        setSelectedBrandModal(null);
                        setSearchQuery(model);
                      }}
                    >
                      <Text style={styles.modelPillText}>{model}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.modalSectionTitle, { marginTop: 18 }]}>
                  Common Repairs & Pricing
                </Text>
                <View style={styles.repairsList}>
                  {selectedBrandModal.repairs.map((repair, idx) => (
                    <View key={idx} style={styles.repairItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.repairName}>{repair.name}</Text>
                        <Text style={styles.repairWarranty}>✓ 100% Genuine Parts</Text>
                      </View>
                      <Text style={styles.repairPrice}>₹{repair.price}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.brandActionBtn}
                onPress={() => {
                  const bName = selectedBrandModal.name;
                  setSelectedBrandModal(null);
                  router.push({
                    pathname: "/(customer)/booking/[id]",
                    params: { id: "cat_mobile", brand: bName },
                  });
                }}
              >
                <Text style={styles.brandActionBtnText}>
                  Book Doorstep {selectedBrandModal.name} Repair
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Sort / Filter Modal */}
      {isFilterModalOpen && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsFilterModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.sortModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalSortTitle}>Sort & Filter</Text>
                <TouchableOpacity onPress={() => setIsFilterModalOpen(false)}>
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.sortOptionsList}>
                {[
                  { id: "POPULAR", label: "🌟 Popularity / Featured" },
                  { id: "PRICE_LOW", label: "💰 Price: Low to High" },
                  { id: "PRICE_HIGH", label: "💎 Price: High to Low" },
                  { id: "RATING", label: "⭐ Customer Rating: High to Low" },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.sortOptionItem,
                      sortBy === opt.id && styles.sortOptionItemActive,
                    ]}
                    onPress={() => {
                      setSortBy(opt.id as any);
                      setIsFilterModalOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortBy === opt.id && styles.sortOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {sortBy === opt.id && <Check size={18} color="#ef4444" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "500",
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: "#ef4444",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  categoryChipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryChipActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  categoryChipTextActive: {
    color: "#ffffff",
  },
  brandsSection: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16a34a",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  brandsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  brandCard: {
    alignItems: "center",
    width: 68,
  },
  brandLogoBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    marginBottom: 4,
  },
  brandLogoImg: {
    width: "100%",
    height: "100%",
  },
  brandName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  giftPromoCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  giftPromoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  giftIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  giftPromoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#991b1b",
  },
  giftPromoSubtitle: {
    fontSize: 11,
    color: "#b91c1c",
    fontWeight: "500",
    marginTop: 1,
  },
  resultsInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  resultsCountText: {
    fontSize: 12,
    color: "#64748b",
  },
  fastDeliveryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  fastDeliveryTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16a34a",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  productCard: {
    width: (width - 34) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  productImgContainer: {
    height: 125,
    width: "100%",
    backgroundColor: "#f8fafc",
    position: "relative",
  },
  productImg: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#2563eb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
  },
  deliveryTimeBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  deliveryTimeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },
  productDetails: {
    padding: 10,
  },
  productUnit: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 2,
  },
  productName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 16,
    height: 32,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginVertical: 4,
  },
  ratingScore: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
  },
  ratingCategory: {
    fontSize: 10,
    color: "#64748b",
  },
  priceActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
  productMrp: {
    fontSize: 10,
    color: "#94a3b8",
    textDecorationLine: "line-through",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#16a34a",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#16a34a",
  },
  qtyStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  stepperBtn: {
    padding: 3,
  },
  stepperQtyText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#ffffff",
    minWidth: 14,
    textAlign: "center",
  },
  floatingCartBar: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
    backgroundColor: "#0f172a",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  floatingCartLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  floatingBadge: {
    backgroundColor: "#ef4444",
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },
  floatingCartTotal: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  floatingCartSub: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "600",
  },
  floatingCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  floatingCartBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  brandModalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  brandModalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modalBrandLogo: {
    width: 44,
    height: 44,
  },
  modalBrandTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  modalBrandSub: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  modelsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modelPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modelPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  repairsList: {
    gap: 8,
  },
  repairItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  repairName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  repairWarranty: {
    fontSize: 10,
    color: "#16a34a",
    fontWeight: "600",
    marginTop: 2,
  },
  repairPrice: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ef4444",
  },
  brandActionBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  brandActionBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  sortModalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalSortTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  sortOptionsList: {
    gap: 10,
    marginVertical: 10,
  },
  sortOptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sortOptionItemActive: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  sortOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  sortOptionTextActive: {
    color: "#ef4444",
  },
});
