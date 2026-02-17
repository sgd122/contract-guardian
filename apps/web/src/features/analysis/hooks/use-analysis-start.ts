"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_ROUTES, DEFAULT_AI_PROVIDER } from "@cg/shared";
import type { AIProvider, AnalysisResult } from "@cg/shared";
import { usePaymentFlow } from "@/features/payment/hooks/use-payment";
import { apiClient } from "@/shared/lib/api-client";

interface UseAnalysisStartOptions {
  uploadResult: { analysisId: string; pageCount: number } | null;
  upload: () => Promise<{ analysisId: string; pageCount: number }>;
  resumeData: AnalysisResult | null;
  isResuming: boolean;
  isFreeAnalysis: boolean;
  price: number;
  userId: string | undefined;
  customerEmail: string | undefined;
  customerName: string | undefined;
}

interface UseAnalysisStartReturn {
  starting: boolean;
  showPayment: boolean;
  setShowPayment: (open: boolean) => void;
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
  handleUploadAndStart: () => Promise<void>;
  handlePaymentConfirm: () => Promise<void>;
}

export function useAnalysisStart({
  uploadResult,
  upload,
  resumeData,
  isResuming,
  isFreeAnalysis,
  price,
  userId,
  customerEmail,
  customerName,
}: UseAnalysisStartOptions): UseAnalysisStartReturn {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [provider, setProvider] = useState<AIProvider>(DEFAULT_AI_PROVIDER);
  const { handlePayment } = usePaymentFlow();

  const submitConsent = async () => {
    await apiClient.post(API_ROUTES.consent, {
      consentType: "privacy_policy",
      consentVersion: "v1.0",
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

  const handleUploadAndStart = async () => {
    try {
      setStarting(true);

      await submitConsent();

      if (isResuming) {
        if (isFreeAnalysis) {
          await startAnalysis(resumeData!.id);
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
    const analysisId = isResuming ? resumeData?.id : uploadResult?.analysisId;
    if (!analysisId) return;
    await handlePayment(analysisId, price, {
      userId,
      provider,
      customerEmail,
      customerName,
    });
  };

  return {
    starting,
    showPayment,
    setShowPayment,
    provider,
    setProvider,
    handleUploadAndStart,
    handlePaymentConfirm,
  };
}
