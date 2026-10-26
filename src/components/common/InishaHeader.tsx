import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { User, Search, Bell } from "lucide-react-native";

interface InishaHeaderProps {
  onSearchPress?: () => void;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  showActions?: boolean;
}

export default function InishaHeader({
  onSearchPress,
  onProfilePress,
  onNotificationPress,
  showActions = true,
}: InishaHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
      {/* Left: Dynamic Inisha Services Brand Logo */}
      <TouchableOpacity
        style={styles.logoRow}
        activeOpacity={0.8}
        onPress={() => router.push("/(customer)/(tabs)")}
      >
        <Image
          source={require("../../../assets/icon.png")}
          style={styles.iconImage}
          resizeMode="contain"
        />
        <View style={styles.titleWrap}>
          <Text style={styles.brandName}>Inisha</Text>
          <View style={styles.servicesBadge}>
            <Text style={styles.servicesBadgeText}>Services</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Right: Quick Action Controls (Profile & Search) */}
      {showActions && (
        <View style={styles.actionButtonsRow}>
          {onNotificationPress && (
            <TouchableOpacity
              onPress={onNotificationPress}
              style={styles.actionCircleBtn}
              activeOpacity={0.7}
            >
              <Bell size={18} color="#1e293b" />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onProfilePress || (() => router.push("/(customer)/(tabs)/profile"))}
            style={styles.actionCircleBtn}
            activeOpacity={0.7}
          >
            <User size={19} color="#1e293b" />
          </TouchableOpacity>

          {onSearchPress && (
            <TouchableOpacity
              onPress={onSearchPress}
              style={styles.actionCircleBtn}
              activeOpacity={0.7}
            >
              <Search size={19} color="#1e293b" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconImage: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 8,
  },
  titleWrap: {
    position: "relative",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  servicesBadge: {
    position: "absolute",
    top: -6,
    right: -48,
    backgroundColor: "#ea580c",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  servicesBadgeText: {
    color: "#ffffff",
    fontSize: 8.5,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#ef4444",
  },
});
