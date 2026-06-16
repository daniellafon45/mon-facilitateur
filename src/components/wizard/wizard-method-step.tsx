"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Pencil, Plus, Sparkles, Target, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { WizardAmarisButton } from "@/components/wizard/wizard-amaris-button";
import {
  ALL_METHODS,
  METHOD_BY_ID,
  METHOD_TABS,
  recommendMethod,
} from "@/lib/methods/catalog";
import { getMethodRecommendationInsight } from "@/lib/methods/method-recommendation";
import { MethodIcon } from "@/components/modeles/method-icon";
import { WizardMethodCard } from "@/components/wizard/wizard-method-card";
import { getMethodCategoryLabel } from "@/lib/methods/method-recommendation";
import { GENRE_BY_ID } from "@/lib/methods/session-genres";

function buildSequence(mainId: string, altIds: string[], targetMin: number): string[] {
  const seq = [mainId];
  let total = METHOD_BY_ID[mainId]?.est ?? 45;
  for (const id of altIds) {
    if (seq.includes(id)) continue;
    const est = METHOD_BY_ID[id]?.est ?? 30;
    if (targetMin <= 0 || total + est <= targetMin * 1.15) {
      seq.push(id);
      total += est;
    }
  }
  return seq;
}

export function WizardMethodStep({
  objective,
  genreId,
  genreMin,
  methods,
  methodsManual,
  onObjectiveChange,
  onMethodsChange,
}: {
  objective: string;
  genreId: string | null;
  genreMin: number;
  methods: string[];
  methodsManual: boolean;
  onObjectiveChange: (v: string) => void;
  onMethodsChange: (ids: string[], manual?: boolean) => void;
}) {
  const genre = genreId ? GENRE_BY_ID[genreId] : null;
  const genreCat = genre?.cats[0] ?? "ideas";
  const reco = useMemo(() => recommendMethod(genreCat, objective), [genreCat, objective]);
  const targetMin = genreMin || genre?.idealMin || 75;
  const recoSeq = useMemo(
    () => buildSequence(reco.main, reco.alts, targetMin),
    [reco.main, reco.alts, targetMin],
  );
  const lastAutoRef = useRef<string | null>(null);

  const [editingObj, setEditingObj] = useState(false);
  const [libOpen, setLibOpen] = useState(false);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (methodsManual) return;
    const key = recoSeq.join(",");
    const cur = methods;
    const last = lastAutoRef.current;
    const sameAsLast = last === key || (cur.length > 0 && cur.join(",") === last);
    if (cur.length === 0 || sameAsLast) {
      onMethodsChange(recoSeq, false);
      lastAutoRef.current = key;
    }
  }, [recoSeq, methodsManual, methods, onMethodsChange]);

  const mainM = METHOD_BY_ID[reco.main];
  const altMethods = reco.alts.map((id) => METHOD_BY_ID[id]).filter(Boolean);
  const libMethods = ALL_METHODS.filter((m) => tab === "all" || m.cats.includes(tab));
  const seqTotal = methods.reduce((s, id) => s + (METHOD_BY_ID[id]?.est ?? 0), 0);

  const toggle = (id: string) => {
    const next = methods.includes(id) ? methods.filter((x) => x !== id) : [...methods, id];
    onMethodsChange(next, true);
  };

  return (
    <div className="mx-auto max-w-[980px] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Choisis ta méthode et tes outils
        </h1>
        <WizardAmarisButton
          label="Laisser Amaris recommander la séquence"
          onClick={() => {
            onMethodsChange(recoSeq, false);
            lastAutoRef.current = recoSeq.join(",");
          }}
        />
      </div>

      <div className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
          <Target className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Votre objectif
          </p>
          {editingObj ? (
            <Input
              value={objective}
              onChange={(e) => onObjectiveChange(e.target.value)}
              onBlur={() => setEditingObj(false)}
              className="mt-0.5 h-8 font-semibold"
              autoFocus
            />
          ) : (
            <p className="truncate font-semibold">{objective || "—"}</p>
          )}
        </div>
        <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setEditingObj(true)}>
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      {mainM && (
        <div className="rounded-2xl border-2 border-violet-300 bg-violet-50/50 p-4 sm:p-5">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-violet-700">
            <Sparkles className="h-3 w-3" />
            Recommandé par Amaris
          </div>
          <div className="flex flex-wrap gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600"
            >
              <MethodIcon name={mainM.icon} className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-extrabold">{mainM.title}</h3>
              <p className="text-sm font-semibold text-violet-700">{mainM.tagline}</p>
              <p className="mt-2 text-sm text-muted-foreground">{mainM.why || mainM.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-semibold">
                  <Check className="h-3 w-3 text-emerald-500" />
                  Tient dans {genre?.dur ?? `${targetMin} min`}
                </span>
                {mainM.produces && (
                  <span className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-xs font-semibold">
                    <Check className="h-3 w-3 text-emerald-500" />
                    {mainM.produces}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant={methods.includes(mainM.id) ? "default" : "outline"}
            size="sm"
            className="mt-4 rounded-xl"
            onClick={() => toggle(mainM.id)}
          >
            {methods.includes(mainM.id) ? (
              <><Check className="mr-1 h-4 w-4" /> Dans votre rencontre</>
            ) : (
              <><Plus className="mr-1 h-4 w-4" /> Ajouter à la rencontre</>
            )}
          </Button>
        </div>
      )}

      {altMethods.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Aussi pertinentes pour votre objectif
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {altMethods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                className="flex items-start gap-3 rounded-xl border bg-background p-4 text-left hover:border-primary/30"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                  <MethodIcon name={m.icon} className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">{m.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{m.why || m.tagline}</p>
                </div>
                <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setLibOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border bg-background px-4 py-3 text-left"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
          <MethodIcon name="Grid" className="h-4 w-4" />
        </div>
        <span className="font-extrabold">Toute la bibliothèque</span>
        <span className="text-sm text-muted-foreground">· {ALL_METHODS.length} méthodes</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", libOpen && "rotate-180")} />
      </button>

      {libOpen && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {METHOD_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  tab === t.id ? "border-foreground bg-foreground text-background" : "text-muted-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid max-h-[400px] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
            {libMethods.map((m) => {
              const sel = methods.includes(m.id);
              const insight = getMethodRecommendationInsight(m.id, objective, reco, genreCat);
              return (
                <WizardMethodCard
                  key={m.id}
                  method={m}
                  categoryLabel={getMethodCategoryLabel(m)}
                  insight={insight}
                  selected={sel}
                  onToggle={() => toggle(m.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="fixed bottom-[72px] left-0 right-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur md:left-[17rem]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
          <span className="text-sm font-bold">{methods.length} méthode{methods.length > 1 ? "s" : ""}</span>
          <span className="text-sm text-muted-foreground">· ~ {Math.round(seqTotal / 5) * 5 || targetMin} min</span>
          <div className="flex flex-1 flex-wrap gap-1.5">
            {methods.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-800">
                {METHOD_BY_ID[id]?.title ?? id}
                <button type="button" onClick={() => toggle(id)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
