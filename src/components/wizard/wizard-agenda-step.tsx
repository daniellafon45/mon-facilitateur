"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Clock, Grid3X3, List, Loader2, Minus, Plus } from "lucide-react";
import type { MeetingAgendaBlock, SessionMode } from "@/types/facilitation";
import {
  agendaTotalMinutes,
  fmtAgendaDuration,
} from "@/lib/meetings/agenda-generator";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import {
  getAgendaBlockIllustration,
  getAgendaBlockIllustrationFallback,
} from "@/lib/wizard/agenda-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  WizardAgendaAiBanner,
  WizardAgendaTimeline,
} from "@/components/wizard/wizard-agenda-timeline";

const IMP_LABELS: Record<string, { label: string; cls: string }> = {
  haute: { label: "Haute", cls: "bg-red-50 text-red-700 border-red-100" },
  normale: { label: "Normale", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  basse: { label: "Basse", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
};

const IMP_ORDER: MeetingAgendaBlock["importance"][] = ["haute", "normale", "basse"];

export function WizardAgendaStep({
  mode,
  methodIds,
  objective,
  genreTitle,
  genreMin,
  genreCondensed,
  blocks,
  pomodoro,
  layout,
  onChange,
  onPomodoroChange,
  onLayoutChange,
}: {
  mode: SessionMode | null;
  methodIds: string[];
  objective: string;
  genreTitle?: string;
  genreMin: number;
  genreCondensed: boolean;
  blocks: MeetingAgendaBlock[];
  pomodoro: boolean;
  layout: "tableau" | "frise";
  onChange: (blocks: MeetingAgendaBlock[]) => void;
  onPomodoroChange: (on: boolean) => void;
  onLayoutChange: (layout: "tableau" | "frise") => void;
}) {
  const targetMin = genreMin || 90;
  const [generating, setGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchAgenda = useCallback(
    async (opts?: { pomodoro?: boolean }) => {
      setGenerating(true);
      try {
        const res = await fetch("/api/wizard/generate-agenda", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: mode ?? "equipe",
            methodIds,
            objective,
            targetMin,
            pomodoro: opts?.pomodoro ?? pomodoro,
            condensed: genreCondensed,
            context: { genreTitle },
          }),
        });
        if (!res.ok) throw new Error("generate failed");
        const data = (await res.json()) as {
          blocks: MeetingAgendaBlock[];
          summary: string;
        };
        onChange(data.blocks);
        setAiSummary(data.summary);
      } finally {
        setGenerating(false);
      }
    },
    [mode, methodIds, objective, targetMin, pomodoro, genreCondensed, genreTitle, onChange],
  );

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    void fetchAgenda();
  }, [fetchAgenda]);

  const totalMin = useMemo(() => agendaTotalMinutes(blocks), [blocks]);
  const over = totalMin > targetMin;
  const margin = targetMin - totalMin;

  const update = (id: string, patch: Partial<MeetingAgendaBlock>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...blocks];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };

  const cycleImportance = (b: MeetingAgendaBlock) => {
    const i = IMP_ORDER.indexOf(b.importance ?? "normale");
    update(b.id, { importance: IMP_ORDER[(i + 1) % IMP_ORDER.length] });
  };

  return (
    <div className="mx-auto max-w-[1024px] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Voici le déroulé proposé</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Amaris ajuste l&apos;ordre du jour à votre objectif et à vos méthodes. Réordonnez, affinez les durées et
            l&apos;importance.
          </p>
        </div>
        <div className="flex rounded-full border bg-background p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => onLayoutChange("tableau")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
              layout === "tableau" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Grid3X3 className="h-3.5 w-3.5" /> Tableau
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange("frise")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
              layout === "frise" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="h-3.5 w-3.5" /> Frise
          </button>
        </div>
      </div>

      {aiSummary && !generating && <WizardAgendaAiBanner summary={aiSummary} />}

      <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/30 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-bold">
            {fmtAgendaDuration(totalMin)} <span className="text-muted-foreground">/ cible {fmtAgendaDuration(targetMin)}</span>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-extrabold",
              over ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800",
            )}
          >
            {over ? `Dépasse de ${totalMin - targetMin} min` : margin > 0 ? `Marge de ${margin} min` : "Pile dans la cible"}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-500", over ? "bg-amber-500" : "bg-emerald-500")}
            style={{ width: `${Math.min(100, (totalMin / targetMin) * 100)}%` }}
          />
        </div>
      </div>

      {mode === "solo" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border bg-amber-50/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-extrabold">Structure Pomodoro</p>
              <p className="text-xs text-muted-foreground">Blocs de focus de 25 min entrecoupés de pauses de 5 min.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={pomodoro}
            disabled={generating}
            onClick={() => {
              const next = !pomodoro;
              onPomodoroChange(next);
              void fetchAgenda({ pomodoro: next });
            }}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              pomodoro ? "bg-amber-500" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform",
                pomodoro ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>
      )}

      {generating && blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold">Amaris ajuste le déroulé…</p>
        </div>
      ) : layout === "frise" ? (
        <WizardAgendaTimeline blocks={blocks} onChange={onChange} onMove={move} onUpdate={update} />
      ) : (
        <div className="space-y-3">
          {blocks.map((b, idx) => {
            const imp = IMP_LABELS[b.importance ?? "normale"];
            const methodTitle =
              b.method && b.method !== "—"
                ? b.method
                : methodIds[0]
                  ? METHOD_BY_ID[methodIds[0]]?.title
                  : "—";
            const imgSrc = getAgendaBlockIllustration(b);
            const imgFallback = getAgendaBlockIllustrationFallback(b);
            return (
              <div
                key={b.id}
                className="flex overflow-hidden rounded-2xl border bg-card shadow-sm"
              >
                <div className="hidden w-24 shrink-0 sm:block md:w-28">
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
                <div className="grid min-w-0 flex-1 gap-2 p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-3 sm:p-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-muted-foreground">#{idx + 1}</span>
                    <Input
                      value={b.title}
                      onChange={(e) => update(b.id, { title: e.target.value })}
                      className="mt-0.5 h-8 border-0 bg-transparent p-0 font-semibold shadow-none focus-visible:ring-0"
                    />
                    {b.activity && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">{b.activity}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => cycleImportance(b)}
                    className={cn("justify-self-start rounded-full border px-2 py-0.5 text-xs font-bold sm:justify-self-center", imp.cls)}
                  >
                    {imp.label}
                  </button>
                  <span className="text-xs font-semibold text-primary">{methodTitle}</span>
                  <div className="flex items-center gap-1">
                    <div className="inline-flex items-center rounded-full border text-xs font-bold">
                      <button type="button" className="px-2 py-1" onClick={() => update(b.id, { min: Math.max(5, b.min - 5) })}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[3rem] text-center">{b.min} min</span>
                      <button type="button" className="px-2 py-1" onClick={() => update(b.id, { min: b.min + 5 })}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button type="button" disabled={idx === 0} onClick={() => move(idx, -1)} className="text-muted-foreground disabled:opacity-30">
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button type="button" disabled={idx === blocks.length - 1} onClick={() => move(idx, 1)} className="text-muted-foreground disabled:opacity-30">
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl"
          disabled={generating}
          onClick={() => void fetchAgenda()}
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {generating ? "Amaris ajuste…" : "Régénérer avec Amaris"}
        </Button>
      </div>
    </div>
  );
}
