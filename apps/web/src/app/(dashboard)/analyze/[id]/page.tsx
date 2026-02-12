"use client";

import { use } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  Button,
  Badge,
  FadeIn,
  StaggerList,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@cg/ui";
import { API_ROUTES } from "@cg/shared";
import { useAnalysisResult } from "@/hooks/use-analysis";
import { AnalysisProgress } from "@/components/analysis/analysis-progress";
import { ReportSummary } from "@/components/analysis/report-summary";
import { ClauseCard } from "@/components/analysis/clause-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function AnalysisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { analysis, loading, error, refresh } = useAnalysisResult(id);

  if (loading) {
    return <LoadingSpinner message="분석 결과를 불러오는 중..." />;
  }

  if (error || !analysis) {
    return (
      <FadeIn>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-medium">
            분석 결과를 불러올 수 없습니다
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            잠시 후 다시 시도해주세요.
          </p>
          <Button
            variant="outline"
            onClick={() => refresh()}
            className="mt-4 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            다시 시도
          </Button>
        </div>
      </FadeIn>
    );
  }

  // Processing state
  if (
    analysis.status === "processing" ||
    analysis.status === "paid" ||
    analysis.status === "pending_payment"
  ) {
    return <AnalysisProgress />;
  }

  // Failed state
  if (analysis.status === "failed") {
    return (
      <FadeIn>
        <div className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-medium">분석에 실패했습니다</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            계약서 분석 중 오류가 발생했습니다. 다시 시도해주세요.
          </p>
          <Button asChild className="mt-4 gap-2">
            <Link href="/analyze">
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Link>
          </Button>
        </div>
      </FadeIn>
    );
  }

  // Completed state
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">
                {analysis.original_filename}
              </h1>
              <p className="text-xs text-muted-foreground">
                분석 완료
                {analysis.page_count && ` | ${analysis.page_count}페이지`}
              </p>
            </div>
          </div>

          <Button variant="outline" className="gap-2" asChild>
            <a
              href={API_ROUTES.report(analysis.id)}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" />
              리포트 다운로드
            </a>
          </Button>
        </div>
      </FadeIn>

      {/* Summary Section */}
      <Card>
        <CardContent className="pt-6">
          <ReportSummary analysis={analysis} />
        </CardContent>
      </Card>

      {/* Clauses Section */}
      {analysis.clauses.length > 0 && (
        <div>
          <FadeIn>
            <h2 className="mb-4 text-lg font-semibold">
              조항별 분석{" "}
              <Badge variant="secondary" className="ml-2">
                {analysis.clauses.length}건
              </Badge>
            </h2>
          </FadeIn>
          <StaggerList className="space-y-4">
            {analysis.clauses.map((clause) => (
              <ClauseCard key={clause.id} clause={clause} />
            ))}
          </StaggerList>
        </div>
      )}

      {/* Improvements Section */}
      {analysis.improvements.length > 0 && (
        <div>
          <FadeIn>
            <h2 className="mb-4 text-lg font-semibold">개선 권고</h2>
          </FadeIn>
          <StaggerList className="space-y-4">
            {analysis.improvements.map((improvement) => (
              <Card key={improvement.priority}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Badge variant="outline">
                      우선순위 {improvement.priority}
                    </Badge>
                    {improvement.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {improvement.description}
                  </p>
                  {improvement.suggested_text && (
                    <div className="mt-3 rounded-lg bg-muted/50 p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        제안 문구:
                      </p>
                      <p className="mt-1 text-sm">
                        {improvement.suggested_text}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </StaggerList>
        </div>
      )}

      {/* Missing Clauses Section */}
      {analysis.missing_clauses && analysis.missing_clauses.length > 0 && (
        <FadeIn>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                누락된 조항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.missing_clauses.map((clause) => (
                  <li
                    key={clause}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {clause}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Disclaimer */}
      <FadeIn>
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            본 서비스는 AI 기반 참고 자료를 제공하며, 법률 자문을 대체하지
            않습니다. 중요한 계약 체결 시 반드시 법률 전문가의 자문을
            받으시기 바랍니다.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
