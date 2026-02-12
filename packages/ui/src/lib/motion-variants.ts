import type { Variants } from "motion/react";

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export const cardRevealVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export const gaugeVariants: Variants = {
  hidden: { pathLength: 0 },
  visible: (score: number) => ({
    pathLength: score / 100,
    transition: { duration: 1.5, ease: "easeInOut" },
  }),
};

export const hoverLift: Variants = {
  rest: { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  hover: {
    y: -4,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    transition: { duration: 0.2 },
  },
};

export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: { repeat: Infinity, duration: 1.5 },
  },
};
