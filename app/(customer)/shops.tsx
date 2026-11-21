import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Search,
  X,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  Smartphone,
  Cake,
  Sparkles,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Percent,
  PlusCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from "lucide-react-native";
import { Shop, ShopCategory } from "../../src/types";
import { apiClient } from "../../src/api/apiClient";
import SafeImage from "../../src/components/common/SafeImage";
import ShopRegistrationModal from "../../src/components/shop/ShopRegistrationModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CATEGORY_TABS: { id: string; label: string; icon: any }[] = [
  { id: "ALL", label: "All Stores", icon: Store },
  { id: "RESTAURANT", label: "Food & Dining", icon: UtensilsCrossed },
  { id: "GROCERY", label: "Grocery & Mart", icon: ShoppingBag },
  { id: "MOBILE_ELECTRONICS", label: "Mobile & Tech", icon: Smartphone },
  { id: "SWEETS_BAKERY", label: "Sweets & Bakery", icon: Cake },
  { id: "BEAUTY_WELLNESS", label: "Beauty & Care", icon: Sparkles },
];

export default function ShopsDirectoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; query?: string }>();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    params.category ? String(params.category).toUpperCase() : "ALL"
  );
  const [searchQuery, setSearchQuery] = useState<string>(params.query || "");
  const [filterFastDelivery, setFilterFastDelivery] = useState(false);
  const [filterTopRated, setFilterTopRated] = useState(false);
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Sync category param change
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(String(params.category).toUpperCase());
    }
  }, [params.category]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const url =
        selectedCategory && selectedCategory !== "ALL"
          ? `/shops?category=${selectedCategory}&activeOnly=true`
          : `/shops?activeOnly=true`;

      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.shops)) {
        setShops(res.data.shops);
      }
    } catch (err: any) {
      console.warn("Failed to fetch shops:", err?.message || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchShops();
  };

  // Filter & Search computation
  const filteredShops = useMemo(() => {
    let result = [...shops];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.address?.street?.toLowerCase().includes(q) ||
          s.address?.city?.toLowerCase().includes(q) ||
          s.subCategories?.some((sub) => sub.toLowerCase().includes(q))
      );
    }

    if (filterFastDelivery) {
      result = result.filter(
        (s) => (s.deliverySettings?.estimatedPrepMins || 25) <= 20
      );
    }

    if (filterTopRated) {
      result = result.filter((s) => (s.rating || 4.5) >= 4.7);
    }

    if (filterOpenOnly) {
      result = result.filter((s) => s.openingHours?.isOpen !== false);
    }

    return result;
  }, [shops, searchQuery, filterFastDelivery, filterTopRated, filterOpenOnly]);

  const safeBottomPadding =
    Platform.OS === "android"
      ? Math.max(insets.bottom, 24) + 16
      : Math.max(insets.bottom, 16) + 12;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Local Shops & Dining</Text>
          <View style={styles.locationPill}>
            <MapPin size={11} color="#dc2626" />
            <Text style={styles.locationText} numberOfLines={1}>
              Patna, Bihar • Express Delivery
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setIsRegisterModalOpen(true)}
          style={styles.headerAddBtn}
          activeOpacity={0.8}
        >
          <PlusCircle size={15} color="#dc2626" />
          <Text style={styles.headerAddBtnText}>Add Shop</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Search Box */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, marts, electronics, sweets..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. Category Horizontal Pills */}
      <View style={styles.categoryScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setSelectedCategory(tab.id)}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
                activeOpacity={0.8}
              >
                <Icon
                  size={15}
                  color={isSelected ? "#ffffff" : "#475569"}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Filter Chips */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
          <TouchableOpacity
            onPress={() => setFilterFastDelivery(!filterFastDelivery)}
            style={[styles.filterChip, filterFastDelivery && styles.filterChipActive]}
            activeOpacity={0.7}
          >
            <Clock size={12} color={filterFastDelivery ? "#dc2626" : "#64748b"} />
            <Text style={[styles.filterChipText, filterFastDelivery && styles.filterChipTextActive]}>
              ⚡ Under 20 Mins
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterTopRated(!filterTopRated)}
            style={[styles.filterChip, filterTopRated && styles.filterChipActive]}
            activeOpacity={0.7}
          >
            <Star size={12} color={filterTopRated ? "#eab308" : "#64748b"} fill={filterTopRated ? "#eab308" : "transparent"} />
            <Text style={[styles.filterChipText, filterTopRated && styles.filterChipTextActive]}>
              ⭐ Rating 4.7+
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterOpenOnly(!filterOpenOnly)}
            style={[styles.filterChip, filterOpenOnly && styles.filterChipActive]}
            activeOpacity={0.7}
          >
            <View style={[styles.greenDot, !filterOpenOnly && { backgroundColor: "#94a3b8" }]} />
            <Text style={[styles.filterChipText, filterOpenOnly && styles.filterChipTextActive]}>
              Open Now
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 5. Main Content: Shop Listings */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={[styles.mainScrollContent, { paddingBottom: safeBottomPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#dc2626"]} />}
      >
        {/* Partner Onboarding Notice Banner */}
        <TouchableOpacity
          onPress={() => setIsRegisterModalOpen(true)}
          style={styles.partnerBanner}
          activeOpacity={0.9}
        >
          <View style={styles.partnerBannerLeft}>
            <View style={styles.partnerBadge}>
              <Sparkles size={11} color="#b91c1c" />
              <Text style={styles.partnerBadgeText}>PARTNER WITH INISHA</Text>
            </View>
            <Text style={styles.partnerBannerTitle}>Own a Store or Restaurant?</Text>
            <Text style={styles.partnerBannerSub}>
              Register your business, upload KYC & get live orders in 24 hours.
            </Text>
          </View>
          <View style={styles.partnerBannerCta}>
            <Text style={styles.partnerBannerCtaText}>Apply Now</Text>
            <ChevronRight size={14} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {/* Total Results Count */}
        <View style={styles.resultsCountRow}>
          <Text style={styles.resultsCountText}>
            {loading ? "Searching verified stores..." : `${filteredShops.length} Stores Available near you`}
          </Text>
          <Text style={styles.resultsLivePill}>⚡ Live Delivery</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={styles.loadingText}>Fetching neighborhood stores & menus...</Text>
          </View>
        ) : filteredShops.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Store size={52} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No stores found</Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? `No shops matching "${searchQuery}". Try a different keyword.`
                : "No stores currently registered in this category."}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
                setFilterFastDelivery(false);
                setFilterTopRated(false);
                setFilterOpenOnly(false);
              }}
              style={styles.emptyResetBtn}
            >
              <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredShops.map((shop) => (
            <ZomatoShopCard
              key={shop.shopId || shop._id}
              shop={shop}
              onPress={() => router.push(`/(customer)/shop/${shop.shopId}` as any)}
            />
          ))
        )}
      </ScrollView>

      {/* KYC / Shop Registration Modal */}
      <ShopRegistrationModal
        visible={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onShopCreated={() => {
          fetchShops();
        }}
      />
    </View>
  );
}

/**
 * Zomato/Swiggy-Style High Impact Shop Card
 */
function ZomatoShopCard({ shop, onPress }: { shop: Shop; onPress: () => void }) {
  const isOpen = shop.openingHours?.isOpen !== false;
  const rating = shop.rating || 4.8;
  const prepTime = shop.deliverySettings?.estimatedPrepMins || 25;
  const minOrder = shop.deliverySettings?.minOrderAmount || 99;
  const freeThreshold = shop.deliverySettings?.freeDeliveryThreshold || 399;

  const bannerImage =
    shop.shopBanner ||
    shop.coverImageUrl ||
    (shop.category === "RESTAURANT"
      ? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80"
      : shop.category === "GROCERY"
      ? "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1000&q=80"
      : "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1000&q=80");

  const logoImage =
    shop.shopLogo ||
    shop.logoUrl ||
    (shop.category === "RESTAURANT"
      ? "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80"
      : "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80");

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.cardContainer}
      activeOpacity={0.92}
    >
      {/* 1. Large Banner Header */}
      <View style={styles.cardBannerWrapper}>
        <SafeImage
          uri={bannerImage}
          style={styles.cardBannerImage}
          resizeMode="cover"
        />

        {/* Dark gradient / tint overlay */}
        <View style={styles.bannerOverlay} />

        {/* Top Badges */}
        <View style={styles.bannerTopRow}>
          {/* Offer Pill */}
          <View style={styles.offerBadge}>
            <Percent size={11} color="#ffffff" />
            <Text style={styles.offerBadgeText}>
              {freeThreshold <= 400 ? `FREE DELIVERY above ₹${freeThreshold}` : "₹50 OFF on first order"}
            </Text>
          </View>

          {/* Delivery Time Pill */}
          <View style={styles.deliveryTimeBadge}>
            <Clock size={11} color="#ffffff" />
            <Text style={styles.deliveryTimeText}>{prepTime}-{prepTime + 10} mins</Text>
          </View>
        </View>

        {/* Floating Shop Logo */}
        <View style={styles.shopLogoWrapper}>
          <SafeImage
            uri={logoImage}
            style={styles.shopLogoImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* 2. Card Body */}
      <View style={styles.cardBody}>
        {/* Name and Rating Row */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardNameCol}>
            <View style={styles.nameVerifiedRow}>
              <Text style={styles.shopName} numberOfLines={1}>
                {shop.name}
              </Text>
              <ShieldCheck size={16} color="#16a34a" />
            </View>
            <Text style={styles.shopCuisine} numberOfLines={1}>
              {shop.subCategories && shop.subCategories.length > 0
                ? shop.subCategories.join(" • ")
                : shop.category.replace("_", " ")}
            </Text>
          </View>

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingScore}>{rating.toFixed(1)}</Text>
            <Star size={11} color="#ffffff" fill="#ffffff" />
          </View>
        </View>

        {/* Address & Locality Row */}
        <View style={styles.addressRow}>
          <MapPin size={12} color="#64748b" />
          <Text style={styles.addressText} numberOfLines={1}>
            {shop.address?.street
              ? `${shop.address.street}, ${shop.address.city || "Patna"}`
              : "Boring Road, Kidwaipuri, Patna"}
          </Text>
          <Text style={styles.distanceDot}>•</Text>
          <Text style={styles.distanceText}>1.8 km</Text>
        </View>

        {/* Bottom Specs & Status Row */}
        <View style={styles.cardFooterRow}>
          <View style={styles.footerLeft}>
            {isOpen ? (
              <View style={styles.statusOpenPill}>
                <View style={styles.pulsingGreenDot} />
                <Text style={styles.statusOpenText}>OPEN NOW</Text>
              </View>
            ) : (
              <View style={styles.statusClosedPill}>
                <Text style={styles.statusClosedText}>CLOSED</Text>
              </View>
            )}
            <Text style={styles.minOrderText}>Min Order: ₹{minOrder}</Text>
          </View>

          <View style={styles.viewMenuBtn}>
            <Text style={styles.viewMenuBtnText}>Order Now</Text>
            <ChevronRight size={13} color="#dc2626" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  headerAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fee2e2",
  },
  headerAddBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a",
    paddingVertical: 0,
  },
  categoryScrollContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 6,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryPillActive: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  categoryPillTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  filterRow: {
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterChipActive: {
    backgroundColor: "#fef2f2",
    borderColor: "#fca5a5",
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  filterChipTextActive: {
    color: "#dc2626",
    fontWeight: "700",
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16a34a",
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 16,
  },
  partnerBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  partnerBannerLeft: {
    flex: 1,
    marginRight: 12,
  },
  partnerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  partnerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#b91c1c",
    letterSpacing: 0.5,
  },
  partnerBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  partnerBannerSub: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 15,
  },
  partnerBannerCta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 2,
  },
  partnerBannerCtaText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  resultsCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  resultsCountText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  resultsLivePill: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16a34a",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyResetBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emptyResetBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Zomato Card Styles
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardBannerWrapper: {
    width: "100%",
    height: 150,
    position: "relative",
  },
  cardBannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.22)",
  },
  bannerTopRow: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  offerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(220, 38, 38, 0.92)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  deliveryTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deliveryTimeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  shopLogoWrapper: {
    position: "absolute",
    bottom: -18,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#ffffff",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  shopLogoImage: {
    width: "100%",
    height: "100%",
  },
  cardBody: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardNameCol: {
    flex: 1,
    marginRight: 10,
  },
  nameVerifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  shopCuisine: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#15803d",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 11,
    color: "#64748b",
    flexShrink: 1,
  },
  distanceDot: {
    fontSize: 11,
    color: "#94a3b8",
  },
  distanceText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
  },
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusOpenPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pulsingGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16a34a",
  },
  statusOpenText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16a34a",
  },
  statusClosedPill: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusClosedText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#dc2626",
  },
  minOrderText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  viewMenuBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#fef2f2",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewMenuBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
  },
});
