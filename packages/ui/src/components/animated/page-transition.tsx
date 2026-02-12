"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "../../lib/utils";
import { pageVariants } from "../../lib/motion-variants";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  pageKey: string;
}

export function PageTransition({ children, className, pageKey }: PageTransitionProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        className={cn(className)}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children as any}
      </motion.div>
    </AnimatePresence>
  );
}
