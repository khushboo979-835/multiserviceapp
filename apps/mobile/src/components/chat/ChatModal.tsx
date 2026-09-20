import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Send, User, ShieldCheck } from "lucide-react-native";
import { useBookingStore } from "../../store/useBookingStore";

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  currentRole: "CUSTOMER" | "PROVIDER";
  recipientName: string;
}

export default function ChatModal({
  visible,
  onClose,
  bookingId,
  currentRole,
  recipientName,
}: ChatModalProps) {
  const insets = useSafeAreaInsets();
  const { messages, sendMessage } = useBookingStore();
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const quickReplies =
    currentRole === "CUSTOMER"
      ? ["I'm at the main gate", "Please call when you reach", "Come to 2nd floor, Flat 204", "How long will it take?"]
      : ["I have arrived outside", "On my way, 5 mins away", "Please share building entry code", "Starting service now"];

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [visible, messages]);

  const handleSend = (textToSend = inputText) => {
    if (!textToSend.trim()) return;
    sendMessage(
      bookingId,
      textToSend.trim(),
      currentRole,
      currentRole === "CUSTOMER" ? "Customer" : "Service Partner"
    );
    setInputText("");
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View
          style={[
            styles.innerContainer,
            {
              paddingTop: insets.top + 8,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Top Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarCircle}>
                <User size={22} color="#ef4444" />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.recipientName}>
                  {recipientName || (currentRole === "CUSTOMER" ? "Service Partner" : "Customer")}
                </Text>
                <View style={styles.onlineStatusRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.bookingIdText}>
                    Active Booking #{bookingId ? bookingId.slice(-6) : "369780"}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.75}
            >
              <X size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Messages ScrollView */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <ShieldCheck size={18} color="#d97706" />
              <Text style={styles.securityNoticeText}>
                For your safety, never share bank OTPs or personal credentials in chat.
              </Text>
            </View>

            {messages.length === 0 ? (
              <View style={styles.emptyChatBox}>
                <Text style={styles.emptyChatText}>No messages yet. Send a quick update below!</Text>
              </View>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderRole === currentRole;

                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubbleWrapper,
                      isMe ? styles.bubbleRight : styles.bubbleLeft,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isMe ? styles.messageTextMe : styles.messageTextOther,
                        ]}
                      >
                        {msg.text}
                      </Text>
                    </View>
                    <Text style={styles.messageTimestamp}>{msg.timestamp}</Text>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Quick Replies Carousel */}
          <View style={styles.quickRepliesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {quickReplies.map((reply, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSend(reply)}
                  style={styles.quickReplyChip}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickReplyText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Bottom Message Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              placeholder="Type your message here..."
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              style={styles.textInput}
              multiline={false}
            />
            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
              style={[
                styles.sendButton,
                inputText.trim() ? styles.sendButtonActive : styles.sendButtonDisabled,
              ]}
              activeOpacity={0.85}
            >
              <Send size={18} color={inputText.trim() ? "#ffffff" : "#94a3b8"} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  innerContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1.5,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fef2f2",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    alignItems: "center",
    justifyContent: "center",
  },
  recipientName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0f172a",
  },
  onlineStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#16a34a",
    marginRight: 6,
  },
  bookingIdText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  messagesScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  securityNoticeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400e",
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  emptyChatBox: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChatText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94a3b8",
  },
  messageBubbleWrapper: {
    marginBottom: 12,
    maxWidth: "80%",
  },
  bubbleRight: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  bubbleLeft: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageBubbleMe: {
    backgroundColor: "#ef4444",
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  messageTextMe: {
    color: "#ffffff",
  },
  messageTextOther: {
    color: "#0f172a",
  },
  messageTimestamp: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    marginTop: 4,
    marginHorizontal: 4,
  },
  quickRepliesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickReplyChip: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickReplyText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  inputBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1.5,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
    marginRight: 10,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#e2e8f0",
  },
});
