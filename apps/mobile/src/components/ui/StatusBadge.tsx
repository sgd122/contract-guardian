import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { AnalysisStatus } from '@cg/shared';

interface StatusBadgeProps {
  status: AnalysisStatus;
  className?: string;
}

interface StatusConfig {
  bg: string;
  text: string;
  label: string;
  pulse?: boolean;
}

const statusConfigs: Record<AnalysisStatus, StatusConfig> = {
  pending_payment: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    label: '\uACB0\uC81C \uB300\uAE30',
  },
  paid: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    label: '\uACB0\uC81C \uC644\uB8CC',
  },
  processing: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    label: '\uBD84\uC11D \uC911',
    pulse: true,
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: '\uC644\uB8CC',
  },
  failed: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: '\uC2E4\uD328',
  },
};

function PulsingBadge({
  config,
  className,
}: {
  config: StatusConfig;
  className: string;
}) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={`self-start rounded-full px-3 py-1 ${config.bg} ${className}`}
      style={animatedStyle}
    >
      <Text className={`text-xs font-semibold ${config.text}`}>
        {config.label}
      </Text>
    </Animated.View>
  );
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfigs[status];

  if (config.pulse) {
    return <PulsingBadge config={config} className={className} />;
  }

  return (
    <View
      className={`self-start rounded-full px-3 py-1 ${config.bg} ${className}`}
    >
      <Text className={`text-xs font-semibold ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
}
