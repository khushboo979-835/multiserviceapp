import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { Star, X, Check, Heart } from "lucide-react-native";

interface RatingReviewModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  providerName?: string;
  onSubmit: (rating: number, comment: string, tip: number) => void;
}

const SATISFACTION_TAGS = [
  "⚡ Super Fast",
  "⭐ Expert Work",
  "🕒 On-Time Arrival",
  "🧼 Clean Service",
  "🤝 Polite Behavior",
];

const TIP_OPTIONS = [0, 20, 50, 100];

export default function RatingReviewModal({
  visible,
  onClose,
  bookingId,
  providerName = "Technician",
  onSubmit,
}: RatingReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(["⭐ Expert Work"]);
  const [comment, setComment] = useState("");
  const [selectedTip, setSelectedTip] = useState(0);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    const fullComment = `${selectedTags.join(", ")}${comment ? ` - ${comment}` : ""}`;
    onSubmit(rating, fullComment, selectedTip);
    Alert.alert("Thank You! 🙏", "Your rating and feedback have been submitted successfully.");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rate Your Service</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            How was your experience with {providerName}?
          </Text>

          {/* Stars Row */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starBtn}
                activeOpacity={0.7}
              >
                <Star
                  size={36}
                  color={star <= rating ? "#f59e0b" : "#cbd5e1"}
                  fill={star <= rating ? "#f59e0b" : "transparent"}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback Tags */}
          <View style={styles.tagsContainer}>
            {SATISFACTION_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tagPill, active && styles.tagPillActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Comment Box */}
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment or praise (optional)..."
            placeholderTextColor="#94a3b8"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />

          {/* Tip Technician Section */}
          <View style={styles.tipSection}>
            <View style={styles.tipHeaderRow}>
              <Heart size={14} color="#ef4444" fill="#ef4444" />
              <Text style={styles.tipTitle}>Tip your technician (100% goes to pro):</Text>
            </View>

            <View style={styles.tipRow}>
              {TIP_OPTIONS.map((tip) => (
                <TouchableOpacity
                  key={tip}
                  onPress={() => setSelectedTip(tip)}
                  style={[styles.tipBtn, selectedTip === tip && styles.tipBtnActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tipBtnText, selectedTip === tip && styles.tipBtnTextActive]}>
                    {tip === 0 ? "No Tip" : `+₹${tip}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn} activeOpacity={0.85}>
            <Text style={styles.submitText}>Submit Review</Text>
          </TouchableOpacity>
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
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    padding: 20,
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
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
    color: "#64748b",
    marginBottom: 16,
    textAlign: "center",
  },
  starsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  starBtn: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },
  tagPill: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagPillActive: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  tagTextActive: {
    color: "#ef4444",
    fontWeight: "700",
  },
  commentInput: {
    width: "100%",
    height: 70,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 10,
    fontSize: 13,
    color: "#0f172a",
    textAlignVertical: "top",
    marginBottom: 14,
  },
  tipSection: {
    width: "100%",
    marginBottom: 16,
  },
  tipHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  tipRow: {
    flexDirection: "row",
    gap: 8,
  },
  tipBtn: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tipBtnActive: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  tipBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  tipBtnTextActive: {
    color: "#ffffff",
  },
  submitBtn: {
    width: "100%",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  submitText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
});
