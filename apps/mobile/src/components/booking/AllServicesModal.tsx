import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  X,
  Search,
  Star,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Zap,
  Wind,
  Droplets,
  Hammer,
  Paintbrush,
  Scissors,
  Smartphone,
  Bug,
  Truck,
} from "lucide-react-native";
import { Category, Subcategory } from "../../types";

interface AllServicesModalProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  onSelectService: (category: Category, subcategory: Subcategory) => void;
}

const getCategoryIcon = (iconName: string, color: string, size: number) => {
  const norm = (iconName || "").toLowerCase().trim();
  switch (norm) {
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
      return <Zap size={size} color={color} />;
    case "droplets":
    case "plumber":
    case "plumbing":
      return <Droplets size={size} color={color} />;
    case "hammer":
    case "carpenter":
      return <Hammer size={size} color={color} />;
    case "paintbrush":
    case "painter":
      return <Paintbrush size={size} color={color} />;
    case "scissors":
    case "salon":
    case "spa":
      return <Scissors size={size} color={color} />;
    case "bug":
    case "pest":
      return <Bug size={size} color={color} />;
    case "truck":
    case "movers":
      return <Truck size={size} color={color} />;
    default:
      return <Sparkles size={size} color={color} />;
  }
};

export default function AllServicesModal({
  visible,
  onClose,
  categories,
  onSelectService,
}: AllServicesModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string>("ALL");

  const filteredServices = useMemo(() => {
    const list: { category: Category; subcategory: Subcategory }[] = [];

    categories.forEach((cat) => {
      if (selectedCatId !== "ALL" && cat.id !== selectedCatId) return;

      (cat.subcategories || []).forEach((sub) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          sub.name.toLowerCase().includes(query) ||
          (sub.description || "").toLowerCase().includes(query) ||
          cat.name.toLowerCase().includes(query);

        if (matchesQuery) {
          list.push({ category: cat, subcategory: sub });
        }
      });
    });

    return list;
  }, [categories, selectedCatId, searchQuery]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>All Home & Repair Services</Text>
              <Text style={styles.subtitle}>Doorstep verified experts at transparent pricing</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchBar}>
            <Search size={18} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search repair, cleaning, AC service..."
              placeholderTextColor="#94a3b8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={16} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Filter Pills Horizontal Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsScroll}
            style={{ maxHeight: 44, marginBottom: 12 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedCatId("ALL")}
              style={[styles.pill, selectedCatId === "ALL" && styles.pillActive]}
            >
              <Text style={[styles.pillText, selectedCatId === "ALL" && styles.pillTextActive]}>
                ✨ All Services
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCatId(cat.id)}
                style={[styles.pill, selectedCatId === cat.id && styles.pillActive]}
              >
                <Text style={[styles.pillText, selectedCatId === cat.id && styles.pillTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Services List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {filteredServices.length === 0 ? (
              <View style={styles.emptyBox}>
                <Sparkles size={36} color="#94a3b8" />
                <Text style={styles.emptyTitle}>No matching services found</Text>
                <Text style={styles.emptySub}>Try searching for "Mobile", "AC", "Cleaning", or "Electrician"</Text>
              </View>
            ) : (
              filteredServices.map(({ category, subcategory }) => (
                <TouchableOpacity
                  key={subcategory.id}
                  activeOpacity={0.85}
                  onPress={() => {
                    onClose();
                    onSelectService(category, subcategory);
                  }}
                  style={styles.serviceCard}
                >
                  <View style={styles.serviceLeft}>
                    <View style={styles.iconBox}>
                      {getCategoryIcon(subcategory.imageUrl || category.imageUrl, "#ef4444", 22)}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.catTag}>
                        <Text style={styles.catTagText}>{category.name}</Text>
                      </View>
                      <Text style={styles.serviceName}>{subcategory.name}</Text>
                      <Text style={styles.serviceDesc} numberOfLines={2}>
                        {subcategory.description || "Expert doorstep technician visit with 30-day service warranty."}
                      </Text>
                      <View style={styles.badgeRow}>
                        <View style={styles.ratingBadge}>
                          <Star size={12} color="#f59e0b" fill="#f59e0b" />
                          <Text style={styles.ratingText}>4.9 (240+)</Text>
                        </View>
                        <View style={styles.timeBadge}>
                          <Clock size={12} color="#64748b" />
                          <Text style={styles.timeText}>45-60 Mins</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.serviceRight}>
                    <Text style={styles.priceLabel}>STARTS AT</Text>
                    <Text style={styles.priceValue}>₹{subcategory.basePrice}</Text>
                    <View style={styles.bookBtn}>
                      <Text style={styles.bookBtnText}>Book Now</Text>
                      <ChevronRight size={14} color="#ffffff" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
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
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: "92%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
  },
  pillsScroll: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  pill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: "#ef4444",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  pillTextActive: {
    color: "#ffffff",
  },
  serviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 12,
  },
  serviceLeft: {
    flexDirection: "row",
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  catTag: {
    alignSelf: "flex-start",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  catTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ef4444",
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  serviceDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    lineHeight: 16,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0f172a",
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  timeText: {
    fontSize: 11,
    color: "#64748b",
  },
  serviceRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748b",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ef4444",
    marginVertical: 2,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  bookBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
    marginRight: 2,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
});
