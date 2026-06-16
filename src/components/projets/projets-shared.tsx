"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, X } from "lucide-react";

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
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-[1100] bg-slate-900/35 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-[1101] flex w-[380px] max-w-[92vw] flex-col bg-background shadow-[-12px_0_40px_rgba(15,23,42,.18)] animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <span className="text-[17px] font-extrabold tracking-tight">{title}</span>
          <button type="button" onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted" title="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex gap-2.5 border-t px-5 py-3.5">{footer}</div>}
      </div>
    </>
  );
}
