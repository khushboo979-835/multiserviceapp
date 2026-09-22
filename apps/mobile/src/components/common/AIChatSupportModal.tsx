import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { AIChatMessage } from "../../types";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Wrench,
  Smartphone,
  Zap,
  ShoppingBag,
  HelpCircle,
  CheckCircle2,
} from "lucide-react-native";

interface AIChatSupportModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectService?: (serviceSlug: string) => void;
}

const INITIAL_MESSAGES: AIChatMessage[] = [
  {
    id: "msg_1",
    sender: "ai",
    text: "Namaste! 🙏 Mai Inisha AI Assistant hu. Mai aapki kya madad kar sakta hu?\n\n• Doorstep Mobile/AC Repair Book karein\n• Pricing aur Offers ke baare me janein\n• Quick grocery & accessories order karein",
    timestamp: new Date().toISOString(),
  },
];

const QUICK_PROMPTS = [
  "📱 Phone display toota hai",
  "❄️ AC thanda nahi kar raha",
  "⚡ Electrician chahiye",
  "🛒 Grocery delivery chahiye",
  "🏷️ Available Coupons kya hai?",
];

export default function AIChatSupportModal({
  visible,
  onClose,
  onSelectService,
}: AIChatSupportModalProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [visible, messages]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: AIChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Intelligent AI Natural Response Engine
    setTimeout(() => {
      let aiResponseText = "";
      let action: AIChatMessage["actionPayload"] = undefined;
      const lower = text.toLowerCase();

      if (lower.includes("phone") || lower.includes("mobile") || lower.includes("screen") || lower.includes("display")) {
        aiResponseText = "📱 Mobile Screen & Hardware Repair hamare certified technicians aapke doorstep par 60 minutes me complete karte hain. Original display par 30-day warranty milti hai!\n\nBase visit charge: ₹499.";
        action = { type: "OPEN_SERVICE", targetId: "cat_mobile", title: "Book Mobile Repair" };
      } else if (lower.includes("ac") || lower.includes("thanda") || lower.includes("cooling") || lower.includes("gas")) {
        aiResponseText = "❄️ AC Power Jet Service & Gas Refill available hai! Technician power foam wash aur cooling coil check karega.\n\nSplit AC Service starts from ₹399.";
        action = { type: "OPEN_SERVICE", targetId: "cat_ac_repair", title: "Book AC Service" };
      } else if (lower.includes("electrician") || lower.includes("fan") || lower.includes("light") || lower.includes("mcb")) {
        aiResponseText = "⚡ Verified Electrician aapke ghar 30 mins me pahuchega. Switchboard, fan, wiring aur short-circuit fault check karne ke liye certified pros available hain.\n\nVisit charge: ₹199.";
        action = { type: "OPEN_SERVICE", targetId: "cat_electrician", title: "Book Electrician" };
      } else if (lower.includes("grocery") || lower.includes("atta") || lower.includes("oil") || lower.includes("rice")) {
        aiResponseText = "🛒 Quick Grocery & Staples 20-30 minutes me deliver hote hain! Mustard Oil, Atta, Basmati Rice aur Daily Needs sab available hain.";
        action = { type: "OPEN_PRODUCT", targetId: "GROCERY", title: "Explore Grocery Store" };
      } else if (lower.includes("coupon") || lower.includes("discount") || lower.includes("offer")) {
        aiResponseText = "🎉 Active Coupons:\n1. 'INISHA50' - 20% OFF (Up to ₹150)\n2. 'FIRST100' - Flat ₹100 OFF on 1st Order\n3. 'SUPER20' - 10% OFF on Grocery & Accessories!";
        action = { type: "APPLY_COUPON", targetId: "INISHA50", title: "Apply Code INISHA50" };
      } else {
        aiResponseText = "Aapka query humne note kar liya hai. Inisha City Service me sabhi home repairs, beauty salon aur grocery 100% verified technicians aur 30-day warranty ke sath uplabdh hain. Aap neeche diye button se service book kar sakte hain.";
        action = { type: "OPEN_SERVICE", targetId: "cat_mobile", title: "Explore Services" };
      }

      const aiMsg: AIChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: aiResponseText,
        timestamp: new Date().toISOString(),
        actionPayload: action,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.botIconBadge}>
                <Bot size={22} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Inisha AI Assistant</Text>
                <View style={styles.onlineBadgeRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Instant AI Support 24x7</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Quick Prompts Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickPromptsScroll}
            contentContainerStyle={styles.quickPromptsContent}
          >
            {QUICK_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSend(prompt)}
                style={styles.promptPill}
                activeOpacity={0.8}
              >
                <Text style={styles.promptPillText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((item) => {
              const isUser = item.sender === "user";
              return (
                <View
                  key={item.id}
                  style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAI]}
                >
                  {!isUser && (
                    <View style={styles.msgAvatar}>
                      <Sparkles size={14} color="#ffffff" />
                    </View>
                  )}
                  <View style={[styles.msgBubble, isUser ? styles.msgBubbleUser : styles.msgBubbleAI]}>
                    <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextAI]}>
                      {item.text}
                    </Text>

                    {item.actionPayload && (
                      <TouchableOpacity
                        onPress={() => {
                          onClose();
                          if (onSelectService) {
                            onSelectService(item.actionPayload!.targetId);
                          }
                        }}
                        style={styles.actionBtn}
                        activeOpacity={0.85}
                      >
                        <CheckCircle2 size={16} color="#ffffff" />
                        <Text style={styles.actionBtnText}>{item.actionPayload.title}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            {isTyping && (
              <View style={[styles.msgRow, styles.msgRowAI]}>
                <View style={styles.msgAvatar}>
                  <Sparkles size={14} color="#ffffff" />
                </View>
                <View style={[styles.msgBubble, styles.msgBubbleAI, { paddingVertical: 12 }]}>
                  <ActivityIndicator size="small" color="#ef4444" />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything (e.g., AC repair price, screen fix)..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              activeOpacity={0.8}
            >
              <Send size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const screenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: screenHeight * 0.85,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  botIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0f172a",
  },
  onlineBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 5,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
  },
  quickPromptsScroll: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  quickPromptsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  promptPill: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  promptPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  msgRow: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-end",
  },
  msgRowUser: {
    justifyContent: "flex-end",
  },
  msgRowAI: {
    justifyContent: "flex-start",
  },
  msgAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 4,
  },
  msgBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  msgBubbleUser: {
    backgroundColor: "#ef4444",
    borderBottomRightRadius: 4,
  },
  msgBubbleAI: {
    backgroundColor: "#f1f5f9",
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextUser: {
    color: "#ffffff",
    fontWeight: "600",
  },
  msgTextAI: {
    color: "#1e293b",
    fontWeight: "500",
  },
  actionBtn: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginRight: 10,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#cbd5e1",
  },
});
