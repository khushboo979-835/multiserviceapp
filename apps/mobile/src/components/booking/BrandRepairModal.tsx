import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import {
  X,
  Smartphone,
  CheckCircle,
  Calendar,
  ShieldCheck,
  Search,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
} from "lucide-react-native";

interface BrandRepairModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectBrandService?: (brand: string, mode: "Sell" | "Buy" | "Repair", model?: string) => void;
}

interface BrandItem {
  id: string;
  name: string;
  displayName: string;
  color: string;
  bgColor?: string;
  isLogoBox?: boolean;
}

const TOP_BRANDS: BrandItem[] = [
  { id: "apple", name: "Apple", displayName: "Apple", color: "#000000" },
  { id: "mi", name: "Xiaomi / Mi", displayName: "mi", color: "#f97316", bgColor: "#ffedd5", isLogoBox: true },
  { id: "samsung", name: "Samsung", displayName: "SAMSUNG", color: "#0284c7" },
  { id: "vivo", name: "Vivo", displayName: "vivo", color: "#0284c7" },
  { id: "oneplus", name: "OnePlus", displayName: "1+ ONEPLUS", color: "#dc2626" },
  { id: "oppo", name: "Oppo", displayName: "oppo", color: "#059669" },
  { id: "realme", name: "Realme", displayName: "realme", color: "#b45309", bgColor: "#fef3c7", isLogoBox: true },
  { id: "motorola", name: "Motorola", displayName: "M motorola", color: "#e11d48" },
  { id: "nokia", name: "Nokia", displayName: "NOKIA", color: "#1e3a8a" },
  { id: "honor", name: "Honor", displayName: "HONOR", color: "#06b6d4" },
  { id: "asus", name: "Asus", displayName: "ASUS", color: "#0f172a" },
  { id: "google", name: "Google", displayName: "G Google", color: "#ea4335" },
  { id: "poco", name: "Poco", displayName: "POCO", color: "#ca8a04" },
  { id: "infinix", name: "Infinix", displayName: "Infinix", color: "#0f172a" },
  { id: "iqoo", name: "iQOO", displayName: "iQOO", color: "#f59e0b" },
  { id: "nothing", name: "Nothing", displayName: "NOTHING", color: "#0f172a" },
];

const POPULAR_MODELS: Record<string, string[]> = {
  apple: ["iPhone 15 / 15 Pro", "iPhone 14 / 14 Pro", "iPhone 13 / 13 Pro", "iPhone 12 / 12 Mini", "iPhone 11", "iPhone XR / X"],
  mi: ["Redmi Note 13 Pro 5G", "Redmi Note 12 Pro", "Redmi 12 5G", "Xiaomi 13 Pro", "Redmi 10 Power", "Redmi K50i"],
  samsung: ["Galaxy S24 / S24 Ultra", "Galaxy S23 FE", "Galaxy M14 5G", "Galaxy A54 5G", "Galaxy M34 5G", "Galaxy F54 5G"],
  oneplus: ["OnePlus 12 / 12R", "OnePlus 11 5G", "OnePlus Nord CE 3", "OnePlus Nord 3", "OnePlus 10 Pro", "OnePlus 9R"],
  vivo: ["Vivo V30 Pro", "Vivo V29 5G", "Vivo T2x 5G", "Vivo Y200 5G", "Vivo X100 Pro", "Vivo Y56 5G"],
  oppo: ["Oppo Reno 11 Pro", "Oppo F25 Pro 5G", "Oppo A79 5G", "Oppo Reno 10", "Oppo A59 5G", "Oppo K10 5G"],
  realme: ["Realme 12 Pro+ 5G", "Realme 11 Pro", "Realme Narzo 60", "Realme C55", "Realme GT 2 Pro", "Realme 10"],
  motorola: ["Moto G84 5G", "Moto Edge 40 Neo", "Moto G54 5G", "Moto Edge 50 Pro", "Moto G34 5G", "Moto Razr 40"],
};

export default function BrandRepairModal({
  visible,
  onClose,
  onSelectBrandService,
}: BrandRepairModalProps) {
  const [activeTab, setActiveTab] = useState<"Sell" | "Buy" | "Repair">("Repair");
  const [selectedBrand, setSelectedBrand] = useState<BrandItem | null>(null);
  const [searchModelQuery, setSearchModelQuery] = useState("");

  const handleBrandClick = (brand: BrandItem) => {
    setSelectedBrand(brand);
  };

  const handleModelSelect = (model: string) => {
    if (selectedBrand) {
      if (onSelectBrandService) {
        onSelectBrandService(selectedBrand.name, activeTab, model);
      } else {
        Alert.alert(
          `${activeTab} - ${selectedBrand.name} ${model}`,
          `We have registered your request for ${selectedBrand.name} ${model} (${activeTab}). Our doorstep technician will reach you.`
        );
      }
      setSelectedBrand(null);
      onClose();
    }
  };

  const currentModels = selectedBrand
    ? (POPULAR_MODELS[selectedBrand.id] || [
        `${selectedBrand.name} Pro Series`,
        `${selectedBrand.name} Neo / Max`,
        `${selectedBrand.name} Prime Edition`,
        `${selectedBrand.name} Lite Edition`,
      ]).filter((m) => m.toLowerCase().includes(searchModelQuery.toLowerCase()))
    : [];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          {/* Sell / Buy / Repair Segmented Bar */}
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              onPress={() => setActiveTab("Sell")}
              style={[styles.segmentBtn, activeTab === "Sell" && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentBtnText, activeTab === "Sell" && styles.segmentBtnTextActive]}>
                Sell
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("Buy")}
              style={[styles.segmentBtn, activeTab === "Buy" && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentBtnText, activeTab === "Buy" && styles.segmentBtnTextActive]}>
                Buy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("Repair")}
              style={[styles.segmentBtn, activeTab === "Repair" && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentBtnText, activeTab === "Repair" && styles.segmentBtnTextActive]}>
                Repair
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Top Brands Heading */}
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionTitle}>Top Brands</Text>
            <Text style={styles.sectionSubtitle}>
              {activeTab === "Repair"
                ? "Select your mobile brand for doorstep repair"
                : activeTab === "Sell"
                ? "Sell old phone for instant cash on doorstep"
                : "Buy certified refurbished phones with warranty"}
            </Text>
          </View>

          {/* 16 Brands 4x4 Grid */}
          <View style={styles.brandsGrid}>
            {TOP_BRANDS.map((brand) => {
              const isSelected = selectedBrand?.id === brand.id;
              return (
                <TouchableOpacity
                  key={brand.id}
                  onPress={() => handleBrandClick(brand)}
                  activeOpacity={0.8}
                  style={[
                    styles.brandCard,
                    isSelected && styles.brandCardSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.brandLogoContainer,
                      brand.bgColor ? { backgroundColor: brand.bgColor } : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.brandText,
                        { color: brand.color },
                        brand.isLogoBox ? styles.brandTextBadge : null,
                      ]}
                      numberOfLines={1}
                    >
                      {brand.displayName}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* If Brand Selected: Show Models Drawer */}
          {selectedBrand && (
            <View style={styles.modelSelectionBox}>
              <View style={styles.modelHeaderRow}>
                <View>
                  <Text style={styles.modelTitle}>Select {selectedBrand.name} Model</Text>
                  <Text style={styles.modelSub}>Choose your exact device model</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedBrand(null)}
                  style={styles.modelCloseIcon}
                >
                  <X size={16} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={styles.modelSearchBar}>
                <Search size={16} color="#94a3b8" />
                <TextInput
                  placeholder={`Search ${selectedBrand.name} model...`}
                  placeholderTextColor="#94a3b8"
                  value={searchModelQuery}
                  onChangeText={setSearchModelQuery}
                  style={styles.modelSearchInput}
                />
              </View>

              <View style={styles.modelsList}>
                {currentModels.map((model, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleModelSelect(model)}
                    style={styles.modelRowItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modelRowLeft}>
                      <Smartphone size={18} color="#0284c7" />
                      <Text style={styles.modelNameText}>{model}</Text>
                    </View>
                    <View style={styles.modelPriceBadge}>
                      <Text style={styles.modelPriceText}>
                        {activeTab === "Repair" ? "From ₹499" : activeTab === "Sell" ? "Up to ₹28,000" : "From ₹8,999"}
                      </Text>
                      <ChevronRight size={14} color="#0284c7" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* 3 Step Repair Workflow Timeline */}
          <View style={styles.workflowSection}>
            {/* Step 1 */}
            <View style={styles.stepItem}>
              <View style={styles.stepIconCircle}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Check Price</Text>
                <Text style={styles.stepDescription}>
                  Select your device that needs to be repaired. Get best Pricing.
                </Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            {/* Step 2 */}
            <View style={styles.stepItem}>
              <View style={styles.stepIconCircle}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Schedule Service</Text>
                <Text style={styles.stepDescription}>
                  Book convenient slot for home/office pickup or doorstep repair.
                </Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            {/* Step 3 */}
            <View style={styles.stepItem}>
              <View style={styles.stepIconCircle}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Doorstep Repair</Text>
                <Text style={styles.stepDescription}>
                  Certified technician arrives and fixes your phone with 6 months warranty.
                </Text>
              </View>
            </View>
          </View>

          {/* Guarantee Highlights */}
          <View style={styles.guaranteeBox}>
            <View style={styles.guaranteePill}>
              <Award size={16} color="#16a34a" />
              <Text style={styles.guaranteeText}>100% Genuine Spares</Text>
            </View>
            <View style={styles.guaranteePill}>
              <ShieldCheck size={16} color="#0284c7" />
              <Text style={styles.guaranteeText}>6 Months Warranty</Text>
            </View>
            <View style={styles.guaranteePill}>
              <Clock size={16} color="#e11d48" />
              <Text style={styles.guaranteeText}>30-45 Mins Repair</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get("window");
const brandCardSize = (width - 36 - 36) / 4; // 4 columns with spacing

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 24,
    padding: 3,
    width: width * 0.72,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  segmentBtnActive: {
    backgroundColor: "#14b8a6", // Teal active tab matching mockup
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  segmentBtnTextActive: {
    color: "#ffffff",
    fontWeight: "900",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeadingRow: {
    marginTop: 18,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 3,
    fontWeight: "500",
  },
  brandsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  brandCard: {
    width: brandCardSize,
    height: brandCardSize,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  brandCardSelected: {
    borderColor: "#14b8a6",
    borderWidth: 2,
    backgroundColor: "#f0fdfa",
  },
  brandLogoContainer: {
    width: "90%",
    height: "90%",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  brandTextBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modelSelectionBox: {
    marginTop: 18,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modelHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modelTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  modelSub: {
    fontSize: 12,
    color: "#64748b",
  },
  modelCloseIcon: {
    padding: 4,
  },
  modelSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  modelSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#0f172a",
    paddingVertical: 0,
  },
  modelsList: {
    gap: 8,
  },
  modelRowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  modelRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modelNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
  },
  modelPriceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  modelPriceText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0284c7",
  },
  workflowSection: {
    marginTop: 26,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#14b8a6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "900",
    color: "#ffffff",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: "#ccfbf1",
    marginLeft: 13,
    marginVertical: 4,
  },
  guaranteeBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 34,
    gap: 8,
  },
  guaranteePill: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#334155",
    marginTop: 4,
    textAlign: "center",
  },
});
