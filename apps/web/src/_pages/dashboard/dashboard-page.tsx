"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus, AlertTriangle, Clock, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  RISK_LABELS,
  type AnalysisStatus,
  type RiskLevel,
} from "@cg/shared";
import { STATUS_CONFIG, RISK_BADGE_VARIANT } from "@/entities/analysis/model";
import { AnalysisSkeleton } from "@/entities/analysis/ui";

export function DashboardPage() {
  const client = useMemo(
    () => createApiClient({ baseURL: "" }),
    []
  );
  const { analyses, loading, error, refresh, removeAnalysis } = useAnalyses(client);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, analysisId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("이 분석을 삭제하시겠습니까?")) return;

    setDeletingId(analysisId);
    try {
      const res = await fetch(`/api/analyses/${analysisId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("분석이 삭제되었습니다.");
        removeAnalysis(analysisId);
      } else {
        toast.error("삭제에 실패했습니다.");
      }
    } catch {
      toast.error("삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

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
              {error ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refresh()}
                  className="mt-3 gap-1.5 text-xs text-muted-foreground"
                >
                  <RefreshCw className="h-3 w-3" />
                  목록 다시 불러오기
                </Button>
              ) : null}
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
                            {RISK_LABELS[analysis.overall_risk_level]}
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
                        {analysis.status !== "processing" && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, analysis.id)}
                            disabled={deletingId === analysis.id}
                            className="ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                          >
                            {deletingId === analysis.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
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
