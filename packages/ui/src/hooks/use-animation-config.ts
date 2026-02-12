"use client";

import { useReducedMotion } from "./use-reduced-motion";

export interface AnimationConfig {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  ease: {
    easeOut: [number, number, number, number];
    spring: { type: "spring"; stiffness: number; damping: number };
    bounce: { type: "spring"; stiffness: number; damping: number; mass: number };
  };
  disabled: boolean;
}

export function useAnimationConfig(): AnimationConfig {
  const reducedMotion = useReducedMotion();

  return {
    duration: {
      fast: reducedMotion ? 0 : 0.15,
      normal: reducedMotion ? 0 : 0.3,
      slow: reducedMotion ? 0 : 0.5,
    },
    ease: {
      easeOut: [0, 0, 0.2, 1],
      spring: { type: "spring", stiffness: 400, damping: 30 },
      bounce: { type: "spring", stiffness: 300, damping: 10, mass: 0.8 },
    },
    disabled: reducedMotion,
  };
}
