"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Clock,
  FileText,
  Heart,
  Play,
  Star,
  Tag,
  X,
} from "lucide-react";
import {
  ALL_RESOURCES,
  LEARN_METHOD_BY_ID,
  LEARN_METHODS,
  LEARN_PARCOURS,
  MODULE_TYPE,
  RESOURCE_CATS,
  THEME_LABEL,
  type LearnMethod,
  type LearnParcours,
  type LearnResource,
} from "@/lib/learn/data";
import { MethodCard, ParcoursCard } from "@/components/apprendre/learn-cards";
import {
  BackBtn,
  EmptyState,
  ErrorState,
  FilterChip,
  LearnProgress,
  LevelBadge,
  LoadingGrid,
  MethodIconTile,
  palColor,
  type LearnVideo,
} from "@/components/apprendre/learn-shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useReady(ms = 320) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const t = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return ready;
}

export function ParcoursCatalogView({
  progress,
  onBack,
  onOpen,
  onQuick,
}: {
  progress: Record<string, boolean[]>;
  onBack: () => void;
  onOpen: (id: string) => void;
  onQuick: (id: string) => void;
}) {
  const ready = useReady();
  const [lvl, setLvl] = useState("Tous");
  const list = LEARN_PARCOURS.filter((p) => lvl === "Tous" || p.level === lvl);

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-7 pb-14 sm:px-10">
      <BackBtn onClick={onBack} label="Apprendre" />
      <h1 className="mb-1 text-[28px] font-extrabold tracking-tight">Tous les parcours</h1>
      <p className="mb-5 text-[15px] text-muted-foreground">Des parcours guidés pour progresser, étape par étape.</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {["Tous", "Débutant", "Intermédiaire", "Avancé"].map((l) => (
          <FilterChip key={l} active={lvl === l} onClick={() => setLvl(l)}>{l}</FilterChip>
        ))}
      </div>
      {!ready ? (
        <LoadingGrid cols={3} count={6} />
      ) : list.length === 0 ? (
        <EmptyState icon="Bolt" title="Aucun parcours à ce niveau" sub="Essayez un autre niveau de difficulté." action="Réinitialiser" onAction={() => setLvl("Tous")} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ParcoursCard key={p.id} p={p} done={progress[p.id]} onOpen={onOpen} onQuick={onQuick} />
          ))}
        </div>
      )}
    </div>
  );
}

export function MethodLibraryView({
  saved,
  onBack,
  onOpen,
  onToggleSave,
}: {
  saved: string[];
  onBack: () => void;
  onOpen: (id: string) => void;
  onToggleSave: (id: string) => void;
}) {
  const ready = useReady();
  const [kind, setKind] = useState("Tout");
  const list = LEARN_METHODS.filter(
    (m) => kind === "Tout" || (kind === "Méthodes" && m.kind === "methode") || (kind === "Outils" && m.kind === "outil"),
  );

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-7 pb-14 sm:px-10">
      <BackBtn onClick={onBack} label="Apprendre" />
      <h1 className="mb-1 text-[28px] font-extrabold tracking-tight">Bibliothèque des méthodes</h1>
      <p className="mb-5 text-[15px] text-muted-foreground">8 méthodes et 3 outils, prêts à apprendre et à utiliser en séance.</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {["Tout", "Méthodes", "Outils"].map((k) => (
          <FilterChip key={k} active={kind === k} onClick={() => setKind(k)}>{k}</FilterChip>
        ))}
      </div>
      {!ready ? (
        <LoadingGrid cols={4} count={8} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((m) => (
            <MethodCard key={m.id} m={m} saved={saved.includes(m.id)} onOpen={onOpen} onToggleSave={onToggleSave} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ResourceLibraryView({
  initialCat,
  onlyNew,
  onBack,
  onOpenRes,
}: {
  initialCat?: string | null;
  onlyNew?: boolean;
  onBack: () => void;
  onOpenRes: (r: LearnResource) => void;
}) {
  const ready = useReady();
  const [cat, setCat] = useState(initialCat || "tous");
  const [nw, setNw] = useState(!!onlyNew);
  let list = ALL_RESOURCES;
  if (cat !== "tous") list = list.filter((r) => r.cat === cat);
  if (nw) list = list.filter((r) => r.isNew);

  const typeColor: Record<string, string> = { Guide: "blue", Article: "slate", Template: "violet", Vidéo: "amber" };

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-7 pb-14 sm:px-10">
      <BackBtn onClick={onBack} label="Apprendre" />
      <h1 className="mb-1 text-[28px] font-extrabold tracking-tight">{nw && cat === "tous" ? "Nouveautés" : "Ressources"}</h1>
      <p className="mb-5 text-[15px] text-muted-foreground">Guides, articles et templates pour aller plus loin.</p>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <FilterChip active={cat === "tous"} onClick={() => setCat("tous")}>Toutes</FilterChip>
        {RESOURCE_CATS.map((c) => (
          <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.title}</FilterChip>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        <FilterChip active={nw} onClick={() => setNw((v) => !v)}>Nouveautés</FilterChip>
      </div>
      {!ready ? (
        <LoadingGrid cols={3} count={6} />
      ) : list.length === 0 ? (
        <EmptyState icon="Document" title="Aucune ressource ici" sub="Modifiez les filtres pour afficher plus de contenu." action="Tout afficher" onAction={() => { setCat("tous"); setNw(false); }} />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r, i) => {
            const pal = palColor(typeColor[r.type] ?? "slate");
            return (
              <button
                key={i}
                type="button"
                onClick={() => onOpenRes(r)}
                className="flex flex-col gap-2.5 rounded-2xl border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <MethodIconTile icon={r.icon} color={r.color} size={38} />
                  {r.isNew && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-emerald-600">Nouveau</span>
                  )}
                </div>
                <div className="text-sm font-bold leading-snug">{r.title}</div>
                <div className="mt-auto flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[11.5px] font-bold" style={{ background: pal.bg, color: pal.fg }}>{r.type}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{r.meta}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MethodeFicheView({
  method,
  saved,
  onToggleSave,
  onBack,
  onUseInSession,
  onOpenTemplate,
}: {
  method: LearnMethod;
  saved: boolean;
  onToggleSave: () => void;
  onBack: () => void;
  onUseInSession: (m: LearnMethod) => void;
  onOpenTemplate?: (m: LearnMethod) => void;
}) {
  const pal = palColor(method.color);

  return (
    <div className="mx-auto max-w-[880px] px-6 py-7 pb-14 sm:px-10">
      <BackBtn onClick={onBack} label="Retour" />
      <div className="mb-2 flex items-start gap-4">
        <MethodIconTile icon={method.icon} color={method.color} size={64} />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full px-2.5 py-0.5 text-[11.5px] font-bold" style={{ background: pal.bg, color: pal.fg }}>{method.cat}</span>
            <LevelBadge level={method.level} />
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11.5px] font-bold text-muted-foreground">
              {method.kind === "outil" ? "Outil" : "Méthode"}
            </span>
          </div>
          <h1 className="mb-1.5 text-[28px] font-extrabold tracking-tight">{method.title}</h1>
          <p className="text-[15px] leading-relaxed text-muted-foreground">{method.pitch}</p>
        </div>
        <button
          type="button"
          onClick={onToggleSave}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
            saved ? "border-red-200 bg-red-50 text-red-500" : "text-muted-foreground",
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        </button>
      </div>

      <div className="mb-5 flex gap-5 border-b pb-5 text-[13.5px] font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-bold text-amber-600">
          <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {method.rating}
        </span>
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {method.dur}</span>
        <span className="inline-flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> {THEME_LABEL[method.theme]}</span>
      </div>

      <div className="grid items-start gap-7 lg:grid-cols-[1fr_280px]">
        <div>
          <section className="mb-6">
            <h2 className="mb-2 text-base font-extrabold">À quoi ça sert</h2>
            <p className="text-[14.5px] leading-relaxed text-muted-foreground">{method.forWhat}</p>
          </section>
          <section>
            <h2 className="mb-3 text-base font-extrabold">Les étapes</h2>
            <div className="space-y-4">
              {method.steps.map((s, i) => (
                <div key={i} className="flex gap-3.5">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold"
                    style={{ background: pal.bg, color: pal.fg }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-[14.5px] font-bold">{s.t}</div>
                    <p className="mt-0.5 text-[13.5px] leading-snug text-muted-foreground">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-4">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <h3 className="mb-2.5 text-sm font-extrabold">Quand l&apos;utiliser</h3>
            {method.when.map((w, i) => (
              <div key={i} className="mb-2 flex gap-2 text-[13px] leading-snug text-muted-foreground last:mb-0">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {w}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onOpenTemplate?.(method)}
            className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 text-left shadow-sm transition-colors hover:border-primary/40"
          >
            <MethodIconTile icon="Document" color="violet" size={36} />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Template</div>
              <div className="text-[13.5px] font-bold">{method.template}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <Button className="w-full rounded-xl" onClick={() => onUseInSession(method)}>
            Utiliser dans une séance <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ParcoursDetailView({
  parcours,
  done,
  onToggleModule,
  onBack,
  onOpenMethod,
  onPlayVideo,
}: {
  parcours: LearnParcours;
  done: boolean[];
  onToggleModule: (idx: number) => void;
  onBack: () => void;
  onOpenMethod: (id: string) => void;
  onPlayVideo: (v: LearnVideo) => void;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const total = parcours.modules.length;
  const completed = done.filter(Boolean).length;
  const pct = Math.round((completed / total) * 100);
  const pal = palColor(parcours.color);
  const currentIdx = done.findIndex((d) => !d);
  const resumeIdx = currentIdx === -1 ? 0 : currentIdx;
  const started = completed > 0;

  const openModule = (i: number) => {
    setSel(i);
    const m = parcours.modules[i];
    if (m.type === "video" && m.vid) {
      onPlayVideo({ vid: m.vid, title: m.t, channel: parcours.title });
    }
  };

  const selMod = sel != null ? parcours.modules[sel] : null;

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-7 pb-14 sm:px-10">
      <BackBtn onClick={onBack} label="Tous les parcours" />
      <div className="mb-5 flex items-start gap-4">
        <MethodIconTile icon={parcours.icon} color={parcours.color} size={64} />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <LevelBadge level={parcours.level} />
            <span className="rounded-full px-2.5 py-0.5 text-[11.5px] font-bold" style={{ background: pal.bg, color: pal.fg }}>
              {THEME_LABEL[parcours.theme]}
            </span>
          </div>
          <h1 className="mb-1.5 text-[28px] font-extrabold tracking-tight">{parcours.title}</h1>
          <p className="mb-3 text-[15px] leading-relaxed text-muted-foreground">{parcours.desc}</p>
          <div className="flex gap-4 text-[13px] font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {total} modules</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {parcours.dur}</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="min-w-[200px] flex-1">
          <div className="mb-1.5 flex justify-between text-[13px] font-bold">
            <span>{started ? `${completed} / ${total} modules` : "Parcours non commencé"}</span>
            <span className={pct === 100 ? "text-emerald-600" : "text-primary"}>{pct}%</span>
          </div>
          <LearnProgress pct={pct} color={pal.fg} />
        </div>
        <Button className="shrink-0 rounded-xl" onClick={() => openModule(resumeIdx)}>
          {pct === 100 ? "Revoir le parcours" : started ? "Reprendre" : "Commencer"} <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {selMod && sel !== null && (
        <div className="mb-6 rounded-2xl border-2 border-primary bg-card p-5 shadow-md">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MethodIconTile icon={MODULE_TYPE[selMod.type].icon} color={MODULE_TYPE[selMod.type].color} size={34} />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Module {sel + 1} · {MODULE_TYPE[selMod.type].label}
                </div>
                <div className="font-extrabold">{selMod.t}</div>
              </div>
            </div>
            <button type="button" onClick={() => setSel(null)} className="rounded-lg bg-muted p-2"><X className="h-4 w-4" /></button>
          </div>

          {selMod.type === "video" && selMod.vid && (
            <button type="button" onClick={() => onPlayVideo({ vid: selMod.vid!, title: selMod.t, channel: parcours.title })} className="relative mb-0 block w-full overflow-hidden rounded-xl">
              <div className="relative aspect-video bg-muted">
                <Image src={`https://i.ytimg.com/vi/${selMod.vid}/hqdefault.jpg`} alt={selMod.t} fill className="object-cover" unoptimized />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                    <Play className="h-6 w-6 fill-white" />
                  </span>
                </span>
              </div>
            </button>
          )}

          {selMod.type === "methode" && selMod.method && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/50 p-4">
              <p className="text-[13.5px] text-muted-foreground">
                Ce module s&apos;appuie sur la méthode <strong>{LEARN_METHOD_BY_ID[selMod.method]?.title}</strong>.
              </p>
              <Button variant="secondary" size="sm" className="rounded-lg" onClick={() => onOpenMethod(selMod.method!)}>
                Ouvrir la fiche <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {(selMod.type === "lecture" || selMod.type === "exercice") && (
            <p className="rounded-xl bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
              {selMod.type === "exercice"
                ? "Mettez en pratique ce que vous venez d'apprendre : suivez les consignes pas à pas, prenez le temps nécessaire, puis marquez le module comme terminé."
                : "Prenez quelques minutes pour parcourir cette lecture. Les points clés sont résumés à la fin, et vous pourrez les retrouver à tout moment dans la bibliothèque de ressources."}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={done[sel] ? "secondary" : "default"}
              className={cn("rounded-xl", done[sel] && "border-emerald-200 bg-emerald-50 text-emerald-700")}
              onClick={() => onToggleModule(sel)}
            >
              {done[sel] ? <><Check className="mr-1 h-4 w-4" /> Module terminé</> : "Marquer comme terminé"}
            </Button>
            {sel < total - 1 && (
              <Button variant="secondary" className="rounded-xl" onClick={() => openModule(sel + 1)}>
                Module suivant <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      <h2 className="mb-3 text-base font-extrabold">Modules</h2>
      <div className="overflow-hidden rounded-2xl border bg-card">
        {parcours.modules.map((m, i) => {
          const mt = MODULE_TYPE[m.type];
          const isCurrent = i === resumeIdx && !done[i];
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => openModule(i)}
              className={cn(
                "flex cursor-pointer items-center gap-3 border-b px-4 py-3 last:border-b-0 transition-colors hover:bg-muted/40",
                sel === i && "bg-primary/5",
                isCurrent && sel !== i && "bg-muted/30",
              )}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleModule(i); }}
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  done[i] ? "border-emerald-600 bg-emerald-600 text-white" : "border-muted-foreground/30 bg-card",
                )}
              >
                {done[i] && <Check className="h-3.5 w-3.5" />}
              </button>
              <MethodIconTile icon={mt.icon} color={mt.color} size={32} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">{m.t}</div>
                <div className="text-xs text-muted-foreground">{mt.label} · {m.dur}</div>
              </div>
              {isCurrent && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">À reprendre</span>
              )}
              <ChevronLeft className="h-4 w-4 shrink-0 rotate-180 text-muted-foreground/40" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProgressionView({
  progress,
  savedCount,
  onBack,
  onOpenParcours,
  onBrowse,
}: {
  progress: Record<string, boolean[]>;
  savedCount: number;
  onBack: () => void;
  onOpenParcours: (id: string) => void;
  onBrowse: () => void;
}) {
  const started = LEARN_PARCOURS.filter((p) => (progress[p.id] || []).some(Boolean));
  const enCours = started.filter((p) => {
    const d = progress[p.id] || [];
    return d.some(Boolean) && !d.every(Boolean);
  });
  const termines = LEARN_PARCOURS.filter((p) => {
    const d = progress[p.id] || [];
    return d.length && d.every(Boolean);
  });
  const modulesDone = LEARN_PARCOURS.reduce(
    (s, p) => s + (progress[p.id] || []).filter(Boolean).length,
    0,
  );

  const stat = (n: number, label: string, color: string) => (
    <div className="flex-1 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="text-3xl font-extrabold tabular-nums tracking-tight" style={{ color }}>{n}</div>
      <div className="mt-0.5 text-[13px] font-semibold text-muted-foreground">{label}</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[980px] px-6 py-7 pb-14 sm:px-10">
      <BackBtn onClick={onBack} label="Apprendre" />
      <h1 className="mb-1 text-[28px] font-extrabold tracking-tight">Ma progression</h1>
      <p className="mb-5 text-[15px] text-muted-foreground">Suivez l&apos;avancement de vos parcours d&apos;apprentissage.</p>

      <div className="mb-7 flex flex-wrap gap-3">
        {stat(enCours.length, "Parcours en cours", "hsl(var(--primary))")}
        {stat(termines.length, "Parcours terminés", "#059669")}
        {stat(modulesDone, "Modules complétés", "hsl(var(--foreground))")}
        {stat(savedCount, "Méthodes favorites", "#7c3aed")}
      </div>

      {started.length === 0 ? (
        <EmptyState icon="Bolt" title="Vous n'avez pas encore commencé de parcours" sub="Choisissez un parcours dans le catalogue pour démarrer votre progression." action="Parcourir les parcours" onAction={onBrowse} />
      ) : (
        <div className="space-y-3">
          {started.map((p) => {
            const d = progress[p.id] || [];
            const completed = d.filter(Boolean).length;
            const pct = Math.round((completed / p.modules.length) * 100);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onOpenParcours(p.id)}
                className="flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-px hover:border-primary/40"
              >
                <MethodIconTile icon={p.icon} color={p.color} size={46} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[15px] font-extrabold">{p.title}</span>
                    {pct === 100 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                        <Check className="h-3 w-3" /> Terminé
                      </span>
                    )}
                  </div>
                  <div className="mb-2 text-xs text-muted-foreground">{completed} / {p.modules.length} modules</div>
                  <LearnProgress pct={pct} color={palColor(p.color).fg} />
                </div>
                <span className={cn("shrink-0 text-sm font-extrabold tabular-nums", pct === 100 ? "text-emerald-600" : "text-primary")}>
                  {pct}%
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { ErrorState };
