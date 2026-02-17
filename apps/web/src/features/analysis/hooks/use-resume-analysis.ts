"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@cg/api";
import { getAnalysis } from "@/shared/api/actions";
import type { AnalysisResult } from "@cg/shared";

interface UseResumeAnalysisReturn {
  resumeData: AnalysisResult | null;
  resumeLoading: boolean;
  filePreviewUrl: string | null;
}

export function useResumeAnalysis(resumeId: string | null): UseResumeAnalysisReturn {
  const router = useRouter();
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  const { data: resumeData = null, isLoading: resumeLoading, error } = useQuery({
    queryKey: queryKeys.analyses.resume(resumeId ?? ""),
    queryFn: async (): Promise<AnalysisResult | null> => {
      const result = await getAnalysis(resumeId!);
      if (!result) throw new Error("Not found");
      return result;
    },
    enabled: !!resumeId,
    retry: false,
  });

  // Side effects separated from queryFn
  useEffect(() => {
    if (!resumeData || !resumeId) return;
    if (resumeData.status !== "pending_payment") {
      router.replace(`/analyze/${resumeId}`);
    } else {
      setFilePreviewUrl(`/api/analyses/${resumeId}/file`);
    }
  }, [resumeData, resumeId, router]);

  useEffect(() => {
    if (error) {
      toast.error("분석 정보를 불러올 수 없습니다.");
      router.replace("/dashboard");
    }
  }, [error, router]);

  return { resumeData, resumeLoading, filePreviewUrl };
}
