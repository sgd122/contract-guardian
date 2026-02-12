"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/utils";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

export interface FadeInProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}

const directionOffset = {
  up: { x: 0, y: 24 },
  down: { x: 0, y: -24 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
};

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  className,
}: FadeInProps) {
  const reducedMotion = useReducedMotion();
  const offset = directionOffset[direction];

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut",
      }}
    >
      {children as any}
    </motion.div>
  );
}
