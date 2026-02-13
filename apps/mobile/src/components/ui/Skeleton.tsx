import React, { useEffect } from 'react';
import { DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
}: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    width: typeof width === 'number' ? width : undefined,
    height: typeof height === 'number' ? height : undefined,
    borderRadius,
    backgroundColor: '#E5E7EB',
  }));

  return (
    <Animated.View
      className={className}
      style={[
        animatedStyle,
        typeof width === 'string' ? { width: width as DimensionValue } : undefined,
        typeof height === 'string' ? { height: height as DimensionValue } : undefined,
      ]}
    />
  );
}
