"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UseDeleteAnalysisReturn {
  deleting: boolean;
  handleDelete: (analysisId: string) => Promise<void>;
}

export function useDeleteAnalysis(): UseDeleteAnalysisReturn {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (analysisId: string) => {
    if (!window.confirm("이 분석을 삭제하시겠습니까?")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete analysis");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to delete analysis:", error);
      alert("분석을 삭제하는 중 오류가 발생했습니다.");
      setDeleting(false);
    }
  };

  return { deleting, handleDelete };
}
