import React from "react";
import { View, Text, Image } from "react-native";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  showText?: boolean;
  showTagline?: boolean;
  textColor?: string;
}

export default function BrandLogo({
  size = "md",
  showText = true,
  showTagline = false,
  textColor = "#0f172a",
}: BrandLogoProps) {
  const getIconDimensions = () => {
    switch (size) {
      case "sm":
        return { imageSize: 42, textStyle: "text-base font-bold", tagStyle: "text-2xs" };
      case "md":
        return { imageSize: 64, textStyle: "text-lg font-black", tagStyle: "text-xs" };
      case "lg":
        return { imageSize: 96, textStyle: "text-2xl font-black", tagStyle: "text-xs font-semibold" };
      case "xl":
        return { imageSize: 130, textStyle: "text-2xl font-black", tagStyle: "text-sm font-semibold" };
      case "hero":
        return { imageSize: 170, textStyle: "text-3xl font-black", tagStyle: "text-base font-semibold" };
    }
  };

  const { imageSize, textStyle, tagStyle } = getIconDimensions();

  return (
    <View className="items-center">
      {/* Official Circular Logo Image */}
      <View
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: imageSize / 2,
          backgroundColor: "#ffffff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 6,
          overflow: "hidden",
        }}
      >
        <Image
          source={require("../../../assets/brand-logo.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>

      {showText && (
        <Text
          className={`${textStyle} tracking-tight mt-2.5 text-center uppercase`}
          style={{ color: textColor }}
        >
          INISHA CITY SERVICE
        </Text>
      )}

      {showTagline && (
        <Text className={`${tagStyle} text-slate-500 font-medium tracking-wide mt-0.5 text-center`}>
          Your Need, Our Service
        </Text>
      )}
    </View>
  );
}
