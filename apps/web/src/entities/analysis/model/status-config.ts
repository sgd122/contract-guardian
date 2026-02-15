import type { AnalysisStatus, RiskLevel } from "@cg/shared";

export const STATUS_CONFIG: Record<
  AnalysisStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending_payment: { label: "결제 대기", variant: "outline" },
  paid: { label: "결제 완료", variant: "secondary" },
  processing: { label: "분석 중", variant: "default" },
  completed: { label: "완료", variant: "secondary" },
  failed: { label: "실패", variant: "destructive" },
};

export const RISK_BADGE_VARIANT: Record<RiskLevel, "risk-high" | "risk-medium" | "risk-low"> = {
  high: "risk-high",
  medium: "risk-medium",
  low: "risk-low",
};
