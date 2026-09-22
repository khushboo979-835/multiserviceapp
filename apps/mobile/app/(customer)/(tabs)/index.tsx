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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../src/store/useAuthStore";
import { useBookingStore } from "../../../src/store/useBookingStore";
import { MOCK_CATEGORIES } from "../../../src/constants/mockData";
import { Category, Subcategory, Booking, BookingStatus } from "../../../src/types";
import DynamicFormBuilder from "../../../src/components/booking/DynamicFormBuilder";
import BrandLogo from "../../../src/components/common/BrandLogo";
import { LocationService, UserAddressDetails } from "../../../src/services/location.service";
import LocationPickerModal from "../../../src/components/location/LocationPickerModal";
import { sendNewJobDispatchNotification } from "../../../src/utils/notifications";
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

  // Fetch dynamic categories from backend API with fallback
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
    ? `${liveLocation.landmark ? `${liveLocation.landmark}, ` : ""}${liveLocation.city || "Patna, Bihar"}`
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
    if (category.subcategories.length === 1) {
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

      // Real-time backend API dispatch
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://multiserviceapp-4pdw.onrender.com/api";
      fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      }).catch((apiErr) => console.warn("Backend booking dispatch sync:", apiErr));

      // Real-time socket broadcast to online partners
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
            paddingTop: insets.top + 10,
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

          <TouchableOpacity
            onPress={() => setIsLocationModalOpen(true)}
            style={styles.refreshGpsButton}
            activeOpacity={0.7}
          >
            <Compass size={18} color="#0f172a" />
          </TouchableOpacity>
        </View>


        {/* User Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>
            Hi, {user?.name || "Customer"} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            What service do you need today?
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#ef4444" />
          <TextInput
            placeholder="Search mobile repair, salon, AC, plumbing..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Active Booking Floating Card */}
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
              <Text style={styles.trackBookingText}>Track Live Booking</Text>
              <ArrowRight size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Hero Promo Banner (Urban Company Style) */}
        <View style={styles.heroPromoBanner}>
          <View style={styles.promoBadge}>
            <Zap size={12} color="#ffffff" />
            <Text style={styles.promoBadgeText}>INSTANT DOORSTEP SERVICE</Text>
          </View>
          <Text style={styles.promoHeading}>Professional Services in 30 Mins ⚡</Text>
          <Text style={styles.promoSubheading}>
            Screen repair, home salon, AC service & electricians at your doorstep with 30-day warranty.
          </Text>
          <View style={styles.promoOfferRow}>
            <View style={styles.offerTag}>
              <Text style={styles.offerTagText}>UP TO 40% OFF</Text>
            </View>
            <Text style={styles.offerSubtext}>Verified & Background Checked Pros</Text>
          </View>
        </View>

        {/* Services Grid (2x2 Cards) */}
        <View style={styles.servicesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Explore Services</Text>
            <Text style={styles.sectionCountText}>{filteredCategories.length} Categories</Text>
          </View>

          <View style={styles.categoryGrid}>
            {filteredCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.85}
                onPress={() => handleCategoryPress(cat)}
                style={styles.categoryCard}
              >
                <View style={styles.categoryIconBox}>
                  {getCategoryIcon(cat.imageUrl, "#ef4444", 26)}
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryDesc} numberOfLines={2}>
                  {cat.description}
                </Text>
                <View style={styles.categoryPricePill}>
                  <Text style={styles.categoryPriceText}>
                    From ₹{cat.subcategories[0]?.basePrice || 499}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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

      {/* Interactive Location Picker Modal */}
      <LocationPickerModal
        visible={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={liveLocation}
        onSelectLocation={(loc) => setLiveLocation(loc)}
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
    paddingHorizontal: 20,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  brandTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  brandTitleText: {
    fontSize: 16,
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
  refreshGpsButton: {
    width: 42,
    height: 42,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  greetingSection: {
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginLeft: 10,
    padding: 0,
  },
  activeBookingCard: {
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
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
    marginBottom: 8,
  },
  activeBookingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeBookingTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginLeft: 8,
  },
  statusBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
  },
  activeBookingId: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  activeBookingOtp: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 14,
  },
  otpHighlight: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ef4444",
  },
  trackBookingButton: {
    backgroundColor: "#ef4444",
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  trackBookingText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    marginRight: 6,
  },
  heroPromoBanner: {
    backgroundColor: "#0f172a",
    borderRadius: 26,
    padding: 22,
    marginBottom: 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  promoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  promoBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  promoHeading: {
    fontSize: 20,
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: 6,
  },
  promoSubheading: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
    lineHeight: 18,
    marginBottom: 14,
  },
  promoOfferRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  offerTag: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  offerTagText: {
    color: "#0f172a",
    fontSize: 11,
    fontWeight: "900",
  },
  offerSubtext: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  servicesSection: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ef4444",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  categoryCard: {
    width: cardWidth,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 180,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryIconBox: {
    width: 54,
    height: 54,
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 15,
    marginBottom: 10,
  },
  categoryPricePill: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: "auto",
  },
  categoryPriceText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },
  guaranteeCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },
  guaranteeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  guaranteeTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
    marginLeft: 8,
  },
  guaranteePillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  guaranteeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 3,
    justifyContent: "center",
  },
  guaranteeItemText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#334155",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "90%",
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalDragHandle: {
    width: 48,
    height: 5,
    backgroundColor: "#cbd5e1",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

