import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showText?: boolean;
  showTagline?: boolean;
  textColor?: string;
  taglineText?: string;
}

export default function BrandLogo({
  size = "md",
  showText = true,
  showTagline = false,
  textColor = "#ffffff",
  taglineText = "Your Daily Services & Delivery",
}: BrandLogoProps) {
  const getIconDimensions = () => {
    switch (size) {
      case "sm":
        return { imageSize: 38, radius: 10, titleSize: 15, tagSize: 10 };
      case "md":
        return { imageSize: 64, radius: 16, titleSize: 20, tagSize: 11 };
      case "lg":
        return { imageSize: 96, radius: 24, titleSize: 26, tagSize: 12 };
      case "xl":
        return { imageSize: 128, radius: 30, titleSize: 30, tagSize: 13 };
      case "hero":
        return { imageSize: 160, radius: 36, titleSize: 34, tagSize: 14 };
    }
  };

  const { imageSize, radius, titleSize, tagSize } = getIconDimensions();

  return (
    <View style={styles.container}>
      {/* 3D Glowing Inisha Brand Icon */}
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
      )}

      {showTagline && (
        <Text
          style={[
            styles.brandTagline,
            {
              fontSize: tagSize,
              color: textColor === "#ffffff" ? "rgba(255, 255, 255, 0.85)" : "#64748b",
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
    shadowColor: "#ea580c",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 12,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  brandTitle: {
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 10,
    textAlign: "center",
  },
  brandTagline: {
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: 2,
    textAlign: "center",
  },
});
