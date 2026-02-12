"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createApiClient, useAnalysis as useAnalysisHook } from "@cg/api";

export function useAnalysisResult(id: string | null) {
  const client = useMemo(
    () => createApiClient({ baseURL: "" }),
    []
  );
  const router = useRouter();
  const result = useAnalysisHook(client, id);

  const navigateToResult = (analysisId: string) => {
    router.push(`/analyze/${analysisId}`);
  };

  return {
    ...result,
    navigateToResult,
  };
}
