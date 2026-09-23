import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  X,
  TrendingUp,
  Star,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  Calendar,
  ChevronRight,
  ShieldCheck,
} from "lucide-react-native";

export default function PerformanceReportsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"WEEKLY" | "DAILY">("WEEKLY");

  const weeklyData = [
    { day: "Mon", amount: 1850, height: "60%" },
    { day: "Tue", amount: 2400, height: "80%" },
    { day: "Wed", amount: 1600, height: "55%" },
    { day: "Thu", amount: 3100, height: "100%" },
    { day: "Fri", amount: 2750, height: "90%" },
    { day: "Sat", amount: 2900, height: "95%" },
    { day: "Sun", amount: 2100, height: "70%" },
  ];

  const categoryBreakdown = [
    { name: "Mobile & Gadget Repair", count: 24, earnings: 14200, color: "#ef4444" },
    { name: "AC Repair & Service", count: 18, earnings: 12800, color: "#3b82f6" },
    { name: "Electrician & Wiring", count: 14, earnings: 6900, color: "#f59e0b" },
    { name: "Plumbing & Sanitary", count: 8, earnings: 4200, color: "#10b981" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Daily & Weekly Reports</Text>
              <Text style={styles.subtitle}>Partner performance telemetry & analytics</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Tier Badge Banner */}
            <View style={styles.tierBanner}>
              <Award size={22} color="#ffffff" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.tierTitle}>Diamond Elite Partner ⭐</Text>
                <Text style={styles.tierSub}>Top 1% service professional in your city</Text>
              </View>
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>TIER 1</Text>
              </View>
            </View>

            {/* Metric KPI Grid */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <View style={styles.kpiIconBox}>
                  <CheckCircle2 size={18} color="#16a34a" />
                </View>
                <Text style={styles.kpiLabel}>ACCEPTANCE</Text>
                <Text style={styles.kpiValue}>98.4%</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={styles.kpiIconBox}>
                  <Clock size={18} color="#3b82f6" />
                </View>
                <Text style={styles.kpiLabel}>ON-TIME ARRIVAL</Text>
                <Text style={styles.kpiValue}>97.1%</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={styles.kpiIconBox}>
                  <Star size={18} color="#f59e0b" fill="#f59e0b" />
                </View>
                <Text style={styles.kpiLabel}>RATING</Text>
                <Text style={styles.kpiValue}>4.95 ★</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={styles.kpiIconBox}>
                  <Zap size={18} color="#ef4444" />
                </View>
                <Text style={styles.kpiLabel}>COMPLETED</Text>
                <Text style={styles.kpiValue}>64 Jobs</Text>
              </View>
            </View>

            {/* Weekly Earnings Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.chartTitle}>Weekly Earnings Summary</Text>
                  <Text style={styles.chartTotal}>₹16,700 Generated This Week</Text>
                </View>
                <View style={styles.growthBadge}>
                  <TrendingUp size={14} color="#16a34a" />
                  <Text style={styles.growthText}>+28%</Text>
                </View>
              </View>

              {/* Bar Chart Visual */}
              <View style={styles.barChartContainer}>
                {weeklyData.map((d, i) => (
                  <View key={i} style={styles.barCol}>
                    <Text style={styles.barAmount}>₹{(d.amount / 1000).toFixed(1)}k</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: d.height as any }]} />
                    </View>
                    <Text style={styles.barDay}>{d.day}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bonus Incentive Card */}
            <View style={styles.incentiveCard}>
              <View style={styles.incentiveLeft}>
                <Award size={20} color="#f59e0b" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.incentiveTitle}>Weekly Milestone Bonus</Text>
                  <Text style={styles.incentiveSub}>Completed 60+ jobs this week</Text>
                </View>
              </View>
              <Text style={styles.incentiveReward}>+₹1,500</Text>
            </View>

            {/* Service Category Breakdown */}
            <Text style={styles.sectionTitle}>Category-wise Orders</Text>
            <View style={styles.breakdownList}>
              {categoryBreakdown.map((cat, idx) => (
                <View key={idx} style={styles.breakdownRow}>
                  <View style={styles.breakdownLeft}>
                    <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                    <View>
                      <Text style={styles.catName}>{cat.name}</Text>
                      <Text style={styles.catCount}>{cat.count} Jobs Fulfilled</Text>
                    </View>
                  </View>
                  <Text style={styles.catEarnings}>₹{cat.earnings.toLocaleString("en-IN")}</Text>
                </View>
              ))}
            </View>
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
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: "88%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  tierBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  tierTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },
  tierSub: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#ffffff",
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },
  kpiCard: {
    width: "48%",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  kpiIconBox: {
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  chartTotal: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#16a34a",
  },
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    paddingTop: 10,
  },
  barCol: {
    alignItems: "center",
    flex: 1,
  },
  barAmount: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 80,
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    width: "100%",
  },
  barDay: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    marginTop: 6,
  },
  incentiveCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    padding: 14,
    borderRadius: 16,
    marginBottom: 18,
  },
  incentiveLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  incentiveTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#92400e",
  },
  incentiveSub: {
    fontSize: 11,
    color: "#b45309",
    marginTop: 2,
  },
  incentiveReward: {
    fontSize: 16,
    fontWeight: "900",
    color: "#15803d",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  breakdownList: {
    gap: 10,
    marginBottom: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  catName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  catCount: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  catEarnings: {
    fontSize: 14,
    fontWeight: "900",
    color: "#0f172a",
  },
});
