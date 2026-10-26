import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import {
  ShieldAlert,
  X,
  Users,
  CheckCircle,
  XCircle,
  PlusCircle,
  Tag,
  DollarSign,
  TrendingUp,
  FileCheck,
  Building,
  Bell,
  RefreshCw,
} from "lucide-react-native";
import { MOCK_COUPONS, MOCK_CITIES } from "../../constants/mockData";
import { FranchiseCity, Coupon, WithdrawalRequest } from "../../types";

interface InAppAdminPortalModalProps {
  visible: boolean;
  onClose: () => void;
  onAddCategory?: (category: any) => void;
}

const MOCK_PENDING_KYCS = [
  {
    id: "kyc_1",
    providerName: "Mohan Kumar (Certified AC Tech)",
    phone: "+91 98351 22334",
    services: "AC Repair & Jet Service",
    docs: ["Aadhaar Verified", "PAN Verified", "Diploma Certified"],
    date: "Today, 10:15 AM",
  },
  {
    id: "kyc_2",
    providerName: "Rahul Sharma (Master Plumber)",
    phone: "+91 94311 88776",
    services: "Plumbing & Sanitary Works",
    docs: ["Aadhaar Verified", "Driving License"],
    date: "Yesterday",
  },
];

const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: "wd_1",
    providerId: "prv_101",
    providerName: "Mohan Kumar",
    amount: 3450,
    payoutMethod: "UPI",
    upiId: "mohan.ac@okhdfcbank",
    status: "PENDING",
    requestedAt: "Today, 09:30 AM",
  },
  {
    id: "wd_2",
    providerId: "prv_102",
    providerName: "Rakesh Mobile Doctor",
    amount: 8200,
    payoutMethod: "UPI",
    upiId: "rakesh.repair@ybl",
    status: "PENDING",
    requestedAt: "Today, 08:45 AM",
  },
];

export default function InAppAdminPortalModal({
  visible,
  onClose,
  onAddCategory,
}: InAppAdminPortalModalProps) {
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "KYC" | "WITHDRAWALS" | "CATEGORIES" | "COUPONS" | "FRANCHISE"
  >("OVERVIEW");

  const [pendingKycs, setPendingKycs] = useState(MOCK_PENDING_KYCS);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(MOCK_WITHDRAWALS);
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [franchises, setFranchises] = useState<FranchiseCity[]>(MOCK_CITIES);

  // New Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [newCatPrice, setNewCatPrice] = useState("399");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("sparkles");

  // New Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("20");

  const handleApproveKyc = (id: string, name: string) => {
    setPendingKycs(pendingKycs.filter((k) => k.id !== id));
    Alert.alert("KYC Approved! ✅", `${name} is now certified to accept live customer bookings.`);
  };

  const handleRejectKyc = (id: string, name: string) => {
    setPendingKycs(pendingKycs.filter((k) => k.id !== id));
    Alert.alert("KYC Rejected", `Verification request for ${name} has been rejected.`);
  };

  const handleApproveWithdrawal = (id: string, amount: number, upi: string = "") => {
    setWithdrawals(
      withdrawals.map((w) => (w.id === id ? { ...w, status: "APPROVED" } : w))
    );
    Alert.alert("Payout Processed 💰", `₹${amount} transferred instantly to ${upi}.`);
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) {
      Alert.alert("Required", "Please enter category name.");
      return;
    }

    const created = {
      id: `cat_${Date.now()}`,
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/\s+/g, "-"),
      description: newCatDesc || "Professional doorstep service with warranty.",
      imageUrl: newCatIcon,
      isActive: true,
      subcategories: [
        {
          id: `sub_${Date.now()}`,
          categoryId: `cat_${Date.now()}`,
          name: `${newCatName} Inspection & Service`,
          slug: `${newCatName.toLowerCase().replace(/\s+/g, "-")}-service`,
          description: "Certified technician visit and doorstep work.",
          basePrice: parseInt(newCatPrice) || 399,
          imageUrl: newCatIcon,
          formConfig: {
            fields: [
              {
                id: "service_details",
                label: "Service Requirement Description",
                type: "TEXT",
                placeholder: "Describe issue...",
                validation: { required: true },
              },
              {
                id: "preferred_date",
                label: "Visit Date",
                type: "DATE",
                validation: { required: true },
              },
              {
                id: "preferred_time",
                label: "Time Slot",
                type: "TIME_SLOT",
                validation: { required: true },
              },
              {
                id: "service_address",
                label: "Address",
                type: "ADDRESS_GPS",
                validation: { required: true },
              },
            ],
          },
        },
      ],
    };

    if (onAddCategory) {
      onAddCategory(created);
    }
    setNewCatName("");
    setNewCatDesc("");
    Alert.alert("Service Created 🚀", `"${created.name}" is now live in the mobile app!`);
  };

  const handleCreateCoupon = () => {
    if (!newCouponCode.trim()) {
      Alert.alert("Required", "Please enter coupon code.");
      return;
    }
    const created: Coupon = {
      code: newCouponCode.toUpperCase(),
      discountType: "PERCENTAGE",
      discountValue: parseInt(newCouponDiscount) || 20,
      minOrderValue: 299,
      maxDiscount: 200,
      description: `${newCouponDiscount}% Instant Discount on all bookings`,
      expiresAt: "2026-12-31",
    };
    setCoupons([created, ...coupons]);
    setNewCouponCode("");
    Alert.alert("Coupon Created 🎉", `Code "${created.code}" is now active for all customers!`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.titleRow}>
            <ShieldAlert size={24} color="#ef4444" />
            <Text style={styles.adminTitle}>Inisha Admin Control</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {[
            { key: "OVERVIEW", label: "📊 Overview" },
            { key: "KYC", label: `🪪 KYC (${pendingKycs.length})` },
            { key: "WITHDRAWALS", label: `💰 Payouts (${withdrawals.filter(w => w.status === "PENDING").length})` },
            { key: "CATEGORIES", label: "🛠️ Add Service" },
            { key: "COUPONS", label: "🏷️ Coupons" },
            { key: "FRANCHISE", label: "🏢 Multi-City" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              style={[styles.tabPill, activeTab === tab.key && styles.tabPillActive]}
            >
              <Text style={[styles.tabPillText, activeTab === tab.key && styles.tabPillTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Main Content */}
        <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
          {activeTab === "OVERVIEW" && (
            <View>
              {/* Stat Cards */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total GMV</Text>
                  <Text style={styles.statVal}>₹54,28,900</Text>
                  <Text style={styles.statSub}>+18.4% this month</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Platform Revenue</Text>
                  <Text style={[styles.statVal, { color: "#16a34a" }]}>₹8,14,335</Text>
                  <Text style={styles.statSub}>15% net commission</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total Bookings</Text>
                  <Text style={styles.statVal}>3,412</Text>
                  <Text style={styles.statSub}>98.2% completion rate</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Active Partners</Text>
                  <Text style={[styles.statVal, { color: "#3b82f6" }]}>503</Text>
                  <Text style={styles.statSub}>Across 5 Cities</Text>
                </View>
              </View>

              {/* Commission Config Box */}
              <View style={styles.sectionBox}>
                <Text style={styles.sectionBoxTitle}>Revenue Model Settings</Text>
                <View style={styles.settingRow}>
                  <Text style={styles.settingText}>Platform Commission Rate</Text>
                  <Text style={styles.settingVal}>15.0%</Text>
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingText}>Customer Convenience Fee</Text>
                  <Text style={styles.settingVal}>₹29 / booking</Text>
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingText}>Referral Bonus Payout</Text>
                  <Text style={styles.settingVal}>₹100 in Wallet</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === "KYC" && (
            <View>
              <Text style={styles.tabHeading}>Pending Technician KYC Approvals</Text>
              {pendingKycs.length === 0 ? (
                <Text style={styles.emptyText}>All partner documents are verified!</Text>
              ) : (
                pendingKycs.map((kyc) => (
                  <View key={kyc.id} style={styles.kycCard}>
                    <Text style={styles.kycName}>{kyc.providerName}</Text>
                    <Text style={styles.kycPhone}>📱 {kyc.phone} • {kyc.services}</Text>
                    <View style={styles.docsRow}>
                      {kyc.docs.map((doc, idx) => (
                        <View key={idx} style={styles.docBadge}>
                          <FileCheck size={12} color="#16a34a" />
                          <Text style={styles.docText}>{doc}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.kycActions}>
                      <TouchableOpacity
                        onPress={() => handleApproveKyc(kyc.id, kyc.providerName)}
                        style={styles.approveBtn}
                      >
                        <CheckCircle size={16} color="#ffffff" />
                        <Text style={styles.approveBtnText}>Approve KYC</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRejectKyc(kyc.id, kyc.providerName)}
                        style={styles.rejectBtn}
                      >
                        <XCircle size={16} color="#ef4444" />
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === "WITHDRAWALS" && (
            <View>
              <Text style={styles.tabHeading}>Provider Withdrawal Requests</Text>
              {withdrawals.map((item) => (
                <View key={item.id} style={styles.kycCard}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.kycName}>{item.providerName}</Text>
                    <Text style={[styles.kycName, { color: "#ef4444" }]}>₹{item.amount}</Text>
                  </View>
                  <Text style={styles.kycPhone}>UPI ID: {item.upiId || "Bank Account"}</Text>
                  <Text style={styles.kycSub}>{item.requestedAt}</Text>

                  {item.status === "PENDING" ? (
                    <TouchableOpacity
                      onPress={() => handleApproveWithdrawal(item.id, item.amount, item.upiId)}
                      style={[styles.approveBtn, { marginTop: 10 }]}
                    >
                      <DollarSign size={16} color="#ffffff" />
                      <Text style={styles.approveBtnText}>Approve & Transfer ₹{item.amount}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.paidBadge}>
                      <CheckCircle size={14} color="#16a34a" />
                      <Text style={styles.paidText}>SETTLED & PAID</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {activeTab === "CATEGORIES" && (
            <View style={styles.formCard}>
              <Text style={styles.tabHeading}>Add New Dynamic Service Category</Text>
              <Text style={styles.fieldLabel}>Category / Service Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Sofa Dry Cleaning, Solar Panel Repair"
                placeholderTextColor="#94a3b8"
                value={newCatName}
                onChangeText={setNewCatName}
              />

              <Text style={styles.fieldLabel}>Starting Base Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="399"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={newCatPrice}
                onChangeText={setNewCatPrice}
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Service details and 30-day warranty info..."
                placeholderTextColor="#94a3b8"
                value={newCatDesc}
                onChangeText={setNewCatDesc}
              />

              <TouchableOpacity onPress={handleCreateCategory} style={styles.submitBtn}>
                <PlusCircle size={18} color="#ffffff" />
                <Text style={styles.submitText}>Add Live Service</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "COUPONS" && (
            <View>
              <View style={styles.formCard}>
                <Text style={styles.tabHeading}>Create New Promo Coupon</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Coupon Code (e.g. FESTIVE30)"
                  placeholderTextColor="#94a3b8"
                  value={newCouponCode}
                  onChangeText={setNewCouponCode}
                  autoCapitalize="characters"
                />
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  placeholder="Discount % (e.g. 25)"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={newCouponDiscount}
                  onChangeText={setNewCouponDiscount}
                />
                <TouchableOpacity onPress={handleCreateCoupon} style={[styles.submitBtn, { marginTop: 10 }]}>
                  <Tag size={16} color="#ffffff" />
                  <Text style={styles.submitText}>Publish Coupon Code</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.tabHeading, { marginTop: 20 }]}>Active Coupons</Text>
              {coupons.map((c) => (
                <View key={c.code} style={styles.couponCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Tag size={16} color="#ef4444" />
                    <Text style={styles.couponCode}>{c.code}</Text>
                  </View>
                  <Text style={styles.couponDesc}>{c.description}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === "FRANCHISE" && (
            <View>
              <Text style={styles.tabHeading}>City Franchise Hubs</Text>
              {franchises.map((f) => (
                <View key={f.id} style={styles.kycCard}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={styles.kycName}>{f.cityName}, {f.state}</Text>
                    <Text style={[styles.kycName, { color: "#16a34a" }]}>₹{(f.monthlyGmv / 100000).toFixed(1)}L GMV</Text>
                  </View>
                  <Text style={styles.kycPhone}>City Manager: {f.managerName} ({f.managerPhone})</Text>
                  <Text style={styles.kycSub}>{f.totalProviders} Active Technicians Online</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 50,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adminTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tabsScroll: {
    maxHeight: 48,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  tabPill: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabPillActive: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  tabPillTextActive: {
    color: "#ffffff",
  },
  mainScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: (Dimensions.get("window").width - 52) / 2,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 14,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  statVal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 4,
  },
  statSub: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  sectionBox: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  sectionBoxTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  settingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  settingVal: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ef4444",
  },
  tabHeading: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 20,
    textAlign: "center",
  },
  kycCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  kycName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  kycPhone: {
    fontSize: 13,
    color: "#475569",
    marginTop: 3,
  },
  kycSub: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  docsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  docBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  docText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16a34a",
  },
  kycActions: {
    flexDirection: "row",
    gap: 10,
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  approveBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  rejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  rejectBtnText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "800",
  },
  paidBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  paidText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16a34a",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    marginTop: 16,
  },
  submitText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  couponCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  couponCode: {
    fontSize: 15,
    fontWeight: "900",
    color: "#ef4444",
  },
  couponDesc: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
});
