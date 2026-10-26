import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  MapPin,
  Crosshair,
  Search,
  X,
  Check,
  Building2,
  Navigation,
  Compass,
  ArrowRight,
} from "lucide-react-native";
import { LocationService, UserAddressDetails } from "../../services/location.service";

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentLocation: UserAddressDetails | null;
  onSelectLocation: (location: UserAddressDetails) => void;
}

export default function LocationPickerModal({
  visible,
  onClose,
  currentLocation,
  onSelectLocation,
}: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);
  const [searching, setSearching] = useState(false);
  const popularCities = LocationService.getPopularCities();

  const handleDetectGps = async () => {
    setDetectingGps(true);
    try {
      const loc = await LocationService.getCurrentLocation();
      onSelectLocation(loc);
      onClose();
    } catch {
      onSelectLocation(LocationService.getFallbackLocation());
      onClose();
    } finally {
      setDetectingGps(false);
    }
  };

  const handleCustomAddressSubmit = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const geocoded = await LocationService.geocodeAddress(searchQuery.trim());
      onSelectLocation(geocoded);
      setSearchQuery("");
      onClose();
    } catch {
      onSelectLocation({
        formattedAddress: searchQuery.trim(),
        latitude: 25.5941,
        longitude: 85.1376,
        city: searchQuery.trim(),
        landmark: searchQuery.trim(),
      });
      setSearchQuery("");
      onClose();
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPopularCity = async (city: { name: string; state: string; lat: number; lng: number }) => {
    const loc: UserAddressDetails = {
      formattedAddress: `${city.name}, ${city.state}`,
      city: city.name,
      region: city.state,
      latitude: city.lat,
      longitude: city.lng,
      landmark: city.name,
    };
    onSelectLocation(loc);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.sheetTitle}>Select Your Location</Text>
              <Text style={styles.sheetSubtitle}>
                Choose your city, colony or auto-detect with GPS
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* GPS Auto Detect Action Card */}
          <TouchableOpacity
            onPress={handleDetectGps}
            disabled={detectingGps}
            style={styles.gpsCard}
            activeOpacity={0.85}
          >
            <View style={styles.gpsIconCircle}>
              {detectingGps ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Crosshair size={22} color="#ffffff" />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.gpsTitle}>Use Current GPS Location</Text>
              <Text style={styles.gpsSubtitle}>
                {detectingGps ? "Detecting high-precision GPS..." : "Auto-detect your precise doorstep address"}
              </Text>
            </View>
            <Navigation size={18} color="#ef4444" />
          </TouchableOpacity>

          {/* Location Name Text Input Box */}
          <View style={styles.searchSection}>
            <Text style={styles.sectionLabel}>OR ENTER YOUR LOCATION / CITY NAME</Text>
            <View style={styles.searchInputContainer}>
              <Search size={18} color="#64748b" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="e.g. Boring Road Patna, Kankarbagh, Noida Sec 62..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleCustomAddressSubmit}
                returnKeyType="done"
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={handleCustomAddressSubmit}
                  disabled={searching}
                  style={styles.applyBtn}
                  activeOpacity={0.8}
                >
                  {searching ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.applyBtnText}>Set</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Popular Cities & Hubs */}
          <View style={{ flex: 1, marginTop: 14 }}>
            <Text style={styles.sectionLabel}>POPULAR SERVICE LOCATIONS</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {popularCities.map((city, idx) => {
                const isSelected =
                  currentLocation?.city?.toLowerCase() === city.name.toLowerCase() ||
                  currentLocation?.formattedAddress?.toLowerCase().includes(city.name.toLowerCase());

                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectPopularCity(city)}
                    style={[styles.cityRow, isSelected ? styles.cityRowSelected : null]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cityLeft}>
                      <View style={[styles.cityIconBox, isSelected ? styles.cityIconBoxSelected : null]}>
                        <Building2 size={16} color={isSelected ? "#ef4444" : "#64748b"} />
                      </View>
                      <View style={{ marginLeft: 12 }}>
                        <Text style={[styles.cityName, isSelected ? styles.cityNameSelected : null]}>
                          {city.name}
                        </Text>
                        <Text style={styles.cityState}>{city.state} • Express Service Available</Text>
                      </View>
                    </View>
                    {isSelected ? (
                      <Check size={18} color="#ef4444" />
                    ) : (
                      <ArrowRight size={16} color="#cbd5e1" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "85%",
    minHeight: 480,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.4,
  },
  sheetSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  gpsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    borderWidth: 1.5,
    borderColor: "#fecdd3",
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
  },
  gpsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  gpsSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
  },
  searchSection: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    padding: 0,
  },
  applyBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  applyBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 13,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cityRowSelected: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  cityLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  cityIconBoxSelected: {
    backgroundColor: "#fee2e2",
  },
  cityName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  cityNameSelected: {
    color: "#ef4444",
    fontWeight: "800",
  },
  cityState: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 1,
  },
});
