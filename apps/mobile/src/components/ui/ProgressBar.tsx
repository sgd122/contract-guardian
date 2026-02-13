import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  label?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  color = '#3B82F6',
  label,
  className = '',
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(clampedProgress, { duration: 500 });
  }, [clampedProgress, animatedWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
    backgroundColor: color,
  }));

  return (
    <View className={`gap-1.5 ${className}`}>
      {label ? (
        <Text className="text-sm font-medium text-gray-700">{label}</Text>
      ) : null}
      <View className="h-2 overflow-hidden rounded-full bg-gray-200">
        <Animated.View className="h-full rounded-full" style={animatedStyle} />
      </View>
    </View>
  );
}
