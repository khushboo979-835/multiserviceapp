import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { useBookingStore } from "../../../src/store/useBookingStore";
import { MOCK_COUPONS, MOCK_CATEGORIES, MOCK_PRODUCTS } from "../../../src/constants/mockData";
import { Category, Subcategory, Booking, BookingStatus } from "../../../src/types";
import DynamicFormBuilder from "../../../src/components/booking/DynamicFormBuilder";
import BrandLogo from "../../../src/components/common/BrandLogo";
import SafeImage from "../../../src/components/common/SafeImage";
import { catalogKeys, fetchCatalogBanners, fetchCatalogCategories, fetchCatalogOffers, fetchCatalogProducts } from "../../../src/api/catalog";
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
import ShopRegistrationModal from "../../../src/components/shop/ShopRegistrationModal";
import MerchantHubModal from "../../../src/components/merchant/MerchantHubModal";
import { apiClient } from "../../../src/api/apiClient";
import {
  Store,
  Utensils,
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
  const categoriesQuery = useQuery({ queryKey: catalogKeys.categories, queryFn: () => fetchCatalogCategories(), staleTime: 0 });
  const bannersQuery = useQuery({ queryKey: catalogKeys.banners, queryFn: () => fetchCatalogBanners(), staleTime: 0 });
  const offersQuery = useQuery({ queryKey: catalogKeys.offers, queryFn: () => fetchCatalogOffers(), staleTime: 0 });
  const productsQuery = useQuery({ queryKey: catalogKeys.products, queryFn: () => fetchCatalogProducts(), staleTime: 0 });
  const categories = (categoriesQuery.data && categoriesQuery.data.length > 0) ? categoriesQuery.data : MOCK_CATEGORIES;
  const banners = bannersQuery.data ?? [];
  const specialOffers = (offersQuery.data && offersQuery.data.length > 0) ? offersQuery.data : banners;
  const topDeals = (productsQuery.data && productsQuery.data.length > 0) ? productsQuery.data : MOCK_PRODUCTS;
  const shopsQuery = useQuery({ queryKey: ["nearbyShops"], queryFn: async () => { try { const res = await apiClient.get("/shops"); return res.data?.shops || []; } catch { return []; } }, staleTime: 60000 });
  const localShops = (shopsQuery.data && shopsQuery.data.length > 0) ? shopsQuery.data : [
    { shopId: "shop_bihar_sweets_101", name: "Patna Special Sweets & Chaat", category: "SWEETS_BAKERY", logoUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&q=80", rating: 4.9, ratingsCount: 240, deliverySettings: { estimatedPrepMins: 15, baseDeliveryFee: 25 }, address: { street: "Kidwaipuri", city: "Patna" } },
    { shopId: "shop_royal_biryani_102", name: "Royal Darbar Restaurant & Biryani", category: "RESTAURANT", logoUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80", rating: 4.8, ratingsCount: 412, deliverySettings: { estimatedPrepMins: 25, baseDeliveryFee: 30 }, address: { street: "Kankarbagh", city: "Patna" } },
    { shopId: "shop_apna_grocery_103", name: "Apna Super Mart & Fresh Grocery", category: "GROCERY", logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80", rating: 4.8, ratingsCount: 180, deliverySettings: { estimatedPrepMins: 15, baseDeliveryFee: 20 }, address: { street: "Bailey Road", city: "Danapur" } },
    { shopId: "shop_chhotu_mobile_104", name: "Chhotu Mobile & Electronics Hub", category: "MOBILE_ELECTRONICS", logoUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80", rating: 5.0, ratingsCount: 520, deliverySettings: { estimatedPrepMins: 20, baseDeliveryFee: 30 }, address: { street: "Suruchi Complex", city: "Sultanganj" } }
  ];

  // Focus refetch for instant live sync
  useFocusEffect(
    useCallback(() => {
      categoriesQuery.refetch();
      bannersQuery.refetch();
      offersQuery.refetch();
      productsQuery.refetch();
    }, [categoriesQuery, bannersQuery, productsQuery])
  );

  // Real-time Socket.IO synchronization for live products & catalog updates
  useEffect(() => {
    const socket = io(
      process.env.EXPO_PUBLIC_API_URL?.replace(/\/api\/?$/, "") || "https://multiserviceapp-4pdw.onrender.com",
      { transports: ["websocket", "polling"], reconnectionAttempts: 5 }
    );
    const handleProductUpdate = () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.products });
      productsQuery.refetch();
    };
    socket.on("product:change", handleProductUpdate);
    socket.on("product:updated", handleProductUpdate);
    socket.on("catalog_updated", () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.products });
      queryClient.invalidateQueries({ queryKey: catalogKeys.categories });
      queryClient.invalidateQueries({ queryKey: catalogKeys.banners });
      productsQuery.refetch();
      categoriesQuery.refetch();
      bannersQuery.refetch();
    });
    return () => {
      socket.disconnect();
    };
  }, [queryClient, productsQuery, categoriesQuery, bannersQuery]);
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
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const offersScrollRef = useRef<ScrollView>(null);

  // Auto-scroll Special Offers banner slider every 4.5 seconds
  useEffect(() => {
    if (specialOffers.length <= 1) return;
    const interval = setInterval(() => {
      setActiveOfferIndex((prev) => {
        const nextIndex = (prev + 1) % specialOffers.length;
        const screenWidth = Dimensions.get('window').width;
        offersScrollRef.current?.scrollTo({
          x: nextIndex * (screenWidth - 32),
          animated: true,
        });
        return nextIndex;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [specialOffers.length]);

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
  const [isShopRegisterOpen, setIsShopRegisterOpen] = useState(false);
  const [isMerchantHubOpen, setIsMerchantHubOpen] = useState(false);
  const [selectedShopFilter, setSelectedShopFilter] = useState("ALL");
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callType, setCallType] = useState<"AUDIO" | "VIDEO">("AUDIO");

  // Preferences State
  const [selectedCity, setSelectedCity] = useState("Sultanganj");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "hinglish">("en");

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([categoriesQuery.refetch(), bannersQuery.refetch(), productsQuery.refetch()]);
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
    const newBookingId = `bk_${Math.floor(100000 + Math.random() * 900000)}`;
    const generatedOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const defaultAddr = liveLocation || LocationService.getFallbackLocation();
    const chosenServiceName =
      selectedSubcategory?.name ||
      draftBooking?.formValues?.service_name ||
      "Doorstep Complete Service";

    const resolvedAddress = formValues.service_address || {
      formattedAddress: defaultAddr.formattedAddress,
      latitude: defaultAddr.latitude,
      longitude: defaultAddr.longitude,
      landmark: defaultAddr.landmark || defaultAddr.city,
    };

    const newBooking: Booking = {
      id: newBookingId,
      customerId: user?.id || "usr_customer_live",
      customerName: user?.name || "Customer",
      customerPhone: user?.phoneNumber || "+91 95078 60048",
      categoryId: draftBooking?.categoryId || selectedCategory?.id || "cat_repair",
      subcategoryId: draftBooking?.subcategoryId || selectedSubcategory?.id || "sub_doorstep",
      serviceName: chosenServiceName,
      serviceTitle: chosenServiceName,
      formValues: formValues,
      selectedAddress: resolvedAddress,
      status: "ACCEPTED",
      providerId: "INP-8842",
      providerName: "Rajesh Kumar (Inisha Certified Pro)",
      providerPhone: "+91 73520 82614",
      providerVehicle: "DL 07 IN 8842",
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
        { status: "DRAFT", timestamp: new Date().toISOString(), note: "Doorstep Booking Placed & Confirmed" },
        { status: "ACCEPTED", timestamp: new Date().toISOString(), note: "Rajesh Kumar (Inisha Pro Verified) assigned to your doorstep service" },
      ],
      scheduledDate: formValues.preferred_date || new Date().toISOString().split("T")[0],
      scheduledTime: formValues.preferred_time || "Immediate Doorstep Visit",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Instantly save booking in local store so tracking screen renders immediately
      setActiveBooking(newBooking);
      addBookingToHistory(newBooking);

      // 2. Immediately close modal and stop loading so button NEVER stays stuck spinning
      setIsFormOpen(false);
      setSelectedSubcategory(null);
      setSelectedCategory(null);
      setBookingLoading(false);

      // 3. Guaranteed immediate navigation to Live Tracking screen
      setTimeout(() => {
        try {
          router.push(`/(customer)/track-booking/${newBookingId}` as any);
        } catch {
          try {
            router.push(`/track-booking/${newBookingId}` as any);
          } catch {
            router.push({
              pathname: "/(customer)/track-booking/[id]",
              params: { id: newBookingId },
            } as any);
          }
        }
      }, 50);

      // 4. Non-blocking background Firestore sync for Admin Live Dashboard
      try {
        setDoc(doc(db, "bookings", newBookingId), {
          ...newBooking,
          bookingId: `BK-${newBookingId.replace("bk_", "").toUpperCase()}`,
          serviceName: chosenServiceName,
          serviceTitle: chosenServiceName,
          amount: newBooking.pricing.finalAmount,
          customerName: newBooking.customerName,
          customerPhone: newBooking.customerPhone,
          address: resolvedAddress.formattedAddress,
          createdAt: Date.now(),
        }).catch((fsErr) => {
          console.warn("Firestore booking sync notice:", fsErr);
        });
      } catch (fsErr) {
        console.warn("Firestore booking sync notice:", fsErr);
      }

      // 5. Asynchronous background persistence to MongoDB Atlas
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";
      fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      }).catch((apiErr) => console.warn("Backend booking dispatch sync:", apiErr));

      // 6. Dispatch live socket event & technician notification
      try {
        const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || "https://multiserviceapp-4pdw.onrender.com";
        const io = require("socket.io-client").io;
        const socket = io(socketUrl, { transports: ["websocket"], autoConnect: true });
        socket.emit("booking:create", newBooking);
        socket.emit("job:dispatch", {
          ...newBooking,
          serviceName: chosenServiceName,
        });
      } catch {}

      sendNewJobDispatchNotification(
        newBooking.id,
        chosenServiceName,
        newBooking.pricing.providerEarnings
      ).catch(() => {});
    } catch (err) {
      console.error("Booking creation notice:", err);
      setIsFormOpen(false);
      setBookingLoading(false);
      router.push(`/(customer)/track-booking/${newBookingId}` as any);
    } finally {
      setIsFormOpen(false);
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
            onPress={() => router.push("/(customer)/(tabs)/explore")}
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

        {/* Secondary Hub Row: (1) Inisha Food & (2) Inisha Grocery */}
        <View style={styles.foodGroceryHubContainer}>
          {/* 1. Inisha Food Hub */}
          <TouchableOpacity
            onPress={() => {
              setSelectedShopFilter('RESTAURANT');
              const foodShop = localShops.find((s: any) => s.category === 'RESTAURANT' || s.category === 'SWEETS_BAKERY');
              if (foodShop) {
                router.push(`/(customer)/shop/${foodShop.shopId}` as any);
              } else {
                router.push({
                  pathname: '/(customer)/(tabs)/explore',
                  params: { tab: 'FOOD' },
                } as any);
              }
            }}
            style={styles.hubCardFood}
            activeOpacity={0.88}
          >
            <View style={styles.hubCardHeader}>
              <View style={[styles.hubIconCircle, { backgroundColor: '#fee2e2' }]}>
                <Utensils size={24} color='#dc2626' />
              </View>
              <View style={styles.hubBadgeRed}>
                <Text style={styles.hubBadgeRedText}>30-Min Delivery</Text>
              </View>
            </View>
            <Text style={styles.hubCardTitle}>Inisha Food</Text>
            <Text style={styles.hubCardSub} numberOfLines={2}>
              Restaurants, Biryani, Fast Food & Hot Meals
            </Text>
            <View style={styles.hubActionRow}>
              <Text style={styles.hubActionTextRed}>Order Food -&gt;</Text>
              <ArrowRight size={14} color='#dc2626' />
            </View>
          </TouchableOpacity>

          {/* 2. Inisha Grocery Hub */}
          <TouchableOpacity
            onPress={() => {
              setSelectedShopFilter('GROCERY');
              const grocShop = localShops.find((s: any) => s.category === 'GROCERY');
              if (grocShop) {
                router.push(`/(customer)/shop/${grocShop.shopId}` as any);
              } else {
                router.push({
                  pathname: '/(customer)/(tabs)/explore',
                  params: { tab: 'GROCERY' },
                } as any);
              }
            }}
            style={styles.hubCardGrocery}
            activeOpacity={0.88}
          >
            <View style={styles.hubCardHeader}>
              <View style={[styles.hubIconCircle, { backgroundColor: '#dcfce7' }]}>
                <Store size={24} color='#16a34a' />
              </View>
              <View style={styles.hubBadgeGreen}>
                <Text style={styles.hubBadgeGreenText}>10-Min Fast</Text>
              </View>
            </View>
            <Text style={styles.hubCardTitle}>Inisha Grocery</Text>
            <Text style={styles.hubCardSub} numberOfLines={2}>
              Fresh Vegetables, Daily Essentials, Atta & Oil
            </Text>
            <View style={styles.hubActionRow}>
              <Text style={styles.hubActionTextGreen}>Shop Grocery -&gt;</Text>
              <ArrowRight size={14} color='#16a34a' />
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
            {/* 1. All Local Shops */}
            <TouchableOpacity
              onPress={() => setSelectedShopFilter("ALL")}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#fee2e2" }]}>
                <Store size={22} color="#dc2626" />
              </View>
              <Text style={styles.circularCatLabel} numberOfLines={1}>All Shops</Text>
            </TouchableOpacity>

            {/* 2. Food & Restaurants */}
            <TouchableOpacity
              onPress={() => {
                const foodShop = localShops.find((s: any) => s.category === "RESTAURANT" || s.category === "SWEETS_BAKERY");
                if (foodShop) router.push(`/(customer)/shop/${foodShop.shopId}` as any);
                else setSelectedShopFilter("RESTAURANT");
              }}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#ffedd5" }]}>
                <Utensils size={22} color="#ea580c" />
              </View>
              <Text style={styles.circularCatLabel} numberOfLines={1}>Food</Text>
            </TouchableOpacity>

            {/* 3. Grocery 15m Express */}
            <TouchableOpacity
              onPress={() => {
                const grocShop = localShops.find((s: any) => s.category === "GROCERY");
                if (grocShop) router.push(`/(customer)/shop/${grocShop.shopId}` as any);
                else setSelectedShopFilter("GROCERY");
              }}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#dcfce7" }]}>
                <ShoppingCart size={22} color="#16a34a" />
              </View>
              <Text style={styles.circularCatLabel} numberOfLines={1}>Grocery</Text>
            </TouchableOpacity>

            {/* 4. Mobile & Tech Hub */}
            <TouchableOpacity
              onPress={() => {
                const mobShop = localShops.find((s: any) => s.category === "MOBILE_ELECTRONICS");
                if (mobShop) router.push(`/(customer)/shop/${mobShop.shopId}` as any);
                else setIsBrandModalOpen(true);
              }}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#dbeafe" }]}>
                <Smartphone size={22} color="#2563eb" />
              </View>
              <Text style={styles.circularCatLabel} numberOfLines={1}>Mobiles</Text>
            </TouchableOpacity>

            {/* 5. ADD YOUR SHOP (Prominent Partner Onboarding Icon!) */}
            <TouchableOpacity
              onPress={() => setIsShopRegisterOpen(true)}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#fef3c7", borderWidth: 1.5, borderColor: "#f59e0b" }]}>
                <Plus size={22} color="#b45309" />
              </View>
              <Text style={[styles.circularCatLabel, { color: "#b45309", fontWeight: "800" }]} numberOfLines={1}>+ Add Shop</Text>
            </TouchableOpacity>

            {/* 6. Dynamic Live Services from MongoDB (e.g. AC, Electrician, Plumber, Salon) */}
            {categories
              .filter((c) => c.id !== "cat_mobile" && !c.slug?.includes("mobile"))
              .slice(0, 6)
              .map((cat, idx) => {
                const bgColors = ["#fce7f3", "#ede9fe", "#cffafe", "#fef9c3", "#e0f2fe", "#d1fae5"];
                const iconColors = ["#db2777", "#7c3aed", "#0891b2", "#ca8a04", "#0284c7", "#059669"];
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

            {/* 12. More / View All */}
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

        {/* 4.5 Register / Add Shop Partner Banner */}
        <TouchableOpacity
          style={styles.merchantPartnerBanner}
          activeOpacity={0.9}
          onPress={() => setIsShopRegisterOpen(true)}
        >
          <View style={styles.merchantBannerLeft}>
            <View style={styles.merchantBannerIconBox}>
              <Store size={22} color="#ffffff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.merchantTagRow}>
                <Text style={styles.merchantTagText}>ZERO ONBOARDING FEE</Text>
              </View>
              <Text style={styles.merchantBannerTitle}>Add Your Shop on Inisha 🏪</Text>
              <Text style={styles.merchantBannerSub}>
                List your Restaurant, Grocery, Mobile or Retail Store & get doorstep delivery across your city
              </Text>
            </View>
          </View>
          <View style={styles.merchantBannerArrowBox}>
            <Text style={styles.merchantBannerActionText}>+ Add</Text>
            <ArrowRight size={12} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {/* 4.8 Local Neighborhood Shops & Food Express Delivery (Prominently Placed at the Top!) */}
        <View style={styles.topDealsSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Local Shops & Restaurants 🏪</Text>
              <Text style={styles.sectionSubtitle}>Doorstep delivery from neighborhood shops</Text>
            </View>
            <TouchableOpacity onPress={() => setIsShopRegisterOpen(true)}>
              <Text style={[styles.viewAllLink, { color: "#dc2626", fontWeight: "800" }]}>+ Add Shop</Text>
            </TouchableOpacity>
          </View>

          {/* Shop Category Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopFilterScroll}>
            {[
              { id: "ALL", label: "🌟 All Stores" },
              { id: "RESTAURANT", label: "🍔 Food & Dining" },
              { id: "GROCERY", label: "🛒 Grocery Marts" },
              { id: "MOBILE_ELECTRONICS", label: "📱 Mobile & Tech" },
              { id: "SWEETS_BAKERY", label: "🥐 Sweets & Bakery" },
            ].map((f) => {
              const active = selectedShopFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.shopFilterChip, active && styles.shopFilterChipActive]}
                  onPress={() => setSelectedShopFilter(f.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.shopFilterChipText, active && styles.shopFilterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {localShops
              .filter((shop: any) => selectedShopFilter === "ALL" || shop.category === selectedShopFilter)
              .map((shop: any) => (
                <TouchableOpacity
                  key={shop.shopId}
                  style={styles.localShopCard}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/(customer)/shop/${shop.shopId}` as any)}
                >
                  <SafeImage uri={shop.logoUrl} style={styles.shopLogoThumbnail} resizeMode="cover" />
                  <View style={styles.shopCardContent}>
                    <View style={styles.shopCategoryPill}>
                      <Text style={styles.shopCategoryPillText}>{String(shop.category || "STORE").replace("_", " ")}</Text>
                    </View>
                    <Text style={styles.shopCardName} numberOfLines={1}>{shop.name}</Text>
                    <View style={styles.shopCardMetaRow}>
                      <View style={styles.shopRatingBox}>
                        <Star size={11} color="#f59e0b" fill="#f59e0b" />
                        <Text style={styles.shopRatingText}>{shop.rating || 4.8}</Text>
                      </View>
                      <Text style={styles.shopMetaDot}>•</Text>
                      <Text style={styles.shopPrepTime}>{shop.deliverySettings?.estimatedPrepMins || 20}m</Text>
                      <Text style={styles.shopMetaDot}>•</Text>
                      <Text style={styles.shopCityText}>{shop.address?.city || "Patna"}</Text>
                    </View>
                    <View style={styles.shopCardActionBtn}>
                      <Text style={styles.shopCardActionBtnText}>Order Now</Text>
                      <ArrowRight size={12} color="#dc2626" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        {/* 5. Popular Services (Horizontal Cards with Real Photos & Book Now button - Dynamic Live Data) */}
        <View style={styles.popularServicesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {categories.slice(0, 6).map((cat) => {
              const basePrice = cat.subcategories?.[0]?.basePrice || 399;
              const normSlug = (cat.slug || cat.id || cat.name || "").toLowerCase();
              const imgUri = (cat.imageUrl && cat.imageUrl.startsWith("http"))
                ? cat.imageUrl
                : normSlug.includes("mobile") || normSlug.includes("phone")
                ? "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80"
                : normSlug.includes("ac") || normSlug.includes("air") || normSlug.includes("wind")
                ? "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80"
                : normSlug.includes("elec") || normSlug.includes("zap") || normSlug.includes("wiring")
                ? "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80"
                : normSlug.includes("plumb") || normSlug.includes("water") || normSlug.includes("pipe")
                ? "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80"
                : normSlug.includes("clean") || normSlug.includes("sanit")
                ? "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80"
                : normSlug.includes("salon") || normSlug.includes("parlour") || normSlug.includes("beauty") || normSlug.includes("spa")
                ? "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80"
                : normSlug.includes("appliance") || normSlug.includes("geyser") || normSlug.includes("oven")
                ? "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80"
                : normSlug.includes("carpenter") || normSlug.includes("wood") || normSlug.includes("furniture")
                ? "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80"
                : normSlug.includes("paint")
                ? "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80"
                : normSlug.includes("cctv") || normSlug.includes("camera") || normSlug.includes("security")
                ? "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&q=80"
                : normSlug.includes("ro") || normSlug.includes("purifier")
                ? "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&q=80"
                : normSlug.includes("computer") || normSlug.includes("laptop") || normSlug.includes("pc")
                ? "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80"
                : normSlug.includes("washing") || normSlug.includes("fridge") || normSlug.includes("refrigerator")
                ? "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80"
                : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80";

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
            <TouchableOpacity onPress={() => router.push("/(customer)/(tabs)/explore" as any)}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
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

        {/* Special Offers Banner Carousel (Dynamic Admin /api/offers) */}
        <View style={styles.offersSectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Sparkles size={18} color='#dc2626' />
                <Text style={styles.sectionTitle}>Special Offers & Top Deals 🔥</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Exclusive discounts on doorstep services, food & groceries
              </Text>
            </View>
          </View>

          <ScrollView
            ref={offersScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x / (Dimensions.get('window').width - 32)
              );
              setActiveOfferIndex(slide);
            }}
            scrollEventThrottle={16}
            contentContainerStyle={styles.offersScrollContent}
          >
            {specialOffers.map((offer, idx) => (
              <TouchableOpacity
                key={offer.id || `offer-${idx}`}
                style={styles.offerSlideCard}
                activeOpacity={0.9}
                onPress={() => {
                  const target = (offer.targetCategory || '').toLowerCase();
                  if (target.includes('food') || target.includes('restaurant')) {
                    const foodShop = localShops.find((s: any) => s.category === 'RESTAURANT' || s.category === 'SWEETS_BAKERY');
                    if (foodShop) router.push(`/(customer)/shop/${foodShop.shopId}` as any);
                    else router.push('/(customer)/(tabs)/explore' as any);
                  } else if (target.includes('grocery')) {
                    const grocShop = localShops.find((s: any) => s.category === 'GROCERY');
                    if (grocShop) router.push(`/(customer)/shop/${grocShop.shopId}` as any);
                    else router.push('/(customer)/(tabs)/explore' as any);
                  } else if (target.includes('mobile') || target.includes('repair')) {
                    setIsBrandModalOpen(true);
                  } else if (target.includes('store') || target.includes('product')) {
                    router.push('/(customer)/(tabs)/explore' as any);
                  } else {
                    setIsAllServicesOpen(true);
                  }
                }}
              >
                <View style={styles.offerTextCol}>
                  <View style={styles.offerTagBadge}>
                    <Text style={styles.offerTagBadgeText}>{offer.tag || 'SPECIAL OFFER'}</Text>
                  </View>
                  <Text style={styles.offerCardTitle} numberOfLines={2}>
                    {offer.title}
                  </Text>
                  {offer.subtitle ? (
                    <Text style={styles.offerCardSubtitle} numberOfLines={2}>
                      {offer.subtitle}
                    </Text>
                  ) : null}
                  <View style={styles.offerCtaBtn}>
                    <Text style={styles.offerCtaBtnText}>Claim Offer</Text>
                    <ArrowRight size={13} color='#ffffff' />
                  </View>
                </View>
                <View style={styles.offerImgBox}>
                  <SafeImage uri={offer.imageUrl} style={styles.offerImg} resizeMode='cover' />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Offer Dots Pagination */}
          <View style={styles.dotsPagination}>
            {specialOffers.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dotItem,
                  activeOfferIndex === idx && styles.dotItemActive,
                ]}
              />
            ))}
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
          <ShopRegistrationModal
        visible={isShopRegisterOpen}
        onClose={() => setIsShopRegisterOpen(false)}
        onShopCreated={() => {
          void shopsQuery.refetch();
          setIsMerchantHubOpen(true);
        }}
      />

      <MerchantHubModal
        visible={isMerchantHubOpen}
        onClose={() => setIsMerchantHubOpen(false)}
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
  sectionSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  localShopCard: {
    width: 200,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  shopLogoThumbnail: {
    width: "100%",
    height: 100,
    backgroundColor: "#f1f5f9",
  },
  shopCardContent: {
    padding: 10,
  },
  shopCategoryPill: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  shopCategoryPillText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#dc2626",
    textTransform: "uppercase",
  },
  shopCardName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  shopCardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  shopRatingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  shopRatingText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0f172a",
  },
  shopMetaDot: {
    fontSize: 10,
    color: "#94a3b8",
  },
  shopPrepTime: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  shopCityText: {
    fontSize: 10,
    color: "#94a3b8",
  },
  shopCardActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#fef2f2",
    paddingVertical: 6,
    borderRadius: 8,
  },
  shopCardActionBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#dc2626",
  },
  notifTime: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
    marginTop: 4,
  },
  merchantPartnerBanner: {
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 6,
    backgroundColor: "#991b1b",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#991b1b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  merchantBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  merchantBannerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  merchantTagRow: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 3,
  },
  merchantTagText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#b45309",
    letterSpacing: 0.5,
  },
  merchantBannerTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: 2,
  },
  merchantBannerSub: {
    fontSize: 10,
    color: "#fecaca",
    lineHeight: 14,
  },
  merchantBannerArrowBox: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  merchantBannerActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
  },
  shopFilterScroll: {
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  shopFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8,
  },
  shopFilterChipActive: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
  },
  shopFilterChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  shopFilterChipTextActive: {
    color: "#ffffff",
  },
  foodGroceryHubContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  hubCardFood: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#fee2e2',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'space-between',
  },
  hubCardGrocery: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#dcfce7',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'space-between',
  },
  hubBadgeRed: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  hubBadgeRedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#dc2626',
  },
  hubBadgeGreen: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  hubBadgeGreenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16a34a',
  },
  hubActionTextRed: {
    fontSize: 12,
    fontWeight: '900',
    color: '#dc2626',
  },
  hubActionTextGreen: {
    fontSize: 12,
    fontWeight: '900',
    color: '#16a34a',
  },
  offersSectionContainer: {
    marginBottom: 20,
  },
  offersScrollContent: {
    gap: 12,
    paddingVertical: 4,
  },
  offerSlideCard: {
    width: Dimensions.get('window').width - 32,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  offerTextCol: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'space-between',
  },
  offerTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  offerTagBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  offerCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 20,
  },
  offerCardSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 15,
    marginBottom: 10,
  },
  offerCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  offerCtaBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  offerImgBox: {
    width: 96,
    height: 96,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  offerImg: {
    width: '100%',
    height: '100%',
  },
});
