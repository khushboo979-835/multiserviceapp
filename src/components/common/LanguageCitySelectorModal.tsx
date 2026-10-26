import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MapPin, Globe, X, Check, Building2 } from "lucide-react-native";
import { MOCK_CITIES } from "../../constants/mockData";

interface LanguageCitySelectorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCity: string;
  selectedLanguage: "en" | "hi" | "hinglish";
  onSelectCity: (cityName: string) => void;
  onSelectLanguage: (lang: "en" | "hi" | "hinglish") => void;
}

const LANGUAGES = [
  { code: "en", label: "English", sub: "Default" },
  { code: "hi", label: "हिन्दी (Hindi)", sub: "पूरी ऐप हिन्दी में" },
  { code: "hinglish", label: "Hinglish", sub: "Mixed Hindi + English" },
] as const;

export default function LanguageCitySelectorModal({
  visible,
  onClose,
  selectedCity,
  selectedLanguage,
  onSelectCity,
  onSelectLanguage,
}: LanguageCitySelectorModalProps) {
  const [activeTab, setActiveTab] = useState<"CITY" | "LANGUAGE">("CITY");

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Preferences & Region</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              onPress={() => setActiveTab("CITY")}
              style={[styles.tabBtn, activeTab === "CITY" && styles.tabBtnActive]}
            >
              <MapPin size={15} color={activeTab === "CITY" ? "#ef4444" : "#64748b"} />
              <Text style={[styles.tabBtnText, activeTab === "CITY" && styles.tabBtnTextActive]}>
                Select City
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("LANGUAGE")}
              style={[styles.tabBtn, activeTab === "LANGUAGE" && styles.tabBtnActive]}
            >
              <Globe size={15} color={activeTab === "LANGUAGE" ? "#ef4444" : "#64748b"} />
              <Text style={[styles.tabBtnText, activeTab === "LANGUAGE" && styles.tabBtnTextActive]}>
                Language (भाषा)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {activeTab === "CITY" ? (
              <View style={styles.listContainer}>
                <Text style={styles.sectionNote}>
                  Choose your operational service hub for instant doorstep delivery:
                </Text>
                {MOCK_CITIES.map((city) => {
                  const isSelected = selectedCity.toLowerCase().includes(city.cityName.toLowerCase());
                  return (
                    <TouchableOpacity
                      key={city.id}
                      onPress={() => {
                        onSelectCity(city.cityName);
                        onClose();
                      }}
                      style={[styles.cityCard, isSelected && styles.cityCardActive]}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cityInfo}>
                        <Building2 size={18} color={isSelected ? "#ef4444" : "#64748b"} />
                        <View style={{ marginLeft: 10 }}>
                          <Text style={[styles.cityName, isSelected && styles.cityNameActive]}>
                            {city.cityName}, {city.state}
                          </Text>
                          <Text style={styles.citySub}>
                            {city.totalProviders}+ Verified Technicians Active
                          </Text>
                        </View>
                      </View>
                      {isSelected && <Check size={18} color="#ef4444" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.listContainer}>
                <Text style={styles.sectionNote}>
                  Select your preferred app interface language:
                </Text>
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      onPress={() => {
                        onSelectLanguage(lang.code);
                        onClose();
                      }}
                      style={[styles.cityCard, isSelected && styles.cityCardActive]}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cityInfo}>
                        <Globe size={18} color={isSelected ? "#ef4444" : "#64748b"} />
                        <View style={{ marginLeft: 10 }}>
                          <Text style={[styles.cityName, isSelected && styles.cityNameActive]}>
                            {lang.label}
                          </Text>
                          <Text style={styles.citySub}>{lang.sub}</Text>
                        </View>
                      </View>
                      {isSelected && <Check size={18} color="#ef4444" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
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
  container: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "75%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  tabBtnTextActive: {
    color: "#ef4444",
  },
  scroll: {
    marginBottom: 10,
  },
  listContainer: {
    gap: 8,
  },
  sectionNote: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  cityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 14,
  },
  cityCardActive: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  cityInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  cityNameActive: {
    color: "#ef4444",
  },
  citySub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
});
