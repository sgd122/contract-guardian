import React from 'react';
import { Text, View } from 'react-native';
import type { RiskLevel } from '@cg/shared';
import { RISK_LABELS } from '@cg/shared';
import { RiskGauge } from '../ui/RiskGauge';

interface RiskSummaryProps {
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  className?: string;
}

const riskLevelColors: Record<RiskLevel, string> = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-green-500',
};

export function RiskSummary({
  riskScore,
  riskLevel,
  summary,
  className = '',
}: RiskSummaryProps) {
  const label = RISK_LABELS[riskLevel];
  const colorClass = riskLevelColors[riskLevel];

  return (
    <View className={`items-center ${className}`}>
      <RiskGauge score={riskScore} size={150} strokeWidth={12} />

      <Text className={`mt-3 text-lg font-bold ${colorClass}`}>{label}</Text>

      <Text className="mt-3 px-2 text-center text-sm leading-5 text-gray-600">
        {summary}
      </Text>
    </View>
  );
}
