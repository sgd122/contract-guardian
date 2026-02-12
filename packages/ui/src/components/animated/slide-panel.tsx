"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "../../lib/utils";
import { useReducedMotion } from "../../hooks/use-reduced-motion";

export interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}

export function SlidePanel({
  isOpen,
  onClose,
  children,
  side = "right",
  className,
}: SlidePanelProps) {
  const reducedMotion = useReducedMotion();

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const slideOffset = side === "right" ? "100%" : "-100%";
  const positionClass = side === "right" ? "right-0" : "left-0";

  if (reducedMotion) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
          role="presentation"
        />
        <div
          className={cn(
            "absolute top-0 h-full w-full max-w-md bg-background shadow-xl",
            positionClass,
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            role="presentation"
          />
          <motion.div
            className={cn(
              "absolute top-0 h-full w-full max-w-md bg-background shadow-xl",
              positionClass,
              className
            )}
            initial={{ x: slideOffset }}
            animate={{ x: 0 }}
            exit={{ x: slideOffset }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {children as any}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
