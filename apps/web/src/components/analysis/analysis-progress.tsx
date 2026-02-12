"use client";

import { useEffect, useState } from "react";
import { ProgressBar, FadeIn } from "@cg/ui";

const STEP_MESSAGES = [
  "계약서 구조 파악 중...",
  "독소 조항 탐지 중...",
  "관련 판례 대조 중...",
  "수정 제안 생성 중...",
  "최종 리포트 작성 중...",
];

const STEP_INTERVAL = 30; // 30 seconds per step
const ESTIMATED_TOTAL = 150; // ~2.5 minutes

interface AnalysisProgressProps {
  startedAt?: string;
}

export function AnalysisProgress({ startedAt }: AnalysisProgressProps) {
  const [elapsed, setElapsed] = useState(() => {
    if (startedAt) {
      const diff = Math.floor(
        (Date.now() - new Date(startedAt).getTime()) / 1000
      );
      return Math.max(0, diff);
    }
    return 0;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (startedAt) {
        const diff = Math.floor(
          (Date.now() - new Date(startedAt).getTime()) / 1000
        );
        setElapsed(Math.max(0, diff));
      } else {
        setElapsed((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  const currentStep = Math.min(
    Math.floor(elapsed / STEP_INTERVAL),
    STEP_MESSAGES.length - 1
  );

  const remaining = Math.max(0, ESTIMATED_TOTAL - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <FadeIn>
      <div className="mx-auto max-w-2xl space-y-8 py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold">계약서를 분석하고 있습니다</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            잠시만 기다려주세요. 보통 2~3분 정도 소요됩니다.
          </p>
        </div>

        <ProgressBar currentStep={currentStep} steps={STEP_MESSAGES} />

        <p className="text-center text-sm text-muted-foreground">
          예상 남은 시간: {minutes}분 {seconds.toString().padStart(2, "0")}초
        </p>
      </div>
    </FadeIn>
  );
}
