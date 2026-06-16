"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, RefreshCw, Sparkles } from "lucide-react";
import type { SessionAssistResult } from "@/lib/assistant/session-assist-prompt";
import { sessionAssistHeuristic } from "@/lib/assistant/session-assist-heuristic";
import {
  sessionAssistFingerprint,
  type SessionAssistContext,
} from "@/lib/session/build-session-assist-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SessionLiveAssistanceProps {
  context: SessionAssistContext;
  onOpenAmaris?: () => void;
}

const DEBOUNCE_MS = 2800;
const POLL_MS = 45000;

export function SessionLiveAssistance({ context, onOpenAmaris }: SessionLiveAssistanceProps) {
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SessionAssistResult>(() => sessionAssistHeuristic(context));
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const lastFetchRef = useRef<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAssist = useCallback(
    async (ctx: SessionAssistContext, force = false) => {
      const fp = sessionAssistFingerprint(ctx);
      if (!force && fp === lastFetchRef.current) return;

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setBusy(true);

      try {
        const res = await fetch("/api/session/live-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ctx),
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("api");
        const data = (await res.json()) as SessionAssistResult;
        if (ac.signal.aborted) return;
        lastFetchRef.current = fp;
        setResult(data);
        setUpdatedAt(new Date());
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        const local = sessionAssistHeuristic(ctx);
        lastFetchRef.current = fp;
        setResult(local);
        setUpdatedAt(new Date());
      } finally {
        if (!ac.signal.aborted) setBusy(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchAssist(context);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [context, fetchAssist]);

  useEffect(() => {
    if (!open) return;
    const t = window.setInterval(() => {
      void fetchAssist(context, true);
    }, POLL_MS);
    return () => window.clearInterval(t);
  }, [open, context, fetchAssist]);

  const timeLabel = updatedAt
    ? updatedAt.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="border-t pt-3" data-testid="session-live-assistance">
      <button
        type="button"
        className="mb-2 flex w-full items-center gap-2 text-xs font-extrabold"
        onClick={() => setOpen((o) => !o)}
      >
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="flex-1 text-left">Assistance Amaris</span>
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
        <ChevronDown className={cn("h-3.5 w-3.5", !open && "-rotate-90")} />
      </button>

      {open && (
        <div className="space-y-3">
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">En direct</p>
            <p className="mt-0.5 text-xs font-semibold leading-snug">{result.status}</p>
            {result.nextAction && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground">Prochaine action :</span> {result.nextAction}
              </p>
            )}
          </div>

          {result.tips.map((t, i) => (
            <div key={`${t.title}-${i}`} className="flex gap-2 text-xs">
              <Sparkles className="h-4 w-4 shrink-0" style={{ color: t.color }} />
              <div>
                <p className="font-bold">{t.title}</p>
                <p className="text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-[10px]"
              disabled={busy}
              onClick={() => void fetchAssist(context, true)}
            >
              <RefreshCw className={cn("h-3 w-3", busy && "animate-spin")} />
              Actualiser
            </Button>
            {timeLabel && (
              <span className="text-[10px] text-muted-foreground">Analysé à {timeLabel}</span>
            )}
            {onOpenAmaris && (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-7 px-1 text-[10px]"
                onClick={onOpenAmaris}
              >
                Parler à Amaris
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
