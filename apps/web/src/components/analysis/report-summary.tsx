"use client";

import { RiskGauge, FadeIn } from "@cg/ui";
import type { AnalysisResult, RiskLevel } from "@cg/shared";

interface ReportSummaryProps {
  analysis: AnalysisResult;
}

export function ReportSummary({ analysis }: ReportSummaryProps) {
  const riskCounts = analysis.clauses.reduce(
    (acc, clause) => {
      acc[clause.risk_level]++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 } as Record<RiskLevel, number>
  );

  return (
    <FadeIn>
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-12">
        <RiskGauge
          score={analysis.overall_risk_score ?? 0}
          size={160}
          showLabel
        />

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">종합 분석 요약</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 rounded-lg border px-4 py-2">
              <span className="h-3 w-3 rounded-full bg-risk-high" />
              <span className="text-sm">
                위험 <strong>{riskCounts.high}</strong>건
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border px-4 py-2">
              <span className="h-3 w-3 rounded-full bg-risk-medium" />
              <span className="text-sm">
                주의 <strong>{riskCounts.medium}</strong>건
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border px-4 py-2">
              <span className="h-3 w-3 rounded-full bg-risk-low" />
              <span className="text-sm">
                안전 <strong>{riskCounts.low}</strong>건
              </span>
            </div>
          </div>

          {analysis.contract_type && (
            <p className="text-xs text-muted-foreground">
              계약서 유형: {analysis.contract_type}
              {analysis.contract_parties && (
                <>
                  {" "}| {analysis.contract_parties.party_a} ↔{" "}
                  {analysis.contract_parties.party_b}
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
