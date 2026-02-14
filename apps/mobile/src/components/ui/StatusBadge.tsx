import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
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
    label: '결제 대기',
  },
  paid: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    label: '결제 완료',
  },
  processing: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    label: '분석 중',
    pulse: true,
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: '완료',
  },
  failed: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: '실패',
  },
};

function PulsingBadge({
  config,
  className,
}: {
  config: StatusConfig;
  className: string;
}) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={`self-start rounded-full px-3 py-1 ${config.bg} ${className}`}
      style={{ opacity }}
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
