"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import { Button, FadeIn, Card, CardContent, CardHeader, CardTitle, cn } from "@cg/ui";
import {
  formatCurrency,
  PRICE_STANDARD,
  PRICE_EXTENDED,
  PAGE_THRESHOLD_EXTENDED,
  API_ROUTES,
  AI_PROVIDERS,
  DEFAULT_AI_PROVIDER,
} from "@cg/shared";
import type { AIProvider } from "@cg/shared";
import { useAuth } from "@cg/api";
import { FileUploadZone } from "@/features/upload";
import { PaymentModal } from "@/features/payment";
import { useFileUpload } from "@/features/upload/hooks";
import { usePaymentFlow } from "@/features/payment/hooks/use-payment";
import { useResumeAnalysis } from "@/features/analysis/hooks";
import { apiClient } from "@/shared/lib/api-client";

export function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resume");
  const { user } = useAuth();
  const {
    file,
    uploading,
    uploadResult,
    error: uploadError,
    selectFile,
    upload,
  } = useFileUpload();

  const [consentAI, setConsentAI] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [starting, setStarting] = useState(false);
  const [provider, setProvider] = useState<AIProvider>(DEFAULT_AI_PROVIDER);

  const { resumeData, resumeLoading, filePreviewUrl } = useResumeAnalysis(resumeId);
  const { handlePayment } = usePaymentFlow();

  const isResuming = !!resumeId && !!resumeData;
  const isFreeAnalysis = (user?.free_analyses_remaining ?? 0) > 0;
  const pageCount = resumeData?.page_count ?? uploadResult?.pageCount ?? 1;
  const price =
    pageCount > PAGE_THRESHOLD_EXTENDED ? PRICE_EXTENDED : PRICE_STANDARD;
  const canProceed = isResuming
    ? consentAI && consentPrivacy
    : file && consentAI && consentPrivacy;

  const handleUploadAndStart = async () => {
    try {
      setStarting(true);

      if (isResuming) {
        if (isFreeAnalysis) {
          await startAnalysis(resumeData.id);
        } else {
          setShowPayment(true);
        }
        return;
      }

      let result = uploadResult;
      if (!result) {
        result = await upload();
      }

      if (isFreeAnalysis) {
        await startAnalysis(result.analysisId);
      } else {
        setShowPayment(true);
      }
    } catch {
      toast.error("파일 업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setStarting(false);
    }
  };

  const handlePaymentConfirm = async () => {
    const analysisId = isResuming ? resumeData.id : uploadResult?.analysisId;
    if (!analysisId) return;
    await handlePayment(analysisId, price, {
      userId: user?.id,
      provider,
      customerEmail: user?.email ?? undefined,
    });
  };

  const startAnalysis = async (analysisId: string) => {
    try {
      await apiClient.post(API_ROUTES.analyze, { analysisId, provider });
      router.push(`/analyze/${analysisId}`);
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : "분석 시작에 실패했습니다.";
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <FadeIn>
        <h1 className="text-2xl font-bold">계약서 분석</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          계약서를 업로드하면 AI가 위험 조항을 찾아드립니다
        </p>
      </FadeIn>

      {resumeLoading ? (
        <FadeIn delay={0.1}>
          <Card className="mt-8">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">분석 정보를 불러오는 중...</span>
            </CardContent>
          </Card>
        </FadeIn>
      ) : isResuming ? (
        <FadeIn delay={0.1}>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-base">업로드된 계약서</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium">{resumeData.original_filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {resumeData.page_count && `${resumeData.page_count}페이지 · `}
                    결제 대기 중
                  </p>
                </div>
              </div>
              {filePreviewUrl && (
                resumeData.file_type === "image" ? (
                  <div className="overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={filePreviewUrl}
                      alt="계약서 미리보기"
                      className="max-h-[500px] w-full object-contain"
                    />
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => window.open(filePreviewUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                    PDF 미리보기
                  </Button>
                )
              )}
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <FadeIn delay={0.1}>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-base">파일 업로드</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                onFileSelect={selectFile}
                disabled={uploading || starting}
              />
              {uploadError && (
                <p className="mt-2 text-sm text-destructive">{uploadError}</p>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {(file || isResuming) && (
        <FadeIn delay={0.2}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">필수 동의</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAI}
                  onChange={(e) => setConsentAI(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                />
                <span className="text-sm leading-relaxed">
                  AI 분석 결과는 법적 효력이 없으며, 법률 자문을 대체하지 않음을
                  인지했습니다.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentPrivacy}
                  onChange={(e) => setConsentPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                />
                <span className="text-sm leading-relaxed">
                  업로드한 계약서는 AI 분석 목적으로만 사용되며,{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    className="underline hover:text-primary"
                  >
                    개인정보처리방침
                  </a>
                  에 동의합니다.
                </span>
              </label>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {(file || isResuming) && (
        <FadeIn delay={0.25}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">AI 모델 선택</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setProvider(key)}
                    className={cn(
                      "flex flex-col items-start rounded-lg border p-4 text-left transition-colors",
                      provider === key
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-input hover:border-primary/50"
                    )}
                  >
                    <span className="text-sm font-medium">{AI_PROVIDERS[key].name}</span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {AI_PROVIDERS[key].description}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {(file || isResuming) && (
        <FadeIn delay={0.3}>
          <div className="mt-6">
            {isFreeAnalysis ? (
              <div className="flex items-center justify-between rounded-lg border bg-primary/5 p-4">
                <div>
                  <p className="text-sm font-medium">무료 분석</p>
                  <p className="text-xs text-muted-foreground">
                    무료 분석 남은 횟수: {user?.free_analyses_remaining}건
                  </p>
                </div>
                <Button
                  onClick={handleUploadAndStart}
                  disabled={!canProceed || uploading || starting}
                >
                  {(uploading || starting) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  무료 분석 시작
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">
                    분석 비용: {formatCurrency(price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pageCount > PAGE_THRESHOLD_EXTENDED
                      ? "확장 분석 (6~20페이지)"
                      : "일반 분석 (1~5페이지)"}
                  </p>
                </div>
                <Button
                  onClick={handleUploadAndStart}
                  disabled={!canProceed || uploading || starting}
                >
                  {(uploading || starting) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  결제하기
                </Button>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      <PaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        amount={price}
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
}
