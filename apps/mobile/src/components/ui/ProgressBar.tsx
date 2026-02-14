import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

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
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clampedProgress,
      duration: 500,
      useNativeDriver: false, // width animation can't use native driver
    }).start();
  }, [clampedProgress, animatedWidth]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View className={`gap-1.5 ${className}`}>
      {label ? (
        <Text className="text-sm font-medium text-gray-700">{label}</Text>
      ) : null}
      <View className="h-2 overflow-hidden rounded-full bg-gray-200">
        <Animated.View
          className="h-full rounded-full"
          style={{ width: widthInterpolation, backgroundColor: color }}
        />
      </View>
    </View>
  );
}
