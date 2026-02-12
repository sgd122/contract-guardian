"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FileText, Plus, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import {
  Button,
  Badge,
  Skeleton,
  AnimatedCard,
  StaggerList,
  FadeIn,
} from "@cg/ui";
import {
  useAnalyses,
  createApiClient,
} from "@cg/api";
import {
  formatDate,
  type AnalysisStatus,
  type RiskLevel,
} from "@cg/shared";

const STATUS_CONFIG: Record<
  AnalysisStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending_payment: { label: "결제 대기", variant: "outline" },
  paid: { label: "결제 완료", variant: "secondary" },
  processing: { label: "분석 중", variant: "default" },
  completed: { label: "완료", variant: "secondary" },
  failed: { label: "실패", variant: "destructive" },
};

const RISK_BADGE_VARIANT: Record<RiskLevel, "risk-high" | "risk-medium" | "risk-low"> = {
  high: "risk-high",
  medium: "risk-medium",
  low: "risk-low",
};

function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const client = useMemo(
    () => createApiClient({ baseURL: "" }),
    []
  );
  const { analyses, loading, error, refresh } = useAnalyses(client);

  return (
    <div>
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">분석 내역</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              계약서 분석 결과를 확인하세요
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/analyze">
              <Plus className="h-4 w-4" />
              새 분석
            </Link>
          </Button>
        </div>
      </FadeIn>

      <div className="mt-8">
        {loading ? (
          <AnalysisSkeleton />
        ) : error || analyses.length === 0 ? (
          <FadeIn>
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">
                아직 분석한 계약서가 없습니다
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                계약서를 업로드하고 AI 분석을 시작하세요
              </p>
              <Button asChild className="mt-6 gap-2">
                <Link href="/analyze">
                  <Plus className="h-4 w-4" />
                  계약서 분석하기
                </Link>
              </Button>
              {error && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refresh()}
                  className="mt-3 gap-1.5 text-xs text-muted-foreground"
                >
                  <RefreshCw className="h-3 w-3" />
                  목록 다시 불러오기
                </Button>
              )}
            </div>
          </FadeIn>
        ) : (
          <StaggerList className="space-y-4">
            {analyses.map((analysis) => {
              const statusConfig = STATUS_CONFIG[analysis.status];
              return (
                <Link
                  key={analysis.id}
                  href={`/analyze/${analysis.id}`}
                >
                  <AnimatedCard className="cursor-pointer p-6 transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-medium">
                            {analysis.original_filename}
                          </h3>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(analysis.created_at)}
                            </span>
                            {analysis.page_count && (
                              <span>{analysis.page_count}페이지</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {analysis.overall_risk_level && (
                          <Badge
                            variant={
                              RISK_BADGE_VARIANT[analysis.overall_risk_level]
                            }
                          >
                            {analysis.overall_risk_level === "high"
                              ? "위험"
                              : analysis.overall_risk_level === "medium"
                                ? "주의"
                                : "안전"}
                          </Badge>
                        )}
                        <Badge variant={statusConfig.variant}>
                          {analysis.status === "processing" && (
                            <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-current" />
                          )}
                          {analysis.status === "failed" && (
                            <AlertTriangle className="mr-1 h-3 w-3" />
                          )}
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  </AnimatedCard>
                </Link>
              );
            })}
          </StaggerList>
        )}
      </div>
    </div>
  );
}
