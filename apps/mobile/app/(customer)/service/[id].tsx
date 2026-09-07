import React, { useState, useMemo } from "react";
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  StyleSheet 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  ShieldCheck, 
  Check, 
  X, 
  Plus, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Banknote, 
  Sparkles,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Award,
  CheckCircle,
  FileText
} from "lucide-react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { fetchServices, createFirestoreBooking } from "@/services/firestoreService";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { useToast } from "@/components/ui/ToastProvider";
import { ServiceItem, Booking, BookingStatus, PaymentMethod } from "@/types";

export default function ServiceDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { setActiveBooking } = useBookingStore();
  const { showSuccess, showError } = useToast();

  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("Today");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00 AM - 12:00 PM");
  const [addressInput, setAddressInput] = useState(
    user?.selectedLocation || user?.savedAddresses?.[0]?.formattedAddress || "7A, DLF Cyber City, Phase 2, Gurugram"
  );
  const [landmarkInput, setLandmarkInput] = useState("Near Cyber Hub Tower B");
  const [notesInput, setNotesInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch catalog to find active service
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["servicesCatalog"],
    queryFn: fetchServices,
    staleTime: 1000 * 60 * 5,
  });

  const service: ServiceItem | undefined = useMemo(() => {
    return services.find((s) => s.id === id || s.id === `srv_${id}`);
  }, [services, id]);

  const activeService = service || services[0];

  // Dynamic Add-ons Price Calculation
  const addOnsTotal = useMemo(() => {
    if (!activeService?.addOns) return 0;
    return activeService.addOns
      .filter((add) => selectedAddOns.includes(add.id))
      .reduce((sum, item) => sum + item.price, 0);
  }, [activeService, selectedAddOns]);

  const basePrice = activeService?.price || 499;
  const subtotal = basePrice + addOnsTotal;
  const taxes = Math.round(subtotal * 0.18);
  const finalTotal = subtotal + taxes;

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((prev) => 
      prev.includes(addOnId) ? prev.filter((i) => i !== addOnId) : [...prev, addOnId]
    );
  };

  const timeSlots = [
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 06:00 PM",
    "06:00 PM - 08:00 PM",
  ];

  const handleConfirmBooking = async () => {
    if (!activeService) return;
    if (!addressInput.trim()) {
      showError("Please enter your doorstep service address");
      return;
    }

    setIsSubmitting(true);
    try {
      const otpCode = `${Math.floor(1000 + Math.random() * 9000)}`;
      const bookingDateValue = selectedDate === "Today" 
        ? new Date().toISOString().split("T")[0] 
        : selectedDate === "Tomorrow" 
        ? new Date(Date.now() + 86400000).toISOString().split("T")[0]
        : selectedDate;

      const newBookingData = {
        customerId: user?.id || user?.uid || "usr_guest",
        customerName: user?.fullName || user?.name || "Customer",
        customerPhone: user?.phoneNumber || user?.phone || "+919876543210",
        serviceId: activeService.id,
        serviceName: activeService.title,
        categoryId: activeService.category,
        subcategoryId: activeService.id,
        bookingDate: bookingDateValue,
        timeSlot: selectedTimeSlot,
        scheduledDate: bookingDateValue,
        scheduledTime: selectedTimeSlot,
        status: "PENDING" as BookingStatus,
        otp: otpCode,
        totalAmount: finalTotal,
        paymentStatus: paymentMethod === "ONLINE" ? "PAID" as const : "COD" as const,
        paymentMethod,
        notes: notesInput.trim(),
        address: `${addressInput.trim()}${landmarkInput ? `, Landmark: ${landmarkInput.trim()}` : ""}`,
        selectedAddress: {
          formattedAddress: addressInput.trim(),
          landmark: landmarkInput.trim(),
          latitude: 28.4901,
          longitude: 77.0805,
        },
        pricing: {
          basePrice,
          tax: taxes,
          commission: Math.round(basePrice * 0.15),
          couponDiscount: 0,
          addOnPrice: addOnsTotal,
          providerEarnings: Math.round(basePrice * 0.85),
          finalAmount: finalTotal,
        },
        timeline: [
          { status: "PENDING" as BookingStatus, timestamp: new Date().toISOString(), note: "Booking requested. Searching for professional partner." }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const bookingId = await createFirestoreBooking(newBookingData);
      
      const createdBooking: Booking = {
        id: bookingId,
        ...newBookingData,
      };

      setActiveBooking(createdBooking);
      showSuccess("Booking confirmed successfully!");

      router.replace({
        pathname: "/(customer)/track-booking/[id]",
        params: { id: bookingId },
      });
    } catch (err: any) {
      console.error("Booking creation error:", err);
      showError("Failed to confirm booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !activeService) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading service details...</Text>
      </View>
    );
  }

  const fallbackImage = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80";

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        
        {/* Large Hero Header Real Photograph */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: activeService.imageUrl || fallbackImage }} 
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />

          {/* Floating Back Button */}
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={[styles.backButton, { top: Math.max(insets.top + 8, 20) }]}
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Category Chip Over Image */}
          <View style={[styles.categoryBadge, { top: Math.max(insets.top + 8, 20) }]}>
            <Text style={styles.categoryBadgeText}>{activeService.category.split("&")[0].trim()}</Text>
          </View>

          {/* Floating Warranty Pill on Image Bottom */}
          {activeService.warranty && (
            <View style={styles.floatingWarrantyPill}>
              <Award size={13} color="#10b981" />
              <Text style={styles.floatingWarrantyText}>{activeService.warranty}</Text>
            </View>
          )}
        </View>

        {/* Content Details */}
        <View style={styles.contentPadding}>
          
          {/* Title & Key Highlights */}
          <Animated.View entering={FadeInUp.duration(500)}>
            <Text style={styles.titleText}>{activeService.title}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.ratingBadge}>
                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingText}>{activeService.rating || "4.9"}</Text>
                <Text style={styles.reviewCountText}>({activeService.reviewCount || 340}+ ratings)</Text>
              </View>

              <View style={styles.durationBadge}>
                <Clock size={13} color="#94a3b8" />
                <Text style={styles.durationText}>{activeService.duration}</Text>
              </View>
            </View>

            <Text style={styles.descriptionText}>{activeService.description}</Text>
          </Animated.View>

          {/* Trust Guarantees Bar */}
          <View style={styles.benefitsCard}>
            <View style={styles.benefitItem}>
              <ShieldCheck size={18} color="#10b981" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.benefitTitle}>Verified & Trained Partner</Text>
                <Text style={styles.benefitSub}>Background-checked & certified professional</Text>
              </View>
            </View>
            <View style={[styles.benefitItem, { marginTop: 12 }]}>
              <Sparkles size={18} color="#8b5cf6" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.benefitTitle}>Quality & Safety Standards</Text>
                <Text style={styles.benefitSub}>Single-use sanitized kits & transparent fixed pricing</Text>
              </View>
            </View>
          </View>

          {/* 4-Step Professional Workflow */}
          {activeService.steps && activeService.steps.length > 0 && (
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>How It Works</Text>
              <View style={styles.stepsCard}>
                {activeService.steps.map((st) => (
                  <View key={st.step} style={styles.stepItem}>
                    <View style={styles.stepNumberBadge}>
                      <Text style={styles.stepNumberText}>{st.step}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.stepTitle}>{st.title}</Text>
                      <Text style={styles.stepDesc}>{st.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* What's Included */}
          {activeService.inclusions && activeService.inclusions.length > 0 && (
            <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>What's Included</Text>
              <View style={styles.inclusionsCard}>
                {activeService.inclusions.map((item, idx) => (
                  <View key={idx} style={styles.checkRow}>
                    <View style={styles.checkIcon}>
                      <Check size={12} color="#10b981" />
                    </View>
                    <Text style={styles.checkText}>{item}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* What's Excluded */}
          {activeService.exclusions && activeService.exclusions.length > 0 && (
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>What's Excluded</Text>
              <View style={styles.exclusionsCard}>
                {activeService.exclusions.map((item, idx) => (
                  <View key={idx} style={styles.checkRow}>
                    <View style={styles.crossIcon}>
                      <X size={12} color="#f43f5e" />
                    </View>
                    <Text style={styles.crossText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Frequently Added Add-ons */}
          {activeService.addOns && activeService.addOns.length > 0 && (
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeading}>Frequently Added Upgrades</Text>
              {activeService.addOns.map((addon) => {
                const isSelected = selectedAddOns.includes(addon.id);
                return (
                  <TouchableOpacity
                    key={addon.id}
                    activeOpacity={0.8}
                    onPress={() => toggleAddOn(addon.id)}
                    style={[styles.addOnCard, isSelected ? styles.addOnSelected : styles.addOnNormal]}
                  >
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={styles.addOnTitle}>{addon.title}</Text>
                      {addon.duration && <Text style={styles.addOnDuration}>⏱ {addon.duration}</Text>}
                      <Text style={styles.addOnPrice}>+ ₹{addon.price}</Text>
                    </View>
                    <View style={[styles.addonCheckButton, isSelected ? styles.addonCheckSelected : styles.addonCheckNormal]}>
                      {isSelected ? <Check size={14} color="#ffffff" /> : <Plus size={14} color="#94a3b8" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Verified Customer Reviews */}
          {activeService.reviewsList && activeService.reviewsList.length > 0 && (
            <View style={styles.sectionBox}>
              <View style={styles.sectionTitleRow}>
                <MessageSquare size={16} color="#8b5cf6" />
                <Text style={styles.sectionHeadingWithIcon}>Customer Reviews ({activeService.reviewCount || 420})</Text>
              </View>
              {activeService.reviewsList.map((rev, idx) => (
                <View key={idx} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={styles.avatarPill}>
                        <Text style={styles.avatarPillText}>{rev.user.charAt(0)}</Text>
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.reviewUserName}>{rev.user}</Text>
                        <Text style={styles.reviewDate}>{rev.date}</Text>
                      </View>
                    </View>
                    <View style={styles.ratingBadge}>
                      <Star size={11} color="#f59e0b" fill="#f59e0b" />
                      <Text style={styles.ratingText}>{rev.rating}.0</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>"{rev.comment}"</Text>
                </View>
              ))}
            </View>
          )}

          {/* FAQs */}
          {activeService.faq && activeService.faq.length > 0 && (
            <View style={styles.sectionBox}>
              <View style={styles.sectionTitleRow}>
                <HelpCircle size={16} color="#8b5cf6" />
                <Text style={styles.sectionHeadingWithIcon}>Frequently Asked Questions</Text>
              </View>
              {activeService.faq.map((f, idx) => (
                <View key={idx} style={styles.faqCard}>
                  <Text style={styles.faqQuestion}>Q: {f.question}</Text>
                  <Text style={styles.faqAnswer}>{f.answer}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Scheduling: Date */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionTitleRow}>
              <Calendar size={16} color="#8b5cf6" />
              <Text style={styles.sectionHeadingWithIcon}>Select Service Date</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {["Today", "Tomorrow", "Pick Date"].map((opt) => {
                const isSelected = selectedDate === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    activeOpacity={0.8}
                    onPress={() => setSelectedDate(opt)}
                    style={[styles.optionBtn, isSelected ? styles.optionBtnSelected : styles.optionBtnNormal]}
                  >
                    <Text style={[styles.optionBtnText, isSelected ? styles.optionTextSelected : styles.optionTextNormal]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Scheduling: Time Slot */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionTitleRow}>
              <Clock size={16} color="#8b5cf6" />
              <Text style={styles.sectionHeadingWithIcon}>Select Time Slot</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTimeSlot(slot)}
                    style={[styles.timeSlotChip, isSelected ? styles.optionBtnSelected : styles.optionBtnNormal]}
                  >
                    <Text style={[styles.optionBtnText, isSelected ? styles.optionTextSelected : styles.optionTextNormal]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Service Address */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionTitleRow}>
              <MapPin size={16} color="#8b5cf6" />
              <Text style={styles.sectionHeadingWithIcon}>Doorstep Delivery Address</Text>
            </View>
            <TextInput
              value={addressInput}
              onChangeText={setAddressInput}
              placeholder="House/Flat number, Street, Locality"
              placeholderTextColor="#475569"
              style={styles.addressInput}
            />
            <TextInput
              value={landmarkInput}
              onChangeText={setLandmarkInput}
              placeholder="Landmark (e.g. Near DLF Cyber Hub)"
              placeholderTextColor="#475569"
              style={[styles.addressInput, { marginTop: 8 }]}
            />
            <TextInput
              value={notesInput}
              onChangeText={setNotesInput}
              placeholder="Special instructions (e.g. Ring doorbell, pet inside)"
              placeholderTextColor="#475569"
              style={[styles.addressInput, { marginTop: 8 }]}
            />
          </View>

          {/* Payment Method Selector */}
          <View style={styles.sectionBox}>
            <View style={styles.sectionTitleRow}>
              <CreditCard size={16} color="#8b5cf6" />
              <Text style={styles.sectionHeadingWithIcon}>Payment Option</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPaymentMethod("COD")}
                style={[styles.paymentBtn, paymentMethod === "COD" ? styles.paymentBtnSelected : styles.optionBtnNormal]}
              >
                <Banknote size={20} color={paymentMethod === "COD" ? "#10b981" : "#94a3b8"} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.paymentBtnTitle, paymentMethod === "COD" ? { color: "#ffffff" } : { color: "#cbd5e1" }]}>
                    Pay After Service
                  </Text>
                  <Text style={styles.paymentBtnSub}>Cash on Delivery / UPI</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPaymentMethod("ONLINE")}
                style={[styles.paymentBtn, paymentMethod === "ONLINE" ? styles.paymentBtnSelected : styles.optionBtnNormal]}
              >
                <CreditCard size={20} color={paymentMethod === "ONLINE" ? "#10b981" : "#94a3b8"} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[styles.paymentBtnTitle, paymentMethod === "ONLINE" ? { color: "#ffffff" } : { color: "#cbd5e1" }]}>
                    Online Payment
                  </Text>
                  <Text style={styles.paymentBtnSub}>UPI, Cards & Netbanking</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Breakdown Summary */}
          <View style={styles.priceSummaryCard}>
            <Text style={styles.billDetailsHeader}>Bill Summary</Text>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Base Service Fee</Text>
              <Text style={styles.summaryValue}>₹{basePrice}</Text>
            </View>
            {addOnsTotal > 0 && (
              <View style={styles.summaryLine}>
                <Text style={styles.summaryLabel}>Selected Add-ons</Text>
                <Text style={styles.summaryValue}>+ ₹{addOnsTotal}</Text>
              </View>
            )}
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Taxes & GST (18%)</Text>
              <Text style={styles.summaryValue}>₹{taxes}</Text>
            </View>
            <View style={[styles.summaryLine, styles.totalLine]}>
              <Text style={styles.totalLabel}>Total Payable Amount</Text>
              <Text style={styles.totalValue}>₹{finalTotal}</Text>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 16 }]}>
        <View>
          <Text style={styles.bottomPriceLabel}>Total Amount</Text>
          <Text style={styles.bottomPriceValue}>₹{finalTotal}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
          style={styles.bookNowButton}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.bookNowText}>Confirm & Book Now</Text>
              <ChevronRight size={18} color="#ffffff" style={{ marginLeft: 4 }} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 12,
  },
  imageContainer: {
    width: "100%",
    height: 270,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.40)",
  },
  backButton: {
    position: "absolute",
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    position: "absolute",
    right: 20,
    backgroundColor: "rgba(124, 58, 237, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#8b5cf6",
  },
  categoryBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  floatingWarrantyPill: {
    position: "absolute",
    bottom: 14,
    left: 20,
    backgroundColor: "rgba(2, 44, 34, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
  },
  floatingWarrantyText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  titleText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 10,
  },
  ratingText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 4,
  },
  reviewCountText: {
    color: "#64748b",
    fontSize: 11,
    marginLeft: 4,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  durationText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  descriptionText: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  benefitsCard: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  benefitSub: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 1,
  },
  sectionBox: {
    marginBottom: 22,
  },
  sectionHeading: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeadingWithIcon: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
  stepsCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumberText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  stepTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  stepDesc: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  inclusionsCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  exclusionsCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#022c22",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },
  checkText: {
    color: "#cbd5e1",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  crossIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#450a0a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },
  crossText: {
    color: "#94a3b8",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  addOnCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  addOnNormal: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
  },
  addOnSelected: {
    backgroundColor: "#1e1b4b",
    borderColor: "#8b5cf6",
  },
  addOnTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  addOnDuration: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 2,
  },
  addOnPrice: {
    color: "#10b981",
    fontSize: 13,
    fontWeight: "800",
  },
  addonCheckButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addonCheckNormal: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
  },
  addonCheckSelected: {
    backgroundColor: "#7c3aed",
  },
  reviewCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7c3aed",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPillText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  reviewUserName: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  reviewDate: {
    color: "#64748b",
    fontSize: 10,
  },
  reviewComment: {
    color: "#cbd5e1",
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 17,
  },
  faqCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  faqQuestion: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  faqAnswer: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 17,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  timeSlotChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  optionBtnNormal: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
  },
  optionBtnSelected: {
    backgroundColor: "#7c3aed",
    borderColor: "#8b5cf6",
  },
  optionBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  optionTextNormal: {
    color: "#94a3b8",
  },
  optionTextSelected: {
    color: "#ffffff",
  },
  addressInput: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 13,
  },
  paymentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  paymentBtnSelected: {
    backgroundColor: "#022c22",
    borderColor: "#10b981",
  },
  paymentBtnTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  paymentBtnSub: {
    color: "#64748b",
    fontSize: 10,
  },
  priceSummaryCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  billDetailsHeader: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    color: "#94a3b8",
    fontSize: 12,
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  totalLine: {
    borderTopColor: "#1e293b",
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  totalValue: {
    color: "#10b981",
    fontSize: 18,
    fontWeight: "800",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0f172a",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  bottomPriceLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  bottomPriceValue: {
    color: "#10b981",
    fontSize: 20,
    fontWeight: "900",
  },
  bookNowButton: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  bookNowText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});
