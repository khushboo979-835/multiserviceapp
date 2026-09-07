import React, { useState, useMemo, useCallback } from "react";
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  StyleSheet 
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { fetchServices } from "@/services/firestoreService";
import { ServiceCardSkeleton } from "@/components/ui/SkeletonLoader";
import { ServiceItem } from "@/types";
import * as Location from "expo-location";
import Animated, { FadeInUp, FadeInDown, Layout } from "react-native-reanimated";
import { 
  Search, 
  MapPin, 
  Bell, 
  ChevronRight, 
  Sparkles,
  X,
  Compass,
  Star,
  Clock,
  ShieldCheck,
  Award,
  Zap,
  Scissors,
  Wrench,
  Smartphone,
  CheckCircle,
  Truck,
  ShoppingCart,
  Activity,
  Heart
} from "lucide-react-native";

const CATEGORIES = [
  "All", 
  "Quick Delivery & Courier",
  "Home Repair & Utilities",
  "Home Cleaning & Housekeeping", 
  "Salon, Beauty & Spa", 
  "Grocery & Daily Essentials",
  "Healthcare & Medical Care",
  "Gadgets & Laptop Repair"
];

// 6 Core Pillars Exactly Matching the Logo Badges
const CATEGORY_SHORTCUTS = [
  { id: "Quick Delivery & Courier", label: "Delivery", icon: "truck", color: "#f59e0b", bg: "#451a03", border: "#f59e0b" },
  { id: "Home Repair & Utilities", label: "Repairs", icon: "wrench", color: "#38bdf8", bg: "#082f49", border: "#0284c7" },
  { id: "Home Cleaning & Housekeeping", label: "Cleaning", icon: "sparkles", color: "#10b981", bg: "#022c22", border: "#10b981" },
  { id: "Salon, Beauty & Spa", label: "Salon & Spa", icon: "scissors", color: "#ec4899", bg: "#500724", border: "#ec4899" },
  { id: "Grocery & Daily Essentials", label: "Grocery", icon: "shopping-cart", color: "#ef4444", bg: "#450a0a", border: "#ef4444" },
  { id: "Healthcare & Medical Care", label: "Doctor & Care", icon: "activity", color: "#14b8a6", bg: "#042f2e", border: "#14b8a6" },
];

const fallbackCardImage = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80";

const ServiceCard = React.memo(({ 
  service, 
  onSelect 
}: { 
  service: ServiceItem; 
  onSelect: (service: ServiceItem) => void;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSelect(service)}
      style={styles.serviceCard}
    >
      <View style={styles.cardImageContainer}>
        <Image 
          source={{ uri: service.imageUrl || fallbackCardImage }} 
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardCategoryChip}>
          <Text style={styles.cardCategoryText}>{service.category.split("&")[0].trim()}</Text>
        </View>
        <View style={styles.cardRatingFloating}>
          <Star size={10} color="#f59e0b" fill="#f59e0b" />
          <Text style={styles.ratingText}>{service.rating || "4.8"}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {service.title}
        </Text>
        <View style={styles.cardMetaRow}>
          <Clock size={11} color="#64748b" />
          <Text style={styles.cardDurationText}>{service.duration}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.priceLabel}>Starting</Text>
          <Text style={styles.priceValue}>₹{service.price}</Text>
        </View>
        <View style={styles.bookMiniBtn}>
          <Text style={styles.bookMiniBtnText}>Book</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function CustomerHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuthStore();
  const { activeBooking } = useBookingStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("All");
  const [currentLocationText, setCurrentLocationText] = useState(user?.selectedLocation || "Cyber City, Gurugram");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");

  const POPULAR_HUBS = [
    { title: "Cyber City, Gurugram", state: "Haryana, 122002" },
    { title: "Golf Course Road, Gurugram", state: "Haryana, 122003" },
    { title: "Indiranagar, Bengaluru", state: "Karnataka, 560038" },
    { title: "Koramangala, Bengaluru", state: "Karnataka, 560034" },
    { title: "Connaught Place, New Delhi", state: "Delhi, 110001" },
    { title: "Bandra West, Mumbai", state: "Maharashtra, 400050" },
    { title: "Hitech City, Hyderabad", state: "Telangana, 500081" },
    { title: "Salt Lake, Kolkata", state: "West Bengal, 700091" },
  ];

  // TanStack Query with automatic caching
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["servicesCatalog"],
    queryFn: fetchServices,
    staleTime: 1000 * 60 * 5,
  });

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      let matchesCategory = false;
      if (selectedCategoryTab === "All") {
        matchesCategory = true;
      } else {
        matchesCategory = srv.category.toLowerCase().includes(selectedCategoryTab.toLowerCase()) ||
                          selectedCategoryTab.toLowerCase().includes(srv.category.toLowerCase());
      }

      const matchesSearch = !searchQuery || 
        srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategoryTab, searchQuery]);

  const handleOpenBooking = useCallback((service: ServiceItem) => {
    router.push({
      pathname: "/(customer)/service/[id]",
      params: { id: service.id },
    });
  }, [router]);

  const [isGpsLoading, setIsGpsLoading] = useState(false);

  const handleFetchCurrentGpsLocation = async () => {
    setIsGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        const fallback = "Cyber City, DLF Phase 2, Gurugram";
        setCurrentLocationText(fallback);
        updateUser({ selectedLocation: fallback });
        setIsLocationModalOpen(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      const reverseList = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (reverseList && reverseList.length > 0) {
        const place = reverseList[0];
        const parts = [
          place.name,
          place.street,
          place.district || place.subregion,
          place.city,
          place.region
        ].filter(Boolean);

        const uniqueParts = Array.from(new Set(parts));
        const formattedLoc = uniqueParts.slice(0, 3).join(", ") || `${place.city || "Gurugram"}, ${place.region || "Haryana"}`;

        setCurrentLocationText(formattedLoc);
        updateUser({ 
          selectedLocation: formattedLoc,
          address: [formattedLoc],
          savedAddresses: [
            {
              id: "gps_current",
              type: "Home",
              flatNo: place.name || "",
              street: place.street || formattedLoc,
              city: place.city || "Gurugram",
              pincode: place.postalCode || "122002",
              formattedAddress: formattedLoc,
              isDefault: true,
            }
          ]
        });
      } else {
        const coordsText = `Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`;
        setCurrentLocationText(coordsText);
        updateUser({ selectedLocation: coordsText });
      }
    } catch (err) {
      console.warn("GPS Location fetch warning:", err);
      const defaultLoc = "Cyber City, DLF Phase 2, Gurugram";
      setCurrentLocationText(defaultLoc);
      updateUser({ selectedLocation: defaultLoc });
    } finally {
      setIsGpsLoading(false);
      setIsLocationModalOpen(false);
    }
  };

  const handleSelectLocation = (locTitle: string) => {
    setCurrentLocationText(locTitle);
    updateUser({ selectedLocation: locTitle });
    setIsLocationModalOpen(false);
  };

  const renderShortcutIcon = (iconName: string, color: string) => {
    switch(iconName) {
      case "truck": return <Truck size={18} color={color} />;
      case "wrench": return <Wrench size={18} color={color} />;
      case "scissors": return <Scissors size={18} color={color} />;
      case "shopping-cart": return <ShoppingCart size={18} color={color} />;
      case "activity": return <Activity size={18} color={color} />;
      case "smartphone": return <Smartphone size={18} color={color} />;
      default: return <Sparkles size={18} color={color} />;
    }
  };

  const filteredHubs = POPULAR_HUBS.filter(h => 
    !locationSearchQuery || 
    h.title.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
    h.state.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  return (
    <View style={[styles.screenContainer, { paddingTop: Math.max(insets.top + 10, 36) }]}>
      <ScrollView 
        style={styles.mainScroll} 
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Top bar with Inisha Logo and location header */}
        <Animated.View entering={FadeInUp.duration(500)} style={styles.topBar}>
          <View style={styles.brandHeaderLeft}>
            <View style={styles.headerLogoContainer}>
              <Image 
                source={require("../../../assets/logo.png")} 
                style={styles.headerLogoImg}
                resizeMode="contain"
              />
            </View>
            <View style={{ marginLeft: 10 }}>
              <View style={styles.locationLabelRow}>
                <MapPin size={12} color="#f59e0b" />
                <Text style={styles.locationLabel}>DELIVERING TO</Text>
              </View>
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => setIsLocationModalOpen(true)}
                style={styles.locationTitleRow}
              >
                <Text style={styles.locationTitleText} numberOfLines={1}>{currentLocationText}</Text>
                <ChevronRight size={14} color="#8b5cf6" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => router.push("/(customer)/(tabs)/bookings")}
            style={styles.bellButton}
          >
            <Bell size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Welcome greeting with App Brand Subtitle */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.greetingBox}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.greetingName}>
              Hi, {user?.name || user?.fullName || "Member"} 👋
            </Text>
            <View style={styles.inishaBadge}>
              <Text style={styles.inishaBadgeText}>INISHA HUB</Text>
            </View>
          </View>
          <Text style={styles.greetingSubtitle}>Your Need, Our Service • 30-Min Doorstep Guarantee</Text>
        </Animated.View>

        {/* Search bar */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.searchBar}>
          <Search size={18} color="#64748b" />
          <TextInput
            placeholder="Search parcel, electrician, plumber, salon, doctor..."
            placeholderTextColor="#475569"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </Animated.View>

        {/* 6 Core Pillars Matching the Logo Badges */}
        <View style={styles.shortcutRow}>
          {CATEGORY_SHORTCUTS.map((item) => {
            const isSelected = selectedCategoryTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => setSelectedCategoryTab(isSelected ? "All" : item.id)}
                style={styles.shortcutItem}
              >
                <View style={[
                  styles.shortcutIconBox, 
                  { backgroundColor: item.bg, borderColor: isSelected ? "#ffffff" : item.border, borderWidth: isSelected ? 2.5 : 1 }
                ]}>
                  {renderShortcutIcon(item.icon, item.color)}
                </View>
                <Text style={[styles.shortcutLabel, isSelected && { color: item.color, fontWeight: "800" }]} numberOfLines={1}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Inisha Quality Guarantee Promotional Banner */}
        <View style={styles.qualityBanner}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <ShieldCheck size={16} color="#10b981" />
              <Text style={styles.qualityBannerTitle}>Inisha Quality Assured</Text>
            </View>
            <Text style={styles.qualityBannerSub}>30-Day Free Rework Guarantee • 100% Upfront Pricing</Text>
          </View>
          <View style={styles.qualityBannerBadge}>
            <Text style={styles.qualityBannerBadgeText}>4.9 ★</Text>
          </View>
        </View>

        {/* Category horizontal tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategoryTab === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => setSelectedCategoryTab(cat)}
                style={[
                  styles.categoryChip,
                  isSelected ? styles.categoryChipSelected : styles.categoryChipNormal
                ]}
              >
                <Text style={[styles.categoryChipText, isSelected ? styles.categoryChipTextSelected : styles.categoryChipTextNormal]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active Booking Tracker Banner */}
        {activeBooking && (
          <Animated.View 
            entering={FadeInDown.duration(500)}
            layout={Layout.springify()}
            style={styles.activeBookingBanner}
          >
            <View style={styles.activeBannerHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Compass size={18} color="#8b5cf6" />
                <Text style={styles.activeBannerTitle}>Live Order Tracker</Text>
              </View>
              <Text style={styles.activeBannerStatus}>
                {activeBooking.status}
              </Text>
            </View>
            <Text style={styles.activeBannerServiceName}>
              {activeBooking.serviceName || "Active Service"}
            </Text>
            <Text style={styles.activeBannerOtp}>
              OTP Verification Code: <Text style={{ color: "#8b5cf6", fontWeight: "bold" }}>{activeBooking.otp || "7821"}</Text>
            </Text>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => {
                router.push({
                  pathname: "/(customer)/track-booking/[id]",
                  params: { id: activeBooking.id },
                });
              }}
              style={styles.trackButton}
            >
              <Text style={styles.trackButtonText}>Track Live Status</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Services Grid */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Services ({filteredServices.length})</Text>
            {isLoading && <ActivityIndicator size="small" color="#8b5cf6" />}
          </View>

          {isLoading ? (
            <View style={styles.servicesGrid}>
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
              <ServiceCardSkeleton />
            </View>
          ) : filteredServices.length === 0 ? (
            <View style={styles.emptyCard}>
              <Sparkles size={32} color="#64748b" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No services found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search term or category filter.
              </Text>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {filteredServices.map((srv) => (
                <ServiceCard key={srv.id} service={srv} onSelect={handleOpenBooking} />
              ))}
            </View>
          )}
        </Animated.View>
        
      </ScrollView>

      {/* Interactive Location Selector Modal */}
      <Modal
        visible={isLocationModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLocationModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Select Service Location</Text>
                <Text style={styles.modalHeaderSub}>Choose doorstep service address</Text>
              </View>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setIsLocationModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <X size={18} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            {/* Location Search */}
            <View style={styles.modalSearchBox}>
              <Search size={16} color="#64748b" />
              <TextInput
                placeholder="Search area, landmark, city..."
                placeholderTextColor="#475569"
                value={locationSearchQuery}
                onChangeText={setLocationSearchQuery}
                style={styles.modalSearchInput}
              />
              {locationSearchQuery ? (
                <TouchableOpacity onPress={() => setLocationSearchQuery("")}>
                  <X size={14} color="#94a3b8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
              
              {/* Current GPS Location Button */}
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleFetchCurrentGpsLocation}
                disabled={isGpsLoading}
                style={[styles.gpsButton, isGpsLoading ? { opacity: 0.8 } : {}]}
              >
                <View style={styles.gpsIconBox}>
                  {isGpsLoading ? (
                    <ActivityIndicator size="small" color="#10b981" />
                  ) : (
                    <MapPin size={18} color="#10b981" />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.gpsTitle}>
                    {isGpsLoading ? "Detecting GPS Location..." : "Use Current Location"}
                  </Text>
                  <Text style={styles.gpsSub}>
                    {isGpsLoading ? "Fetching precise street address" : "Auto-detect from device GPS"}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Saved Addresses from User Profile */}
              {user?.savedAddresses && user.savedAddresses.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.sectionSubHeading}>SAVED ADDRESSES</Text>
                  {user.savedAddresses.map((addr) => (
                    <TouchableOpacity
                      key={addr.id}
                      activeOpacity={0.8}
                      onPress={() => handleSelectLocation(addr.formattedAddress)}
                      style={styles.locationItemRow}
                    >
                      <View style={styles.hubIconBox}>
                        <MapPin size={16} color="#8b5cf6" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.hubTitle}>{addr.type}: {addr.flatNo}, {addr.street}</Text>
                        <Text style={styles.hubState}>{addr.city} • {addr.pincode}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Popular Localities */}
              <Text style={styles.sectionSubHeading}>POPULAR HUBS & CITIES</Text>
              {filteredHubs.map((hub, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  onPress={() => handleSelectLocation(hub.title)}
                  style={styles.locationItemRow}
                >
                  <View style={styles.hubIconBox}>
                    <MapPin size={16} color="#8b5cf6" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.hubTitle}>{hub.title}</Text>
                    <Text style={styles.hubState}>{hub.state}</Text>
                  </View>
                  {currentLocationText === hub.title && (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>Active</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

            </ScrollView>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
  },
  mainScroll: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  brandHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  headerLogoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0f172a",
    borderWidth: 1.5,
    borderColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  headerLogoImg: {
    width: "100%",
    height: "100%",
  },
  locationLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  locationLabel: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  locationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 220,
  },
  locationTitleText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
    marginRight: 4,
  },
  inishaBadge: {
    backgroundColor: "#1e3a8a",
    borderColor: "#3b82f6",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  inishaBadgeText: {
    color: "#60a5fa",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  bellButton: {
    width: 44,
    height: 44,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  greetingBox: {
    marginBottom: 16,
  },
  greetingName: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 3,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
    padding: 0,
  },
  shortcutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  shortcutItem: {
    alignItems: "center",
    width: "18%",
  },
  shortcutIconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  shortcutLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  qualityBanner: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qualityBannerTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 6,
  },
  qualityBannerSub: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  qualityBannerBadge: {
    backgroundColor: "#022c22",
    borderColor: "#10b981",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  qualityBannerBadgeText: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "800",
  },
  categoryScroll: {
    marginBottom: 18,
    marginHorizontal: -4,
  },
  categoryContent: {
    paddingRight: 10,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  categoryChipNormal: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
  },
  categoryChipSelected: {
    backgroundColor: "#7c3aed",
    borderColor: "#8b5cf6",
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  categoryChipTextNormal: {
    color: "#94a3b8",
  },
  categoryChipTextSelected: {
    color: "#ffffff",
  },
  activeBookingBanner: {
    backgroundColor: "#1e1b4b",
    borderColor: "#6366f1",
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
  },
  activeBannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  activeBannerTitle: {
    color: "#a5b4fc",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
  },
  activeBannerStatus: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    backgroundColor: "#7c3aed",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  activeBannerServiceName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  activeBannerOtp: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 14,
  },
  trackButton: {
    backgroundColor: "#7c3aed",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  trackButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    justifyContent: "space-between",
  },
  cardImageContainer: {
    width: "100%",
    height: 110,
    position: "relative",
    backgroundColor: "#020617",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardCategoryChip: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.7)",
  },
  cardCategoryText: {
    color: "#cbd5e1",
    fontSize: 8,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  cardRatingFloating: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(2, 6, 23, 0.85)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  ratingText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 3,
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  cardTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
    minHeight: 34,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardDurationText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  cardFooter: {
    borderTopColor: "#1e293b",
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    color: "#64748b",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  priceValue: {
    color: "#10b981",
    fontSize: 14,
    fontWeight: "800",
  },
  bookMiniBtn: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bookMiniBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  emptyCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginVertical: 12,
  },
  emptyTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  emptySubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeaderTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  modalHeaderSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSearchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  modalSearchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 13,
    marginLeft: 8,
    padding: 0,
  },
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#022c22",
    borderColor: "#10b981",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  gpsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  gpsTitle: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "800",
  },
  gpsSub: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  sectionSubHeading: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  locationItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  hubIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#1e1b4b",
    alignItems: "center",
    justifyContent: "center",
  },
  hubTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  hubState: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activePillText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
  },
});

