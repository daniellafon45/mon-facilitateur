"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

export type MotionOverlayVariant = "drawer-right" | "center";

interface MotionOverlayProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: MotionOverlayVariant;
  className?: string;
  panelClassName?: string;
  zIndex?: number;
}

export function MotionOverlayBackdrop({
  onClose,
  zIndex = 1100,
  className,
}: {
  onClose: () => void;
  zIndex?: number;
  className?: string;
}) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: MOTION_DURATION.overlay, ease: MOTION_EASE }}
      className={cn("fixed inset-0 bg-slate-900/35 backdrop-blur-[2px]", className)}
      style={{ zIndex }}
      onClick={onClose}
      aria-hidden
    />
  );
}

export function MotionOverlay({
  open,
  onClose,
  children,
  variant = "drawer-right",
  className,
  panelClassName,
  zIndex = 1100,
}: MotionOverlayProps) {
  const reduced = useReducedMotion() ?? false;

  if (reduced && open) {
    if (variant === "center") {
      return (
        <>
          <div
            className={cn("fixed inset-0 bg-slate-900/35 backdrop-blur-[2px]", className)}
            style={{ zIndex }}
            onClick={onClose}
            aria-hidden
          />
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: zIndex + 1 }}
          >
            <div className={cn("w-full", panelClassName)} onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        <div
          className={cn("fixed inset-0 bg-slate-900/35 backdrop-blur-[2px]", className)}
          style={{ zIndex }}
          onClick={onClose}
          aria-hidden
        />
        <div
          className={cn(
            "fixed top-0 right-0 bottom-0 flex w-[380px] max-w-[92vw] flex-col bg-background shadow-[-12px_0_40px_rgba(15,23,42,.18)]",
            panelClassName,
          )}
          style={{ zIndex: zIndex + 1 }}
        >
          {children}
        </div>
      </>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <MotionOverlayBackdrop onClose={onClose} zIndex={zIndex} className={className} />
          {variant === "center" ? (
            <div
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ zIndex: zIndex + 1 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: MOTION_DURATION.overlay, ease: MOTION_EASE }}
                className={cn("w-full", panelClassName)}
                onClick={(e) => e.stopPropagation()}
              >
                {children}
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: MOTION_DURATION.overlay, ease: MOTION_EASE }}
              className={cn(
                "fixed top-0 right-0 bottom-0 flex w-[380px] max-w-[92vw] flex-col bg-background shadow-[-12px_0_40px_rgba(15,23,42,.18)]",
                panelClassName,
              )}
              style={{ zIndex: zIndex + 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

/** Drawer/modal monté par le parent : joue la sortie avant d'appeler onClose. */
export function useMotionOverlayClose(onClose: () => void) {
  const reduced = useReducedMotion() ?? false;

  return (setOpen: (v: boolean) => void) => {
    setOpen(false);
    if (reduced) {
      onClose();
      return;
    }
    window.setTimeout(onClose, MOTION_DURATION.overlay * 1000);
  };
}
