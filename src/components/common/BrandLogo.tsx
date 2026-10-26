import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showText?: boolean;
  showTagline?: boolean;
  textColor?: string;
  taglineText?: string;
  subText?: string;
}

export default function BrandLogo({
  size = "md",
  showText = true,
  showTagline = false,
  textColor = "#0f172a",
  taglineText = "Your Need, Our Service",
  subText = "On-Demand Doorstep Repairs, Home Services & Salon Experience",
}: BrandLogoProps) {
  const getIconDimensions = () => {
    switch (size) {
      case "sm":
        return { imageSize: 38, radius: 8, titleSize: 15, tagSize: 10 };
      case "md":
        return { imageSize: 68, radius: 14, titleSize: 18, tagSize: 11 };
      case "lg":
        return { imageSize: 110, radius: 22, titleSize: 22, tagSize: 13 };
      case "xl":
        return { imageSize: 130, radius: 26, titleSize: 24, tagSize: 14 };
      case "hero":
        return { imageSize: 150, radius: 30, titleSize: 26, tagSize: 14 };
    }
  };

  const { imageSize, radius, titleSize, tagSize } = getIconDimensions();

  return (
    <View style={styles.container}>
      {/* Official Inisha Brand Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            width: imageSize,
            height: imageSize,
            borderRadius: radius,
          },
        ]}
      >
        <Image
          source={require("../../../assets/brand-logo.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>

      {showText && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.brandTitle,
              {
                fontSize: titleSize,
                color: textColor,
              },
            ]}
          >
            inisha
          </Text>
        </View>
      )}

      {showTagline && (
        <Text
          style={[
            styles.brandTagline,
            {
              fontSize: tagSize,
              color: textColor === "#ffffff" ? "rgba(255, 255, 255, 0.9)" : "#64748b",
            },
          ]}
        >
          {taglineText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  iconContainer: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  textContainer: {
    alignItems: "center",
  },
  brandTitle: {
    fontWeight: "900",
    letterSpacing: 0.3,
    marginTop: 12,
    textAlign: "center",
  },
  brandTagline: {
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: 3,
    textAlign: "center",
  },
  brandSubText: {
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 16,
  },
});
