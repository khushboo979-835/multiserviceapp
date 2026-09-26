import React, { useState, useMemo, useEffect, useRef } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { useBookingStore } from "../../../src/store/useBookingStore";
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_COUPONS } from "../../../src/constants/mockData";
import { Category, Subcategory, Booking, BookingStatus } from "../../../src/types";
import DynamicFormBuilder from "../../../src/components/booking/DynamicFormBuilder";
import BrandLogo from "../../../src/components/common/BrandLogo";
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
} from "lucide-react-native";

const BANNER_SLIDES = [
  {
    id: "banner_1",
    tag: "INISHA",
    title: "Professional Services at\nYour Doorstep | Book Now",
    buttonText: "Book Now",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
    action: "SERVICES",
  },
  {
    id: "banner_2",
    tag: "BEST DEALS",
    title: "Best Deals on Mobiles &\nAccessories | Fast Delivery",
    buttonText: "Shop Deals",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
    action: "STORE",
  },
  {
    id: "banner_3",
    tag: "INSTANT GROCERY",
    title: "Grocery & Daily Needs\nDelivered in 20 Mins",
    buttonText: "Order Now",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    action: "STORE",
  },
];

const SUGGESTIONS = [
  "Electrician",
  "Parlour",
  "Mobile",
  "Grocery",
  "AC Repair",
  "Cleaning",
];

const POPULAR_SERVICES_DATA = [
  {
    id: "pop_clean",
    name: "Deep Home Cleaning",
    rating: 4.8,
    price: 799,
    subtitle: "Availability is only",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
    categoryId: "cat_cleaning",
  },
  {
    id: "pop_salon",
    name: "Salon for Women",
    rating: 4.8,
    price: 799,
    subtitle: "Availability is only",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
    categoryId: "cat_salon",
  },
  {
    id: "pop_ac",
    name: "AC Repair & Service",
    rating: 4.8,
    price: 799,
    subtitle: "Doorstep technician",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
    categoryId: "cat_ac_repair",
  },
  {
    id: "pop_mobile",
    name: "Mobile Screen Repair",
    rating: 4.9,
    price: 499,
    subtitle: "Doorstep in 60 Mins",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
    categoryId: "cat_mobile",
  },
];

const TOP_DEALS_DATA = [
  {
    id: "deal_1",
    name: "Wireless Earbuds",
    originalPrice: 1599,
    price: 299,
    discount: "15% OFF",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80",
  },
  {
    id: "deal_2",
    name: "Fresh Organic Fruits",
    originalPrice: 1000,
    price: 199,
    discount: "15% OFF",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80",
  },
  {
    id: "deal_3",
    name: "Smartphone Case",
    originalPrice: 1699,
    price: 279,
    discount: "63% OFF",
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&q=80",
  },
  {
    id: "deal_4",
    name: "65W Fast Charger",
    originalPrice: 1499,
    price: 699,
    discount: "53% OFF",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80",
  },
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

  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
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

  // 1. Fetch live categories from backend & Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";
        const res = await fetch(`${API_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
          }
        }
      } catch (err) {
        console.log("Using cached/fallback categories:", err);
      }
    };
    fetchCategories();

    try {
      const unsubCat = onSnapshot(collection(db, "categories"), (snap) => {
        if (!snap.empty) {
          const liveCats: Category[] = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            liveCats.push({
              id: docSnap.id,
              name: d.name || "Service",
              slug: d.slug || docSnap.id,
              isActive: d.isActive ?? true,
              imageUrl: d.imageUrl || "sparkles",
              description: d.description || "",
              subcategories: d.subcategories || [
                {
                  id: `sub_${docSnap.id}`,
                  categoryId: docSnap.id,
                  name: d.name || "Doorstep Service",
                  slug: `sub_${docSnap.id}`,
                  basePrice: d.basePrice || 499,
                  formConfig: d.fields || { fields: [] },
                },
              ],
            });
          });
          if (liveCats.length > 0) setCategories(liveCats);
        }
      });

      const unsubNotif = onSnapshot(
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

      return () => {
        unsubCat();
        unsubNotif();
      };
    } catch {}
  }, []);

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
        customerPhone: user?.phoneNumber || "+91 73520 82614",
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
      "Hello Inisha City Service Team! I need doorstep service assistance."
    );
    Linking.openURL(`https://wa.me/917352082614?text=${message}`).catch(() => {
      Alert.alert("WhatsApp Support", "Reach us at +91 73520 82614 on WhatsApp.");
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
      >
        {/* 1. Header: Deliver/Service at Sultanganj + Bell & Avatar (Matching Image 1) */}
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
              onPress={() => {
                Alert.alert("Notifications", "You have no unread notifications right now.");
              }}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <Bell size={20} color="#0f172a" />
              <View style={styles.bellBadge} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(customer)/(tabs)/profile")}
              style={styles.avatarBtn}
              activeOpacity={0.7}
            >
              <View style={styles.avatarCircle}>
                <User size={20} color="#3b82f6" />
              </View>
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

        {/* 3. Hero Carousel Banners (Matching Image 1) */}
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
            {BANNER_SLIDES.map((banner) => (
              <View key={banner.id} style={styles.bannerSlideCard}>
                <View style={styles.bannerTextContent}>
                  <Text style={styles.bannerTagText}>{banner.tag}</Text>
                  <Text style={styles.bannerTitleText}>{banner.title}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (banner.action === "STORE") setIsStoreOpen(true);
                      else setIsAllServicesOpen(true);
                    }}
                    style={styles.bannerActionBtn}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.bannerActionBtnText}>{banner.buttonText}</Text>
                  </TouchableOpacity>
                </View>
                <Image source={{ uri: banner.image }} style={styles.bannerImage} />
              </View>
            ))}
          </ScrollView>

          {/* Dots Pagination */}
          <View style={styles.dotsPagination}>
            {BANNER_SLIDES.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dotItem,
                  activeBannerIndex === idx && styles.dotItemActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 4. Explore Categories: 8 Circular Colorful Icons (Matching Image 1) */}
        <View style={styles.exploreSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Explore Categories</Text>
            <TouchableOpacity onPress={() => setIsAllServicesOpen(true)}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.circularCategoriesGrid}>
            {/* 1. Mobile */}
            <TouchableOpacity
              onPress={() => setIsBrandModalOpen(true)}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#dbeafe" }]}>
                <Smartphone size={24} color="#2563eb" />
              </View>
              <Text style={styles.circularCatLabel}>Mobile</Text>
            </TouchableOpacity>

            {/* 2. Grocery */}
            <TouchableOpacity
              onPress={() => setIsStoreOpen(true)}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#ffedd5" }]}>
                <ShoppingCart size={24} color="#ea580c" />
              </View>
              <Text style={styles.circularCatLabel}>Grocery</Text>
            </TouchableOpacity>

            {/* 3. Parlour */}
            <TouchableOpacity
              onPress={() => {
                const found = categories.find((c) => c.id === "cat_salon" || c.name.toLowerCase().includes("salon"));
                if (found) handleCategoryPress(found);
                else setIsAllServicesOpen(true);
              }}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#fce7f3" }]}>
                <Scissors size={24} color="#db2777" />
              </View>
              <Text style={styles.circularCatLabel}>Parlour</Text>
            </TouchableOpacity>

            {/* 4. Electrician */}
            <TouchableOpacity
              onPress={() => {
                const found = categories.find((c) => c.id === "cat_electrician" || c.name.toLowerCase().includes("electric"));
                if (found) handleCategoryPress(found);
                else setIsAllServicesOpen(true);
              }}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#fef3c7" }]}>
                <Zap size={24} color="#d97706" />
              </View>
              <Text style={styles.circularCatLabel}>Electrician</Text>
            </TouchableOpacity>

            {/* 5. Plumber */}
            <TouchableOpacity
              onPress={() => {
                const found = categories.find((c) => c.id === "cat_plumber" || c.name.toLowerCase().includes("plumb"));
                if (found) handleCategoryPress(found);
                else setIsAllServicesOpen(true);
              }}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#ede9fe" }]}>
                <Wrench size={24} color="#7c3aed" />
              </View>
              <Text style={styles.circularCatLabel}>Plumber</Text>
            </TouchableOpacity>

            {/* 6. AC Repair */}
            <TouchableOpacity
              onPress={() => {
                const found = categories.find((c) => c.id === "cat_ac_repair" || c.name.toLowerCase().includes("ac"));
                if (found) handleCategoryPress(found);
                else setIsAllServicesOpen(true);
              }}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#cffafe" }]}>
                <Snowflake size={24} color="#0891b2" />
              </View>
              <Text style={styles.circularCatLabel}>AC Repair</Text>
            </TouchableOpacity>

            {/* 7. Cleaning */}
            <TouchableOpacity
              onPress={() => {
                const found = categories.find((c) => c.id === "cat_cleaning" || c.name.toLowerCase().includes("clean"));
                if (found) handleCategoryPress(found);
                else setIsAllServicesOpen(true);
              }}
              style={styles.circularCatItem}
              activeOpacity={0.8}
            >
              <View style={[styles.circularIconBox, { backgroundColor: "#fef9c3" }]}>
                <Sparkles size={24} color="#ca8a04" />
              </View>
              <Text style={styles.circularCatLabel}>Cleaning</Text>
            </TouchableOpacity>

            {/* 8. More */}
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

        {/* 5. Popular Services (Horizontal Cards with Real Photos & Book Now button - Image 1) */}
        <View style={styles.popularServicesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {POPULAR_SERVICES_DATA.map((srv) => (
              <View key={srv.id} style={styles.popularServiceCard}>
                <Image source={{ uri: srv.image }} style={styles.popularServiceImg} />
                <View style={styles.popularServiceContent}>
                  <Text style={styles.popularServiceName} numberOfLines={1}>
                    {srv.name}
                  </Text>
                  <View style={styles.ratingRow}>
                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.ratingText}>{srv.rating} Rating</Text>
                  </View>

                  <View style={styles.popularServiceBottomRow}>
                    <View>
                      <Text style={styles.startingLabel}>{srv.subtitle}</Text>
                      <Text style={styles.popularPriceText}>Starting ₹{srv.price}</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        const found = categories.find((c) => c.id === srv.categoryId);
                        if (found) handleCategoryPress(found);
                        else setIsAllServicesOpen(true);
                      }}
                      style={styles.bookNowBtn}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.bookNowBtnText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 6. Top Deals (Horizontal Cards with Real Product Photos & Add button - Image 1) */}
        <View style={styles.topDealsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Top Deals</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {TOP_DEALS_DATA.map((deal) => (
              <View key={deal.id} style={styles.topDealCard}>
                <Image source={{ uri: deal.image }} style={styles.topDealImg} />
                {deal.discount && (
                  <View style={styles.dealDiscountBadge}>
                    <Text style={styles.dealDiscountText}>{deal.discount}</Text>
                  </View>
                )}

                <View style={styles.topDealContent}>
                  <Text style={styles.topDealName} numberOfLines={1}>
                    {deal.name}
                  </Text>
                  <Text style={styles.dealOriginalPrice}>₹{deal.originalPrice}</Text>

                  <View style={styles.topDealBottomRow}>
                    <Text style={styles.dealFinalPrice}>₹{deal.price}</Text>
                    <TouchableOpacity
                      onPress={() => setIsStoreOpen(true)}
                      style={styles.dealAddBtn}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.dealAddBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
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
              Helpline: +91 73520 82614 | Chat for custom bookings & spares
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

      {/* Brand Repair / Sell / Buy Modal (Image 5) */}
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
              `${mode} Request Registered`,
              `Brand: ${brand} | Model: ${model || "Default"} | Mode: ${mode}. Our doorstep technician will assist you.`
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
        technicianPhone={activeBooking?.providerPhone || "+91 73520 82614"}
        callType={callType}
      />

      <InAppAdminPortalModal
        visible={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onAddCategory={(newCat) => setCategories([newCat, ...categories])}
      />

      <AllServicesModal
        visible={isAllServicesOpen}
        onClose={() => setIsAllServicesOpen(false)}
        categories={categories}
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
});
