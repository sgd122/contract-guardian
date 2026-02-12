"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/utils";
import {
  staggerContainerVariants,
  cardRevealVariants,
} from "../../lib/motion-variants";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

export interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerList({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerListProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants = {
    ...staggerContainerVariants,
    visible: {
      opacity: 1,
      transition: { staggerChildren: staggerDelay },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {React.Children.map(children, (child) => (
        <motion.div className="h-full" variants={cardRevealVariants}>{child as any}</motion.div>
      ))}
    </motion.div>
  );
}
