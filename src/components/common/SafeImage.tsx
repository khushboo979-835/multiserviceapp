import React, { useEffect, useState } from "react";
import { Image, ImageProps, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

interface SafeImageProps extends Omit<ImageProps, "source"> {
  uri?: string | null;
  fallbackLabel?: string;
}

export default function SafeImage({ uri, fallbackLabel = "Image unavailable", style, ...imageProps }: SafeImageProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const normalizedUri = typeof uri === "string" && /^(https?:|data:image\/)/i.test(uri) ? uri : null;

  useEffect(() => {
    setFailedUri(null);
  }, [normalizedUri]);

  if (!normalizedUri || failedUri === normalizedUri) {
    return (
      <View style={[styles.fallback, style as StyleProp<ViewStyle>]}>
        <Text numberOfLines={1} style={styles.fallbackText}>{fallbackLabel}</Text>
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
