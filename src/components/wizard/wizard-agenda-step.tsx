"use client";

import { useEffect, useMemo, useRef } from "react";
import { ArrowDown, ArrowUp, Clock, Grid3X3, List, Minus, Plus } from "lucide-react";
import type { MeetingAgendaBlock, SessionMode } from "@/types/facilitation";
import {
  agendaTotalMinutes,
  fmtAgendaDuration,
  generateAgendaPlan,
} from "@/lib/meetings/agenda-generator";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { WizardAgendaTimeline } from "@/components/wizard/wizard-agenda-timeline";

const IMP_LABELS: Record<string, { label: string; cls: string }> = {
  haute: { label: "Haute", cls: "bg-red-50 text-red-700 border-red-100" },
  normale: { label: "Normale", cls: "bg-slate-100 text-slate-600 border-slate-200" },
  basse: { label: "Basse", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
};

const IMP_ORDER: MeetingAgendaBlock["importance"][] = ["haute", "normale", "basse"];

export function WizardAgendaStep({
  mode,
  methodIds,
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
  genreMin: number;
  genreCondensed: boolean;
  blocks: MeetingAgendaBlock[];
  pomodoro: boolean;
  layout: "tableau" | "frise";
  onChange: (blocks: MeetingAgendaBlock[]) => void;
  onPomodoroChange: (on: boolean) => void;
  onLayoutChange: (layout: "tableau" | "frise") => void;
}) {
  const initialized = useRef(false);
  const targetMin = genreMin || 90;

  useEffect(() => {
    if (initialized.current && blocks.length > 0) return;
    initialized.current = true;
    onChange(
      generateAgendaPlan(mode ?? "equipe", methodIds, targetMin, {
        pomodoro,
        condensed: genreCondensed,
      }),
    );
  }, [blocks.length, mode, methodIds, targetMin, pomodoro, genreCondensed, onChange]);

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

  const regen = () => {
    onChange(
      generateAgendaPlan(mode ?? "equipe", methodIds, targetMin, {
        pomodoro,
        condensed: genreCondensed,
      }),
    );
  };

  return (
    <div className="mx-auto max-w-[980px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Voici le déroulé proposé</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Généré d&apos;après votre durée et votre méthode. Réordonnez, ajustez les durées et l&apos;importance.
          </p>
        </div>
        <div className="flex rounded-full border p-0.5">
          <button
            type="button"
            onClick={() => onLayoutChange("tableau")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
              layout === "tableau" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <Grid3X3 className="h-3.5 w-3.5" /> Tableau
          </button>
          <button
            type="button"
            onClick={() => onLayoutChange("frise")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
              layout === "frise" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <List className="h-3.5 w-3.5" /> Frise
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-bold">
            {fmtAgendaDuration(totalMin)} / cible {fmtAgendaDuration(targetMin)}
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
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", over ? "bg-amber-500" : "bg-emerald-500")}
            style={{ width: `${Math.min(100, (totalMin / targetMin) * 100)}%` }}
          />
        </div>
      </div>

      {mode === "solo" && (
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-amber-50/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-extrabold text-sm">Structure Pomodoro</p>
              <p className="text-xs text-muted-foreground">Blocs de focus de 25 min entrecoupés de pauses de 5 min.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={pomodoro}
            onClick={() => {
              onPomodoroChange(!pomodoro);
              onChange(
                generateAgendaPlan(mode ?? "solo", methodIds, targetMin, {
                  pomodoro: !pomodoro,
                  condensed: genreCondensed,
                }),
              );
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

      {layout === "frise" ? (
        <WizardAgendaTimeline blocks={blocks} onChange={onChange} onMove={move} onUpdate={update} />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Point à l&apos;ordre du jour</th>
                <th className="px-3 py-2">Importance</th>
                <th className="px-3 py-2">Méthode</th>
                <th className="px-3 py-2">Durée</th>
                <th className="px-3 py-2">Ordre</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((b, idx) => {
                const imp = IMP_LABELS[b.importance ?? "normale"];
                const methodTitle =
                  b.method && b.method !== "—"
                    ? b.method
                    : methodIds[0]
                      ? METHOD_BY_ID[methodIds[0]]?.title
                      : "—";
                return (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="px-3 py-2 font-bold text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-2">
                      <Input
                        value={b.title}
                        onChange={(e) => update(b.id, { title: e.target.value })}
                        className="h-8 font-semibold"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => cycleImportance(b)}
                        className={cn("rounded-full border px-2 py-0.5 text-xs font-bold", imp.cls)}
                      >
                        {imp.label}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-xs font-semibold text-primary">{methodTitle}</td>
                    <td className="px-3 py-2">
                      <div className="inline-flex items-center rounded-full border">
                        <button type="button" className="px-2 py-1" onClick={() => update(b.id, { min: Math.max(5, b.min - 5) })}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[3rem] text-center text-xs font-bold">{b.min} min</span>
                        <button type="button" className="px-2 py-1" onClick={() => update(b.id, { min: b.min + 5 })}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button type="button" disabled={idx === 0} onClick={() => move(idx, -1)} className="text-muted-foreground disabled:opacity-30">
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button type="button" disabled={idx === blocks.length - 1} onClick={() => move(idx, 1)} className="text-muted-foreground disabled:opacity-30">
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={regen}>
          Régénérer avec Amaris
        </Button>
      </div>
    </div>
  );
}
