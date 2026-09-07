import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WifiOff, RefreshCw } from "lucide-react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

interface OfflineBannerProps {
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onRetry }) => {
  const [isOffline, setIsOffline] = useState(false);

  // Periodic network availability probe
  useEffect(() => {
    let isMounted = true;
    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch("https://www.google.com/generate_204", {
          signal: controller.signal,
          mode: "no-cors",
        });
        clearTimeout(timeoutId);
        if (isMounted) setIsOffline(false);
      } catch (err) {
        if (isMounted) setIsOffline(true);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      className="bg-amber-600 px-4 py-2 flex-row items-center justify-between"
    >
      <View className="flex-row items-center flex-1 pr-2">
        <WifiOff size={16} color="#ffffff" />
        <Text className="text-white text-xs font-semibold ml-2">
          Offline Mode: Cached data is shown.
        </Text>
      </View>
      {onRetry && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRetry}
          className="bg-white/20 px-2.5 py-1 rounded-lg flex-row items-center"
        >
          <RefreshCw size={12} color="#ffffff" className="mr-1" />
          <Text className="text-white text-xs font-bold">Retry</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};
