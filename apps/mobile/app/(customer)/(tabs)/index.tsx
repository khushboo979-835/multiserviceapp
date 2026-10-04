import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import io from "socket.io-client";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { useBookingStore } from "../../../src/store/useBookingStore";
import { MOCK_COUPONS } from "../../../src/constants/mockData";
import { Category, Subcategory, Booking, BookingStatus } from "../../../src/types";
import DynamicFormBuilder from "../../../src/components/booking/DynamicFormBuilder";
import BrandLogo from "../../../src/components/common/BrandLogo";
import SafeImage from "../../../src/components/common/SafeImage";
import { catalogKeys, fetchCatalogBanners, fetchCatalogCategories, fetchCatalogProducts } from "../../../src/api/catalog";
import InishaHeader from "../../../src/components/common/InishaHeader";
import { LocationService, UserAddressDetails } from "../../../src/services/location.service";
import LocationPickerModal from "../../../src/components/location/LocationPickerModal";
import { sendNewJobDispatchNotification } from "../../../src/utils/notifications";
import { db } from "../../../src/config/firebase";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import AIChatSupportModal from "../../../src/components/common/AIChatSupportModal";
import VoiceBookingModal from "../../../src/components/common/VoiceBookingModal";
import ProductCatalogModal from "../../../src/components/ecommerce/ProductCatalogModal";
import BrandRepairModal from "../../../src/components/booking/BrandRepairModal";
import GSTInvoiceModal from "../../../src/components/booking/GSTInvoiceModal";
import RatingReviewModal from "../../../src/components/booking/RatingReviewModal";
import AllServicesModal from "../../../src/components/booking/AllServicesModal";
import LanguageCitySelectorModal from "../../../src/components/common/LanguageCitySelectorModal";
import CallSimulationModal from "../../../src/components/common/CallSimulationModal";
import InAppAdminPortalModal from "../../../src/components/admin/InAppAdminPortalModal";
import {
  Smartphone,
  Scissors,
  Wrench,
  Search,
  MapPin,
  ChevronRight,
  Sparkles,
  X,
  Compass,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  Zap,
  Wind,
  Droplets,
  Hammer,
  Paintbrush,
  Camera,
  Droplet,
  Disc,
  Snowflake,
  Bug,
  Mic,
  Bot,
  ShoppingBag,
  FileText,
  Phone,
  Video,
  Globe,
  Tag,
  ShieldAlert,
  MessageCircle,
  Bell,
  User,
  Plus,
  ShoppingCart,
  Lock,
  Truck,
} from "lucide-react-native";

const SUGGESTIONS = [
  "Electrician",
  "Parlour",
  "Mobile",
  "Grocery",
  "AC Repair",
  "Cleaning",
];

export default function CustomerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    activeBooking,
    initDraftBooking,
    draftBooking,
    setActiveBooking,
    addBookingToHistory,
  } = useBookingStore();

  const queryClient = useQueryClient();
  const categoriesQuery = useQuery({ queryKey: catalogKeys.categories, queryFn: fetchCatalogCategories, staleTime: 0 });
  const bannersQuery = useQuery({ queryKey: catalogKeys.banners, queryFn: fetchCatalogBanners, staleTime: 0 });
  const productsQuery = useQuery({ queryKey: catalogKeys.products, queryFn: fetchCatalogProducts, staleTime: 0 });
  const categories = categoriesQuery.data ?? [];
  const banners = bannersQuery.data ?? [];
  const topDeals = (productsQuery.data ?? []).slice(0, 4);

  // Real-time Socket.IO synchronization for live products & catalog updates
  useEffect(() => {
    const socket = io(
      process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "https://multiserviceapp-4pdw.onrender.com",
      { transports: ["websocket", "polling"], reconnectionAttempts: 5 }
    );
    socket.on("product:change", () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.products });
    });
    socket.on("product:updated", () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.products });
    });
    socket.on("catalog_updated", () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.products });
      queryClient.invalidateQueries({ queryKey: catalogKeys.categories });
      queryClient.invalidateQueries({ queryKey: catalogKeys.banners });
    });
    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [liveLocation, setLiveLocation] = useState<UserAddressDetails | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Modals State
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAllServicesOpen, setIsAllServicesOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isLangCityOpen, setIsLangCityOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callType, setCallType] = useState<"AUDIO" | "VIDEO">("AUDIO");

  // Preferences State
  const [selectedCity, setSelectedCity] = useState("Sultanganj");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "hinglish">("en");

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([categoriesQuery.refetch(), bannersQuery.refetch()]);
    setRefreshing(false);
  };

  useEffect(() => {
    let unsubNotif = () => {};
    try {
      unsubNotif = onSnapshot(
        query(collection(db, "broadcast_notifications"), orderBy("sentAt", "desc"), limit(1)),
        (snap) => {
          if (!snap.empty) {
            const notif = snap.docs[0].data();
            if (notif.sentAt && Date.now() - notif.sentAt < 120000) {
              Alert.alert(notif.title || "Inisha Alert", notif.body || "");
            }
          }
        }
      );
    } catch {}

    return () => {
      unsubNotif();
    };
  }, []);

  useEffect(() => {
    setActiveBannerIndex((index) => Math.min(index, Math.max(0, banners.length - 1)));
  }, [banners.length]);

  // Fetch real device GPS coordinates on mount
  useEffect(() => {
    fetchLiveGps();
  }, []);

  const fetchLiveGps = async () => {
    setDetectingGps(true);
    try {
      const loc = await LocationService.getCurrentLocation();
      setLiveLocation(loc);
    } catch {
      setLiveLocation(LocationService.getFallbackLocation());
    } finally {
      setDetectingGps(false);
    }
  };

  const userLocationCity = liveLocation?.city || selectedCity || "Sultanganj";

  const handleCategoryPress = (category: Category) => {
    if (category.id === "cat_mobile" || category.slug?.includes("mobile")) {
      setIsBrandModalOpen(true);
      return;
    }
    setSelectedCategory(category);
    if (category.subcategories && category.subcategories.length >= 1) {
      handleSubcategoryPress(category.subcategories[0]);
    }
  };

  const handleSubcategoryPress = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setCurrentPrice(subcategory.basePrice);
    initDraftBooking(subcategory.categoryId, subcategory.id, subcategory.basePrice);
    setIsFormOpen(true);
  };

  const handleSuggestionClick = (query: string) => {
    setSearchQuery(query);
    const qLower = query.toLowerCase();
    if (qLower.includes("mobile")) {
      setIsBrandModalOpen(true);
      return;
    }
    if (qLower.includes("grocery")) {
      setIsStoreOpen(true);
      return;
    }
    const found = categories.find(
      (c) => c.name.toLowerCase().includes(qLower) || c.slug.toLowerCase().includes(qLower)
    );
    if (found) handleCategoryPress(found);
  };

  const handleFormSubmit = async (formValues: Record<string, any>) => {
    setBookingLoading(true);
    try {
      const newBookingId = `bk_${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
      const defaultAddr = liveLocation || LocationService.getFallbackLocation();

      const newBooking: Booking = {
        id: newBookingId,
        customerId: user?.id || "usr_customer_live",
        customerName: user?.name || "Customer",
        customerPhone: user?.phoneNumber || "+91 95078 60048",
        categoryId: draftBooking?.categoryId || selectedCategory?.id || "cat_repair",
        subcategoryId: draftBooking?.subcategoryId || selectedSubcategory?.id || "sub_doorstep",
        formValues: formValues,
        selectedAddress: formValues.service_address || {
          formattedAddress: defaultAddr.formattedAddress,
          latitude: defaultAddr.latitude,
          longitude: defaultAddr.longitude,
          landmark: defaultAddr.landmark || defaultAddr.city,
        },
        status: "PENDING_PROVIDER",
        otp: generatedOtp,
        paymentMethod: "CASH_AFTER_SERVICE",
        paymentStatus: "PENDING",
        pricing: {
          basePrice: currentPrice,
          tax: Math.round(currentPrice * 0.18),
          commission: Math.round(currentPrice * 0.15),
          couponDiscount: 0,
          addOnPrice: 0,
          providerEarnings: Math.round(currentPrice * 0.85),
          finalAmount: Math.round(currentPrice * 1.18),
        },
        timeline: [
          { status: "DRAFT", timestamp: new Date().toISOString(), note: "Booking Created" },
          { status: "PENDING_PROVIDER", timestamp: new Date().toISOString(), note: "Broadcasting request to nearby technicians" },
        ],
        scheduledDate: formValues.preferred_date || new Date().toISOString().split("T")[0],
        scheduledTime: formValues.preferred_time || "Immediate Doorstep Visit",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, "bookings", newBookingId), {
          ...newBooking,
          bookingId: `BK-${newBookingId.replace("bk_", "").toUpperCase()}`,
          serviceName: selectedSubcategory?.name || "Doorstep Service",
          serviceTitle: selectedSubcategory?.name || "Doorstep Service",
          amount: newBooking.pricing.finalAmount,
          customerName: newBooking.customerName,
          customerPhone: newBooking.customerPhone,
          address: newBooking.selectedAddress.formattedAddress,
          createdAt: Date.now(),
        });
      } catch (fsErr) {
        console.warn("Firestore booking sync notice:", fsErr);
      }

      const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";
      fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      }).catch((apiErr) => console.warn("Backend booking dispatch sync:", apiErr));

      try {
        const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || "https://multiserviceapp-4pdw.onrender.com";
        const io = require("socket.io-client").io;
        const socket = io(socketUrl, { transports: ["websocket"], autoConnect: true });
        socket.emit("booking:create", newBooking);
        socket.emit("job:dispatch", {
          ...newBooking,
          serviceName: selectedSubcategory?.name || "Doorstep Service",
        });
      } catch {}

      sendNewJobDispatchNotification(
        newBooking.id,
        selectedSubcategory?.name || "Doorstep Service",
        newBooking.pricing.providerEarnings
      ).catch(() => {});

      setActiveBooking(newBooking);
      addBookingToHistory(newBooking);

      setIsFormOpen(false);
      setSelectedSubcategory(null);
      setSelectedCategory(null);

      router.push({
        pathname: "/(customer)/track-booking/[id]",
        params: { id: newBookingId },
      });
    } catch (err) {
      console.error("Booking creation failed:", err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSubcategory(null);
  };

  const openWhatsAppSupport = () => {
    const message = encodeURIComponent(
      "Hello Inisha Team! I need doorstep service assistance."
    );
    Linking.openURL(`https://wa.me/919507860048?text=${message}`).catch(() => {
      Alert.alert("WhatsApp Support", "Reach us at +91 95078 60048 on WhatsApp.");
    });
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case "PENDING_PROVIDER":
        return "Finding partner...";
      case "ACCEPTED":
        return "Partner Assigned";
      case "EN_ROUTE":
        return "On the way";
      case "ARRIVED":
        return "Arrived";
      case "IN_PROGRESS":
        return "In progress";
      default:
        return status;
    }
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 24) + 64,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      >
        {/* Official Inisha Brand Header (Matching Design Mockup) */}
        <InishaHeader
          onProfilePress={() => router.push("/(customer)/(tabs)/profile")}
          onSearchPress={() => {}}
          onNotificationPress={() => {
            Alert.alert("Inisha Notifications", "Your latest updates & order alerts appear here.");
          }}
        />

        {/* 1. Location Bar: Deliver/Service at Sultanganj */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={() => setIsLocationModalOpen(true)}
            style={styles.locationContainer}
            activeOpacity={0.8}
          >
            <View style={styles.locationPinBox}>
              <MapPin size={18} color="#0f172a" />
            </View>
            <View>
              <Text style={styles.deliverLabel}>Deliver/Service at</Text>
              <View style={styles.cityNameRow}>
                <Text style={styles.cityNameText}>{userLocationCity}</Text>
                <ChevronRight size={16} color="#0f172a" style={{ marginTop: 2 }} />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRightButtons}>
            <TouchableOpacity
              onPress={() => setIsLocationModalOpen(true)}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <Compass size={18} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Search Bar with Mic & Suggestions (Matching Image 1) */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#94a3b8" />
            <TextInput
              placeholder="Search products, services..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            <TouchableOpacity
              onPress={() => setIsVoiceOpen(true)}
              style={styles.voiceMicBtn}
              activeOpacity={0.7}
            >
              <Mic size={18} color="#475569" />
            </TouchableOpacity>
          </View>

          {/* Suggestion Chips Row */}
          <View style={styles.suggestionRow}>
            <Text style={styles.suggestionLabel}>Suggestion: </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SUGGESTIONS.map((sug, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSuggestionClick(sug)}
                  style={styles.suggestionChip}
                >
                  <Text style={styles.suggestionText}>
                    {sug}
                    {idx < SUGGESTIONS.length - 1 ? "," : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Main Hub: (1) City Service & (2) Inisha Store */}
        <View style={styles.mainHubContainer}>
          {/* 1. City Service Hub (Opens All 15+ Services) */}
          <TouchableOpacity
            onPress={() => setIsAllServicesOpen(true)}
            style={styles.hubCardCityService}
            activeOpacity={0.88}
          >
            <View style={styles.hubCardHeader}>
              <View style={[styles.hubIconCircle, { backgroundColor: "#e0f2fe" }]}>
                <Wrench size={24} color="#0284c7" />
              </View>
              <View style={styles.hubBadgeBlue}>
                <Text style={styles.hubBadgeBlueText}>15+ Services</Text>
              </View>
            </View>
            <Text style={styles.hubCardTitle}>City Service</Text>
            <Text style={styles.hubCardSub} numberOfLines={2}>
              Doorstep Repair, AC, Cleaning, Salon & more
            </Text>
            <View style={styles.hubActionRow}>
              <Text style={styles.hubActionTextBlue}>Book Service</Text>
              <ArrowRight size={14} color="#0284c7" />
            </View>
          </TouchableOpacity>

          {/* 2. Inisha Store Hub (Opens Store & Product Catalog) */}
          <TouchableOpacity
            onPress={() => setIsStoreOpen(true)}
            style={styles.hubCardInishaStore}
            activeOpacity={0.88}
          >
            <View style={styles.hubCardHeader}>
              <View style={[styles.hubIconCircle, { backgroundColor: "#ffedd5" }]}>
                <ShoppingBag size={24} color="#ea580c" />
              </View>
              <View style={styles.hubBadgeOrange}>
                <Text style={styles.hubBadgeOrangeText}>10-Min Fast</Text>
              </View>
            </View>
            <Text style={styles.hubCardTitle}>Inisha Store</Text>
            <Text style={styles.hubCardSub} numberOfLines={2}>
              Groceries, Spares, Mobiles & Products
            </Text>
            <View style={styles.hubActionRow}>
              <Text style={styles.hubActionTextOrange}>Shop Store</Text>
              <ArrowRight size={14} color="#ea580c" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Floating Notification Banner (Matching Image 2 Mockup) */}
        <View style={styles.notifBannerCard}>
          <View style={styles.notifBadgeCircle}>
            <Bell size={18} color="#ffffff" />
            <View style={styles.notifDot} />
          </View>
          <View style={styles.notifContent}>
            <Text style={styles.notifTitle}>Notification</Text>
            <Text style={styles.notifDesc} numberOfLines={2}>
              Welcome to Inisha! Doorstep home repair, salon & instant grocery delivery is ready for you.
            </Text>
            <Text style={styles.notifTime}>1 min ago</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </View>

        {/* 3. Admin-managed hero carousel */}
        <View style={styles.bannerCarouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x / (Dimensions.get("window").width - 36)
              );
              setActiveBannerIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {banners.map((banner) => (
              <View key={banner.id} style={styles.bannerSlideCard}>
                <View style={styles.bannerTextContent}>
                  <Text style={styles.bannerTagText}>{banner.tag}</Text>
                  <Text style={styles.bannerTitleText}>{banner.title}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const target = banner.targetCategory.toLowerCase();
                      if (target.includes("store") || target.includes("product") || target.includes("grocery")) setIsStoreOpen(true);
                      else setIsAllServicesOpen(true);
                    }}
                    style={styles.bannerActionBtn}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.bannerActionBtnText}>Explore</Text>
                  </TouchableOpacity>
                </View>
                <SafeImage uri={banner.imageUrl} style={styles.bannerImage} />
              </View>
            ))}
          </ScrollView>

          {/* Dots Pagination */}
          <View style={styles.dotsPagination}>
            {banners.map((banner, idx) => (
              <View
                key={banner.id}
                style={[
                  styles.dotItem,
                  activeBannerIndex === idx && styles.dotItemActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 4. Explore Categories: MongoDB-backed live catalog */}
        <View style={styles.exploreSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Explore Categories</Text>
            <TouchableOpacity onPress={() => setIsAllServicesOpen(true)}>
              <Text style={styles.viewAllLink}>View All ({categories.length})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.circularCategoriesGrid}>
            {/* 1. Mobile Repair / First Live Category */}
            {categories.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  const mobCat = categories.find((c) => c.id === "cat_mobile" || c.slug?.includes("mobile")) || categories[0];
                  setIsBrandModalOpen(true);
                }}
                style={styles.circularCatItem}
                activeOpacity={0.8}
              >
                <View style={[styles.circularIconBox, { backgroundColor: "#dbeafe" }]}>
                  <Smartphone size={24} color="#2563eb" />
                </View>
                <Text style={styles.circularCatLabel} numberOfLines={1}>
                  {(categories.find((c) => c.id === "cat_mobile" || c.slug?.includes("mobile")) || categories[0]).name}
                </Text>
              </TouchableOpacity>
            )}

            {/* 2. Grocery & Needs */}
            <TouchableOpacity
              onPress={() => setIsStoreOpen(true)}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#ffedd5" }]}>
                <ShoppingCart size={24} color="#ea580c" />
              </View>
              <Text style={styles.circularCatLabel} numberOfLines={1}>Grocery</Text>
            </TouchableOpacity>

            {/* 3 to 7: Dynamic Live Categories from Backend MongoDB (e.g. Parlour, Electrician, Plumber, AC, etc.) */}
            {categories
              .filter((c) => c.id !== "cat_mobile" && !c.slug?.includes("mobile"))
              .slice(0, 5)
              .map((cat, idx) => {
                const bgColors = ["#fce7f3", "#fef3c7", "#ede9fe", "#cffafe", "#fef9c3", "#e0f2fe", "#d1fae5"];
                const iconColors = ["#db2777", "#d97706", "#7c3aed", "#0891b2", "#ca8a04", "#0284c7", "#059669"];
                const bgColor = bgColors[idx % bgColors.length];
                const iconColor = iconColors[idx % iconColors.length];
                const norm = (cat.imageUrl || (cat as any).iconName || cat.slug || cat.name || "").toLowerCase();

                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => handleCategoryPress(cat)}
                    style={styles.circularCatItem}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.circularIconBox, { backgroundColor: bgColor }]}>
                      {cat.imageUrl && (cat.imageUrl.startsWith("http://") || cat.imageUrl.startsWith("https://") || cat.imageUrl.startsWith("data:image")) ? (
                        <SafeImage uri={cat.imageUrl} style={{ width: 26, height: 26, borderRadius: 6 }} resizeMode="cover" />
                      ) : norm.includes("salon") || norm.includes("parlour") || norm.includes("beauty") ? (
                        <Scissors size={24} color={iconColor} />
                      ) : norm.includes("elec") || norm.includes("zap") ? (
                        <Zap size={24} color={iconColor} />
                      ) : norm.includes("plumb") || norm.includes("water") || norm.includes("droplet") ? (
                        <Droplets size={24} color={iconColor} />
                      ) : norm.includes("ac") || norm.includes("wind") || norm.includes("air") ? (
                        <Snowflake size={24} color={iconColor} />
                      ) : norm.includes("clean") ? (
                        <Sparkles size={24} color={iconColor} />
                      ) : norm.includes("car") || norm.includes("motor") || norm.includes("vehicle") ? (
                        <Truck size={24} color={iconColor} />
                      ) : norm.includes("paint") ? (
                        <Paintbrush size={24} color={iconColor} />
                      ) : norm.includes("carpenter") || norm.includes("hammer") ? (
                        <Hammer size={24} color={iconColor} />
                      ) : (
                        <Wrench size={24} color={iconColor} />
                      )}
                    </View>
                    <Text style={styles.circularCatLabel} numberOfLines={1}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}

            {/* 8. More / View All */}
            <TouchableOpacity
              onPress={() => setIsAllServicesOpen(true)}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#f1f5f9" }]}>
                <Plus size={24} color="#475569" />
              </View>
              <Text style={styles.circularCatLabel}>More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Popular Services (Horizontal Cards with Real Photos & Book Now button - Dynamic Live Data) */}
        <View style={styles.popularServicesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {categories.slice(0, 6).map((cat) => {
              const basePrice = cat.subcategories?.[0]?.basePrice || 399;
              const imgUri = (cat.imageUrl && cat.imageUrl.startsWith("http"))
                ? cat.imageUrl
                : (cat.id === "cat_mobile" || cat.slug?.includes("mobile")
                  ? "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80"
                  : cat.id === "cat_ac_repair" || cat.slug?.includes("ac")
                  ? "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80"
                  : cat.id === "cat_salon" || cat.slug?.includes("salon")
                  ? "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80"
                  : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80");

              return (
                <View key={cat.id} style={styles.popularServiceCard}>
                  <SafeImage uri={imgUri} style={styles.popularServiceImg} />
                  <View style={styles.popularServiceContent}>
                    <Text style={styles.popularServiceName} numberOfLines={1}>
                      {cat.name}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Star size={12} color="#f59e0b" fill="#f59e0b" />
                      <Text style={styles.ratingText}>4.9 Rating</Text>
                    </View>

                    <View style={styles.popularServiceBottomRow}>
                      <View>
                        <Text style={styles.startingLabel}>Doorstep Technician</Text>
                        <Text style={styles.popularPriceText}>Starting ₹{basePrice}</Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleCategoryPress(cat)}
                        style={styles.bookNowBtn}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.bookNowBtnText}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 6. Top Deals (Horizontal Cards with Real Product Photos & Add button - Image 1) */}
        <View style={styles.topDealsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Top Deals</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {topDeals.map((deal) => (
              <TouchableOpacity
                key={deal.id}
                style={styles.topDealCard}
                activeOpacity={0.9}
                onPress={() => router.push(`/product/${deal.id}` as any)}
              >
                <SafeImage uri={deal.imageUrl} style={styles.topDealImg} />
                {deal.discountPercentage > 0 && (
                  <View style={styles.dealDiscountBadge}>
                    <Text style={styles.dealDiscountText}>{deal.discountPercentage}% OFF</Text>
                  </View>
                )}

                <View style={styles.topDealContent}>
                  <Text style={styles.topDealName} numberOfLines={1}>
                    {deal.name}
                  </Text>
                  {deal.originalPrice > deal.price ? <Text style={styles.dealOriginalPrice}>₹{deal.originalPrice}</Text> : null}

                  <View style={styles.topDealBottomRow}>
                    <Text style={styles.dealFinalPrice}>₹{deal.price}</Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/product/${deal.id}` as any);
                      }}
                      style={styles.dealAddBtn}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.dealAddBtnText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 7. Why Choose Inisha? (Matching Image 1) */}
        <View style={styles.whyChooseSection}>
          <Text style={styles.whyChooseTitle}>Why Choose Inisha?</Text>
          <View style={styles.whyChooseRow}>
            <View style={styles.whyChooseItem}>
              <ShieldCheck size={20} color="#0f172a" />
              <Text style={styles.whyChooseLabel}>Verified{"\n"}Professionals</Text>
            </View>

            <View style={styles.whyChooseItem}>
              <Zap size={20} color="#0f172a" />
              <Text style={styles.whyChooseLabel}>Fast{"\n"}Service</Text>
            </View>

            <View style={styles.whyChooseItem}>
              <Lock size={20} color="#0f172a" />
              <Text style={styles.whyChooseLabel}>Secure{"\n"}Payment</Text>
            </View>

            <View style={styles.whyChooseItem}>
              <MapPin size={20} color="#0f172a" />
              <Text style={styles.whyChooseLabel}>Local{"\n"}Service</Text>
            </View>
          </View>
        </View>

        {/* Inisha AI Assistant Floating Box */}
        <TouchableOpacity
          onPress={() => setIsAIChatOpen(true)}
          style={styles.aiAssistantBanner}
          activeOpacity={0.85}
        >
          <View style={styles.aiBadgeBox}>
            <Bot size={20} color="#ffffff" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.aiBannerTitle}>Inisha AI Assistant ⚡</Text>
              <View style={styles.aiLivePill}>
                <Text style={styles.aiLiveText}>24x7</Text>
              </View>
            </View>
            <Text style={styles.aiBannerSub}>
              Ask about repair costs, diagnose mobile/AC issues & get instant booking help
            </Text>
          </View>
          <ChevronRight size={18} color="#0284c7" />
        </TouchableOpacity>

        {/* Active Booking Tracker */}
        {activeBooking && (
          <View style={styles.activeBookingCard}>
            <View style={styles.activeBookingHeader}>
              <View style={styles.activeBookingTitleRow}>
                <Compass size={18} color="#0284c7" />
                <Text style={styles.activeBookingTitle}>Active Service Tracker</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {getStatusText(activeBooking.status)}
                </Text>
              </View>
            </View>

            <Text style={styles.activeBookingId}>Booking: #{activeBooking.id}</Text>
            <Text style={styles.activeBookingOtp}>
              Start OTP: <Text style={styles.otpHighlight}>{activeBooking.otp}</Text>
            </Text>

            <View style={styles.bookingQuickActionsRow}>
              <TouchableOpacity
                onPress={() => {
                  setCallType("AUDIO");
                  setIsCallOpen(true);
                }}
                style={styles.quickActionPill}
              >
                <Phone size={14} color="#0f172a" />
                <Text style={styles.quickActionText}>Audio Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setCallType("VIDEO");
                  setIsCallOpen(true);
                }}
                style={styles.quickActionPill}
              >
                <Video size={14} color="#0f172a" />
                <Text style={styles.quickActionText}>Video Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsInvoiceOpen(true)}
                style={styles.quickActionPill}
              >
                <FileText size={14} color="#0f172a" />
                <Text style={styles.quickActionText}>Invoice</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsRatingOpen(true)}
                style={styles.quickActionPill}
              >
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.quickActionText}>Review</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/(customer)/track-booking/[id]",
                  params: { id: activeBooking.id },
                });
              }}
              style={styles.trackBookingButton}
              activeOpacity={0.85}
            >
              <Text style={styles.trackBookingText}>Live GPS Map & Route</Text>
              <ArrowRight size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* WhatsApp Direct Help Banner */}
        <TouchableOpacity
          onPress={openWhatsAppSupport}
          style={styles.whatsappBanner}
          activeOpacity={0.85}
        >
          <View style={styles.whatsappIconBox}>
            <MessageCircle size={22} color="#ffffff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.whatsappTitle}>Instant WhatsApp Support 💬</Text>
            <Text style={styles.whatsappSub}>
              Helpline: +91 95078 60048 | Chat for custom bookings & spares
            </Text>
          </View>
          <ArrowRight size={16} color="#16a34a" />
        </TouchableOpacity>
      </ScrollView>

      {/* Booking Form Bottom Sheet Modal */}
      <Modal
        visible={isFormOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />

            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={styles.modalTitle}>{selectedSubcategory?.name}</Text>
                <Text style={styles.modalSubtitle}>Customize your service details</Text>
              </View>
              <TouchableOpacity
                onPress={handleCloseForm}
                style={styles.modalCloseButton}
              >
                <X size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>

            {selectedSubcategory && (
              <DynamicFormBuilder
                formConfig={selectedSubcategory.formConfig}
                onSubmit={handleFormSubmit}
                basePrice={selectedSubcategory.basePrice}
                onPriceChange={setCurrentPrice}
                submitButtonText={`Book Service • ₹${currentPrice}`}
                isLoading={bookingLoading}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Brand Repair / Doorstep Repair Modal */}
      <BrandRepairModal
        visible={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onSelectBrandService={(brand, mode, model) => {
          const mobileCat = categories.find((c) => c.id === "cat_mobile");
          if (mobileCat && mobileCat.subcategories.length > 0) {
            setSelectedCategory(mobileCat);
            setSelectedSubcategory(mobileCat.subcategories[0]);
            setCurrentPrice(mobileCat.subcategories[0].basePrice);
            setIsFormOpen(true);
          } else {
            Alert.alert(
              `Doorstep Repair Registered`,
              `Brand: ${brand} | Model: ${model || "Default"}. Our certified technician will assist you.`
            );
          }
        }}
      />

      {/* Interactive Modals */}
      <LocationPickerModal
        visible={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={liveLocation}
        onSelectLocation={(loc) => setLiveLocation(loc)}
      />

      <AIChatSupportModal
        visible={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onSelectService={(catId) => {
          const found = categories.find((c) => c.id === catId);
          if (found) handleCategoryPress(found);
          else if (catId === "GROCERY") setIsStoreOpen(true);
        }}
      />

      <VoiceBookingModal
        visible={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onServiceDetected={(catId) => {
          const found = categories.find((c) => c.id === catId);
          if (found) handleCategoryPress(found);
        }}
      />

      <ProductCatalogModal
        visible={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        onOrderPlaced={() => {}}
      />

      <GSTInvoiceModal
        visible={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        booking={activeBooking}
      />

      <RatingReviewModal
        visible={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        bookingId={activeBooking?.id || "bk_demo"}
        providerName={activeBooking?.providerName || "Verified Technician"}
        onSubmit={() => {}}
      />

      <LanguageCitySelectorModal
        visible={isLangCityOpen}
        onClose={() => setIsLangCityOpen(false)}
        selectedCity={selectedCity}
        selectedLanguage={selectedLanguage}
        onSelectCity={setSelectedCity}
        onSelectLanguage={setSelectedLanguage}
      />

      <CallSimulationModal
        visible={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        technicianName={activeBooking?.providerName || "Verified Technician"}
        technicianPhone={activeBooking?.providerPhone || "+91 95078 60048"}
        callType={callType}
      />

      <InAppAdminPortalModal
        visible={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onAddCategory={() => {
          void categoriesQuery.refetch();
        }}
      />

      <AllServicesModal
        visible={isAllServicesOpen}
        onClose={() => setIsAllServicesOpen(false)}
        categories={categories}
        initialQuery={searchQuery}
        onSelectService={(cat, sub) => {
          setSelectedCategory(cat);
          setSelectedSubcategory(sub);
          setCurrentPrice(sub.basePrice);
          setIsFormOpen(true);
        }}
      />
    </View>
  );
}

const { width } = Dimensions.get("window");
const bannerWidth = width - 36;
const categoryCircleSize = (width - 36 - 36) / 4;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationPinBox: {
    marginRight: 6,
  },
  deliverLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  cityNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityNameText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    marginRight: 2,
  },
  headerRightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  searchContainer: {
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#0f172a",
    paddingVertical: 0,
  },
  voiceMicBtn: {
    padding: 6,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingLeft: 2,
  },
  suggestionLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
  },
  suggestionChip: {
    marginRight: 4,
  },
  suggestionText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },
  bannerCarouselContainer: {
    marginBottom: 18,
  },
  bannerSlideCard: {
    width: bannerWidth,
    height: 140,
    backgroundColor: "#0f172a",
    borderRadius: 18,
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
    paddingHorizontal: 16,
    position: "relative",
  },
  bannerTextContent: {
    flex: 1,
    zIndex: 2,
    justifyContent: "center",
  },
  bannerTagText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 2,
  },
  bannerTitleText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
    lineHeight: 18,
    marginBottom: 10,
  },
  bannerActionBtn: {
    backgroundColor: "#2563eb",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerActionBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  bannerImage: {
    width: 140,
    height: 140,
    position: "absolute",
    right: 0,
    top: 0,
    opacity: 0.85,
  },
  dotsPagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  dotItem: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
  },
  dotItemActive: {
    width: 14,
    backgroundColor: "#64748b",
  },
  exploreSection: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0f172a",
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  circularCategoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  circularCatItem: {
    width: categoryCircleSize,
    alignItems: "center",
  },
  circularIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  circularCatLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
  },
  popularServicesSection: {
    marginBottom: 20,
  },
  horizontalScroll: {
    marginHorizontal: -18,
    paddingHorizontal: 18,
  },
  popularServiceCard: {
    width: 220,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  popularServiceImg: {
    width: "100%",
    height: 110,
  },
  popularServiceContent: {
    padding: 10,
  },
  popularServiceName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  popularServiceBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  startingLabel: {
    fontSize: 9,
    color: "#94a3b8",
  },
  popularPriceText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  bookNowBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bookNowBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  topDealsSection: {
    marginBottom: 20,
  },
  topDealCard: {
    width: 140,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    marginRight: 12,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  topDealImg: {
    width: "100%",
    height: 110,
    backgroundColor: "#f8fafc",
  },
  dealDiscountBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#2563eb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dealDiscountText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },
  topDealContent: {
    padding: 8,
  },
  topDealName: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  dealOriginalPrice: {
    fontSize: 10,
    color: "#94a3b8",
    textDecorationLine: "line-through",
  },
  topDealBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  dealFinalPrice: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0f172a",
  },
  dealAddBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dealAddBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  whyChooseSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    marginBottom: 18,
  },
  whyChooseTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 12,
  },
  whyChooseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  whyChooseItem: {
    alignItems: "center",
    flex: 1,
  },
  whyChooseLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 13,
  },
  aiAssistantBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1.5,
    borderColor: "#bfdbfe",
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
  },
  aiBadgeBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  aiBannerTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  aiLivePill: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiLiveText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },
  aiBannerSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  activeBookingCard: {
    backgroundColor: "#eff6ff",
    borderWidth: 1.5,
    borderColor: "#bfdbfe",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  activeBookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  activeBookingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeBookingTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginLeft: 6,
  },
  statusBadge: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
  },
  activeBookingId: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
  },
  activeBookingOtp: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 2,
  },
  otpHighlight: {
    color: "#2563eb",
    fontWeight: "900",
    letterSpacing: 2,
  },
  bookingQuickActionsRow: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 10,
  },
  quickActionPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0f172a",
  },
  trackBookingButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  trackBookingText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  whatsappBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#bbf7d0",
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
  },
  whatsappIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  whatsappTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  whatsappSub: {
    fontSize: 11,
    color: "#16a34a",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  modalDragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748b",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  mainHubContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  hubCardCityService: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#e0f2fe",
    shadowColor: "#0284c7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: "space-between",
  },
  hubCardInishaStore: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#ffedd5",
    shadowColor: "#ea580c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: "space-between",
  },
  hubCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hubIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  hubBadgeBlue: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  hubBadgeBlueText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
  },
  hubBadgeOrange: {
    backgroundColor: "#ffedd5",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  hubBadgeOrangeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ea580c",
  },
  hubCardTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 2,
  },
  hubCardSub: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 15,
    marginBottom: 10,
  },
  hubActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  hubActionTextBlue: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0284c7",
  },
  hubActionTextOrange: {
    fontSize: 12,
    fontWeight: "900",
    color: "#ea580c",
  },
  notifBannerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notifBadgeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#0369a1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notifDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ea580c",
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  notifContent: {
    flex: 1,
    marginRight: 8,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 2,
  },
  notifDesc: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 15,
  },
  notifTime: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
    marginTop: 4,
  },
});
