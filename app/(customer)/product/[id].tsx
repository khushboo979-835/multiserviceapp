import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  Share,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Share2,
  ShoppingCart,
  Star,
  ShieldCheck,
  RotateCcw,
  Truck,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Zap,
  X,
  Store,
  Tag,
  Heart,
  BadgePercent,
  Eye,
  Check,
} from "lucide-react-native";
import { fetchProductDetails, fetchCatalogProducts, catalogKeys } from "../../../src/api/catalog";
import { Product, ProductVariant } from "../../../src/types";
import { useCartStore } from "../../../src/store/useCartStore";
import io from "socket.io-client";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.95;

const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "https://multiserviceapp-4pdw.onrender.com";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { items, addItem, updateQuantity, getItemQuantity } = useCartStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);
  const [fullscreenActiveIndex, setFullscreenActiveIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [pincode, setPincode] = useState("800001");
  const fullscreenScrollRef = useRef<ScrollView>(null);

  // Fetch Product Details with fallback to list if single endpoint takes time
  const { data: product, isLoading, isError, refetch } = useQuery<Product>({
    queryKey: ["catalog", "product", id],
    queryFn: async () => {
      try {
        return await fetchProductDetails(id!);
      } catch {
        const list = await fetchCatalogProducts();
        const found = list.find((p) => p.id === id);
        if (found) return found;
        throw new Error("Product not found");
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

  // Fetch All Catalog Products for Similar / Related Products section
  const { data: catalogProducts = [] } = useQuery<Product[]>({
    queryKey: catalogKeys.products,
    queryFn: () => fetchCatalogProducts(),
    staleTime: 1000 * 60 * 5,
  });

  // Filter similar products from same category or popular items
  const similarProducts = useMemo(() => {
    if (!catalogProducts || (catalogProducts as Product[]).length === 0) return [];
    const currentCat = product?.category || product?.categoryName || "";
    const prods = catalogProducts as Product[];
    const sameCategory = prods.filter(
      (p: Product) => p.id !== id && (p.category === currentCat || p.categoryName === currentCat)
    );
    const otherProducts = prods.filter(
      (p: Product) => p.id !== id && !sameCategory.some((sc: Product) => sc.id === p.id)
    );
    return [...sameCategory, ...otherProducts].slice(0, 8);
  }, [catalogProducts, product, id]);

  // Socket.IO live sync for instant catalog & product updates
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socket.on("product:change", (data: any) => {
      if (!data || data.id === id || !data.id) {
        queryClient.invalidateQueries({ queryKey: ["catalog", "product", id] });
        queryClient.invalidateQueries({ queryKey: catalogKeys.products });
      }
    });

    socket.on("product:updated", (data: any) => {
      if (!data || data.id === id || !data.id) {
        queryClient.invalidateQueries({ queryKey: ["catalog", "product", id] });
        queryClient.invalidateQueries({ queryKey: catalogKeys.products });
      }
    });

    socket.on("catalog_updated", () => {
      queryClient.invalidateQueries({ queryKey: ["catalog", "product", id] });
      queryClient.invalidateQueries({ queryKey: catalogKeys.products });
    });

    return () => {
      socket.disconnect();
    };
  }, [id, queryClient]);

  // Available images array
  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return product.imageUrl ? [product.imageUrl] : [];
  }, [product]);

  // Initialize default variant selection
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const initial: Record<string, string> = {};
      product.variants.forEach((v) => {
        if (v.options && v.options.length > 0) {
          initial[v.name] = v.options[0];
        }
      });
      setSelectedVariants(initial);
    }
  }, [product]);

  // Calculate pricing based on variant selection if available
  const currentPricing = useMemo(() => {
    if (!product) return { price: 0, originalPrice: 0, discount: 0 };
    let price = product.price;
    let originalPrice = product.originalPrice || product.mrp || product.price;

    // Check if selected variant overrides price
    if (product.variants) {
      for (const v of product.variants) {
        const sel = selectedVariants[v.name];
        if (sel && v.price) {
          price = v.price;
          originalPrice = v.mrp || v.price;
        }
      }
    }

    const discount =
      originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : product.discountPercentage || 0;

    return { price, originalPrice, discount };
  }, [product, selectedVariants]);

  const cartQuantity = product ? getItemQuantity(product.id) : 0;
  const totalCartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        title: product.name,
        message: `Check out ${product.name} on Inisha City Service for just ₹${currentPricing.price}! ${product.images?.[0] || product.imageUrl || ""}`,
      });
    } catch {
      // Ignored
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      ...product,
      price: currentPricing.price,
      originalPrice: currentPricing.originalPrice,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (cartQuantity === 0) {
      addItem({
        ...product,
        price: currentPricing.price,
        originalPrice: currentPricing.originalPrice,
      });
    }
    router.push("/(customer)/(tabs)/cart" as any);
  };

  const openFullscreen = (index: number) => {
    setFullscreenActiveIndex(index);
    setIsFullscreenVisible(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The item you are looking for is currently unavailable.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Flipkart-Style Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.categoryName || "Inisha Store"}
        </Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={() => setIsWishlisted(!isWishlisted)}
            style={styles.headerIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Heart
              size={20}
              color={isWishlisted ? "#DC2626" : "#1E293B"}
              fill={isWishlisted ? "#DC2626" : "none"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Share2 size={20} color="#1E293B" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(customer)/(tabs)/cart" as any)}
            style={styles.headerIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ShoppingCart size={20} color="#1E293B" />
            {totalCartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Flipkart-Style Multi-Image Carousel Section with Tap to Zoom */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              if (slide !== activeImageIndex && slide >= 0 && slide < galleryImages.length) {
                setActiveImageIndex(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {galleryImages.map((imgUrl, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.95}
                onPress={() => openFullscreen(idx)}
                style={styles.carouselSlide}
              >
                <Image
                  source={{ uri: imgUrl }}
                  style={styles.carouselImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Floating Discount Ribbon */}
          {currentPricing.discount > 0 && (
            <View style={styles.discountFloatingBadge}>
              <Sparkles size={12} color="#FFFFFF" />
              <Text style={styles.discountFloatingText}>
                {currentPricing.discount}% OFF
              </Text>
            </View>
          )}

          {/* Tap to Zoom floating pill */}
          <TouchableOpacity
            style={styles.zoomHintBadge}
            onPress={() => openFullscreen(activeImageIndex)}
            activeOpacity={0.8}
          >
            <Eye size={12} color="#475569" />
            <Text style={styles.zoomHintText}>Tap to Zoom</Text>
          </TouchableOpacity>

          {/* Dots / Page Counter Indicator */}
          <View style={styles.paginationRow}>
            {galleryImages.length > 1 ? (
              <View style={styles.paginationDots}>
                {galleryImages.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      activeImageIndex === idx && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            ) : null}
            {galleryImages.length > 1 && (
              <View style={styles.pageCountBadge}>
                <Text style={styles.pageCountText}>
                  {activeImageIndex + 1}/{galleryImages.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Thumbnail Preview Strip */}
        {galleryImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailStrip}
          >
            {galleryImages.map((imgUrl, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setActiveImageIndex(idx)}
                style={[
                  styles.thumbnailWrapper,
                  activeImageIndex === idx && styles.activeThumbnailWrapper,
                ]}
              >
                <Image
                  source={{ uri: imgUrl }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Brand, Title & Rating Header */}
        <View style={styles.mainInfoCard}>
          {product.brand ? (
            <View style={styles.brandBadgeRow}>
              <Text style={styles.brandLabel}>{product.brand.toUpperCase()}</Text>
              <View style={styles.assuredBadge}>
                <ShieldCheck size={13} color="#16A34A" />
                <Text style={styles.assuredText}>Inisha Verified</Text>
              </View>
            </View>
          ) : null}

          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.unitSubtitle}>{product.unit || "1 Unit"}</Text>

          {/* Rating & Review Summary Pill */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>{product.rating.toFixed(1)}</Text>
              <Star size={11} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
            </View>
            <Text style={styles.ratingsCountText}>
              {product.ratingsCount || 148} ratings & 52 reviews
            </Text>
            <Text style={styles.hotSellingBadge}>🔥 Fast Selling</Text>
          </View>

          {/* Pricing & Discount Card */}
          <View style={styles.pricingCard}>
            <View style={styles.priceRow}>
              <Text style={styles.sellingPrice}>₹{currentPricing.price}</Text>
              {currentPricing.originalPrice > currentPricing.price && (
                <Text style={styles.originalPrice}>₹{currentPricing.originalPrice}</Text>
              )}
              {currentPricing.discount > 0 && (
                <View style={styles.discountTag}>
                  <Text style={styles.discountTagText}>
                    {currentPricing.discount}% off
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.taxInclusiveText}>Inclusive of all taxes & free doorstep delivery</Text>
          </View>
        </View>

        {/* Flipkart-Style Bank Offers & Coupons Card */}
        <View style={styles.sectionCard}>
          <View style={styles.offersHeaderRow}>
            <BadgePercent size={18} color="#16A34A" />
            <Text style={styles.sectionHeadingNoMargin}>Available Offers & Discounts</Text>
          </View>

          <View style={styles.offerItem}>
            <Tag size={14} color="#16A34A" style={styles.offerTagIcon} />
            <Text style={styles.offerText}>
              <Text style={styles.offerHighlight}>Bank Offer:</Text> 5% Unlimited Cashback on Inisha UPI / Card Payments.
            </Text>
          </View>

          <View style={styles.offerItem}>
            <Tag size={14} color="#16A34A" style={styles.offerTagIcon} />
            <Text style={styles.offerText}>
              <Text style={styles.offerHighlight}>Special Price:</Text> Extra ₹100 Off on orders above ₹999.
            </Text>
          </View>

          <View style={styles.offerItem}>
            <Tag size={14} color="#16A34A" style={styles.offerTagIcon} />
            <Text style={styles.offerText}>
              <Text style={styles.offerHighlight}>No Cost EMI:</Text> Avail EMI options on orders above ₹2,000.
            </Text>
          </View>
        </View>

        {/* Variant & Color Selectors */}
        {product.variants && product.variants.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Select Options / Variants</Text>
            {product.variants.map((variant: ProductVariant, vIdx: number) => (
              <View key={vIdx} style={styles.variantGroup}>
                <Text style={styles.variantLabel}>
                  {variant.name}:{" "}
                  <Text style={styles.variantSelectedValue}>
                    {selectedVariants[variant.name] || variant.options[0]}
                  </Text>
                </Text>

                <View style={styles.variantOptionsRow}>
                  {variant.options.map((opt: string, oIdx: number) => {
                    const isSelected =
                      selectedVariants[variant.name] === opt ||
                      (!selectedVariants[variant.name] && oIdx === 0);
                    return (
                      <TouchableOpacity
                        key={oIdx}
                        onPress={() =>
                          setSelectedVariants((prev) => ({
                            ...prev,
                            [variant.name]: opt,
                          }))
                        }
                        style={[
                          styles.variantPill,
                          isSelected && styles.selectedVariantPill,
                        ]}
                      >
                        {variant.name.toLowerCase().includes("color") && (
                          <View
                            style={[
                              styles.colorSwatchDot,
                              {
                                backgroundColor:
                                  opt.toLowerCase() === "pink"
                                    ? "#F472B6"
                                    : opt.toLowerCase() === "blue"
                                    ? "#38BDF8"
                                    : opt.toLowerCase() === "black"
                                    ? "#1E293B"
                                    : opt.toLowerCase() === "lavender" || opt.toLowerCase() === "purple"
                                    ? "#C084FC"
                                    : opt.toLowerCase() === "green"
                                    ? "#4ADE80"
                                    : opt.toLowerCase() === "white"
                                    ? "#F8FAFC"
                                    : "#E2E8F0",
                              },
                            ]}
                          />
                        )}
                        <Text
                          style={[
                            styles.variantPillText,
                            isSelected && styles.selectedVariantPillText,
                          ]}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Delivery & Pincode Checker Card */}
        <View style={styles.sectionCard}>
          <View style={styles.deliveryHeaderRow}>
            <View style={styles.deliveryBadgeIcon}>
              <Zap size={18} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveryTitle}>
                Express Delivery in {product.deliveryTimeMins || 20} mins
              </Text>
              <Text style={styles.deliverySubtitle}>
                Order now to get instant doorstep delivery in Patna & Bihar
              </Text>
            </View>
          </View>

          <View style={styles.pincodeRow}>
            <MapPin size={16} color="#64748B" />
            <Text style={styles.pincodeText}>Deliver to: Patna - {pincode}</Text>
            <TouchableOpacity
              onPress={() => {
                const nextCode = pincode === "800001" ? "800020" : "800001";
                setPincode(nextCode);
              }}
              style={styles.changePincodeBtn}
            >
              <Text style={styles.changePincodeText}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Trust Value Badges Grid */}
          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <CheckCircle2 size={16} color="#16A34A" />
              <Text style={styles.trustItemText}>100% Genuine</Text>
            </View>
            <View style={styles.trustItem}>
              <RotateCcw size={16} color="#2563EB" />
              <Text style={styles.trustItemText}>7-Day Replacement</Text>
            </View>
            <View style={styles.trustItem}>
              <Truck size={16} color="#EA580C" />
              <Text style={styles.trustItemText}>Cash on Delivery</Text>
            </View>
          </View>
        </View>

        {/* Product Description with Read More / Read Less Toggle */}
        {product.description ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Product Overview</Text>
            <Text
              style={styles.descriptionText}
              numberOfLines={isDescriptionExpanded ? undefined : 4}
            >
              {product.description}
            </Text>
            {product.description.length > 150 && (
              <TouchableOpacity
                onPress={() => setIsDescriptionExpanded((prev) => !prev)}
                style={styles.readMoreBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.readMoreText}>
                  {isDescriptionExpanded ? "Read Less ▲" : "Read More ▼"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Specifications & Highlights Table */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Specifications & Highlights</Text>
          <View style={styles.specTable}>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Category</Text>
              <Text style={styles.specValue}>{product.categoryName || "General"}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Unit / Pack</Text>
              <Text style={styles.specValue}>{product.unit || "1 Unit"}</Text>
            </View>
            {product.brand ? (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Brand</Text>
                <Text style={styles.specValue}>{product.brand}</Text>
              </View>
            ) : null}
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Availability</Text>
              <Text style={[styles.specValue, { color: product.inStock ? "#16A34A" : "#DC2626", fontWeight: "700" }]}>
                {product.inStock ? "In Stock (Fast Dispatch)" : "Out of Stock"}
              </Text>
            </View>

            {/* Custom Dynamic Specifications */}
            {product.specifications?.map((spec, sIdx) => (
              <View key={sIdx} style={styles.specRow}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ratings & Customer Reviews Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Ratings & Reviews</Text>
          <View style={styles.ratingSummaryBox}>
            <View style={styles.ratingBigCol}>
              <Text style={styles.ratingBigNumber}>{product.rating.toFixed(1)}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} color="#F59E0B" fill="#F59E0B" />
                ))}
              </View>
              <Text style={styles.ratingTotalText}>
                {product.ratingsCount || 148} Verified Ratings
              </Text>
            </View>

            <View style={styles.ratingBarsCol}>
              {[
                { star: "5 ★", pct: 75, color: "#16A34A" },
                { star: "4 ★", pct: 18, color: "#22C55E" },
                { star: "3 ★", pct: 4, color: "#F59E0B" },
                { star: "2 ★", pct: 2, color: "#F97316" },
                { star: "1 ★", pct: 1, color: "#EF4444" },
              ].map((bar, bIdx) => (
                <View key={bIdx} style={styles.ratingBarItem}>
                  <Text style={styles.ratingBarStarLabel}>{bar.star}</Text>
                  <View style={styles.ratingBarTrack}>
                    <View
                      style={[
                        styles.ratingBarFill,
                        { width: `${bar.pct}%`, backgroundColor: bar.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.ratingBarPct}>{bar.pct}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Sample Verified Customer Reviews */}
          <View style={styles.reviewsList}>
            <View style={styles.reviewItemCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewMiniBadge}>
                  <Text style={styles.reviewMiniBadgeText}>5 ★</Text>
                </View>
                <Text style={styles.reviewTitleText}>Must Buy! Value for Money</Text>
              </View>
              <Text style={styles.reviewBodyText}>
                Super fast delivery by Inisha City Service. The product was genuine and original packaging. Very satisfied!
              </Text>
              <View style={styles.reviewFooter}>
                <Text style={styles.reviewerName}>Rahul Sharma</Text>
                <View style={styles.verifiedBuyerTag}>
                  <Check size={11} color="#16A34A" />
                  <Text style={styles.verifiedBuyerText}>Certified Buyer, Patna</Text>
                </View>
              </View>
            </View>

            <View style={styles.reviewItemCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewMiniBadge}>
                  <Text style={styles.reviewMiniBadgeText}>5 ★</Text>
                </View>
                <Text style={styles.reviewTitleText}>Terrific purchase & fast delivery</Text>
              </View>
              <Text style={styles.reviewBodyText}>
                Ordered in the morning and arrived at my doorstep within 30 minutes! Perfect condition.
              </Text>
              <View style={styles.reviewFooter}>
                <Text style={styles.reviewerName}>Pooja Kumari</Text>
                <View style={styles.verifiedBuyerTag}>
                  <Check size={11} color="#16A34A" />
                  <Text style={styles.verifiedBuyerText}>Certified Buyer, Danapur</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Seller Info & Assurance Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Seller Details</Text>
          <View style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              <Store size={20} color="#DC2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>
                {product.sellerName || "Inisha Retail & Logistics Partner"}
              </Text>
              <Text style={styles.sellerMeta}>
                4.9 ★ Rating | 99% Positive Customer Feedback
              </Text>
            </View>
          </View>
        </View>

        {/* Similar Products / You May Also Like Section (Flipkart-Style) */}
        {similarProducts.length > 0 && (
          <View style={styles.similarSectionCard}>
            <View style={styles.similarHeaderRow}>
              <View>
                <Text style={styles.similarTitle}>Similar Products</Text>
                <Text style={styles.similarSubtitle}>
                  Customers who viewed this also bought
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(customer)/(tabs)/catalog" as any)}
                style={styles.viewAllBtn}
              >
                <Text style={styles.viewAllBtnText}>View All</Text>
                <ChevronRight size={14} color="#DC2626" />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarScrollContainer}
            >
              {similarProducts.map((item) => {
                const itemImg = item.images?.[0] || item.imageUrl || "";
                const itemMrp = item.originalPrice || item.mrp || item.price;
                const itemDisc =
                  itemMrp > item.price
                    ? Math.round(((itemMrp - item.price) / itemMrp) * 100)
                    : item.discountPercentage || 0;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.similarProductCard}
                    activeOpacity={0.9}
                    onPress={() => {
                      router.push(`/(customer)/product/${item.id}` as any);
                    }}
                  >
                    <View style={styles.similarImageWrapper}>
                      <Image
                        source={{ uri: itemImg }}
                        style={styles.similarProductImage}
                        resizeMode="contain"
                      />
                      {itemDisc > 0 && (
                        <View style={styles.similarDiscBadge}>
                          <Text style={styles.similarDiscText}>{itemDisc}% OFF</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.similarInfo}>
                      <Text style={styles.similarName} numberOfLines={2}>
                        {item.name}
                      </Text>

                      <View style={styles.similarRatingRow}>
                        <View style={styles.similarRatingPill}>
                          <Text style={styles.similarRatingText}>
                            {(item.rating || 4.5).toFixed(1)}
                          </Text>
                          <Star size={9} color="#FFFFFF" fill="#FFFFFF" />
                        </View>
                        <Text style={styles.similarUnit}>{item.unit || "1 Pc"}</Text>
                      </View>

                      <View style={styles.similarPriceRow}>
                        <Text style={styles.similarPrice}>₹{item.price}</Text>
                        {itemMrp > item.price && (
                          <Text style={styles.similarMrp}>₹{itemMrp}</Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={styles.similarAddBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          addItem(item);
                        }}
                      >
                        <Text style={styles.similarAddBtnText}>Add to Cart</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Bottom spacer for sticky footer */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Sticky Bottom Action Footer */}
      <View style={styles.footerBar}>
        {cartQuantity > 0 ? (
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              onPress={() => updateQuantity(product.id, cartQuantity - 1)}
              style={styles.stepperBtn}
            >
              <Minus size={18} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.stepperQtyText}>{cartQuantity}</Text>
            <TouchableOpacity
              onPress={() => updateQuantity(product.id, cartQuantity + 1)}
              style={styles.stepperBtn}
            >
              <Plus size={18} color="#1E293B" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleAddToCart}
            style={styles.addToCartBtn}
            activeOpacity={0.8}
          >
            <ShoppingCart size={18} color="#DC2626" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleBuyNow}
          style={styles.buyNowBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.buyNowText}>
            {cartQuantity > 0 ? "View Cart / Checkout" : "Buy Now"}
          </Text>
          <ChevronRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Fullscreen Interactive Pinch-To-Zoom & Pan Modal (Flipkart Style) */}
      <Modal
        visible={isFullscreenVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsFullscreenVisible(false)}
      >
        <View style={styles.fullscreenModal}>
          {/* Header with counter and close button */}
          <View style={styles.fullscreenHeader}>
            <TouchableOpacity
              onPress={() => setIsFullscreenVisible(false)}
              style={styles.fullscreenCloseBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.fullscreenCounter}>
              {fullscreenActiveIndex + 1} / {galleryImages.length}
            </Text>

            <TouchableOpacity
              onPress={handleShare}
              style={styles.fullscreenShareBtn}
            >
              <Share2 size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Pinch-to-zoom ScrollView Container */}
          <ScrollView
            ref={fullscreenScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              if (slide !== fullscreenActiveIndex && slide >= 0 && slide < galleryImages.length) {
                setFullscreenActiveIndex(slide);
              }
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{ alignItems: "center" }}
          >
            {galleryImages.map((imgUrl, idx) => (
              <ScrollView
                key={idx}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.75 }}
                contentContainerStyle={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                maximumZoomScale={4}
                minimumZoomScale={1}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                centerContent
              >
                <Image
                  source={{ uri: imgUrl }}
                  style={{
                    width: SCREEN_WIDTH * 0.95,
                    height: SCREEN_WIDTH * 0.95,
                  }}
                  resizeMode="contain"
                />
              </ScrollView>
            ))}
          </ScrollView>

          {/* Bottom Zoom Tip & Thumbnail Selector */}
          <View style={styles.fullscreenBottomBar}>
            <Text style={styles.fullscreenZoomTip}>
              🔍 Pinch with 2 fingers to zoom into details
            </Text>

            {galleryImages.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.fullscreenThumbnailStrip}
              >
                {galleryImages.map((imgUrl, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setFullscreenActiveIndex(idx);
                      fullscreenScrollRef.current?.scrollTo({
                        x: idx * SCREEN_WIDTH,
                        animated: true,
                      });
                    }}
                    style={[
                      styles.fullscreenThumbWrapper,
                      fullscreenActiveIndex === idx && styles.fullscreenThumbActive,
                    ]}
                  >
                    <Image
                      source={{ uri: imgUrl }}
                      style={{ width: "100%", height: "100%", borderRadius: 6 }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 52 : 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerIconButton: {
    padding: 6,
    borderRadius: 20,
    position: "relative",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingBottom: 24,
  },
  carouselContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  carouselSlide: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselImage: {
    width: SCREEN_WIDTH * 0.9,
    height: IMAGE_HEIGHT * 0.9,
  },
  discountFloatingBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#16A34A",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  discountFloatingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  zoomHintBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(241, 245, 249, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  zoomHintText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  paginationRow: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
  },
  activeDot: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DC2626",
  },
  pageCountBadge: {
    position: "absolute",
    right: 0,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pageCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  thumbnailStrip: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  thumbnailWrapper: {
    width: 54,
    height: 54,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    padding: 2,
    backgroundColor: "#F8FAFC",
  },
  activeThumbnailWrapper: {
    borderColor: "#DC2626",
    borderWidth: 2,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 6,
  },
  mainInfoCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 8,
  },
  brandBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  brandLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 24,
  },
  unitSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  ratingsCountText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  hotSellingBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EA580C",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: "auto",
  },
  assuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  assuredText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
  },
  pricingCard: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  sellingPrice: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
  },
  originalPrice: {
    fontSize: 16,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  discountTag: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountTagText: {
    color: "#16A34A",
    fontSize: 13,
    fontWeight: "800",
  },
  taxInclusiveText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 3,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  sectionHeadingNoMargin: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  offersHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  offerItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  offerTagIcon: {
    marginTop: 2,
  },
  offerText: {
    fontSize: 12,
    color: "#334155",
    lineHeight: 18,
    flex: 1,
  },
  offerHighlight: {
    fontWeight: "800",
    color: "#0F172A",
  },
  variantGroup: {
    marginBottom: 12,
  },
  variantLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  variantSelectedValue: {
    color: "#DC2626",
  },
  variantOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variantPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  selectedVariantPill: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  colorSwatchDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  variantPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  selectedVariantPillText: {
    color: "#DC2626",
    fontWeight: "800",
  },
  deliveryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deliveryBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  deliverySubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  pincodeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  pincodeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    flex: 1,
  },
  changePincodeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  changePincodeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#DC2626",
  },
  trustGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustItemText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },
  readMoreBtn: {
    marginTop: 6,
    alignSelf: "flex-start",
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#DC2626",
  },
  specTable: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  specRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  specLabel: {
    width: "40%",
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  specValue: {
    width: "60%",
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
  },
  ratingSummaryBox: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 12,
  },
  ratingBigCol: {
    alignItems: "center",
    justifyContent: "center",
    width: "35%",
    borderRightWidth: 1,
    borderRightColor: "#F1F5F9",
    paddingRight: 10,
  },
  ratingBigNumber: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0F172A",
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  ratingTotalText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  ratingBarsCol: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  ratingBarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingBarStarLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    width: 24,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  ratingBarPct: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    width: 26,
    textAlign: "right",
  },
  reviewsList: {
    gap: 10,
  },
  reviewItemCard: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  reviewMiniBadge: {
    backgroundColor: "#16A34A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reviewMiniBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  reviewTitleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  reviewBodyText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
    marginBottom: 8,
  },
  reviewFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reviewerName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
  },
  verifiedBuyerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedBuyerText: {
    fontSize: 11,
    color: "#16A34A",
    fontWeight: "600",
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sellerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  sellerName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  sellerMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  similarSectionCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    marginBottom: 8,
  },
  similarHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  similarTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  similarSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#DC2626",
  },
  similarScrollContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  similarProductCard: {
    width: SCREEN_WIDTH * 0.44,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  similarImageWrapper: {
    width: "100%",
    height: 120,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  similarProductImage: {
    width: "90%",
    height: "90%",
  },
  similarDiscBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#16A34A",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  similarDiscText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  similarInfo: {
    marginTop: 8,
  },
  similarName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    height: 32,
    lineHeight: 16,
  },
  similarRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  similarRatingPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  similarRatingText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  similarUnit: {
    fontSize: 11,
    color: "#64748B",
  },
  similarPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 6,
  },
  similarPrice: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
  similarMrp: {
    fontSize: 11,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  similarAddBtn: {
    marginTop: 8,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  similarAddBtnText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "800",
  },
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#DC2626",
    backgroundColor: "#FFFFFF",
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
  },
  buyNowBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#DC2626",
    shadowColor: "#DC2626",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  buyNowText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  stepperContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 8,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperQtyText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "space-between",
  },
  fullscreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 54 : 24,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  fullscreenCloseBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },
  fullscreenCounter: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  fullscreenShareBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },
  fullscreenBottomBar: {
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    paddingTop: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
  },
  fullscreenZoomTip: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
  },
  fullscreenThumbnailStrip: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
  },
  fullscreenThumbWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
    padding: 2,
  },
  fullscreenThumbActive: {
    borderColor: "#DC2626",
    borderWidth: 2,
  },
});
