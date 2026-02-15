"use client";

import { useState } from "react";
import { ChevronDown, Scale } from "lucide-react";
import { AnimatedCard, Badge, cn } from "@cg/ui";
import type { ClauseAnalysis, RiskLevel } from "@cg/shared";
import { CLAUSE_TYPE_LABELS, RISK_LABELS } from "@cg/shared";

const RISK_BADGE_VARIANT: Record<RiskLevel, "risk-high" | "risk-medium" | "risk-low"> = {
  high: "risk-high",
  medium: "risk-medium",
  low: "risk-low",
};

interface ClauseCardProps {
  clause: ClauseAnalysis;
}

export function ClauseCard({ clause }: ClauseCardProps) {
  const [expanded, setExpanded] = useState(false);

  const borderColor =
    clause.risk_level === "high"
      ? "border-l-risk-high"
      : clause.risk_level === "medium"
        ? "border-l-amber-400"
        : "border-l-green-500";

  return (
    <AnimatedCard className={cn("border-l-4 p-0", borderColor)}>
      <button
        className="flex w-full items-start justify-between gap-4 p-5 text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant={RISK_BADGE_VARIANT[clause.risk_level]}>
              {RISK_LABELS[clause.risk_level]}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {CLAUSE_TYPE_LABELS[clause.clause_type] ?? clause.clause_type}
            </span>
          </div>
          <blockquote className="mt-3 border-l-2 border-muted pl-3 text-sm italic text-muted-foreground line-clamp-2">
            &ldquo;{clause.original_text}&rdquo;
          </blockquote>
        </div>
        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-4 border-t px-5 pb-5 pt-4">
          <div>
            <h4 className="text-sm font-medium">분석 설명</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {clause.explanation}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium">수정 제안</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {clause.suggestion}
            </p>
          </div>

          {clause.relevant_law && (
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
              <Scale className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <h4 className="text-xs font-medium">관련 법령</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {clause.relevant_law}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </AnimatedCard>
  );
}
