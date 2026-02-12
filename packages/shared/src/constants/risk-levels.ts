import type { RiskLevel } from '../types/analysis';

export const RISK_THRESHOLDS = {
  high: 70,
  medium: 40,
} as const;

export const RISK_LABELS: Record<RiskLevel, string> = {
  high: '위험',
  medium: '주의',
  low: '안전',
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  high: 'red-500',
  medium: 'amber-500',
  low: 'green-500',
};
