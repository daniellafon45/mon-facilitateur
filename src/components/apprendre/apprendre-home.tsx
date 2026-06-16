"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  Package,
  Play,
  Search,
  X,
} from "lucide-react";
import {
  ALL_RESOURCES,
  LEARN_CHANNELS,
  LEARN_METHODS,
  LEARN_NEWS,
  LEARN_PARCOURS,
  LEARN_THEMES,
  LEARN_VIDEOS,
  RESOURCE_CATS,
  THEME_LABEL,
  type LearnResource,
} from "@/lib/learn/data";
import { MethodCard, ParcoursCard } from "@/components/apprendre/learn-cards";
import { KitsPromo } from "@/components/apprendre/kits-views";
import { MethodIcon, MethodIconTile } from "@/components/modeles/method-icon";
import {
  EmptyState,
  LearnProgress,
  RailItemThumb,
  SectionHead,
  palColor,
  type LearnVideo,
} from "@/components/apprendre/learn-shared";
import {
  getLearnNewsIllustration,
  getParcoursIllustration,
  getResourceCatIllustration,
} from "@/lib/learn/parcours-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatShaderBackground } from "@/components/dashboard/dashboard-shader-background";
import { CHAT_AI_GRADIENT } from "@/components/dashboard/assistant-ia-card";
import { getDashboardTheme } from "@/lib/data/dashboard-themes";
import { useDashboardThemeStore } from "@/lib/store/dashboard-theme-store";
import { cn } from "@/lib/utils";

type GoFn = (name: string, id?: string | null, flag?: boolean) => void;

export function ApprendreHome({
  progress,
  saved,
  query,
  setQuery,
  theme,
  setTheme,
  go,
  openParcoursQuick,
  openResource,
  playVideo,
  toggleSave,
  onStartLearning,
}: {
  progress: Record<string, boolean[]>;
  saved: string[];
  query: string;
  setQuery: (q: string) => void;
  theme: string | null;
  setTheme: (t: string | null) => void;
  go: GoFn;
  openParcoursQuick: (id: string) => void;
  openResource: (r: LearnResource) => void;
  playVideo: (v: LearnVideo) => void;
  toggleSave: (id: string) => void;
  onStartLearning: () => void;
}) {
  const [moreVideos, setMoreVideos] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const visibleVideos = moreVideos ? LEARN_VIDEOS : LEARN_VIDEOS.slice(0, 3);

  const dashboardThemeId = useDashboardThemeStore((s) => s.themeId);
  const dashboardTheme = getDashboardTheme(dashboardThemeId);
  const hasShader = dashboardTheme !== null;
  const darkHero = hasShader && dashboardTheme.appearance === "dark";

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const matchP = searching
    ? LEARN_PARCOURS.filter((p) => `${p.title}${p.desc}${THEME_LABEL[p.theme]}`.toLowerCase().includes(q))
    : [];
  const matchM = searching
    ? LEARN_METHODS.filter((m) => `${m.title}${m.pitch}${m.cat}${THEME_LABEL[m.theme]}`.toLowerCase().includes(q))
    : [];
  const matchR = searching
    ? ALL_RESOURCES.filter((r) => `${r.title}${r.type}${THEME_LABEL[r.theme]}`.toLowerCase().includes(q))
    : [];
  const noResults = searching && matchP.length === 0 && matchM.length === 0 && matchR.length === 0;

  const parcoursList = theme
    ? LEARN_PARCOURS.filter((p) => p.theme === theme)
    : LEARN_PARCOURS.filter((p) => p.recommended);
  const methodsList = (theme ? LEARN_METHODS.filter((m) => m.theme === theme) : LEARN_METHODS).slice(0, 4);
  const resumeList = LEARN_PARCOURS.filter((p) => (progress[p.id] || []).some(Boolean)).slice(0, 3);

  return (
    <div className="mx-auto flex max-w-[1400px] gap-6 px-6 py-8 pb-14 sm:px-10">
      <div className="min-w-0 flex-1">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-[32px] font-extrabold tracking-tight">Apprendre</h1>
          <div className="flex min-w-[248px] items-center gap-2 rounded-xl border bg-card px-3.5 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un sujet, une méthode…"
              className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {searching ? (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">
              Résultats pour « <strong className="text-foreground">{query}</strong> »
            </p>
            {noResults ? (
              <EmptyState icon="Search" title="Aucun résultat" sub="Essayez : brainstorming, design thinking, facilitation…" action="Effacer la recherche" onAction={() => setQuery("")} />
            ) : (
              <div className="space-y-7">
                {matchP.length > 0 && (
                  <div>
                    <SectionHead title={`Parcours (${matchP.length})`} />
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                      {matchP.map((p) => (
                        <ParcoursCard key={p.id} p={p} done={progress[p.id]} onOpen={(id) => go("parcours", id)} onQuick={openParcoursQuick} />
                      ))}
                    </div>
                  </div>
                )}
                {matchM.length > 0 && (
                  <div>
                    <SectionHead title={`Méthodes & outils (${matchM.length})`} />
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                      {matchM.map((m) => (
                        <MethodCard key={m.id} m={m} saved={saved.includes(m.id)} onOpen={(id) => go("method", id)} onToggleSave={toggleSave} />
                      ))}
                    </div>
                  </div>
                )}
                {matchR.length > 0 && (
                  <div>
                    <SectionHead title={`Ressources (${matchR.length})`} />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {matchR.map((r, i) => (
                        <button key={i} type="button" onClick={() => openResource(r)} className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 text-left hover:border-primary/40">
                          <MethodIconTile icon={r.icon} color={r.color} size={36} />
                          <div className="min-w-0">
                            <div className="text-[13.5px] font-bold leading-snug">{r.title}</div>
                            <div className="text-xs text-muted-foreground">{r.type} · {r.meta}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div
              className={cn(
                "relative mb-7 overflow-hidden rounded-2xl px-8 py-7",
                hasShader
                  ? "border border-white/25"
                  : CHAT_AI_GRADIENT,
              )}
            >
              {hasShader && <ChatShaderBackground />}
              <div className="relative z-10 max-w-md">
                <h2
                  className={cn(
                    "mb-3 text-[26px] font-extrabold leading-tight",
                    hasShader ? (darkHero ? "text-white" : "text-foreground") : "text-white",
                  )}
                >
                  Libérez votre potentiel créatif et innovez avec impact
                </h2>
                <p
                  className={cn(
                    "mb-5 text-sm leading-relaxed",
                    hasShader
                      ? darkHero
                        ? "text-white/75"
                        : "text-foreground/70"
                      : "text-white/75",
                  )}
                >
                  Méthodes, parcours, guides pratiques et inspirations pour transformer vos idées en solutions concrètes.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Button
                    className={cn(
                      "rounded-xl",
                      hasShader
                        ? darkHero
                          ? "bg-white text-primary hover:bg-white/90"
                          : "bg-foreground text-background hover:bg-foreground/90"
                        : "bg-white text-primary hover:bg-white/90",
                    )}
                    onClick={onStartLearning}
                  >
                    Commencer à apprendre <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    className={cn(
                      "rounded-xl",
                      hasShader
                        ? darkHero
                          ? "border border-white/30 bg-white/15 text-white hover:bg-white/25"
                          : "border border-white/60 bg-white/50 text-foreground hover:bg-white/70"
                        : "border border-white/30 bg-white/15 text-white hover:bg-white/25",
                    )}
                    onClick={() => go("parcours-catalog")}
                  >
                    Voir les parcours
                  </Button>
                </div>
              </div>
            </div>

            <section className="mb-6">
              <div className="mb-3 text-[17px] font-extrabold">Explorer par thème</div>
              <div className="flex flex-wrap gap-2">
                {LEARN_THEMES.map((t) => (
                  <Button
                    key={t.id}
                    type="button"
                    variant={theme === t.id ? "default" : "secondary"}
                    size="sm"
                    className="rounded-full font-bold"
                    onClick={() => setTheme(theme === t.id ? null : t.id)}
                  >
                    <MethodIcon name={t.icon} className="mr-1.5 h-3.5 w-3.5" /> {t.label}
                  </Button>
                ))}
              </div>
              {theme && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-primary/10 px-3.5 py-2.5 text-[13.5px]">
                  <span>Contenu filtré sur <strong className="text-primary">{THEME_LABEL[theme]}</strong></span>
                  <button type="button" onClick={() => setTheme(null)} className="inline-flex items-center gap-1 font-bold text-primary">
                    <X className="h-3.5 w-3.5" /> Retirer le filtre
                  </button>
                </div>
              )}
            </section>

            <section className="mb-7">
              <SectionHead
                title={theme ? `Parcours · ${THEME_LABEL[theme]}` : "Parcours recommandés"}
                action="Voir tous les parcours"
                onAction={() => go("parcours-catalog")}
              />
              {parcoursList.length === 0 ? (
                <EmptyState icon="Bolt" title="Aucun parcours sur ce thème" action="Voir les méthodes" onAction={() => go("method-library")} />
              ) : (
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                  {parcoursList.slice(0, 4).map((p) => (
                    <ParcoursCard key={p.id} p={p} done={progress[p.id]} onOpen={(id) => go("parcours", id)} onQuick={openParcoursQuick} />
                  ))}
                </div>
              )}
            </section>

            <section className="mb-7">
              <SectionHead
                title={theme ? `Méthodes · ${THEME_LABEL[theme]}` : "Méthodes populaires"}
                action="Voir toutes les méthodes"
                onAction={() => go("method-library")}
              />
              {methodsList.length === 0 ? (
                <EmptyState icon="Bulb" title="Aucune méthode sur ce thème" action="Toutes les méthodes" onAction={() => go("method-library")} />
              ) : (
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                  {methodsList.map((m) => (
                    <MethodCard key={m.id} m={m} saved={saved.includes(m.id)} onOpen={(id) => go("method", id)} onToggleSave={toggleSave} />
                  ))}
                </div>
              )}
            </section>

            <KitsPromo go={go} />

            <section>
              <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white text-xs font-bold">▶</span>
                  <div className="text-[17px] font-extrabold">Sur YouTube</div>
                </div>
                <a href="https://www.youtube.com/results?search_query=facilitation+atelier" target="_blank" rel="noopener noreferrer" className="text-[13px] font-bold text-primary">
                  Explorer plus <ArrowRight className="inline h-3.5 w-3.5" />
                </a>
              </div>

              <div className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">Chaînes à suivre</div>
              <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {LEARN_CHANNELS.map((ch, i) => (
                  <a key={i} href={ch.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors hover:border-primary/40">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ background: ch.c }}>{ch.init}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-extrabold">{ch.name}</div>
                      <div className="text-xs text-muted-foreground">{ch.desc}</div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">Vidéos à regarder</div>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleVideos.map((v, i) => (
                  <button key={i} type="button" onClick={() => playVideo(v)} className="overflow-hidden rounded-2xl border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                    <div className="relative aspect-video bg-muted">
                      <Image src={`https://i.ytimg.com/vi/${v.vid}/hqdefault.jpg`} alt={v.title} fill className="object-cover" unoptimized />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                          <Play className="h-5 w-5 fill-white" />
                        </span>
                      </span>
                      {v.dur && <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11.5px] font-bold text-white">{v.dur}</span>}
                    </div>
                    <div className="p-3.5">
                      <div className="mb-1 line-clamp-2 text-sm font-extrabold leading-snug">{v.title}</div>
                      <div className="text-xs font-semibold text-muted-foreground">{v.channel}</div>
                    </div>
                  </button>
                ))}
              </div>
              {!moreVideos && LEARN_VIDEOS.length > 3 && (
                <div className="mt-4 text-center">
                  <Button variant="secondary" className="rounded-xl" onClick={() => setMoreVideos(true)}>Charger plus de vidéos</Button>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {!railOpen ? (
        <div className="hidden w-14 shrink-0 xl:block">
          <button
            type="button"
            onClick={() => setRailOpen(true)}
            title="Déplier le panneau Accès rapide"
            aria-label="Ouvrir Accès rapide"
            className="sticky top-4 flex w-full flex-col items-center gap-2.5 rounded-2xl border-2 border-foreground bg-foreground px-2 py-4 text-background shadow-lg transition-all hover:-translate-x-0.5 hover:bg-foreground/90 hover:shadow-xl"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="text-xs font-extrabold tracking-wide [writing-mode:vertical-rl]">Accès rapide</span>
          </button>
        </div>
      ) : (
        <aside className="hidden w-[280px] shrink-0 flex-col gap-4 xl:flex">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setRailOpen(false)}>Replier <ChevronLeft className="ml-1 h-3.5 w-3.5 rotate-180" /></Button>
          </div>

          <button type="button" onClick={() => go("kits-catalog")} className={cn("rounded-2xl p-4 text-left text-white", CHAT_AI_GRADIENT)}>
            <div className="mb-2 flex items-center gap-2 font-extrabold"><Package className="h-4 w-4" /> Boutique</div>
            <p className="mb-2 text-xs leading-relaxed text-white/75">16 kits d&apos;activité prêts à animer.</p>
            <span className="text-xs font-bold">Explorer les kits <ArrowRight className="inline h-3 w-3" /></span>
          </button>

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 font-extrabold">Accès rapide</div>
            {RESOURCE_CATS.map((c, i) => (
              <button key={c.id} type="button" onClick={() => go("resource-library", c.id)} className={cn("flex w-full items-center gap-2.5 py-2 text-left", i < RESOURCE_CATS.length - 1 && "border-b")}>
                <RailItemThumb src={getResourceCatIllustration(c.id)} alt={c.title} size={42} />
                <div>
                  <div className="text-[13px] font-bold">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.desc}</div>
                </div>
              </button>
            ))}
            <button type="button" onClick={() => go("resource-library")} className="mt-2 text-[13px] font-bold text-primary">
              Voir toutes les ressources <ArrowRight className="inline h-3 w-3" />
            </button>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 font-extrabold">Reprendre votre progression</div>
            {resumeList.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                Aucun parcours commencé.{" "}
                <button type="button" onClick={() => go("parcours-catalog")} className="font-bold text-primary">En découvrir un</button>.
              </p>
            ) : (
              resumeList.map((p, i) => {
                const d = progress[p.id] || [];
                const completed = d.filter(Boolean).length;
                const pct = Math.round((completed / p.modules.length) * 100);
                const cur = d.findIndex((x) => !x);
                const sub = pct === 100 ? "Terminé" : completed === 0 ? "Non commencé" : `Module ${cur + 1} sur ${p.modules.length}`;
                return (
                  <button key={p.id} type="button" onClick={() => go("parcours", p.id)} className={cn("flex w-full items-center gap-2.5 py-2 text-left", i < resumeList.length - 1 && "border-b")}>
                    <RailItemThumb src={getParcoursIllustration(p.id, p.theme)} alt={p.title} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold">{p.title}</div>
                      <div className="text-[11.5px] text-muted-foreground">{sub}</div>
                      <div className="mt-1"><LearnProgress pct={pct} color={palColor(p.color).fg} /></div>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{pct}%</span>
                  </button>
                );
              })
            )}
            <button type="button" onClick={() => go("progression")} className="mt-2 text-[13px] font-bold text-primary">
              Voir toute ma progression <ArrowRight className="inline h-3 w-3" />
            </button>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 font-extrabold">Nouveautés</div>
            {LEARN_NEWS.map((n, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if ("method" in n && n.method) go("method", n.method);
                  else {
                    const found = ALL_RESOURCES.find((r) => r.title === n.res);
                    openResource(found ?? {
                      title: n.res ?? n.text,
                      type: "Guide",
                      meta: "",
                      icon: n.icon,
                      color: n.color,
                      theme: "facilitation",
                      cat: "guides",
                      catTitle: "Guides pratiques",
                    });
                  }
                }}
                className={cn("flex w-full items-start gap-2.5 py-2 text-left", i < LEARN_NEWS.length - 1 && "border-b")}
              >
                <RailItemThumb src={getLearnNewsIllustration(n)} alt={n.text} size={38} />
                <span className="text-[13px] font-semibold leading-snug">{n.text}</span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
