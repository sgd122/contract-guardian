"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";

import { cn } from "../../lib/utils";
import { pulseVariants } from "../../lib/motion-variants";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

const DEFAULT_STEPS = [
  "계약서 구조 파악 중...",
  "독소 조항 탐지 중...",
  "관련 판례 대조 중...",
  "수정 제안 생성 중...",
  "최종 리포트 작성 중...",
];

export interface ProgressBarProps {
  currentStep: number;
  steps?: string[];
  className?: string;
}

export function ProgressBar({
  currentStep,
  steps = DEFAULT_STEPS,
  className,
}: ProgressBarProps) {
  const reducedMotion = useReducedMotion();
  const totalSteps = steps.length;
  const progressPercent = Math.min(
    ((currentStep + 1) / totalSteps) * 100,
    100
  );

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        {reducedMotion ? (
          <div
            className="h-full bg-primary"
            style={{ width: `${progressPercent}%` }}
          />
        ) : (
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        )}
      </div>

      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div
              key={step}
              className="flex flex-col items-center gap-1.5"
              style={{ width: `${100 / totalSteps}%` }}
            >
              <div className="flex items-center justify-center">
                {isCompleted ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                ) : isActive ? (
                  reducedMotion ? (
                    <div className="h-6 w-6 rounded-full border-2 border-primary bg-primary/20" />
                  ) : (
                    <motion.div
                      className="h-6 w-6 rounded-full border-2 border-primary bg-primary/20"
                      variants={pulseVariants}
                      animate="animate"
                    />
                  )
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-muted bg-background" />
                )}
              </div>
              <span
                className={cn(
                  "text-center text-xs",
                  isActive
                    ? "font-medium text-foreground"
                    : isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
