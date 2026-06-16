"use client";

import Image from "next/image";
import { Clock, FileText, Heart, Info, Star } from "lucide-react";
import type { LearnMethod, LearnParcours } from "@/lib/learn/data";
import { getLearnMethodIllustration, getParcoursIllustration } from "@/lib/learn/parcours-images";
import { LearnProgress, LevelBadge, palColor } from "@/components/apprendre/learn-shared";
import { cn } from "@/lib/utils";

export function ParcoursCard({
  p,
  done,
  onOpen,
  onQuick,
}: {
  p: LearnParcours;
  done?: boolean[];
  onOpen: (id: string) => void;
  onQuick: (id: string) => void;
}) {
  const completed = (done || []).filter(Boolean).length;
  const pct = done?.length ? Math.round((completed / done.length) * 100) : 0;
  const started = completed > 0;
  const pal = palColor(p.color);
  const cover = getParcoursIllustration(p.id, p.theme);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(p.id)}
      onKeyDown={(e) => e.key === "Enter" && onOpen(p.id)}
      className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative h-28 w-full overflow-hidden">
        <Image
          src={cover}
          alt={p.title}
          fill
          sizes="(max-width: 640px) 100vw, 280px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onQuick(p.id); }}
          aria-label="Aperçu"
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-muted-foreground shadow-sm hover:text-foreground"
        >
          <Info className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="mb-1.5"><LevelBadge level={p.level} /></div>
        <div className="mb-1.5 text-[14.5px] font-extrabold leading-tight">{p.title}</div>
        <p className="mb-3 flex-1 text-xs leading-snug text-muted-foreground">{p.desc}</p>
        {started ? (
          <div>
            <div className="mb-1 flex justify-between text-[11.5px] font-semibold text-muted-foreground">
              <span>{completed}/{done!.length} modules</span>
              <span className="font-bold text-primary">{pct}%</span>
            </div>
            <LearnProgress pct={pct} color={pal.fg} />
          </div>
        ) : (
          <div className="flex gap-3 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> {p.modules.length} modules</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {p.dur}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MethodCard({
  m,
  saved,
  onOpen,
  onToggleSave,
}: {
  m: LearnMethod;
  saved: boolean;
  onOpen: (id: string) => void;
  onToggleSave: (id: string) => void;
}) {
  const pal = palColor(m.color);
  const cover = getLearnMethodIllustration(m.id, m.theme);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(m.id)}
      onKeyDown={(e) => e.key === "Enter" && onOpen(m.id)}
      className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative h-24 w-full overflow-hidden">
        <Image
          src={cover}
          alt={m.title}
          fill
          sizes="(max-width: 640px) 100vw, 280px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleSave(m.id); }}
          className={cn(
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 shadow-sm transition-colors",
            saved ? "text-red-500" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="text-[14.5px] font-extrabold">{m.title}</div>
        <p className="mb-2.5 mt-1 flex-1 text-xs leading-snug text-muted-foreground">{m.pitch}</p>
        <div>
          <span className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-[11.5px] font-bold" style={{ background: pal.bg, color: pal.fg }}>
            {m.cat}
          </span>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {m.rating}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <Clock className="h-3 w-3" /> {m.dur}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
