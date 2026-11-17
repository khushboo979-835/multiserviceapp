import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Store,
  X,
  MapPin,
  Compass,
  CheckCircle2,
  Sparkles,
  Phone,
  Clock,
  Truck,
  Building,
} from "lucide-react-native";
import { apiClient } from "../../api/apiClient";
import { useAuthStore } from "../../store/useAuthStore";
import { LocationService } from "../../services/location.service";

interface ShopRegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  onShopCreated?: (shop: any) => void;
}

const SHOP_CATEGORIES = [
  { id: "RESTAURANT", label: "🍔 Restaurant & Food", icon: "🍔" },
  { id: "GROCERY", label: "🛒 Grocery & Essentials", icon: "🛒" },
  { id: "MOBILE_ELECTRONICS", label: "📱 Mobile & Electronics", icon: "📱" },
  { id: "SWEETS_BAKERY", label: "🥐 Sweets & Bakery", icon: "🥐" },
  { id: "BEAUTY_WELLNESS", label: "💄 Beauty & Wellness", icon: "💄" },
  { id: "GENERAL", label: "🛍️ General Store", icon: "🛍️" },
];

const DELIVERY_MODELS = [
  { id: "HYBRID", label: "Hybrid (Inisha Fleet + Shop Boy)", desc: "Maximum speed" },
  { id: "INISHA_DELIVERY", label: "Inisha Central Delivery", desc: "Our verified riders pick up" },
  { id: "SHOP_DELIVERY", label: "Self Delivery", desc: "Your own delivery staff" },
];

export default function ShopRegistrationModal({
  visible,
  onClose,
  onShopCreated,
}: ShopRegistrationModalProps) {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [category, setCategory] = useState("RESTAURANT");
  const [phone, setPhone] = useState(user?.phoneNumber || "+91 ");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Patna");
  const [pincode, setPincode] = useState("800001");
  const [description, setDescription] = useState("");
  const [deliveryModel, setDeliveryModel] = useState<"HYBRID" | "INISHA_DELIVERY" | "SHOP_DELIVERY">("HYBRID");
  const [prepTime, setPrepTime] = useState("20");
  const [coordinates, setCoordinates] = useState<[number, number]>([85.1376, 25.5941]); // [lng, lat]

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleAutoDetectLocation = async () => {
    try {
      setGpsLoading(true);
      const loc = await LocationService.getCurrentLocation();
      if (loc) {
        setCoordinates([loc.longitude, loc.latitude]);
        setStreet(loc.formattedAddress);
        if (loc.landmark) setLandmark(loc.landmark);
        if (loc.city) setCity(loc.city);
        if (loc.postalCode) setPincode(loc.postalCode);
      }
    } catch {
      Alert.alert("Location notice", "Could not automatically detect GPS. Please enter street and city manually.");
    } finally {
      setGpsLoading(false);
    }
  };

  const handleRegisterShop = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your shop or business name.");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      Alert.alert("Required", "Please provide a valid 10-digit contact phone number.");
      return;
    }
    if (!street.trim()) {
      Alert.alert("Required", "Please provide the shop street address.");
      return;
    }

    try {
      setLoading(true);
      const shopPayload = {
        name: name.trim(),
        legalName: legalName.trim() || `${name.trim()} Online Services`,
        category,
        subCategories: [category.replace("_", " ")],
        description: description.trim() || `Verified neighborhood partner store delivering fresh orders across ${city}.`,
        logoUrl:
          category === "RESTAURANT"
            ? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80"
            : category === "GROCERY"
            ? "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80"
            : category === "MOBILE_ELECTRONICS"
            ? "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80"
            : "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&q=80",
        coverImageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80",
        phone: phone.trim(),
        address: {
          street: street.trim(),
          landmark: landmark.trim(),
          city: city.trim(),
          state: "Bihar",
          pincode: pincode.trim(),
        },
        location: {
          type: "Point",
          coordinates: coordinates,
        },
        openingHours: {
          openTime: "08:00 AM",
          closeTime: "10:00 PM",
          isOpen: true,
          daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        deliverySettings: {
          deliveryModel,
          radiusKm: 12,
          minOrderAmount: 99,
          baseDeliveryFee: 25,
          freeDeliveryThreshold: 499,
          estimatedPrepMins: parseInt(prepTime, 10) || 20,
        },
        isActive: true,
        isVerified: true,
      };

      const res = await apiClient.post("/shops", shopPayload);

      if (res.data?.success && res.data.shop) {
        const created = res.data.shop;
        if (user) {
          updateUser({
            shopId: created.shopId,
            role: user.role === "ADMIN" ? "ADMIN" : "SHOP_OWNER",
          });
        }

        Alert.alert(
          "Shop Registered Successfully! 🎉",
          `Congratulations! "${created.name}" is now registered and active on Inisha Store & Quick Delivery. You can now manage menu items, toggle orders, and dispatch deliveries.`,
          [
            {
              text: "Open Merchant Dashboard",
              onPress: () => {
                onClose();
                if (onShopCreated) onShopCreated(created);
              },
            },
          ]
        );
      }
    } catch (err: any) {
      console.error("Shop registration error:", err);
      Alert.alert("Registration Failed", err.response?.data?.message || "Could not register shop. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.storeIconBox}>
              <Store size={22} color="#dc2626" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Register Your Shop</Text>
              <Text style={styles.headerSubtitle}>Become an Inisha Partner & reach local customers</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroTextRow}>
              <Sparkles size={20} color="#f59e0b" />
              <Text style={styles.heroTitle}>Grow with Inisha Quick Delivery</Text>
            </View>
            <Text style={styles.heroDesc}>
              Get doorstep orders delivered in 15-30 minutes across your city with our hybrid delivery rider network.
            </Text>
          </View>

          {/* 1. Shop Category Selector */}
          <Text style={styles.fieldSectionLabel}>SELECT BUSINESS CATEGORY *</Text>
          <View style={styles.categoryGrid}>
            {SHOP_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryCardIcon}>{cat.icon}</Text>
                  <Text
                    style={[styles.categoryCardLabel, isSelected && styles.categoryCardLabelSelected]}
                    numberOfLines={1}
                  >
                    {cat.label.split(" ").slice(1).join(" ")}
                  </Text>
                  {isSelected && (
                    <View style={styles.categoryCheckBadge}>
                      <CheckCircle2 size={12} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 2. Shop Information */}
          <Text style={styles.fieldSectionLabel}>SHOP & CONTACT DETAILS *</Text>

          <Text style={styles.inputLabel}>Shop / Store Name *</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Royal Sweets, Patna Mobile Hub, Fresh Mart"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.inputLabel}>Legal / Registered Firm Name (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={legalName}
            onChangeText={setLegalName}
            placeholder="e.g. Inisha Retail Services LLP"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.inputLabel}>Contact Phone / Helpline *</Text>
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 95078 60048"
            keyboardType="phone-pad"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.inputLabel}>Description / Specialties</Text>
          <TextInput
            style={[styles.textInput, { height: 70, textAlignVertical: "top" }]}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. Famous Dum Biryani, mobile phone repairs, dairy & grocery essentials"
            placeholderTextColor="#94a3b8"
            multiline
          />

          {/* 3. Address & GPS */}
          <View style={styles.addressHeaderRow}>
            <Text style={styles.fieldSectionLabel}>LOCATION & ADDRESS *</Text>
            <TouchableOpacity
              style={styles.gpsDetectBtn}
              onPress={handleAutoDetectLocation}
              disabled={gpsLoading}
            >
              {gpsLoading ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <>
                  <Compass size={14} color="#dc2626" />
                  <Text style={styles.gpsDetectText}>Auto GPS</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Street / Area / Market Name *</Text>
          <TextInput
            style={styles.textInput}
            value={street}
            onChangeText={setStreet}
            placeholder="e.g. Upper Road, Suruchi Complex, Boring Road"
            placeholderTextColor="#94a3b8"
          />

          <View style={styles.twoColRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputLabel}>Landmark</Text>
              <TextInput
                style={styles.textInput}
                value={landmark}
                onChangeText={setLandmark}
                placeholder="Near ICICI Bank"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.textInput}
                value={city}
                onChangeText={setCity}
                placeholder="Patna"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {/* 4. Delivery Model */}
          <Text style={styles.fieldSectionLabel}>DELIVERY DISPATCH MODEL *</Text>
          {DELIVERY_MODELS.map((m) => {
            const isSelected = deliveryModel === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.deliveryModelCard, isSelected && styles.deliveryModelCardSelected]}
                onPress={() => setDeliveryModel(m.id as any)}
                activeOpacity={0.8}
              >
                <View style={styles.deliveryModelLeft}>
                  <Truck size={18} color={isSelected ? "#dc2626" : "#64748b"} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={[styles.deliveryModelTitle, isSelected && styles.deliveryModelTitleSelected]}>
                      {m.label}
                    </Text>
                    <Text style={styles.deliveryModelDesc}>{m.desc}</Text>
                  </View>
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioInnerDot} />}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleRegisterShop}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Store size={18} color="#ffffff" />
                <Text style={styles.submitBtnText}>Register Shop on Inisha</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  storeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#64748b",
  },
  closeBtn: {
    padding: 6,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  heroTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#991b1b",
  },
  heroDesc: {
    fontSize: 12,
    color: "#7f1d1d",
    lineHeight: 17,
  },
  fieldSectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#475569",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  categoryCardSelected: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  categoryCardIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryCardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    flex: 1,
  },
  categoryCardLabelSelected: {
    color: "#dc2626",
    fontWeight: "800",
  },
  categoryCheckBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#dc2626",
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 10,
  },
  addressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 10,
  },
  gpsDetectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gpsDetectText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#dc2626",
  },
  twoColRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryModelCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  deliveryModelCardSelected: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
  deliveryModelLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deliveryModelTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
  },
  deliveryModelTitleSelected: {
    color: "#dc2626",
  },
  deliveryModelDesc: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#dc2626",
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
  },
  submitBtn: {
    backgroundColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    shadowColor: "#dc2626",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
});
