"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

import { cn } from "../../lib/utils";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

export interface RiskGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

function getRiskColor(score: number): string {
  if (score >= 70) return "#ef4444";
  if (score >= 40) return "#f59e0b";
  return "#22c55e";
}

function getRiskLabel(score: number): string {
  if (score >= 70) return "위험";
  if (score >= 40) return "주의";
  return "안전";
}

function getRiskBgClass(score: number): string {
  if (score >= 70) return "text-risk-high";
  if (score >= 40) return "text-risk-medium";
  return "text-risk-low";
}

export function RiskGauge({
  score,
  size = 120,
  showLabel = true,
  className,
}: RiskGaugeProps) {
  const reducedMotion = useReducedMotion();
  const clampedScore = Math.min(Math.max(score, 0), 100);

  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const color = getRiskColor(clampedScore);

  const motionValue = useMotionValue(0);
  const displayValue = useTransform(motionValue, (v) => Math.round(v));
  const [displayNumber, setDisplayNumber] = React.useState(
    reducedMotion ? clampedScore : 0
  );

  React.useEffect(() => {
    if (reducedMotion) {
      setDisplayNumber(clampedScore);
      return;
    }

    const controls = animate(motionValue, clampedScore, {
      duration: 1.5,
      ease: "easeInOut",
    });

    const unsubscribe = displayValue.on("change", (v) => {
      setDisplayNumber(v);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [clampedScore, reducedMotion, motionValue, displayValue]);

  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={8}
            className="text-muted"
            transform={`rotate(-90 ${center} ${center})`}
          />
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: reducedMotion ? strokeDashoffset : strokeDashoffset }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 1.5, ease: "easeInOut" }
            }
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn("text-2xl font-bold", getRiskBgClass(clampedScore))}
            style={{ color }}
          >
            {displayNumber}
          </span>
        </div>
      </div>
      {showLabel && (
        <span
          className="text-sm font-medium"
          style={{ color }}
        >
          {getRiskLabel(clampedScore)}
        </span>
      )}
    </div>
  );
}
