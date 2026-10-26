import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  ShieldCheck,
  User,
} from "lucide-react-native";

interface CallSimulationModalProps {
  visible: boolean;
  onClose: () => void;
  technicianName?: string;
  technicianPhone?: string;
  callType: "AUDIO" | "VIDEO";
}

export default function CallSimulationModal({
  visible,
  onClose,
  technicianName = "Verified Technician",
  technicianPhone = "+91 73520 82614",
  callType,
}: CallSimulationModalProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === "VIDEO");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  useEffect(() => {
    let timer: any;
    if (visible) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [visible]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.verifiedTag}>
            <ShieldCheck size={14} color="#16a34a" />
            <Text style={styles.verifiedText}>End-to-End Encrypted HD Call</Text>
          </View>
        </View>

        {/* Video / Caller Area */}
        <View style={styles.centerArea}>
          {isVideoEnabled ? (
            <View style={styles.videoSimulatorBox}>
              <Text style={styles.videoSimText}>📹 HD Video Call Live</Text>
              <View style={styles.selfVideoPreview}>
                <Text style={styles.selfVideoText}>You</Text>
              </View>
            </View>
          ) : (
            <View style={styles.avatarLarge}>
              <User size={64} color="#ffffff" />
            </View>
          )}

          <Text style={styles.technicianName}>{technicianName}</Text>
          <Text style={styles.technicianPhone}>{technicianPhone}</Text>
          <Text style={styles.durationText}>{formatTimer(callDuration)}</Text>
        </View>

        {/* Controls Bar */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            onPress={() => setIsMuted(!isMuted)}
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          >
            {isMuted ? <MicOff size={24} color="#ffffff" /> : <Mic size={24} color="#ffffff" />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsVideoEnabled(!isVideoEnabled)}
            style={[styles.controlBtn, !isVideoEnabled && styles.controlBtnInactive]}
          >
            {isVideoEnabled ? <Video size={24} color="#ffffff" /> : <VideoOff size={24} color="#ffffff" />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
            style={[styles.controlBtn, isSpeakerOn && styles.controlBtnActive]}
          >
            <Volume2 size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.endCallBtn}>
            <PhoneOff size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "space-between",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  topHeader: {
    alignItems: "center",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  verifiedText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  centerArea: {
    alignItems: "center",
  },
  videoSimulatorBox: {
    width: width - 40,
    height: height * 0.45,
    backgroundColor: "#1e293b",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#334155",
  },
  videoSimText: {
    color: "#94a3b8",
    fontSize: 16,
    fontWeight: "700",
  },
  selfVideoPreview: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 90,
    height: 120,
    backgroundColor: "#334155",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  selfVideoText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  technicianName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
  },
  technicianPhone: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
  },
  durationText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#22c55e",
    marginTop: 10,
  },
  controlsBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnActive: {
    backgroundColor: "#3b82f6",
  },
  controlBtnInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  endCallBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
});
