"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  adjustDurationOptions,
  fmtMin,
  GENRE_BY_ID,
  GENRE_PAL_BG,
  presentGenreThemes,
  visibleGenreBands,
  type SessionGenre,
} from "@/lib/methods/session-genres";
import type { SessionMode } from "@/types/facilitation";
import { WizardImageSelectCard } from "@/components/wizard/wizard-image-select-card";
import { getWizardIllustration, getWizardIllustrationFallback } from "@/lib/wizard/wizard-images";

const MODE_META: Record<SessionMode, { label: string; icon: typeof User; color: string; hex: string }> = {
  solo: { label: "Solo", icon: User, color: "violet", hex: "#7c3aed" },
  equipe: { label: "Équipe", icon: Users, color: "blue", hex: "#2563eb" },
  atelier: { label: "Grand atelier", icon: Users, color: "green", hex: "#059669" },
};

function genreGridClass(count: number) {
  if (count === 1) return "grid max-w-sm gap-4";
  if (count === 2) return "grid max-w-2xl gap-4 sm:grid-cols-2";
  return "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
}

export function WizardGenreStep({
  mode,
  genre,
  genreDur,
  genreMin,
  genreCondensed,
  onSelect,
  onChangeMode,
  onPreviewChange,
}: {
  mode: SessionMode;
  genre: string | null;
  genreDur: string | null;
  genreMin: number;
  genreCondensed: boolean;
  onSelect: (g: SessionGenre) => void;
  onAdjustDuration: (min: number, dur: string, condensed: boolean) => void;
  onChangeMode: () => void;
  onPreviewChange?: (genreId: string | null) => void;
}) {
  const modeMeta = MODE_META[mode];
  const ModeIcon = modeMeta.icon;
  const [theme, setTheme] = useState(() => {
    const cats = new Set(visibleGenreBands(mode, "all").flatMap((b) => b.genres.flatMap((g) => g.cats)));
    return cats.has("start") ? "start" : "all";
  });

  const bands = useMemo(() => visibleGenreBands(mode, theme), [mode, theme]);
  const themeTabs = useMemo(() => presentGenreThemes(mode), [mode]);
  const selGenre = genre ? GENRE_BY_ID[genre] : null;

  return (
    <div className="mx-auto max-w-[980px] space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Quel genre de séance préparez-vous ?
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold"
            style={{
              background: GENRE_PAL_BG[modeMeta.color],
              borderColor: modeMeta.hex,
              color: modeMeta.hex,
            }}
          >
            <ModeIcon className="h-3.5 w-3.5" />
            Mode : {modeMeta.label}
          </span>
          <button type="button" className="text-xs font-bold text-primary hover:underline" onClick={onChangeMode}>
            Changer
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {themeTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                theme === t.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {bands.map((band) => (
          <section key={band.id}>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm font-extrabold" style={{ color: band.color }}>
                {band.label}
              </span>
              <span className="text-xs text-muted-foreground">{band.range}</span>
            </div>
            <div className={genreGridClass(band.genres.length)}>
              {band.genres.map((g) => (
                <WizardImageSelectCard
                  key={g.id}
                  testId={`genre-${g.id}`}
                  imageSrc={getWizardIllustration(g.id)}
                  imageFallbackSrc={getWizardIllustrationFallback(g.id)}
                  title={g.title}
                  tag={band.label}
                  metaLabel={g.dur}
                  description={g.desc}
                  selected={genre === g.id}
                  onClick={() => onSelect(g)}
                  onMouseEnter={() => onPreviewChange?.(g.id)}
                  onMouseLeave={() => onPreviewChange?.(null)}
                  onFocus={() => onPreviewChange?.(g.id)}
                  onBlur={() => onPreviewChange?.(null)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {selGenre && (
        <p className="text-center text-xs font-semibold text-muted-foreground sm:hidden">
          {selGenre.title} · {genreDur ?? selGenre.dur}
        </p>
      )}
    </div>
  );
}

export function GenrePreviewPanel({
  genre,
  genreDur,
  genreMin,
  genreCondensed,
  selected,
  onSelect,
  onAdjustDuration,
}: {
  genre: SessionGenre;
  genreDur: string | null;
  genreMin: number;
  genreCondensed: boolean;
  selected: boolean;
  onSelect: () => void;
  onAdjustDuration: (min: number, dur: string, condensed: boolean) => void;
}) {
  const opts = adjustDurationOptions(genre.idealMin);

  return (
    <div className="space-y-4">
      <div className="relative h-28 w-full overflow-hidden rounded-xl">
        <img
          src={getWizardIllustrationFallback(genre.id) ?? getWizardIllustration(genre.id)}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div>
        <h3 className="font-extrabold">{genre.title}</h3>
        <p className="text-xs text-muted-foreground">{genreDur ?? genre.dur}</p>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{genre.desc}</p>
      {opts.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Ajuster la durée
          </p>
          <div className="flex flex-wrap gap-1.5">
            {opts.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onAdjustDuration(m, fmtMin(m), m < genre.idealMin)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-bold",
                  genreMin === m ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                {m === genre.idealMin ? "Idéale" : fmtMin(m)}
              </button>
            ))}
          </div>
          {genreCondensed && (
            <p className="mt-2 text-xs text-amber-700">Version condensée — l&apos;agenda sera adapté.</p>
          )}
        </div>
      )}
      <ul className="space-y-1.5">
        {genre.use.map((u) => (
          <li key={u} className="flex gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
            {u}
          </li>
        ))}
      </ul>
      {!selected && (
        <Button type="button" size="sm" className="w-full rounded-xl" onClick={onSelect}>
          Sélectionner
        </Button>
      )}
    </div>
  );
}
