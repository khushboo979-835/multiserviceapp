import React, { useState, useMemo, useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { useBookingStore } from "../../../src/store/useBookingStore";
import { MOCK_CATEGORIES, MOCK_COUPONS } from "../../../src/constants/mockData";
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
  Monitor,
  Search,
  MapPin,
  ChevronRight,
  Sparkles,
  X,
  Compass,
  ArrowRight,
  ShieldCheck,
  Star,
  RefreshCw,
  Clock,
  Award,
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
} from "lucide-react-native";

const getCategoryIcon = (iconName: string, color: string, size: number) => {
  const normalized = (iconName || "").toLowerCase().trim();
  switch (normalized) {
    case "phone":
    case "smartphone":
    case "mobile":
      return <Smartphone size={size} color={color} />;
    case "wind":
    case "ac":
    case "air-conditioner":
      return <Wind size={size} color={color} />;
    case "zap":
    case "electrician":
    case "electricity":
      return <Zap size={size} color={color} />;
    case "droplets":
    case "plumber":
    case "plumbing":
      return <Droplets size={size} color={color} />;
    case "hammer":
    case "carpenter":
    case "carpentry":
      return <Hammer size={size} color={color} />;
    case "sparkles":
    case "cleaning":
    case "home-cleaning":
      return <Sparkles size={size} color={color} />;
    case "scissors":
    case "salon":
    case "beauty":
      return <Scissors size={size} color={color} />;
    case "wrench":
    case "appliance":
    case "appliance-repair":
      return <Wrench size={size} color={color} />;
    case "paint-brush":
    case "paintbrush":
    case "painting":
      return <Paintbrush size={size} color={color} />;
    case "camera":
    case "cctv":
    case "cctv-installation":
      return <Camera size={size} color={color} />;
    case "droplet":
    case "ro":
    case "water":
    case "ro-service":
      return <Droplet size={size} color={color} />;
    case "monitor":
    case "computer":
    case "laptop":
      return <Monitor size={size} color={color} />;
    case "disc":
    case "washing":
    case "washing-machine":
      return <Disc size={size} color={color} />;
    case "snowflake":
    case "fridge":
    case "refrigerator":
      return <Snowflake size={size} color={color} />;
    case "bug":
    case "pest":
    case "pest-control":
      return <Bug size={size} color={color} />;
    default:
      return <Sparkles size={size} color={color} />;
  }
};

const getCategoryTheme = (iconName?: string, catId?: string) => {
  const norm = (iconName || catId || "").toLowerCase().trim();
  if (norm.includes("phone") || norm.includes("mobile") || norm.includes("smartphone")) {
    return {
      iconColor: "#ef4444",
      iconBg: "#fee2e2",
      borderColor: "#fecaca",
      badgeBg: "#fef2f2",
      badgeText: "#dc2626",
    };
  }
  if (norm.includes("wind") || norm.includes("ac") || norm.includes("cool")) {
    return {
      iconColor: "#0284c7",
      iconBg: "#e0f2fe",
      borderColor: "#bae6fd",
      badgeBg: "#f0f9ff",
      badgeText: "#0369a1",
    };
  }
  if (norm.includes("zap") || norm.includes("electr")) {
    return {
      iconColor: "#d97706",
      iconBg: "#fef3c7",
      borderColor: "#fde68a",
      badgeBg: "#fffbeb",
      badgeText: "#b45309",
    };
  }
  if (norm.includes("droplet") || norm.includes("plumb")) {
    return {
      iconColor: "#4f46e5",
      iconBg: "#e0e7ff",
      borderColor: "#c7d2fe",
      badgeBg: "#eef2ff",
      badgeText: "#4338ca",
    };
  }
  if (norm.includes("sparkle") || norm.includes("clean")) {
    return {
      iconColor: "#16a34a",
      iconBg: "#dcfce7",
      borderColor: "#bbf7d0",
      badgeBg: "#f0fdf4",
      badgeText: "#15803d",
    };
  }
  if (norm.includes("hammer") || norm.includes("carpent") || norm.includes("wood")) {
    return {
      iconColor: "#ea580c",
      iconBg: "#ffedd5",
      borderColor: "#fed7aa",
      badgeBg: "#fff7ed",
      badgeText: "#c2410c",
    };
  }
  if (norm.includes("scissor") || norm.includes("salon") || norm.includes("beauty") || norm.includes("spa")) {
    return {
      iconColor: "#db2777",
      iconBg: "#fce7f3",
      borderColor: "#fbcfe8",
      badgeBg: "#fdf2f8",
      badgeText: "#be185d",
    };
  }
  if (norm.includes("paint") || norm.includes("brush")) {
    return {
      iconColor: "#9333ea",
      iconBg: "#f3e8ff",
      borderColor: "#e9d5ff",
      badgeBg: "#faf5ff",
      badgeText: "#7e22ce",
    };
  }
  if (norm.includes("bug") || norm.includes("pest")) {
    return {
      iconColor: "#059669",
      iconBg: "#d1fae5",
      borderColor: "#a7f3d0",
      badgeBg: "#ecfdf5",
      badgeText: "#047857",
    };
  }
  if (norm.includes("truck") || norm.includes("mover") || norm.includes("pack")) {
    return {
      iconColor: "#2563eb",
      iconBg: "#dbeafe",
      borderColor: "#bfdbfe",
      badgeBg: "#eff6ff",
      badgeText: "#1d4ed8",
    };
  }
  if (norm.includes("camera") || norm.includes("cctv") || norm.includes("security")) {
    return {
      iconColor: "#475569",
      iconBg: "#f1f5f9",
      borderColor: "#e2e8f0",
      badgeBg: "#f8fafc",
      badgeText: "#334155",
    };
  }
  return {
    iconColor: "#ef4444",
    iconBg: "#fef2f2",
    borderColor: "#fee2e2",
    badgeBg: "#fff1f2",
    badgeText: "#e11d48",
  };
};

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
    bookingHistory,
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

  // New Feature Modals
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isAllServicesOpen, setIsAllServicesOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isLangCityOpen, setIsLangCityOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callType, setCallType] = useState<"AUDIO" | "VIDEO">("AUDIO");

  // Preferences State
  const [selectedCity, setSelectedCity] = useState("Patna");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "hinglish">("en");

  // 1. Fetch dynamic categories and listen to real-time Firestore updates
  useEffect(() => {
    // A. Backend API Sync
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

    // B. Real-time Firestore Categories Listener
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

      // C. Real-time Push Notifications listener from Admin
      const unsubNotif = onSnapshot(
        query(collection(db, "broadcast_notifications"), orderBy("sentAt", "desc"), limit(1)),
        (snap) => {
          if (!snap.empty) {
            const notif = snap.docs[0].data();
            // Show in-app banner if created within last 2 minutes
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

  const userLocationText = liveLocation
    ? `${liveLocation.landmark ? `${liveLocation.landmark}, ` : ""}${liveLocation.city || selectedCity || "Patna, Bihar"}`
    : "Detecting Location...";

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.subcategories.some((sub) => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [categories, searchQuery]);

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category);
    if (category.subcategories.length >= 1) {
      handleSubcategoryPress(category.subcategories[0]);
    }
  };

  const handleSubcategoryPress = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setCurrentPrice(subcategory.basePrice);
    initDraftBooking(subcategory.categoryId, subcategory.id, subcategory.basePrice);
    setIsFormOpen(true);
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
        customerName: user?.name || "Verified Customer",
        customerPhone: user?.phoneNumber || "+91 78570 23438",
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

      // 1. Direct Real-Time Firestore Save (instantly streams to Admin Dashboard)
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

      // 2. Real-time backend API dispatch
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";
      fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      }).catch((apiErr) => console.warn("Backend booking dispatch sync:", apiErr));

      // 3. Real-time socket broadcast to online partners
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

      // Ring sound / alert notification
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
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <BrandLogo size="sm" showText={false} />
            <View style={styles.brandTitleContainer}>
              <Text style={styles.brandTitleText}>INISHA CITY SERVICE</Text>
              <TouchableOpacity
                onPress={() => setIsLocationModalOpen(true)}
                style={styles.locationPill}
                activeOpacity={0.7}
              >
                {detectingGps ? (
                  <ActivityIndicator size="small" color="#ef4444" style={{ marginRight: 4 }} />
                ) : (
                  <MapPin size={13} color="#ef4444" />
                )}
                <Text style={styles.locationText} numberOfLines={1}>
                  {userLocationText}
                </Text>
                <ChevronRight size={13} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Header Action Buttons */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              onPress={() => setIsLangCityOpen(true)}
              style={styles.iconCircleBtn}
              activeOpacity={0.7}
            >
              <Globe size={18} color="#0f172a" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsAdminOpen(true)}
              style={[styles.iconCircleBtn, { backgroundColor: "#fef2f2", borderColor: "#fca5a5" }]}
              activeOpacity={0.7}
            >
              <ShieldAlert size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Greeting & Switcher */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>
            Hi, {user?.name || "Customer"} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            Certified doorstep repair, salon & instant delivery in 30 mins.
          </Text>
        </View>

        {/* Services vs Store Primary Tab Bar */}
        <View style={styles.primaryTabsRow}>
          <TouchableOpacity
            style={[styles.primaryTabBtn, styles.primaryTabBtnActive]}
            activeOpacity={0.85}
          >
            <Sparkles size={16} color="#ffffff" />
            <Text style={styles.primaryTabBtnTextActive}>15 Doorstep Services</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsStoreOpen(true)}
            style={styles.primaryTabBtn}
            activeOpacity={0.85}
          >
            <ShoppingBag size={16} color="#ef4444" />
            <Text style={styles.primaryTabBtnText}>Quick Store 🛒</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar with Voice Mic & AI */}
        <View style={styles.searchBar}>
          <Search size={18} color="#ef4444" />
          <TextInput
            placeholder="Search mobile repair, AC, plumber, grocery..."
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
            <Mic size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* AI Assistant Banner */}
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
                <Text style={styles.aiLiveText}>24x7 Support</Text>
              </View>
            </View>
            <Text style={styles.aiBannerSub}>
              Ask about repair costs, diagnose phone/AC issues & get instant booking help
            </Text>
          </View>
          <ChevronRight size={18} color="#ef4444" />
        </TouchableOpacity>

        {/* Active Booking Tracker with Full Actions */}
        {activeBooking && (
          <View style={styles.activeBookingCard}>
            <View style={styles.activeBookingHeader}>
              <View style={styles.activeBookingTitleRow}>
                <Compass size={20} color="#ef4444" />
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

            {/* Quick Action Pills: Call, Video Call, Invoice, Rate */}
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
                <Text style={styles.quickActionText}>GST Invoice</Text>
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

        {/* Promo Coupon Bar */}
        <View style={styles.couponBannerRow}>
          <Tag size={16} color="#ef4444" />
          <Text style={styles.couponBannerText}>
            Use code <Text style={{ fontWeight: "900", color: "#ef4444" }}>INISHA50</Text> for 20% OFF on all services!
          </Text>
        </View>

        {/* Services Grid (All 15 Core Home & Repair Services) */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Explore Services</Text>
              <Text style={styles.sectionCountText}>{filteredCategories.length} Categories Available</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsAllServicesOpen(true)}
              style={styles.viewAllBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllBtnText}>सभी Services ➔</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            {filteredCategories.map((cat) => {
              const theme = getCategoryTheme(cat.imageUrl, cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.85}
                  onPress={() => handleCategoryPress(cat)}
                  style={[styles.categoryCard, { borderColor: theme.borderColor }]}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: theme.iconBg, borderColor: theme.borderColor }]}>
                    {getCategoryIcon(cat.imageUrl, theme.iconColor, 24)}
                  </View>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {cat.name}
                  </Text>
                  <Text style={styles.categoryDesc} numberOfLines={2}>
                    {cat.description}
                  </Text>
                  <View style={[styles.categoryPricePill, { backgroundColor: theme.badgeBg, borderColor: theme.borderColor }]}>
                    <Text style={[styles.categoryPriceText, { color: theme.badgeText }]}>
                      From ₹{cat.subcategories[0]?.basePrice || 499}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
              Chat directly with our Patna operations hub for custom bookings
            </Text>
          </View>
          <ArrowRight size={16} color="#16a34a" />
        </TouchableOpacity>

        {/* Quality Assurance Guarantees */}
        <View style={styles.guaranteeCard}>
          <View style={styles.guaranteeHeaderRow}>
            <ShieldCheck size={22} color="#ef4444" />
            <Text style={styles.guaranteeTitle}>Inisha City Guarantee</Text>
          </View>

          <View style={styles.guaranteePillsRow}>
            <View style={styles.guaranteeItem}>
              <Award size={16} color="#16a34a" />
              <Text style={styles.guaranteeItemText}>Verified Pros</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Star size={16} color="#f59e0b" />
              <Text style={styles.guaranteeItemText}>Fixed Pricing</Text>
            </View>
            <View style={styles.guaranteeItem}>
              <Clock size={16} color="#3b82f6" />
              <Text style={styles.guaranteeItemText}>30-Day Warranty</Text>
            </View>
          </View>
        </View>
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

const screenWidth = Dimensions.get("window").width;
const cardWidth = (screenWidth - 40 - 14) / 2;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  brandTitleContainer: {
    marginLeft: 10,
    flex: 1,
  },
  brandTitleText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginLeft: 4,
    marginRight: 4,
    flexShrink: 1,
  },
  headerRightActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  greetingSection: {
    marginBottom: 12,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
  },
  primaryTabsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  primaryTabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  primaryTabBtnActive: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  primaryTabBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  primaryTabBtnTextActive: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginLeft: 8,
    padding: 0,
  },
  voiceMicBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  aiAssistantBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
  },
  aiBadgeBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  aiBannerTitle: {
    fontSize: 14,
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
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
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
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginLeft: 6,
  },
  statusBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
  },
  activeBookingId: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  activeBookingOtp: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginTop: 2,
  },
  otpHighlight: {
    color: "#ef4444",
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
    borderColor: "#fca5a5",
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
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  trackBookingText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  couponBannerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 8,
  },
  couponBannerText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
    flex: 1,
  },
  servicesSection: {
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0f172a",
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 1,
  },
  viewAllBtn: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ef4444",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryCard: {
    width: cardWidth,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 12,
  },
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 3,
  },
  categoryDesc: {
    fontSize: 10,
    color: "#64748b",
    lineHeight: 14,
    height: 28,
  },
  categoryPricePill: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryPriceText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ef4444",
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
  guaranteeCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
  },
  guaranteeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  guaranteePillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  guaranteeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  guaranteeItemText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
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
