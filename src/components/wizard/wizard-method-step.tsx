"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LayoutGrid, Pencil, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AssistantAvatar } from "@/components/ui/assistant-avatar";
import {
  ALL_METHODS,
  METHOD_BY_ID,
  METHOD_TABS,
  recommendMethod,
} from "@/lib/methods/catalog";
import {
  getMethodCategoryLabel,
  getMethodRecommendationInsight,
} from "@/lib/methods/method-recommendation";
import { GENRE_BY_ID } from "@/lib/methods/session-genres";
import { WizardAmarisButton } from "@/components/wizard/wizard-amaris-button";
import { WizardMethodCard } from "@/components/wizard/wizard-method-card";

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
  ptype,
  genreId,
  genreMin,
  methods,
  methodsManual,
  methodsAiSummary,
  onObjectiveChange,
  onMethodsChange,
}: {
  objective: string;
  ptype: string | null;
  genreId: string | null;
  genreMin: number;
  methods: string[];
  methodsManual: boolean;
  methodsAiSummary?: string | null;
  onObjectiveChange: (v: string) => void;
  onMethodsChange: (ids: string[], manual?: boolean) => void;
}) {
  const genre = genreId ? GENRE_BY_ID[genreId] : null;
  const genreCat = genre?.cats[0] ?? "ideas";
  const reco = useMemo(
    () => recommendMethod(genreCat, objective, { ptype, genreId }),
    [genreCat, objective, ptype, genreId],
  );
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
    if (methodsAiSummary && methods.length > 0) return;
    const key = recoSeq.join(",");
    const cur = methods;
    const last = lastAutoRef.current;
    const sameAsLast = last === key || (cur.length > 0 && cur.join(",") === last);
    if (cur.length === 0 || sameAsLast) {
      onMethodsChange(recoSeq, false);
      lastAutoRef.current = key;
    }
  }, [recoSeq, methodsManual, methods, methodsAiSummary, onMethodsChange]);

  const mainM = METHOD_BY_ID[reco.main];
  const altMethods = reco.alts.map((id) => METHOD_BY_ID[id]).filter(Boolean);
  const libMethods = ALL_METHODS.filter((m) => tab === "all" || m.cats.includes(tab));
  const toggle = (id: string) => {
    const next = methods.includes(id) ? methods.filter((x) => x !== id) : [...methods, id];
    onMethodsChange(next, true);
  };

  const applyAmarisRecommendation = () => {
    onMethodsChange(recoSeq, false);
    lastAutoRef.current = recoSeq.join(",");
  };

  return (
    <div className="mx-auto max-w-[980px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Choisis ta méthode et tes outils
          </h1>
          <div className="mt-3 h-[3px] w-14 rounded-full bg-primary" />
        </div>
        <WizardAmarisButton
          className="self-start"
          label="Laisser Amaris recommander la séquence"
          onClick={applyAmarisRecommendation}
        />
      </div>

      {methodsAiSummary && !methodsManual && methods.length > 0 && (
        <div
          className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground"
          data-testid="wizard-ai-methods-banner"
        >
          <AssistantAvatar sizeClassName="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <span className="font-semibold text-primary">Sélection proposée par Amaris</span> d&apos;après votre
            objectif — {methodsAiSummary}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
            <p className="font-semibold leading-snug">{objective || "—"}</p>
          )}
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setEditingObj(true)}
          aria-label="Modifier l'objectif"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      {mainM && (
        <section className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-primary">
            <AssistantAvatar sizeClassName="h-4 w-4" />
            Recommandé par Amaris
          </div>
          <WizardMethodCard
            method={mainM}
            categoryLabel={getMethodCategoryLabel(mainM)}
            insight={getMethodRecommendationInsight(mainM.id, objective, reco, genreCat)}
            selected={methods.includes(mainM.id)}
            onToggle={() => toggle(mainM.id)}
            featured
            durationLabel={genre?.dur ?? `${targetMin} min`}
          />
          <div className="flex flex-wrap gap-2 pl-1">
            <Badge variant="outline" className="gap-1 rounded-full border-border bg-background font-semibold">
              <Check className="h-3 w-3 text-emerald-500" />
              Tient dans {genre?.dur ?? `${targetMin} min`}
            </Badge>
            {mainM.produces && (
              <Badge variant="outline" className="gap-1 rounded-full border-border bg-background font-semibold">
                <Check className="h-3 w-3 text-emerald-500" />
                {mainM.produces}
              </Badge>
            )}
          </div>
        </section>
      )}

      {altMethods.length > 0 && (
        <section>
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Aussi pertinentes pour votre objectif
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {altMethods.map((m) => (
              <WizardMethodCard
                key={m.id}
                method={m}
                categoryLabel={getMethodCategoryLabel(m)}
                insight={getMethodRecommendationInsight(m.id, objective, reco, genreCat)}
                selected={methods.includes(m.id)}
                onToggle={() => toggle(m.id)}
              />
            ))}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setLibOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left shadow-sm transition-colors hover:border-primary/30"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <LayoutGrid className="h-4 w-4" />
        </div>
        <span className="font-extrabold">Toute la bibliothèque</span>
        <span className="text-sm text-muted-foreground">· {ALL_METHODS.length} méthodes</span>
        <ChevronDown className={cn("ml-auto h-4 w-4 text-muted-foreground transition-transform", libOpen && "rotate-180")} />
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
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  tab === t.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid max-h-[400px] grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
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

    </div>
  );
}
