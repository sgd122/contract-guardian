"use client";

import { useRouter } from "next/navigation";
import { useAnalysis as useAnalysisHook } from "@cg/api";
import { getAnalysis } from "@/shared/api/actions";

export function useAnalysisResult(id: string | null) {
  const router = useRouter();
  const result = useAnalysisHook(id, {
    queryFn: async (analysisId: string) => getAnalysis(analysisId),
  });

  const navigateToResult = (analysisId: string) => {
    router.push(`/analyze/${analysisId}`);
  };

  return {
    ...result,
    navigateToResult,
  };
}
