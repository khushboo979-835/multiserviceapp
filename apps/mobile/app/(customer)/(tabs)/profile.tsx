import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
  Modal,
} from "react-native";
import { useAuthStore } from "../../../src/store/useAuthStore";
import {
  LogOut,
  ChevronRight,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  Briefcase,
  Sparkles,
  Phone,
  Edit3,
  Gift,
  Globe,
  ShieldAlert,
  Copy,
  Share2,
  X,
  Check,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BrandLogo from "../../../src/components/common/BrandLogo";
import {
  EditProfileModal,
  NotificationsModal,
  PrivacySecurityModal,
  AppPreferencesModal,
  HelpSupportModal,
} from "../../../src/components/profile/ProfileModals";
import LanguageCitySelectorModal from "../../../src/components/common/LanguageCitySelectorModal";
import InAppAdminPortalModal from "../../../src/components/admin/InAppAdminPortalModal";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [editVisible, setEditVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [prefVisible, setPrefVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [referVisible, setReferVisible] = useState(false);
  const [langCityVisible, setLangCityVisible] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);

  const [selectedCity, setSelectedCity] = useState("Patna");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [copied, setCopied] = useState(false);

  const referralCode = `INISHA-${user?.phoneNumber?.slice(-4) || "7857"}`;
  const displayName = user?.name || `Customer ${user?.phoneNumber?.slice(-4) || "User"}`;

  const handleCopyReferral = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert("Code Copied! 📋", `Referral Code ${referralCode} copied to clipboard.`);
  };

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: `Use my referral code ${referralCode} on Inisha City Service to get ₹100 instant wallet bonus for home repairs, AC service & grocery delivery! Download app now: https://expo.dev/artifacts/eas/7qz62D_XnV-VtH1P2K88lzYqBWek1RXFq97alZpe59Y.apk`,
      });
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert(
      "Confirm Sign Out",
      "Are you sure you want to sign out of Inisha City Service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const handleSwitchToPartner = () => {
    router.push("/(auth)/select-role");
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 10 }]}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* User Header Profile Card */}
      <View style={styles.profileCard}>
        <BrandLogo size="md" showText={false} />
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{displayName}</Text>
          <TouchableOpacity onPress={() => setEditVisible(true)} style={styles.editIconBtn}>
            <Edit3 size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
        <View style={styles.phonePill}>
          <Phone size={13} color="#64748b" />
          <Text style={styles.userPhone}>{user?.phoneNumber || "+91 78570 23438"}</Text>
        </View>
        <View style={styles.customerBadge}>
          <Sparkles size={13} color="#ef4444" />
          <Text style={styles.customerBadgeText}>VERIFIED CUSTOMER • {selectedCity.toUpperCase()}</Text>
        </View>
      </View>

      {/* Refer & Earn Banner */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setReferVisible(true)}
        style={styles.referralBanner}
      >
        <View style={styles.referralLeft}>
          <View style={styles.giftIconBox}>
            <Gift size={22} color="#ffffff" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.referralTitle}>Refer & Earn ₹100 Cashback 🎁</Text>
            <Text style={styles.referralSub}>Share your code with friends & family</Text>
          </View>
        </View>
        <ChevronRight size={18} color="#ef4444" />
      </TouchableOpacity>

      {/* Menu Settings Card */}
      <View style={styles.menuCard}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => setLangCityVisible(true)} style={styles.menuRow}>
          <View style={styles.menuRowLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#fef2f2" }]}>
              <Globe size={18} color="#ef4444" />
            </View>
            <View>
              <Text style={styles.menuTitle}>Language & City Region</Text>
              <Text style={styles.menuSub}>{selectedCity} • {selectedLanguage.toUpperCase()}</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={() => setNotifVisible(true)} style={styles.menuRow}>
          <View style={styles.menuRowLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#f8fafc" }]}>
              <Bell size={18} color="#475569" />
            </View>
            <Text style={styles.menuTitle}>Notifications & Job Alerts</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={() => setPrivacyVisible(true)} style={styles.menuRow}>
          <View style={styles.menuRowLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#f8fafc" }]}>
              <Shield size={18} color="#475569" />
            </View>
            <Text style={styles.menuTitle}>Privacy & Security</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={() => setPrefVisible(true)} style={styles.menuRow}>
          <View style={styles.menuRowLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#f8fafc" }]}>
              <Settings size={18} color="#475569" />
            </View>
            <View>
              <Text style={styles.menuTitle}>App Settings & Preferences</Text>
              <Text style={styles.menuSub}>Sound, Dark mode & Language</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={() => setHelpVisible(true)} style={styles.menuRow}>
          <View style={styles.menuRowLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#f8fafc" }]}>
              <HelpCircle size={18} color="#475569" />
            </View>
            <Text style={styles.menuTitle}>Help Center & WhatsApp</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={() => setAdminVisible(true)} style={[styles.menuRow, { borderBottomWidth: 0 }]}>
          <View style={styles.menuRowLeft}>
            <View style={[styles.menuIconCircle, { backgroundColor: "#fef2f2" }]}>
              <ShieldAlert size={18} color="#ef4444" />
            </View>
            <View>
              <Text style={[styles.menuTitle, { color: "#ef4444", fontWeight: "800" }]}>Admin Management Portal</Text>
              <Text style={styles.menuSub}>KYC, Payouts, Coupons & Analytics</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleLogout}
        style={styles.signOutButton}
      >
        <LogOut size={18} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Refer & Earn Modal */}
      <Modal visible={referVisible} animationType="slide" transparent onRequestClose={() => setReferVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.referModalContainer}>
            <View style={styles.referModalHeader}>
              <Text style={styles.referModalTitle}>Refer Friends & Earn ₹100</Text>
              <TouchableOpacity onPress={() => setReferVisible(false)} style={styles.closeBtn}>
                <X size={18} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <View style={styles.referCardCenter}>
              <Gift size={48} color="#ef4444" />
              <Text style={styles.referDesc}>
                Share your unique invite code. When your friend places their first repair or service, both of you get ₹100 wallet cashback!
              </Text>

              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{referralCode}</Text>
                <TouchableOpacity onPress={handleCopyReferral} style={styles.copyBtn}>
                  {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} color="#ef4444" />}
                  <Text style={[styles.copyBtnText, copied && { color: "#16a34a" }]}>
                    {copied ? "Copied" : "Copy"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleShareReferral} style={styles.shareWhatsAppBtn} activeOpacity={0.85}>
                <Share2 size={18} color="#ffffff" />
                <Text style={styles.shareWhatsAppText}>Share on WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Interactive Modals */}
      <EditProfileModal visible={editVisible} onClose={() => setEditVisible(false)} />
      <NotificationsModal visible={notifVisible} onClose={() => setNotifVisible(false)} />
      <PrivacySecurityModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />
      <AppPreferencesModal visible={prefVisible} onClose={() => setPrefVisible(false)} />
      <HelpSupportModal visible={helpVisible} onClose={() => setHelpVisible(false)} />

      <LanguageCitySelectorModal
        visible={langCityVisible}
        onClose={() => setLangCityVisible(false)}
        selectedCity={selectedCity}
        selectedLanguage={selectedLanguage}
        onSelectCity={setSelectedCity}
        onSelectLanguage={setSelectedLanguage}
      />

      <InAppAdminPortalModal
        visible={adminVisible}
        onClose={() => setAdminVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 28,
    padding: 22,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  editIconBtn: {
    marginLeft: 8,
    padding: 6,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
  },
  phonePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  userPhone: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginLeft: 6,
  },
  customerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 10,
  },
  customerBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ef4444",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  referralBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff7ed",
    borderWidth: 1.5,
    borderColor: "#ffedd5",
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  referralLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  giftIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
  },
  referralTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#9a3412",
  },
  referralSub: {
    fontSize: 11,
    color: "#c2410c",
    marginTop: 2,
  },
  switchRoleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },
  switchRoleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchRoleIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  switchRoleTextContainer: {
    marginLeft: 12,
  },
  switchRoleTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  switchRoleSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  menuSub: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 1,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#fee2e2",
    borderRadius: 18,
    paddingVertical: 14,
    marginBottom: 20,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#ef4444",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  referModalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  referModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  referModalTitle: {
    fontSize: 17,
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
  referCardCenter: {
    alignItems: "center",
    paddingVertical: 10,
  },
  referDesc: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    marginVertical: 14,
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#ef4444",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ef4444",
    letterSpacing: 1.5,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ef4444",
  },
  shareWhatsAppBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  shareWhatsAppText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
});
