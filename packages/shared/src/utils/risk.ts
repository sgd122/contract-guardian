import type { RiskLevel, ClauseAnalysis } from '../types/analysis';
import { RISK_THRESHOLDS, RISK_LABELS, RISK_COLORS } from '../constants/risk-levels';

export function calculateOverallRisk(clauses: ClauseAnalysis[]): number {
  if (clauses.length === 0) return 0;

  const weights: Record<RiskLevel, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  let totalWeight = 0;
  let weightedSum = 0;

  for (const clause of clauses) {
    const weight = weights[clause.risk_level];
    weightedSum += clause.risk_score * weight;
    totalWeight += weight;
  }

  return Math.round(weightedSum / totalWeight);
}

export function getRiskLabel(score: number): {
  level: RiskLevel;
  label: string;
  color: string;
} {
  if (score >= RISK_THRESHOLDS.high) {
    return { level: 'high', label: RISK_LABELS.high, color: RISK_COLORS.high };
  }
  if (score >= RISK_THRESHOLDS.medium) {
    return { level: 'medium', label: RISK_LABELS.medium, color: RISK_COLORS.medium };
  }
  return { level: 'low', label: RISK_LABELS.low, color: RISK_COLORS.low };
}

export function getRiskColor(level: RiskLevel): string {
  return RISK_COLORS[level];
}
