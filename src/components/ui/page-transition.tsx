"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { MOTION_DURATION, MOTION_EASE, MOTION_OFFSET } from "@/lib/motion/tokens";

export type PageTransitionVariant = "page" | "wizard";
export type WizardDirection = "forward" | "back";

interface PageTransitionProps {
  children: ReactNode;
  transitionKey: string;
  variant?: PageTransitionVariant;
  direction?: WizardDirection;
  className?: string;
}

function pageVariants(reduced: boolean) {
  if (reduced) {
    return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 1, y: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: MOTION_OFFSET.slideY },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: MOTION_OFFSET.slideYExit },
  };
}

function wizardVariants(direction: WizardDirection, reduced: boolean) {
  if (reduced) {
    return {
      initial: { opacity: 1, x: 0 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 1, x: 0 },
    };
  }
  const enterX = direction === "forward" ? MOTION_OFFSET.slideX : -MOTION_OFFSET.slideX;
  const exitX = direction === "forward" ? -MOTION_OFFSET.slideX : MOTION_OFFSET.slideX;
  return {
    initial: { opacity: 0, x: enterX },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: exitX },
  };
}

export function PageTransition({
  children,
  transitionKey,
  variant = "page",
  direction = "forward",
  className,
}: PageTransitionProps) {
  const reduced = useReducedMotion() ?? false;
  const variants = variant === "wizard" ? wizardVariants(direction, reduced) : pageVariants(reduced);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={transitionKey}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration: MOTION_DURATION.page, ease: MOTION_EASE }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
