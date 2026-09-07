import React, { useEffect } from "react";
import { View, DimensionValue } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from "react-native-reanimated";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className = "",
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: "#1e293b" }, animatedStyle]}
      className={className}
    />
  );
};

export const ServiceCardSkeleton: React.FC = () => {
  return (
    <View className="w-[47%] bg-dark-900 border border-dark-800 rounded-3xl p-5 mb-4">
      <Skeleton width={56} height={56} borderRadius={16} className="mb-4 self-center" />
      <Skeleton width="80%" height={18} borderRadius={6} className="mb-2 self-center" />
      <Skeleton width="100%" height={12} borderRadius={4} className="mb-1" />
      <Skeleton width="60%" height={12} borderRadius={4} className="self-center" />
    </View>
  );
};

export const BookingCardSkeleton: React.FC = () => {
  return (
    <View className="bg-dark-900 border border-dark-800 p-5 rounded-3xl mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1 pr-4">
          <Skeleton width="70%" height={18} borderRadius={6} className="mb-2" />
          <Skeleton width="40%" height={12} borderRadius={4} />
        </View>
        <Skeleton width={80} height={26} borderRadius={12} />
      </View>
      <View className="border-t border-dark-800/60 pt-3 flex-row justify-between items-center">
        <Skeleton width="50%" height={14} borderRadius={4} />
        <Skeleton width="25%" height={18} borderRadius={6} />
      </View>
    </View>
  );
};
