"use client";

import { ArrowDown, ArrowUp, Minus, Plus, Sparkles, X } from "lucide-react";
import type { MeetingAgendaBlock } from "@/types/facilitation";
import {
  getAgendaBlockIllustration,
  getAgendaBlockIllustrationFallback,
} from "@/lib/wizard/agenda-images";
import { cn } from "@/lib/utils";

const KIND_LABELS: Record<string, string> = {
  intro: "Ouverture",
  focus: "Travail",
  pause: "Pause",
  synthèse: "Synthèse",
  breakout: "Sous-groupe",
  plénière: "Plénière",
};

const KIND_ACCENT: Record<string, string> = {
  intro: "border-l-slate-400",
  focus: "border-l-sky-500",
  pause: "border-l-amber-400",
  synthèse: "border-l-emerald-500",
  breakout: "border-l-violet-500",
  plénière: "border-l-indigo-500",
};

const IMP_STYLES: Record<string, string> = {
  haute: "bg-rose-50 text-rose-700 border-rose-100",
  normale: "bg-slate-100 text-slate-600 border-slate-200",
  basse: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

function fmtMarker(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return r ? `${h} h ${String(r).padStart(2, "0")}` : `${h} h`;
}

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
    <div className="space-y-4">
      {blocks.map((b, idx) => {
        const marker = cumulative;
        cumulative += b.min;
        const kind = b.kind ?? "focus";
        const imgSrc = getAgendaBlockIllustration(b);
        const imgFallback = getAgendaBlockIllustrationFallback(b);

        return (
          <div key={b.id} className="flex gap-4">
            <div className="flex w-16 shrink-0 flex-col items-center pt-3">
              <span className="text-[11px] font-bold tabular-nums text-muted-foreground">
                {fmtMarker(marker)}
              </span>
              <div className="mt-2 h-2.5 w-2.5 rounded-full bg-primary/70" />
              {idx < blocks.length - 1 && (
                <div className="my-2 w-px flex-1 min-h-[48px] bg-gradient-to-b from-border to-transparent" />
              )}
            </div>

            <article
              className={cn(
                "group mb-1 flex flex-1 overflow-hidden rounded-2xl border border-l-[5px] bg-card shadow-sm transition-shadow hover:shadow-md",
                KIND_ACCENT[kind] ?? KIND_ACCENT.focus,
              )}
            >
              <div className="relative hidden w-28 shrink-0 sm:block md:w-36">
                <img
                  src={imgSrc}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (el.src !== imgFallback) el.src = imgFallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" />
                <span className="absolute bottom-2 left-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                  {KIND_LABELS[kind] ?? kind}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
                <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl sm:hidden">
                  <img
                    src={imgSrc}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (el.src !== imgFallback) el.src = imgFallback;
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold leading-snug">{b.title}</h3>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize",
                        IMP_STYLES[b.importance ?? "normale"],
                      )}
                    >
                      {b.importance ?? "normale"}
                    </span>
                  </div>
                  {b.activity && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{b.activity}</p>
                  )}
                  {b.method && b.method !== "—" && (
                    <p className="mt-1 text-xs font-semibold text-primary">{b.method}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
                  <div className="inline-flex items-center rounded-full border bg-background text-xs font-bold">
                    <button
                      type="button"
                      className="rounded-l-full px-2.5 py-1.5 hover:bg-muted"
                      onClick={() => onUpdate(b.id, { min: Math.max(5, b.min - 5) })}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[3.25rem] text-center tabular-nums">{b.min} min</span>
                    <button
                      type="button"
                      className="rounded-r-full px-2.5 py-1.5 hover:bg-muted"
                      onClick={() => onUpdate(b.id, { min: b.min + 5 })}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => onMove(idx, -1)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === blocks.length - 1}
                    onClick={() => onMove(idx, 1)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    onClick={() => onChange(blocks.filter((x) => x.id !== b.id))}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
}

export function WizardAgendaAiBanner({ summary }: { summary: string }) {
  return (
    <div
      className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 text-sm text-sky-950"
      data-testid="wizard-ai-agenda-banner"
    >
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
      <p>
        <span className="font-semibold">Déroulé ajusté par Amaris</span> — {summary}
      </p>
    </div>
  );
}
