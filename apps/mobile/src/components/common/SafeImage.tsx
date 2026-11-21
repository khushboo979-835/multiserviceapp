import React, { useEffect, useState } from "react";
import { Image, ImageProps, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Image as ImageIcon } from "lucide-react-native";

interface SafeImageProps extends Omit<ImageProps, "source"> {
  uri?: string | null;
  fallbackLabel?: string;
  fallbackComponent?: React.ReactNode;
}

export default function SafeImage({
  uri,
  fallbackLabel,
  fallbackComponent,
  style,
  ...imageProps
}: SafeImageProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const normalizedUri = typeof uri === "string" && /^(https?:|data:image\/)/i.test(uri) ? uri : null;

  useEffect(() => {
    setFailedUri(null);
  }, [normalizedUri]);

  if (!normalizedUri || failedUri === normalizedUri) {
    if (fallbackComponent) {
      return <View style={[styles.fallback, style as StyleProp<ViewStyle>]}>{fallbackComponent}</View>;
    }
    return (
      <View style={[styles.fallback, style as StyleProp<ViewStyle>]}>
        {fallbackLabel ? (
          <Text numberOfLines={1} style={styles.fallbackText}>
            {fallbackLabel}
          </Text>
        ) : (
          <ImageIcon size={16} color="#94a3b8" />
        )}
      </View>
    );
  }

  return (
    <Image
      {...imageProps}
      source={{ uri: normalizedUri }}
      style={style}
      onError={() => setFailedUri(normalizedUri)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
  },
  fallbackText: {
    color: "#64748b",
    fontSize: 10,
    textAlign: "center",
  },
});
