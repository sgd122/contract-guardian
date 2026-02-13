import React from 'react';
import { Text, View } from 'react-native';
import type { RiskLevel } from '@cg/shared';

interface BadgeProps {
  level: RiskLevel;
  label?: string;
  className?: string;
}

const badgeStyles: Record<RiskLevel, string> = {
  high: 'bg-[#FEE2E2]',
  medium: 'bg-[#FEF3C7]',
  low: 'bg-[#DCFCE7]',
};

const textStyles: Record<RiskLevel, string> = {
  high: 'text-[#DC2626]',
  medium: 'text-[#D97706]',
  low: 'text-[#16A34A]',
};

const defaultLabels: Record<RiskLevel, string> = {
  high: '\uC704\uD5D8',
  medium: '\uC8FC\uC758',
  low: '\uC548\uC804',
};

export function Badge({ level, label, className = '' }: BadgeProps) {
  const displayLabel = label ?? defaultLabels[level];

  return (
    <View
      className={`self-start rounded-full px-3 py-1 ${badgeStyles[level]} ${className}`}
    >
      <Text className={`text-xs font-semibold ${textStyles[level]}`}>
        {displayLabel}
      </Text>
    </View>
  );
}
