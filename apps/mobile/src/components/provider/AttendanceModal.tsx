import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import {
  X,
  Clock,
  CheckCircle2,
  Calendar,
  Zap,
  Timer,
  Award,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AttendanceRecord {
  date: string;
  punchIn: string;
  punchOut: string | null;
  hours: string;
  status: "PRESENT" | "HALF_DAY" | "ABSENT";
}

export default function AttendanceModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [history, setHistory] = useState<AttendanceRecord[]>([
    {
      date: "Yesterday",
      punchIn: "09:15 AM",
      punchOut: "07:30 PM",
      hours: "10h 15m",
      status: "PRESENT",
    },
    {
      date: "20 Sep 2026",
      punchIn: "09:00 AM",
      punchOut: "06:45 PM",
      hours: "9h 45m",
      status: "PRESENT",
    },
    {
      date: "19 Sep 2026",
      punchIn: "10:30 AM",
      punchOut: "07:00 PM",
      hours: "8h 30m",
      status: "PRESENT",
    },
    {
      date: "18 Sep 2026",
      punchIn: "09:10 AM",
      punchOut: "08:15 PM",
      hours: "11h 05m",
      status: "PRESENT",
    },
    {
      date: "17 Sep 2026",
      punchIn: "09:30 AM",
      punchOut: "06:30 PM",
      hours: "9h 00m",
      status: "PRESENT",
    },
  ]);

  // Load saved punch-in state
  useEffect(() => {
    const loadPunchState = async () => {
      try {
        const savedTime = await AsyncStorage.getItem("@partner_punch_in_time");
        if (savedTime) {
          const t = parseInt(savedTime, 10);
          setPunchInTime(t);
          setIsPunchedIn(true);
          setElapsedSeconds(Math.floor((Date.now() - t) / 1000));
        }
      } catch {}
    };
    loadPunchState();
  }, []);

  // Timer loop when punched in
  useEffect(() => {
    let interval: any;
    if (isPunchedIn && punchInTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - punchInTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPunchedIn, punchInTime]);

  const formatElapsedTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}h ${m.toString().padStart(2, "0")}m ${s
      .toString()
      .padStart(2, "0")}s`;
  };

  const handlePunchToggle = async () => {
    if (!isPunchedIn) {
      const now = Date.now();
      setIsPunchedIn(true);
      setPunchInTime(now);
      setElapsedSeconds(0);
      await AsyncStorage.setItem("@partner_punch_in_time", now.toString());
      Alert.alert(
        "Punched In Successfully! 🟢",
        `Shift started at ${new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}. You are active for service requests.`
      );
    } else {
      Alert.alert(
        "Confirm Punch Out",
        "Are you sure you want to end your shift today?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Punch Out",
            style: "destructive",
            onPress: async () => {
              const totalHours = formatElapsedTime(elapsedSeconds);
              const newRecord: AttendanceRecord = {
                date: "Today",
                punchIn: punchInTime
                  ? new Date(punchInTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "09:00 AM",
                punchOut: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                hours: totalHours,
                status: "PRESENT",
              };
              setHistory([newRecord, ...history]);
              setIsPunchedIn(false);
              setPunchInTime(null);
              setElapsedSeconds(0);
              await AsyncStorage.removeItem("@partner_punch_in_time");
              Alert.alert(
                "Shift Ended 🏁",
                `Great job! You completed ${totalHours} of service today.`
              );
            },
          },
        ]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Daily Attendance & Shifts</Text>
              <Text style={styles.subtitle}>Track your daily duty hours & check-ins</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Live Shift Punch Card */}
            <View style={[styles.punchCard, isPunchedIn ? styles.punchCardActive : styles.punchCardInactive]}>
              <View style={styles.punchHeader}>
                <View style={[styles.statusBadge, isPunchedIn ? styles.badgeActive : styles.badgeInactive]}>
                  <View style={[styles.statusDot, { backgroundColor: isPunchedIn ? "#22c55e" : "#64748b" }]} />
                  <Text style={[styles.statusText, { color: isPunchedIn ? "#15803d" : "#475569" }]}>
                    {isPunchedIn ? "ON DUTY (ACTIVE SHIFT)" : "OFF DUTY (NOT PUNCHED IN)"}
                  </Text>
                </View>
                <Clock size={20} color={isPunchedIn ? "#22c55e" : "#64748b"} />
              </View>

              <Text style={styles.timerTitle}>Today's Working Hours</Text>
              <Text style={styles.timerValue}>
                {isPunchedIn ? formatElapsedTime(elapsedSeconds) : "00h 00m 00s"}
              </Text>

              {isPunchedIn && punchInTime && (
                <Text style={styles.punchSub}>
                  Punched in at {new Date(punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePunchToggle}
                style={[styles.punchBtn, isPunchedIn ? styles.punchOutBtn : styles.punchInBtn]}
              >
                <Timer size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.punchBtnText}>
                  {isPunchedIn ? "Punch Out & End Shift" : "Punch In Now (Start Shift)"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Attendance Rules Pill */}
            <View style={styles.rulesCard}>
              <Award size={18} color="#f59e0b" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rulesTitle}>Attendance Bonus Eligibility</Text>
                <Text style={styles.rulesText}>
                  Complete 8+ duty hours daily for 6 consecutive days to earn ₹1,200 weekly attendance bonus.
                </Text>
              </View>
            </View>

            {/* Attendance History Section */}
            <Text style={styles.sectionTitle}>7-Day Attendance Log</Text>
            <View style={styles.historyList}>
              {history.map((item, idx) => (
                <View key={idx} style={styles.historyRow}>
                  <View style={styles.historyLeft}>
                    <View style={styles.calendarIconBox}>
                      <Calendar size={18} color="#ef4444" />
                    </View>
                    <View>
                      <Text style={styles.historyDate}>{item.date}</Text>
                      <Text style={styles.historyTimes}>
                        In: {item.punchIn} • Out: {item.punchOut || "Active"}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.historyHours}>{item.hours}</Text>
                    <View style={styles.presentBadge}>
                      <CheckCircle2 size={12} color="#16a34a" />
                      <Text style={styles.presentText}>Present</Text>
                    </View>
                  </View>
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
    marginBottom: 18,
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
  punchCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1.5,
  },
  punchCardActive: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  punchCardInactive: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  punchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeActive: {
    backgroundColor: "#dcfce7",
  },
  badgeInactive: {
    backgroundColor: "#e2e8f0",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  timerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  timerValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: 1,
    marginVertical: 4,
  },
  punchSub: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "600",
    marginBottom: 12,
  },
  punchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  punchInBtn: {
    backgroundColor: "#ef4444",
  },
  punchOutBtn: {
    backgroundColor: "#0f172a",
  },
  punchBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  rulesCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  rulesTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#92400e",
  },
  rulesText: {
    fontSize: 12,
    color: "#b45309",
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  historyList: {
    gap: 10,
    marginBottom: 10,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  historyTimes: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  historyHours: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  presentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  presentText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16a34a",
  },
});
