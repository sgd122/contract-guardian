"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button, FadeIn, Card, CardContent, CardHeader, CardTitle } from "@cg/ui";
import {
  formatCurrency,
  PRICE_STANDARD,
  PRICE_EXTENDED,
  PAGE_THRESHOLD_EXTENDED,
  API_ROUTES,
} from "@cg/shared";
import { useAuth, createApiClient } from "@cg/api";
import { FileUploadZone } from "@/components/analysis/file-upload-zone";
import { PaymentModal } from "@/components/payment/payment-modal";
import { useFileUpload } from "@/hooks/use-file-upload";

export default function AnalyzePage() {
  const router = useRouter();
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

  const client = useMemo(() => createApiClient({ baseURL: "" }), []);

  const isFreeAnalysis = (user?.free_analyses_remaining ?? 0) > 0;
  const pageCount = uploadResult?.pageCount ?? 1;
  const price =
    pageCount > PAGE_THRESHOLD_EXTENDED ? PRICE_EXTENDED : PRICE_STANDARD;
  const canProceed = file && consentAI && consentPrivacy;

  const handleUploadAndStart = async () => {
    try {
      setStarting(true);

      // Upload first if not already uploaded
      let result = uploadResult;
      if (!result) {
        result = await upload();
      }

      if (isFreeAnalysis) {
        // Start analysis directly for free tier
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
    if (!uploadResult) return;
    try {
      // Create payment
      const payRes = await client.post<{ orderId: string }>(
        API_ROUTES.paymentCreate,
        {
          analysisId: uploadResult.analysisId,
          amount: price,
        }
      );

      // Confirm payment (simplified - in production use Toss widget)
      await client.post(API_ROUTES.paymentConfirm, {
        orderId: payRes.orderId,
        paymentKey: `pk_${Date.now()}`,
        amount: price,
      });

      await startAnalysis(uploadResult.analysisId);
    } catch {
      throw new Error("결제 처리에 실패했습니다.");
    }
  };

  const startAnalysis = async (analysisId: string) => {
    try {
      await client.post(API_ROUTES.analyze, { analysisId });
      router.push(`/analyze/${analysisId}`);
    } catch {
      toast.error("분석 시작에 실패했습니다.");
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

      {file && (
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

      {file && (
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
