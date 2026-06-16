"use client";

import { useMemo, useState } from "react";
import { Check, CheckCircle2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  adjustDurationOptions,
  fmtMin,
  GENRE_BY_ID,
  GENRE_PAL,
  GENRE_PAL_BG,
  presentGenreThemes,
  visibleGenreBands,
  type SessionGenre,
} from "@/lib/methods/session-genres";
import { MethodIcon } from "@/components/modeles/method-icon";
import type { SessionMode } from "@/types/facilitation";
import { WizardRecoModal } from "@/components/wizard/wizard-reco-modal";
import { WizardAmarisButton } from "@/components/wizard/wizard-amaris-button";

const MODE_META: Record<SessionMode, { label: string; icon: typeof User; color: string; hex: string }> = {
  solo: { label: "Solo", icon: User, color: "violet", hex: "#7c3aed" },
  equipe: { label: "Équipe", icon: Users, color: "blue", hex: "#2563eb" },
  atelier: { label: "Grand atelier", icon: Users, color: "green", hex: "#059669" },
};

function genreGridClass(count: number) {
  if (count === 1) return "grid max-w-md gap-3";
  if (count === 2) return "grid max-w-2xl gap-3 sm:grid-cols-2";
  return "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";
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
  const [recoOpen, setRecoOpen] = useState(false);

  const bands = useMemo(() => visibleGenreBands(mode, theme), [mode, theme]);
  const themeTabs = useMemo(() => presentGenreThemes(mode), [mode]);
  const selGenre = genre ? GENRE_BY_ID[genre] : null;

  const modeGenres = useMemo(
    () => Object.values(GENRE_BY_ID).filter((g) => g.mode === mode),
    [mode],
  );

  return (
    <div className="mx-auto max-w-[980px] space-y-6">
      <WizardRecoModal
        open={recoOpen}
        title="Genre de séance"
        options={modeGenres.map((g) => ({ id: g.id, title: g.title, desc: `${g.dur} · ${g.desc}` }))}
        onAccept={(id) => {
          const g = GENRE_BY_ID[id];
          if (g) onSelect(g);
        }}
        onClose={() => setRecoOpen(false)}
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Quel genre de séance préparez-vous ?
          </h1>
          <WizardAmarisButton onClick={() => setRecoOpen(true)} />
        </div>
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
              {band.genres.map((g) => {
                const on = genre === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onSelect(g)}
                    onMouseEnter={() => onPreviewChange?.(g.id)}
                    onMouseLeave={() => onPreviewChange?.(null)}
                    onFocus={() => onPreviewChange?.(g.id)}
                    onBlur={() => onPreviewChange?.(null)}
                    className={cn(
                      "relative rounded-xl border bg-background p-4 text-left transition-all",
                      on ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/30",
                    )}
                  >
                    {on && (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <div
                      className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ background: GENRE_PAL_BG[g.color], color: GENRE_PAL[g.color] }}
                    >
                      <MethodIcon name={g.icon} className="h-4 w-4" />
                    </div>
                    <p className="pr-6 text-sm font-extrabold">{g.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{g.dur}</p>
                  </button>
                );
              })}
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
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: GENRE_PAL_BG[genre.color], color: GENRE_PAL[genre.color] }}
      >
        <MethodIcon name={genre.icon} className="h-5 w-5" />
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
