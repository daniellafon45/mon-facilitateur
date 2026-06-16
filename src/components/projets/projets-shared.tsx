"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { MotionOverlay } from "@/components/ui/motion-overlay";
import { MOTION_DURATION } from "@/lib/motion/tokens";

export function useProjetsToast() {
  const [toast, setToast] = useState("");
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => setToast(""), 2200);
  }, []);
  useEffect(() => () => { if (ref.current) clearTimeout(ref.current); }, []);
  return { toast, flash };
}

export function ProjetsToast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed left-1/2 bottom-7 z-[1200] -translate-x-1/2 flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
      {message}
    </div>
  );
}

export function MfDrawer({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  const requestClose = useCallback(() => {
    setOpen(false);
    window.setTimeout(onClose, MOTION_DURATION.overlay * 1000);
  }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [requestClose]);

  return (
    <MotionOverlay open={open} onClose={requestClose} variant="drawer-right" zIndex={1100}>
      <div className="flex items-center justify-between border-b px-5 py-4">
        <span className="text-[17px] font-extrabold tracking-tight">{title}</span>
        <button
          type="button"
          onClick={requestClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
          title="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
      {footer && <div className="flex gap-2.5 border-t px-5 py-3.5">{footer}</div>}
    </MotionOverlay>
  );
}
