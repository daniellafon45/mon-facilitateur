"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bolt,
  Calendar,
  ChevronDown,
  ChevronLeft,
  Clock,
  Download,
  Expand,
  Eye,
  FileText,
  Grid3X3,
  Link2,
  List,
  MessageSquare,
  Pencil,
  SlidersHorizontal,
  Sparkles,
  StopCircle,
  Target,
  Users,
  Vote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  FACILITATOR_TIPS,
  PERSONAL_TOOLS,
  PROJECT_TOOLS,
  QUICK_TOOLS,
  SESSION_RAIL_ITEMS,
  type SessionRailId,
} from "@/lib/session/session-rail-config";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RAIL_ICONS: Record<string, LucideIcon> = {
  Pencil,
  Grid: Grid3X3,
  Calendar,
  Users,
  MessageSquare,
  FileText,
  List,
  Clock,
  Vote,
};

interface SessionRightHubProps {
  methodIds: string[];
  activeMethodId: string;
  onSelectMethod: (id: string) => void;
  onOpenQuickTool: (id: string) => void;
  onPreviewFullscreen?: () => void;
  previewFullscreen?: boolean;
}

export function SessionRightHub({
  methodIds,
  activeMethodId,
  onSelectMethod,
  onOpenQuickTool,
  onPreviewFullscreen,
  previewFullscreen,
}: SessionRightHubProps) {
  const [derouleOpen, setDerouleOpen] = useState(true);
  const [persoOpen, setPersoOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [sessSecs, setSessSecs] = useState(60 * 60);
  const [sessUp, setSessUp] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setSessSecs((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, []);

  const activeMeta = METHOD_BY_ID[activeMethodId];
  const elapsed = 60 * 60 - sessSecs;
  const shown = sessUp ? elapsed : sessSecs;
  const fmt = (s: number) =>
    `${String(Math.floor(Math.abs(s) / 60)).padStart(2, "0")}:${String(Math.abs(s) % 60).padStart(2, "0")}`;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-3 text-sm">
      <div>
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
          Méthode en cours
        </p>
        <p className="font-serif text-base font-extrabold italic text-primary">
          {activeMeta?.title ?? activeMethodId}
        </p>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
          Minuteur
        </p>
        <button
          type="button"
          onClick={() => setSessUp((u) => !u)}
          className="flex w-full items-center gap-3 rounded-xl border bg-muted/30 px-3 py-2 text-left"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-primary/30 text-sm font-extrabold tabular-nums">
            {fmt(shown)}
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {sessUp ? "Temps écoulé" : "Temps restant"}
          </span>
        </button>
      </div>

      <button
        type="button"
        className="flex w-full items-center gap-2"
        onClick={() => setDerouleOpen((o) => !o)}
      >
        <span className="flex-1 text-left text-sm font-extrabold">Déroulé de la séance</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", !derouleOpen && "-rotate-90")} />
      </button>

      {derouleOpen && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {methodIds.length} outil{methodIds.length > 1 ? "s" : ""} sélectionné
            {methodIds.length > 1 ? "s" : ""}
          </p>
          {methodIds.map((id, idx) => {
            const meta = METHOD_BY_ID[id];
            const on = id === activeMethodId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectMethod(id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors",
                  on && "border-primary bg-primary/5",
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-bold">
                  {meta?.title ?? id}
                </span>
              </button>
            );
          })}
          {onPreviewFullscreen && (
            <Button
              type="button"
              variant={previewFullscreen ? "default" : "secondary"}
              size="sm"
              className="mt-2 w-full rounded-xl"
              onClick={onPreviewFullscreen}
            >
              <Eye className="mr-1 h-4 w-4" />
              {previewFullscreen ? "Quitter l'aperçu" : "Aperçu complet"}
            </Button>
          )}
        </div>
      )}

      <div className="border-t pt-3">
        <button
          type="button"
          className="mb-2 flex w-full items-center gap-2 text-xs font-extrabold"
          onClick={() => setPersoOpen((o) => !o)}
        >
          <span className="flex-1 text-left">Outils externes</span>
          <ChevronDown className={cn("h-3.5 w-3.5", !persoOpen && "-rotate-90")} />
        </button>
        {persoOpen && (
          <div className="space-y-1">
            {PERSONAL_TOOLS.map((t) => (
              <a
                key={t.id}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-bold hover:bg-muted/50"
              >
                <span className="flex-1">{t.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-extrabold">Outils rapides</p>
        <div className="grid grid-cols-2 gap-1.5">
          {QUICK_TOOLS.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => onOpenQuickTool(q.id)}
              className="flex flex-col items-start gap-1 rounded-xl border px-2.5 py-2 text-left text-[11px] font-bold hover:border-primary hover:bg-primary/5"
            >
              <QuickIcon id={q.id} />
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-extrabold">Outils du projet</p>
        <div className="grid grid-cols-2 gap-1.5">
          {PROJECT_TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="rounded-xl border px-2.5 py-2 text-left text-[11px] font-bold text-muted-foreground hover:border-primary"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-3">
        <button
          type="button"
          className="mb-2 flex w-full items-center gap-2 text-xs font-extrabold"
          onClick={() => setTipsOpen((o) => !o)}
        >
          <span className="flex-1 text-left">Assistance</span>
          <ChevronDown className={cn("h-3.5 w-3.5", !tipsOpen && "-rotate-90")} />
        </button>
        {tipsOpen &&
          FACILITATOR_TIPS.map((t, i) => (
            <div key={i} className="mb-2 flex gap-2 text-xs">
              <Sparkles className="h-4 w-4 shrink-0" style={{ color: t.color }} />
              <div>
                <p className="font-bold">{t.title}</p>
                <p className="text-muted-foreground">{t.desc}</p>
              </div>
            </div>
          ))}
      </div>

      <div>
        <button
          type="button"
          className="mb-2 flex w-full items-center gap-2 text-xs font-extrabold"
          onClick={() => setDocsOpen((o) => !o)}
        >
          <span className="flex-1 text-left">Documents liés</span>
          <ChevronDown className={cn("h-3.5 w-3.5", !docsOpen && "-rotate-90")} />
        </button>
        {docsOpen &&
          ["Étude de besoins.pdf", "Benchmark.xlsx"].map((d) => (
            <div key={d} className="mb-1 flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-semibold">
              <FileText className="h-3.5 w-3.5" />
              {d}
            </div>
          ))}
      </div>
    </div>
  );
}

function QuickIcon({ id }: { id: string }) {
  const cls = "h-4 w-4 text-primary";
  if (id === "vote") return <Vote className={cls} />;
  if (id === "desaccord") return <Bolt className={cls} />;
  if (id === "reflexion") return <Sparkles className={cls} />;
  if (id === "probleme") return <Target className={cls} />;
  if (id === "minuteur") return <Clock className={cls} />;
  if (id === "parking") return <StopCircle className={cls} />;
  return <Sparkles className={cls} />;
}

export { SESSION_RAIL_ITEMS, RAIL_ICONS };
export type { SessionRailId };
