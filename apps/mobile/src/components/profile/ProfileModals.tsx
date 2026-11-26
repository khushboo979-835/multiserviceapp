import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  X,
  User,
  Mail,
  MapPin,
  Phone,
  Bell,
  Volume2,
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  HelpCircle,
  MessageCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react-native";
import { useAuthStore } from "../../store/useAuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ==========================================
// 1. EDIT PROFILE MODAL
// ==========================================
export function EditProfileModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [city, setCity] = useState(user?.city || "Bhagalpur");
  const [address, setAddress] = useState(user?.address || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setCity(user?.city || "Bhagalpur");
      AsyncStorage.getItem("@user_delivery_address").then((stored) => {
        if (stored && stored.trim()) {
          setAddress(stored.trim());
        } else if (user?.address && user.address.trim()) {
          setAddress(user.address.trim());
        } else {
          setAddress("Rahmatnagar, Dilgouri, Sultanganj, Bhagalpur, Bihar - 813213");
        }
      }).catch(() => {
        setAddress(user?.address || "Rahmatnagar, Dilgouri, Sultanganj, Bhagalpur, Bihar - 813213");
      });
    }
  }, [visible, user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your full name.");
      return;
    }

    try {
      setSaving(true);
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      const trimmedCity = city.trim() || "Bhagalpur";
      const trimmedAddress = address.trim();

      // 1. Update local reactive state
      updateUser({
        name: trimmedName,
        email: trimmedEmail,
        city: trimmedCity,
        address: trimmedAddress,
      });

      // 2. Persist in AsyncStorage for offline & instant reloads
      await Promise.all([
        AsyncStorage.setItem("@user_delivery_address", trimmedAddress),
        AsyncStorage.setItem("@user_selected_city", trimmedCity),
        AsyncStorage.setItem(
          "@user_profile",
          JSON.stringify({
            ...user,
            name: trimmedName,
            email: trimmedEmail,
            city: trimmedCity,
            address: trimmedAddress,
          })
        ),
      ]);

      // 3. Sync to backend MongoDB Atlas
      const API_URL =
        process.env.EXPO_PUBLIC_API_URL ||
        "https://multiserviceapp-4pdw.onrender.com/api";
      const token = useAuthStore.getState().token;

      fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId: user?.id,
          phone: user?.phoneNumber,
          phoneNumber: user?.phoneNumber,
          name: trimmedName,
          email: trimmedEmail,
          city: trimmedCity,
          address: trimmedAddress,
        }),
      }).catch((e) => console.warn("Background profile sync:", e?.message));

      Alert.alert("Profile Updated ✅", "Your profile, city, and address have been saved successfully.");
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Edit Profile Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
                <X size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 280 }}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>FULL NAME</Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#64748b" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your Full Name"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={18} color="#64748b" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInput}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="yourname@gmail.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>REGISTERED PHONE (VERIFIED)</Text>
                <View style={[styles.inputWrapper, { backgroundColor: "#f1f5f9" }]}>
                  <Phone size={18} color="#64748b" style={{ marginRight: 10 }} />
                  <Text style={styles.disabledText}>{user?.phoneNumber || "+91 95078 60048"}</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CITY / SERVICE REGION</Text>
                <View style={styles.inputWrapper}>
                  <Building2 size={18} color="#64748b" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.textInput}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Bhagalpur / Sultanganj"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>DELIVERY & SERVICE ADDRESS</Text>
                <View style={[styles.inputWrapper, { minHeight: 70, height: "auto", paddingVertical: 10 }]}>
                  <MapPin size={18} color="#ef4444" style={{ marginRight: 10, marginTop: 2 }} />
                  <TextInput
                    style={[styles.textInput, { minHeight: 55, textAlignVertical: "top" }]}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="House/Flat No, Landmark, Sultanganj / Bhagalpur..."
                    placeholderTextColor="#94a3b8"
                    multiline
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                activeOpacity={0.85}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? "Saving Changes..." : "Save Profile Changes"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ==========================================
// 2. NOTIFICATIONS SETTINGS MODAL
// ==========================================
export function NotificationsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [jobAlerts, setJobAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [loudAudio, setLoudAudio] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Notification Preferences</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.toggleTitle}>Doorstep Service Updates</Text>
              <Text style={styles.toggleSub}>Instant push notification when partner is assigned or arrives</Text>
            </View>
            <Switch value={jobAlerts} onValueChange={setJobAlerts} trackColor={{ false: "#cbd5e1", true: "#ef4444" }} />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.toggleTitle}>High-Priority Ringtone Alert</Text>
              <Text style={styles.toggleSub}>Play custom audio alert for urgent job dispatches</Text>
            </View>
            <Switch value={loudAudio} onValueChange={setLoudAudio} trackColor={{ false: "#cbd5e1", true: "#ef4444" }} />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.toggleTitle}>Telecom SMS Delivery</Text>
              <Text style={styles.toggleSub}>Receive OTP & booking verification codes via SMS</Text>
            </View>
            <Switch value={smsAlerts} onValueChange={setSmsAlerts} trackColor={{ false: "#cbd5e1", true: "#ef4444" }} />
          </View>

          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.toggleTitle}>Promotions & Discounts</Text>
              <Text style={styles.toggleSub}>Seasonal offers and referral cashback alerts</Text>
            </View>
            <Switch value={promoAlerts} onValueChange={setPromoAlerts} trackColor={{ false: "#cbd5e1", true: "#ef4444" }} />
          </View>

          <TouchableOpacity onPress={onClose} style={styles.saveBtn} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ==========================================
// 3. PRIVACY & SECURITY MODAL
// ==========================================
export function PrivacySecurityModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Privacy & Data Security</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
            <View style={styles.securityHighlight}>
              <ShieldCheck size={22} color="#16a34a" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.securityTitle}>256-Bit SSL Encrypted Platform</Text>
                <Text style={styles.securityDesc}>
                  Your phone number, addresses, and live location are strictly encrypted and never shared with unauthorized third parties.
                </Text>
              </View>
            </View>

            <View style={styles.policyBlock}>
              <Text style={styles.policyHeading}>1. Terms of Service</Text>
              <Text style={styles.policyText}>
                Inisha City Service provides an on-demand marketplace connecting customers with verified background-checked service partners for home repairs, utility services, and doorstep salon.
              </Text>
            </View>

            <View style={styles.policyBlock}>
              <Text style={styles.policyHeading}>2. Payment & Wallet Security</Text>
              <Text style={styles.policyText}>
                All UPI payments are settled through RBI-regulated payment channels directly with Punjab National Bank corporate gateway.
              </Text>
            </View>

            <View style={styles.policyBlock}>
              <Text style={styles.policyHeading}>3. Background Checked Professionals</Text>
              <Text style={styles.policyText}>
                All partners undergo government ID verification (Aadhaar/PAN) and police background checks before receiving active dispatches.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.saveBtn} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Close & Return</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ==========================================
// 4. APP PREFERENCES MODAL
// ==========================================
export function AppPreferencesModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [lang, setLang] = useState<"EN" | "HI" | "HINGLISH">("EN");

  const languages = [
    { code: "EN", name: "English (Default)" },
    { code: "HI", name: "हिन्दी (Hindi)" },
    { code: "HINGLISH", name: "Hinglish (Hindi in English)" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>App Preferences</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>SELECT APP LANGUAGE</Text>
          <View style={{ gap: 10, marginVertical: 14 }}>
            {languages.map((l) => {
              const active = lang === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  onPress={() => setLang(l.code as any)}
                  style={[styles.langOption, active && styles.langOptionActive]}
                >
                  <Text style={[styles.langText, active && styles.langTextActive]}>{l.name}</Text>
                  {active && <ShieldCheck size={18} color="#ef4444" />}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.saveBtn} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Apply Preferences</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ==========================================
// 5. HELP & SUPPORT MODAL
// ==========================================
export function HelpSupportModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I book a doorstep technician?",
      a: "Select your desired category from Home, choose subcategory and address, and tap 'Proceed to Book'. A nearby verified partner will be assigned immediately.",
    },
    {
      q: "How does wallet payment work?",
      a: "You can add balance using UPI, PhonePe, or Google Pay. Once service is completed, you can settle bills instantly via your Inisha Wallet.",
    },
    {
      q: "What if a technician does not arrive on time?",
      a: "You can call the technician directly from the tracking page or reach our 24/7 customer helpline for instant re-assignment or 100% refund.",
    },
  ];

  const handleCallSupport = () => {
    Linking.openURL("tel:+917352082614");
  };

  const handleWhatsApp = () => {
    Linking.openURL("https://wa.me/917352082614?text=Hello%20Inisha%20City%20Service%20Support");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Help & 24/7 Support</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeCircle}>
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
            {/* Quick Contact Buttons */}
            <View style={styles.contactRow}>
              <TouchableOpacity onPress={handleCallSupport} style={styles.callSupportBtn}>
                <Phone size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.callSupportText}>Call Support</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleWhatsApp} style={styles.whatsappBtn}>
                <MessageCircle size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.whatsappText}>WhatsApp Chat</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.supportInfoBox}>
              <Text style={styles.supportInfoText}>
                Helpline: <Text style={styles.boldText}>+91 73520 82614</Text>
              </Text>
              <Text style={styles.supportInfoText}>
                Email: <Text style={styles.boldText}>support@inishacityservice.com</Text>
              </Text>
            </View>

            {/* FAQs Accordion */}
            <Text style={[styles.label, { marginTop: 14 }]}>FREQUENTLY ASKED QUESTIONS</Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              {faqs.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setExpandedFaq(isOpen ? null : index)}
                    style={styles.faqCard}
                    activeOpacity={0.8}
                  >
                    <View style={styles.faqHeader}>
                      <Text style={styles.faqQ}>{faq.q}</Text>
                      {isOpen ? <ChevronUp size={16} color="#ef4444" /> : <ChevronDown size={16} color="#64748b" />}
                    </View>
                    {isOpen && <Text style={styles.faqA}>{faq.a}</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.saveBtn} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 36,
    maxHeight: "90%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    padding: 0,
  },
  disabledText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#64748b",
  },
  saveBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#ffffff",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  toggleSub: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
  },
  securityHighlight: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#16a34a",
  },
  securityDesc: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
    lineHeight: 16,
  },
  policyBlock: {
    marginBottom: 14,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  policyHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  policyText: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 16,
  },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  langOptionActive: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  langText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  langTextActive: {
    color: "#ef4444",
    fontWeight: "900",
  },
  contactRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  callSupportBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  callSupportText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  whatsappBtn: {
    flex: 1,
    backgroundColor: "#22c55e",
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  whatsappText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  supportInfoBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    gap: 4,
    marginBottom: 10,
  },
  supportInfoText: {
    fontSize: 12,
    color: "#64748b",
  },
  boldText: {
    fontWeight: "800",
    color: "#0f172a",
  },
  faqCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqQ: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0f172a",
    flex: 1,
    marginRight: 6,
  },
  faqA: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 8,
    lineHeight: 16,
  },
});
