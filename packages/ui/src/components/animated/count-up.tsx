"use client";

import * as React from "react";
import { useMotionValue, useTransform, animate } from "motion/react";

import { cn } from "../../lib/utils";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

export interface CountUpProps {
  end: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
}

export function CountUp({
  end,
  duration = 1.5,
  format,
  className,
}: CountUpProps) {
  const reducedMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const [display, setDisplay] = React.useState(reducedMotion ? end : 0);

  React.useEffect(() => {
    if (reducedMotion) {
      setDisplay(end);
      return;
    }

    const controls = animate(motionValue, end, {
      duration,
      ease: "easeOut",
    });

    const unsubscribe = rounded.on("change", (v) => {
      setDisplay(v);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [end, duration, reducedMotion, motionValue, rounded]);

  const formatted = format ? format(display) : String(display);

  return <span className={cn(className)}>{formatted}</span>;
}
