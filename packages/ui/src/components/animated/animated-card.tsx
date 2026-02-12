"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/utils";
import { cardRevealVariants, hoverLift } from "../../lib/motion-variants";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

export interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div
        className={cn(
          "h-full rounded-lg border bg-card text-card-foreground shadow-sm",
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "h-full rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      variants={cardRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay }}
      whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", transition: { duration: 0.2 } }}
    >
      {children as any}
    </motion.div>
  );
}
