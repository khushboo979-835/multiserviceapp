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
} from "lucide-react-native";
import { fetchProductDetails, fetchCatalogProducts, catalogKeys } from "../../../src/api/catalog";
import { Product, ProductVariant } from "../../../src/types";
import { useCartStore } from "../../../src/store/useCartStore";
import io from "socket.io-client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.92;

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
  const [pincode, setPincode] = useState("800001");

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

  // Socket.IO live sync for instant catalog & product updates
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
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
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={22} color="#1E293B" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.categoryName || "Product Details"}
        </Text>

        <View style={styles.headerRightActions}>
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
        {/* Multi-Image Carousel Section */}
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
                activeOpacity={0.9}
                onPress={() => setIsFullscreenVisible(true)}
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

          {/* Floating Discount Ribbon & Rating */}
          {currentPricing.discount > 0 && (
            <View style={styles.discountFloatingBadge}>
              <Sparkles size={12} color="#FFFFFF" />
              <Text style={styles.discountFloatingText}>
                {currentPricing.discount}% OFF
              </Text>
            </View>
          )}

          {/* Dots Pagination Indicator */}
          {galleryImages.length > 1 && (
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
          )}
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
            <Text style={styles.brandLabel}>{product.brand.toUpperCase()}</Text>
          ) : null}

          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.unitSubtitle}>{product.unit || "1 Unit"}</Text>

          {/* Rating & Review Summary Pill */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>{product.rating.toFixed(1)}</Text>
              <Star size={12} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
            </View>
            <Text style={styles.ratingsCountText}>
              {product.ratingsCount || 120} Ratings & 48 Reviews
            </Text>
            <View style={styles.assuredBadge}>
              <ShieldCheck size={14} color="#16A34A" />
              <Text style={styles.assuredText}>Inisha Assured</Text>
            </View>
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
                    {currentPricing.discount}% OFF
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.taxInclusiveText}>Inclusive of all taxes</Text>
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
                Order now to get instant doorstep delivery
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

        {/* Product Description */}
        {product.description ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Product Overview</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
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
              <Text style={[styles.specValue, { color: product.inStock ? "#16A34A" : "#DC2626" }]}>
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

        {/* Bottom spacer for sticky footer */}
        <View style={{ height: 100 }} />
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

      {/* Fullscreen Pinch / Zoom Modal */}
      <Modal
        visible={isFullscreenVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsFullscreenVisible(false)}
      >
        <View style={styles.fullscreenModal}>
          <TouchableOpacity
            onPress={() => setIsFullscreenVisible(false)}
            style={styles.fullscreenCloseBtn}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center" }}
          >
            {galleryImages.map((imgUrl, idx) => (
              <View
                key={idx}
                style={{
                  width: SCREEN_WIDTH,
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: imgUrl }}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
  paginationDots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
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
    marginBottom: 10,
  },
  brandLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 4,
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
  assuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
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
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
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
    justifyContent: "center",
  },
  fullscreenCloseBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 24,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },
});
