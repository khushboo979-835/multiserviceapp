import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { Mic, MicOff, X, Sparkles, ArrowRight, Volume2 } from "lucide-react-native";

interface VoiceBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onServiceDetected: (categoryId: string, detectedPrompt: string) => void;
}

const VOICE_SAMPLES = [
  { text: "Mera Split AC thanda nahi kar raha hai, gas check karwana hai.", category: "cat_ac_repair" },
  { text: "Phone ka display toot gaya hai, doorstep screen repair chahiye.", category: "cat_mobile" },
  { text: "Bathroom me tap leak ho raha hai aur pipe fitting karni hai.", category: "cat_plumber" },
  { text: "Ghar me short circuit ho gaya hai, MCB trip ho rahi hai.", category: "cat_electrician" },
  { text: "Deep home cleaning aur kitchen jet wash karwana hai.", category: "cat_cleaning" },
];

export default function VoiceBookingModal({
  visible,
  onClose,
  onServiceDetected,
}: VoiceBookingModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startListeningSimulation = (sampleText?: string, categoryId?: string) => {
    setIsListening(true);
    setTranscript("");
    setDetectedCategory(null);

    const target = sampleText || VOICE_SAMPLES[Math.floor(Math.random() * VOICE_SAMPLES.length)].text;
    const cat = categoryId || (sampleText ? VOICE_SAMPLES.find(s => s.text === sampleText)?.category : "cat_mobile") || "cat_mobile";

    setTimeout(() => {
      setTranscript(target);
      setIsListening(false);
      setDetectedCategory(cat);
    }, 1800);
  };

  const handleConfirmBooking = () => {
    if (detectedCategory) {
      onClose();
      onServiceDetected(detectedCategory, transcript);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Volume2 size={20} color="#ef4444" />
              <Text style={styles.title}>Voice Booking</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Tap mic and speak your requirement in Hindi or English (e.g., "AC service", "Phone screen replacement")
          </Text>

          {/* Mic Button with Animated Glow */}
          <View style={styles.micCenterContainer}>
            <Animated.View
              style={[
                styles.glowCircle,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: isListening ? "rgba(239, 68, 68, 0.2)" : "transparent",
                },
              ]}
            />
            <TouchableOpacity
              onPress={() => startListeningSimulation()}
              style={[styles.micButton, isListening && styles.micButtonActive]}
              activeOpacity={0.8}
            >
              <Mic size={36} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.listeningStatus}>
            {isListening ? "Listening... (Bolte rahiye)" : "Tap mic to speak"}
          </Text>

          {/* Transcript Box */}
          {transcript ? (
            <View style={styles.transcriptCard}>
              <View style={styles.transcriptHeader}>
                <Sparkles size={16} color="#ef4444" />
                <Text style={styles.transcriptLabel}>Voice Detected:</Text>
              </View>
              <Text style={styles.transcriptText}>"{transcript}"</Text>

              <TouchableOpacity
                onPress={handleConfirmBooking}
                style={styles.bookNowBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.bookNowText}>Proceed to Booking</Text>
                <ArrowRight size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.samplesContainer}>
              <Text style={styles.samplesHeading}>Try tapping a sample:</Text>
              {VOICE_SAMPLES.slice(0, 3).map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => startListeningSimulation(item.text, item.category)}
                  style={styles.sampleItem}
                  activeOpacity={0.75}
                >
                  <Text style={styles.sampleText} numberOfLines={1}>
                    🗣️ "{item.text}"
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    width: "100%",
    maxWidth: 420,
    padding: 24,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  micCenterContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  glowCircle: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: "#dc2626",
  },
  listeningStatus: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
  },
  transcriptCard: {
    width: "100%",
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },
  transcriptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ef4444",
    textTransform: "uppercase",
  },
  transcriptText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 14,
  },
  bookNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 8,
  },
  bookNowText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  samplesContainer: {
    width: "100%",
  },
  samplesHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 8,
  },
  sampleItem: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  sampleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
});
