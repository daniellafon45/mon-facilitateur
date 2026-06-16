"use client";

import { ArrowDown, ArrowUp, Minus, Plus, X, Zap } from "lucide-react";
import type { MeetingAgendaBlock } from "@/types/facilitation";
import { cn } from "@/lib/utils";

const KIND_STYLES: Record<string, { border: string; dot: string; icon: string }> = {
  focus: { border: "border-l-blue-500", dot: "bg-blue-500", icon: "bg-blue-100 text-blue-600" },
  pause: { border: "border-l-amber-500", dot: "bg-amber-500", icon: "bg-amber-100 text-amber-600" },
  synthèse: { border: "border-l-emerald-500", dot: "bg-emerald-500", icon: "bg-emerald-100 text-emerald-600" },
  intro: { border: "border-l-slate-400", dot: "bg-slate-400", icon: "bg-slate-100 text-slate-600" },
  breakout: { border: "border-l-violet-500", dot: "bg-violet-500", icon: "bg-violet-100 text-violet-600" },
  plénière: { border: "border-l-sky-500", dot: "bg-sky-500", icon: "bg-sky-100 text-sky-600" },
};

export function WizardAgendaTimeline({
  blocks,
  onChange,
  onMove,
  onUpdate,
}: {
  blocks: MeetingAgendaBlock[];
  onChange: (blocks: MeetingAgendaBlock[]) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
  onUpdate: (id: string, patch: Partial<MeetingAgendaBlock>) => void;
}) {
  let cumulative = 0;

  return (
    <div className="space-y-0">
      {blocks.map((b, idx) => {
        const style = KIND_STYLES[b.kind ?? "focus"] ?? KIND_STYLES.focus;
        const marker = cumulative;
        cumulative += b.min;
        return (
          <div key={b.id} className="flex gap-3">
            <div className="flex w-14 shrink-0 flex-col items-center">
              <span className="text-[10px] font-bold text-muted-foreground tabular-nums">
                {marker < 60 ? `${marker} min` : `${Math.floor(marker / 60)} h ${String(marker % 60).padStart(2, "0")}`}
              </span>
              <div className={cn("mt-1 h-2.5 w-2.5 rounded-full", style.dot)} />
              {idx < blocks.length - 1 && <div className="my-1 w-px flex-1 bg-border min-h-[40px]" />}
            </div>
            <div
              className={cn(
                "mb-3 flex flex-1 items-start gap-3 rounded-xl border border-l-4 bg-background p-3",
                style.border,
              )}
            >
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", style.icon)}>
                <Zap className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold">{b.title}</p>
                <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold capitalize">
                  {b.importance ?? "normale"}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <div className="inline-flex items-center rounded-full border text-xs font-bold">
                  <button type="button" className="px-2 py-1" onClick={() => onUpdate(b.id, { min: Math.max(5, b.min - 5) })}>
                    <Minus className="h-3 w-3" />
                  </button>
                  {b.min} min
                  <button type="button" className="px-2 py-1" onClick={() => onUpdate(b.id, { min: b.min + 5 })}>
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button type="button" disabled={idx === 0} onClick={() => onMove(idx, -1)} className="p-1 text-muted-foreground disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" disabled={idx === blocks.length - 1} onClick={() => onMove(idx, 1)} className="p-1 text-muted-foreground disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-1 text-muted-foreground hover:text-red-500"
                  onClick={() => onChange(blocks.filter((x) => x.id !== b.id))}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
