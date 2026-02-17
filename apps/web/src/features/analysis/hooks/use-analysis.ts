"use client";

import { useRouter } from "next/navigation";
import { useAnalysis as useAnalysisHook } from "@cg/api";
import { apiClient } from "@/shared/lib/api-client";

export function useAnalysisResult(id: string | null) {
  const router = useRouter();
  const result = useAnalysisHook(apiClient, id);

  const navigateToResult = (analysisId: string) => {
    router.push(`/analyze/${analysisId}`);
  };

  return {
    ...result,
    navigateToResult,
  };
}
