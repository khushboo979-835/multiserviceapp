import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import {
  X,
  Search,
  Clock,
  Sparkles,
  Smartphone,
  Scissors,
  Check,
  ChevronRight,
  ShieldCheck,
  Wrench,
} from "lucide-react-native";
import SafeImage from "../common/SafeImage";
import {
  MEN_GROOMING_CATALOG,
  WOMEN_BEAUTY_CATALOG,
  MOBILE_REPAIR_CATALOG,
  OTHER_HOME_SERVICES_CATALOG,
  CatalogServiceItem,
} from "../../constants/servicesCatalogData";

const { width } = Dimensions.get("window");

const MOBILE_BRANDS = [
  "All Brands",
  "Apple",
  "Samsung",
  "Xiaomi / Redmi",
  "OnePlus",
  "Realme",
  "Vivo",
  "Oppo",
  "Motorola",
  "Other",
];

export interface ServiceSubListDrillDownProps {
  visible: boolean;
  onClose: () => void;
  initialCategory?: "Beauty Parlour" | "Mobile Repair" | "Home Repair" | string;
  initialSubCategory?: "Men's Grooming" | "Women's Beauty Services" | "Doorstep Mobile Repair" | string;
  onBookService: (service: {
    serviceName: string;
    category: string;
    subCategory: string;
    price: number;
    duration: string;
    imageUrl: string;
    description: string;
    selectedBrand?: string;
  }) => void;
}

export default function ServiceSubListDrillDown({
  visible,
  onClose,
  initialCategory = "Beauty Parlour",
  initialSubCategory = "Men's Grooming",
  onBookService,
}: ServiceSubListDrillDownProps) {
  // Category state
  const isBeauty =
    initialCategory.toLowerCase().includes("beauty") ||
    initialCategory.toLowerCase().includes("parlour") ||
    initialCategory.toLowerCase().includes("salon");

  const isMobile =
    initialCategory.toLowerCase().includes("mobile") ||
    initialCategory.toLowerCase().includes("phone");

  const [activeTab, setActiveTab] = useState<"MEN" | "WOMEN">(
    initialSubCategory.toLowerCase().includes("women") ? "WOMEN" : "MEN"
  );
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Determine current active catalog list
  const activeCatalog: CatalogServiceItem[] = useMemo(() => {
    let list: CatalogServiceItem[] = [];

    if (isBeauty) {
      list = activeTab === "MEN" ? MEN_GROOMING_CATALOG : WOMEN_BEAUTY_CATALOG;
    } else if (isMobile) {
      list = MOBILE_REPAIR_CATALOG;
    } else {
      // Home repairs (AC, Electrician, Plumber, etc.)
      const catNorm = initialCategory.toLowerCase();
      list = OTHER_HOME_SERVICES_CATALOG.filter(
        (s: CatalogServiceItem) =>
          s.category.toLowerCase().includes(catNorm) ||
          catNorm.includes(s.category.toLowerCase())
      );
      if (list.length === 0) list = OTHER_HOME_SERVICES_CATALOG;
    }

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter(
      (s) =>
        s.serviceName.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
    );
  }, [isBeauty, isMobile, activeTab, initialCategory, searchQuery]);

  const categoryHeaderTitle = useMemo(() => {
    if (isBeauty) {
      return activeTab === "MEN" ? "Men's Grooming Booking" : "Women's Beauty Booking";
    }
    if (isMobile) {
      return "Mobile Repair Booking";
    }
    return `${initialCategory} Booking`;
  }, [isBeauty, isMobile, activeTab, initialCategory]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Top Bar with Close button */}
          <View style={styles.topHandleBar}>
            <View style={styles.handleIndicator} />
            <TouchableOpacity onPress={onClose} style={styles.closeCircleBtn}>
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Header Title & Subtitle */}
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerCategoryTitle}>
              {isBeauty
                ? "Beauty Parlour & Salon Services"
                : isMobile
                ? "Doorstep Mobile Repair"
                : `${initialCategory} Services`}
            </Text>
            <Text style={styles.headerSubtitle}>
              Doorstep verified experts with genuine parts & upfront pricing
            </Text>
          </View>

          {/* Segmented Tab Bar for Beauty Parlour (Men vs Women) */}
          {isBeauty && (
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === "MEN" && styles.segmentBtnActive]}
                onPress={() => setActiveTab("MEN")}
                activeOpacity={0.85}
              >
                <Scissors size={15} color={activeTab === "MEN" ? "#000000" : "#a1a1aa"} />
                <Text
                  style={[
                    styles.segmentBtnText,
                    activeTab === "MEN" && styles.segmentBtnTextActive,
                  ]}
                >
                  Men's Grooming (15)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, activeTab === "WOMEN" && styles.segmentBtnActive]}
                onPress={() => setActiveTab("WOMEN")}
                activeOpacity={0.85}
              >
                <Sparkles size={15} color={activeTab === "WOMEN" ? "#000000" : "#a1a1aa"} />
                <Text
                  style={[
                    styles.segmentBtnText,
                    activeTab === "WOMEN" && styles.segmentBtnTextActive,
                  ]}
                >
                  Women's Beauty (24)
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Brand Selector Chips for Mobile Repair */}
          {isMobile && (
            <View style={styles.brandSelectorSection}>
              <Text style={styles.brandSelectorLabel}>Select Smartphone Brand:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.brandChipsScroll}
              >
                {MOBILE_BRANDS.map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    onPress={() => setSelectedBrand(brand)}
                    style={[
                      styles.brandChip,
                      selectedBrand === brand && styles.brandChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.brandChipText,
                        selectedBrand === brand && styles.brandChipTextActive,
                      ]}
                    >
                      {brand}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Search size={18} color="#71717a" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeCatalog.length} services (e.g. Hair Cut, Facial, Screen)...`}
              placeholderTextColor="#71717a"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={16} color="#a1a1aa" />
              </TouchableOpacity>
            )}
          </View>

          {/* Service Cards List - Strictly matching Screenshot 6 */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardsScrollContent}
          >
            {/* Dark Card Container (Screenshot 6) */}
            <View style={styles.blackCardContainer}>
              {/* Card Header Row: Title on Left, Green "Available" pill on Right */}
              <View style={styles.blackCardHeaderRow}>
                <Text style={styles.blackCardHeaderTitle}>
                  {categoryHeaderTitle}
                </Text>
                <View style={styles.availableBadge}>
                  <Text style={styles.availableBadgeText}>Available</Text>
                </View>
              </View>

              {/* Items in the Card */}
              {activeCatalog.length === 0 ? (
                <View style={styles.emptyStateWrap}>
                  <Text style={styles.emptyStateText}>No services found matching "{searchQuery}"</Text>
                </View>
              ) : (
                activeCatalog.map((item, idx) => (
                  <View key={item.id} style={styles.serviceItemRowWrapper}>
                    {idx > 0 && <View style={styles.serviceDivider} />}

                    <View style={styles.serviceItemRow}>
                      {/* Left: Thumbnail Image with Rounded Corners */}
                      <SafeImage
                        uri={item.imageUrl}
                        style={styles.serviceThumbnail}
                        resizeMode="cover"
                      />

                      {/* Middle: Service Name, Neon Green Bold Price, Duration */}
                      <View style={styles.serviceInfoCol}>
                        <Text style={styles.serviceNameText} numberOfLines={2}>
                          {item.serviceName}
                        </Text>
                        <Text style={styles.neonPriceText}>₹{item.price}</Text>
                        <View style={styles.durationRow}>
                          <Clock size={13} color="#a1a1aa" style={{ marginRight: 4 }} />
                          <Text style={styles.durationText}>{item.duration}</Text>
                        </View>
                      </View>

                      {/* Right: Crisp White Pill Button [ Book Now ] with Black Text */}
                      <TouchableOpacity
                        style={styles.whitePillBookBtn}
                        activeOpacity={0.85}
                        onPress={() => {
                          onClose();
                          onBookService({
                            serviceName: item.serviceName,
                            category: item.category,
                            subCategory: item.subCategory,
                            price: item.price,
                            duration: item.duration,
                            imageUrl: item.imageUrl,
                            description: item.description,
                            selectedBrand: isMobile ? selectedBrand : undefined,
                          });
                        }}
                      >
                        <Text style={styles.whitePillBookBtnText}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Bottom Safe Spacing */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#121214",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "94%",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topHandleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  handleIndicator: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3f3f46",
    alignSelf: "center",
    marginLeft: 32,
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    marginBottom: 14,
  },
  headerCategoryTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: "#a1a1aa",
    fontSize: 13,
    marginTop: 2,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "#27272a",
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: "#ffffff",
  },
  segmentBtnText: {
    color: "#a1a1aa",
    fontSize: 13,
    fontWeight: "600",
  },
  segmentBtnTextActive: {
    color: "#000000",
    fontWeight: "800",
  },
  brandSelectorSection: {
    marginBottom: 14,
  },
  brandSelectorLabel: {
    color: "#d4d4d8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  brandChipsScroll: {
    gap: 8,
    paddingRight: 10,
  },
  brandChip: {
    backgroundColor: "#27272a",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3f3f46",
  },
  brandChipActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  brandChipText: {
    color: "#d4d4d8",
    fontSize: 13,
    fontWeight: "600",
  },
  brandChipTextActive: {
    color: "#000000",
    fontWeight: "800",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e24",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#27272a",
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    paddingVertical: 0,
  },
  cardsScrollContent: {
    paddingBottom: 20,
  },

  /* Black Card Container - Screenshot 6 */
  blackCardContainer: {
    backgroundColor: "#000000",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#27272a",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  blackCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f23",
    marginBottom: 12,
  },
  blackCardHeaderTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
    flex: 1,
  },
  availableBadge: {
    backgroundColor: "#052e16",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#166534",
  },
  availableBadgeText: {
    color: "#22c55e",
    fontSize: 13,
    fontWeight: "700",
  },
  serviceItemRowWrapper: {
    width: "100%",
  },
  serviceDivider: {
    height: 1,
    backgroundColor: "#18181b",
    marginVertical: 14,
  },
  serviceItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serviceThumbnail: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: "#27272a",
  },
  serviceInfoCol: {
    flex: 1,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  serviceNameText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 21,
    marginBottom: 4,
  },
  neonPriceText: {
    color: "#22c55e",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    color: "#a1a1aa",
    fontSize: 13,
    fontWeight: "500",
  },
  whitePillBookBtn: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 96,
    ...Platform.select({
      ios: {
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  whitePillBookBtnText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },
  emptyStateWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#71717a",
    fontSize: 14,
  },
});
