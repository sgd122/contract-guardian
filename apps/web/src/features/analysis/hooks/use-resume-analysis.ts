"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AnalysisResult } from "@cg/shared";

interface UseResumeAnalysisReturn {
  resumeData: AnalysisResult | null;
  resumeLoading: boolean;
  filePreviewUrl: string | null;
}

export function useResumeAnalysis(resumeId: string | null): UseResumeAnalysisReturn {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<AnalysisResult | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;

    const fetchAnalysis = async () => {
      setResumeLoading(true);
      try {
        const res = await fetch(`/api/analyses/${resumeId}`);
        if (!res.ok) throw new Error("Not found");
        const data: AnalysisResult = await res.json();
        if (data.status !== "pending_payment") {
          router.replace(`/analyze/${resumeId}`);
          return;
        }
        if (!cancelled) {
          setResumeData(data);
          setFilePreviewUrl(`/api/analyses/${resumeId}/file`);
        }
      } catch {
        toast.error("분석 정보를 불러올 수 없습니다.");
        router.replace("/dashboard");
      } finally {
        if (!cancelled) setResumeLoading(false);
      }
    };

    fetchAnalysis();
    return () => { cancelled = true; };
  }, [resumeId, router]);

  return { resumeData, resumeLoading, filePreviewUrl };
}
