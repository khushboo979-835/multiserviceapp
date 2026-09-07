import React, { useState } from "react";
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Alert, 
  ActivityIndicator,
  StyleSheet 
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingStore } from "@/store/useBookingStore";
import { 
  syncUserProfile, 
  updateUserProfileData, 
  saveUserAddressInFirestore, 
  deleteUserAddressInFirestore 
} from "@/services/firestoreService";
import { useToast } from "@/components/ui/ToastProvider";
import { UserSavedAddress } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  User, 
  LogOut, 
  ChevronRight, 
  Settings, 
  Shield, 
  Bell, 
  HelpCircle, 
  Edit3, 
  MapPin, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Phone, 
  Mail, 
  Home, 
  Briefcase, 
  Sparkles,
  ShieldCheck,
  Globe
} from "lucide-react-native";
import { useRouter } from "expo-router";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
];

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuthStore();
  const { bookingHistory } = useBookingStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showSuccess, showError } = useToast();

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || user?.fullName || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || user?.phone || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || AVATAR_PRESETS[0]);
  const [savingProfile, setSavingProfile] = useState(false);

  // Add Address Modal State
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [addressType, setAddressType] = useState<"Home" | "Work" | "Other">("Home");
  const [flatNo, setFlatNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Gurugram");
  const [pincode, setPincode] = useState("122002");
  const [savingAddress, setSavingAddress] = useState(false);

  // Language Modal State
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English (US)");

  // Help & Support Modal State
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("@inisha_auth_user");
              await AsyncStorage.removeItem("@inisha_auth_token");
            } catch (e) {
              console.warn("AsyncStorage logout cleanup error:", e);
            }
            logout();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      showError("Please enter your full name");
      return;
    }

    setSavingProfile(true);
    try {
      const uid = user?.id || user?.uid;
      const updatedData = {
        name: editName.trim(),
        fullName: editName.trim(),
        email: editEmail.trim(),
        phoneNumber: editPhone.trim(),
        phone: editPhone.trim(),
        avatarUrl: selectedAvatar,
      };

      updateUser(updatedData);

      if (uid) {
        await syncUserProfile({
          ...user,
          ...updatedData,
          id: uid,
        });
      }

      showSuccess("Profile details updated successfully!");
      setIsEditProfileOpen(false);
    } catch (err) {
      console.error("Profile update error:", err);
      showError("Failed to update profile. Saved locally.");
      setIsEditProfileOpen(false);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!flatNo.trim() || !street.trim() || !city.trim() || !pincode.trim()) {
      showError("Please fill in Flat No, Street, City, and Pincode");
      return;
    }

    setSavingAddress(true);
    try {
      const formattedAddress = `${flatNo.trim()}, ${street.trim()}${landmark ? `, Near ${landmark.trim()}` : ""}, ${city.trim()} - ${pincode.trim()}`;
      const newAddress: UserSavedAddress = {
        id: `addr_${Date.now()}`,
        type: addressType,
        flatNo: flatNo.trim(),
        street: street.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        formattedAddress,
        isDefault: (user?.savedAddresses?.length || 0) === 0,
      };

      const uid = user?.id || user?.uid;
      let updatedList = [...(user?.savedAddresses || []), newAddress];

      if (uid) {
        updatedList = await saveUserAddressInFirestore(uid, newAddress);
      }

      updateUser({ savedAddresses: updatedList, selectedLocation: formattedAddress });
      showSuccess("New address added successfully!");
      
      // Reset form
      setFlatNo("");
      setStreet("");
      setLandmark("");
      setIsAddAddressOpen(false);
    } catch (err) {
      console.error("Address save error:", err);
      showError("Failed to save address to server.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to remove this saved address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const uid = user?.id || user?.uid;
            let updatedList = (user?.savedAddresses || []).filter(a => a.id !== addressId);
            if (uid) {
              updatedList = await deleteUserAddressInFirestore(uid, addressId);
            }
            updateUser({ savedAddresses: updatedList });
            showSuccess("Address removed");
          },
        },
      ]
    );
  };

  const userAvatar = user?.avatarUrl || selectedAvatar;
  const savedAddresses = user?.savedAddresses || [];

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top + 8, 20) }]}>
      <ScrollView 
        style={styles.mainScroll} 
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header Title */}
        <View style={styles.topHeader}>
          <Text style={styles.screenHeading}>My Account</Text>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => {
              setEditName(user?.name || user?.fullName || "");
              setEditEmail(user?.email || "");
              setEditPhone(user?.phoneNumber || user?.phone || "");
              setSelectedAvatar(user?.avatarUrl || AVATAR_PRESETS[0]);
              setIsEditProfileOpen(true);
            }}
            style={styles.editHeaderBtn}
          >
            <Edit3 size={15} color="#8b5cf6" />
            <Text style={styles.editHeaderBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: userAvatar }} 
              style={styles.avatarImage} 
              resizeMode="cover"
            />
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={12} color="#10b981" />
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {user?.name || user?.fullName || "Verified User"}
            </Text>
            <View style={styles.profileMetaRow}>
              <Phone size={12} color="#94a3b8" />
              <Text style={styles.profileMetaText}>{user?.phoneNumber || user?.phone || "+91 XXXXXXXXXX"}</Text>
            </View>
            {user?.email ? (
              <View style={styles.profileMetaRow}>
                <Mail size={12} color="#94a3b8" />
                <Text style={styles.profileMetaText} numberOfLines={1}>{user.email}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Account Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{bookingHistory.length}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{savedAddresses.length}</Text>
            <Text style={styles.statLabel}>Saved Locations</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: "#10b981" }]}>₹1,250</Text>
            <Text style={styles.statLabel}>Wallet Cash</Text>
          </View>
        </View>

        {/* Saved Addresses Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MapPin size={18} color="#8b5cf6" />
              <Text style={styles.sectionCardTitle}>Saved Doorstep Addresses</Text>
            </View>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setIsAddAddressOpen(true)}
              style={styles.addAddressChip}
            >
              <Plus size={14} color="#ffffff" />
              <Text style={styles.addAddressChipText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {savedAddresses.length === 0 ? (
            <View style={styles.emptyAddressBox}>
              <Text style={styles.emptyAddressTitle}>No Saved Addresses</Text>
              <Text style={styles.emptyAddressSub}>Add your home or office address for 1-tap checkout.</Text>
            </View>
          ) : (
            savedAddresses.map((addr) => (
              <View key={addr.id} style={styles.addressItem}>
                <View style={styles.addressTypeBadge}>
                  {addr.type === "Home" ? <Home size={12} color="#8b5cf6" /> : addr.type === "Work" ? <Briefcase size={12} color="#38bdf8" /> : <MapPin size={12} color="#10b981" />}
                  <Text style={styles.addressTypeText}>{addr.type}</Text>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                  <Text style={styles.addressLine1} numberOfLines={1}>{addr.flatNo}, {addr.street}</Text>
                  <Text style={styles.addressLine2}>{addr.city} - {addr.pincode}</Text>
                </View>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => handleDeleteAddress(addr.id)}
                  style={styles.deleteAddressBtn}
                >
                  <Trash2 size={15} color="#f43f5e" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Preferences & Help Menu */}
        <View style={styles.menuCard}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => router.push("/(customer)/(tabs)/bookings")}
            style={styles.menuItem}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: "#1e1b4b" }]}>
                <Sparkles size={18} color="#8b5cf6" />
              </View>
              <Text style={styles.menuItemText}>Order History & Invoices</Text>
            </View>
            <ChevronRight size={16} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setIsLanguageOpen(true)}
            style={styles.menuItem}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: "#312e81" }]}>
                <Globe size={18} color="#818cf8" />
              </View>
              <View>
                <Text style={styles.menuItemText}>App Language</Text>
                <Text style={{ color: "#64748b", fontSize: 11, marginTop: 1 }}>{selectedLanguage}</Text>
              </View>
            </View>
            <ChevronRight size={16} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => setIsSupportOpen(true)}
            style={styles.menuItem}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: "#022c22" }]}>
                <HelpCircle size={18} color="#10b981" />
              </View>
              <Text style={styles.menuItemText}>24x7 Help Desk & Support</Text>
            </View>
            <ChevronRight size={16} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => showSuccess("App is on the latest version v1.2.0")}
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: "#082f49" }]}>
                <Shield size={18} color="#38bdf8" />
              </View>
              <Text style={styles.menuItemText}>Privacy Policy & Terms</Text>
            </View>
            <ChevronRight size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={styles.signOutBtn}
        >
          <LogOut size={18} color="#f43f5e" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditProfileOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditProfileOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Edit Profile Information</Text>
              <TouchableOpacity onPress={() => setIsEditProfileOpen(false)}>
                <X size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              
              {/* Choose Avatar */}
              <Text style={styles.inputLabel}>CHOOSE PROFILE AVATAR</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {AVATAR_PRESETS.map((avUrl, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.8}
                    onPress={() => setSelectedAvatar(avUrl)}
                    style={[
                      styles.avatarPresetChip,
                      selectedAvatar === avUrl && styles.avatarPresetSelected
                    ]}
                  >
                    <Image source={{ uri: avUrl }} style={styles.avatarPresetImage} />
                    {selectedAvatar === avUrl && (
                      <View style={styles.avatarCheckBadge}>
                        <Check size={10} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Full Name */}
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your full name"
                placeholderTextColor="#475569"
                style={styles.textInput}
              />

              {/* Phone Number */}
              <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              <TextInput
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="+91 XXXXXXXXXX"
                placeholderTextColor="#475569"
                keyboardType="phone-pad"
                style={styles.textInput}
              />

              {/* Email Address */}
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="youremail@example.com"
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.textInput}
              />

              {/* Save Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSaveProfile}
                disabled={savingProfile}
                style={styles.modalActionBtn}
              >
                {savingProfile ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalActionBtnText}>Save Profile Changes</Text>
                )}
              </TouchableOpacity>

            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* Add Saved Address Modal */}
      <Modal
        visible={isAddAddressOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddAddressOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setIsAddAddressOpen(false)}>
                <X size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              
              {/* Address Type Tag */}
              <Text style={styles.inputLabel}>SAVE AS</Text>
              <View style={{ flexDirection: "row", marginBottom: 14 }}>
                {(["Home", "Work", "Other"] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.8}
                    onPress={() => setAddressType(type)}
                    style={[
                      styles.typeSelectorBtn,
                      addressType === type && styles.typeSelectorSelected
                    ]}
                  >
                    <Text style={[styles.typeSelectorText, addressType === type && { color: "#fff" }]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Flat / House No */}
              <Text style={styles.inputLabel}>FLAT / HOUSE NO. / TOWER</Text>
              <TextInput
                value={flatNo}
                onChangeText={setFlatNo}
                placeholder="e.g. Tower 4, Flat 902"
                placeholderTextColor="#475569"
                style={styles.textInput}
              />

              {/* Street / Locality */}
              <Text style={styles.inputLabel}>STREET / AREA / SECTOR</Text>
              <TextInput
                value={street}
                onChangeText={setStreet}
                placeholder="e.g. Cyber City, Phase 2"
                placeholderTextColor="#475569"
                style={styles.textInput}
              />

              {/* Landmark */}
              <Text style={styles.inputLabel}>LANDMARK (OPTIONAL)</Text>
              <TextInput
                value={landmark}
                onChangeText={setLandmark}
                placeholder="e.g. Opposite Rapid Metro Station"
                placeholderTextColor="#475569"
                style={styles.textInput}
              />

              {/* City & Pincode Row */}
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ width: "48%" }}>
                  <Text style={styles.inputLabel}>CITY</Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="City"
                    placeholderTextColor="#475569"
                    style={styles.textInput}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <Text style={styles.inputLabel}>PINCODE</Text>
                  <TextInput
                    value={pincode}
                    onChangeText={setPincode}
                    placeholder="122002"
                    placeholderTextColor="#475569"
                    keyboardType="number-pad"
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Save Address Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSaveAddress}
                disabled={savingAddress}
                style={styles.modalActionBtn}
              >
                {savingAddress ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalActionBtnText}>Save Address</Text>
                )}
              </TouchableOpacity>

            </ScrollView>

          </View>
        </View>
      </Modal>

      {/* 24x7 Help Desk Support Modal */}
      <Modal
        visible={isSupportOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSupportOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: 30 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>24x7 Customer Help Desk</Text>
              <TouchableOpacity onPress={() => setIsSupportOpen(false)}>
                <X size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <View style={{ paddingVertical: 10 }}>
              <Text style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
                Need help with a booking or technician warranty claim? Our dedicated escalation team is available round the clock.
              </Text>
              <View style={styles.supportRow}>
                <Phone size={18} color="#10b981" />
                <Text style={styles.supportText}>Helpline: 1800-420-9999 (Toll Free)</Text>
              </View>
              <View style={styles.supportRow}>
                <Mail size={18} color="#8b5cf6" />
                <Text style={styles.supportText}>Email: support@multiserviceapp.com</Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsLanguageOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Choose Language</Text>
                <Text style={styles.modalHeaderSub}>Select your preferred interface language</Text>
              </View>
              <TouchableOpacity onPress={() => setIsLanguageOpen(false)}>
                <X size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8, paddingVertical: 10 }}>
              {[
                { name: "English (US)", native: "English" },
                { name: "हिन्दी", native: "Hindi" },
                { name: "বাংলা", native: "Bengali" },
                { name: "தமிழ்", native: "Tamil" },
                { name: "తెలుగు", native: "Telugu" },
                { name: "ಕನ್ನಡ", native: "Kannada" },
              ].map((lang) => {
                const isSelected = selectedLanguage === lang.name;
                return (
                  <TouchableOpacity
                    key={lang.name}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedLanguage(lang.name);
                      showSuccess(`Language set to ${lang.name}`);
                      setIsLanguageOpen(false);
                    }}
                    style={[
                      styles.languageItemRow,
                      isSelected ? styles.languageItemSelected : null
                    ]}
                  >
                    <View>
                      <Text style={[styles.languageName, isSelected ? { color: "#ffffff" } : null]}>
                        {lang.name}
                      </Text>
                      <Text style={styles.languageNative}>{lang.native}</Text>
                    </View>
                    {isSelected && <Check size={18} color="#8b5cf6" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 20,
  },
  mainScroll: {
    flex: 1,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  screenHeading: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  editHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1b4b",
    borderColor: "#8b5cf6",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  editHeaderBtnText: {
    color: "#a78bfa",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    position: "relative",
    backgroundColor: "#1e1b4b",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#022c22",
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  profileMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  profileMetaText: {
    color: "#94a3b8",
    fontSize: 12,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  statBox: {
    width: "31%",
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
    textTransform: "uppercase",
  },
  sectionCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionCardTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },
  addAddressChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7c3aed",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  addAddressChipText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
  },
  emptyAddressBox: {
    paddingVertical: 14,
    alignItems: "center",
  },
  emptyAddressTitle: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyAddressSub: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
  },
  addressItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  addressTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1b4b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  addressTypeText: {
    color: "#a78bfa",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 4,
  },
  addressLine1: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  addressLine2: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 1,
  },
  deleteAddressBtn: {
    padding: 6,
  },
  menuCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 24,
    padding: 6,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    borderColor: "rgba(244, 63, 94, 0.3)",
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 20,
  },
  signOutText: {
    color: "#f43f5e",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderColor: "#1e293b",
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeaderTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "800",
  },
  modalHeaderSub: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  inputLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    fontSize: 13,
    marginBottom: 10,
  },
  avatarPresetChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  avatarPresetSelected: {
    borderColor: "#8b5cf6",
  },
  avatarPresetImage: {
    width: "100%",
    height: "100%",
    borderRadius: 26,
  },
  avatarCheckBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
    padding: 2,
  },
  typeSelectorBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 3,
  },
  typeSelectorSelected: {
    backgroundColor: "#7c3aed",
    borderColor: "#8b5cf6",
  },
  typeSelectorText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  modalActionBtn: {
    backgroundColor: "#7c3aed",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 14,
    marginBottom: 10,
  },
  modalActionBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderColor: "#1e293b",
    borderWidth: 1,
  },
  supportText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 12,
  },
  languageItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  languageItemSelected: {
    borderColor: "#8b5cf6",
    backgroundColor: "rgba(139, 92, 246, 0.12)",
  },
  languageName: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "700",
  },
  languageNative: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 2,
  },
});

