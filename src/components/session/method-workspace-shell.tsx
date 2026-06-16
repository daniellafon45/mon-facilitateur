"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Expand,
  Grid3X3,
  Minimize2,
  Pause,
  Play,
  Printer,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { DEFAULT_LIB_MEMBERS } from "@/lib/methods/tool-constants";
import type { BmcDesignMode, BmcThemeId } from "@/lib/methods/bmc-blocks";
import { BMC_THEMES } from "@/lib/methods/bmc-blocks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WorkspaceMeta {
  title: string;
  icon?: ReactNode;
  colorClass?: string;
}

interface MethodWorkspaceShellProps {
  meta: WorkspaceMeta;
  stats?: ReactNode;
  exportName?: string;
  getExportText?: () => string;
  designMode?: BmcDesignMode;
  onDesignModeChange?: (mode: BmcDesignMode) => void;
  themeId?: BmcThemeId;
  onThemeChange?: (theme: BmcThemeId) => void;
  embedded?: boolean;
  children: ReactNode;
}

function fmtTimer(secs: number) {
  const m = Math.floor(Math.abs(secs) / 60);
  const s = Math.abs(secs) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function TimerRing({
  secs,
  total,
  color = "#2563eb",
}: {
  secs: number;
  total: number;
  color?: string;
}) {
  const pct = total > 0 ? Math.max(0, Math.min(1, secs / total)) : 0;
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="shrink-0">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
      <text
        x="22"
        y="24"
        textAnchor="middle"
        className="fill-slate-800 text-[10px] font-extrabold"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {fmtTimer(secs)}
      </text>
    </svg>
  );
}

export function MethodWorkspaceShell({
  meta,
  stats,
  exportName = "methode",
  getExportText,
  designMode = "couleur",
  onDesignModeChange,
  themeId = "classic",
  onThemeChange,
  embedded = false,
  children,
}: MethodWorkspaceShellProps) {
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState(60 * 60);
  const [durOpen, setDurOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareMembers, setShareMembers] = useState<string[]>(
    () => DEFAULT_LIB_MEMBERS.map((m) => m.id),
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [toast, setToast] = useState("");
  const tRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tRef.current = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => {
      if (tRef.current) clearInterval(tRef.current);
    };
  }, [running]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreen) setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2800);
  }

  function doExport(mode: "file" | "copy" | "print") {
    const text = getExportText?.() ?? "";
    if (mode === "copy") {
      void navigator.clipboard?.writeText(text);
      showToast("Copié dans le presse-papiers");
    } else if (mode === "print") {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(
          `<pre style="font-family:ui-monospace,monospace;font-size:13px;white-space:pre-wrap;padding:24px">${text.replace(/</g, "&lt;")}</pre>`,
        );
        w.document.close();
        w.print();
      }
      showToast("Ouverture du panneau d'impression…");
    } else {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${exportName}.txt`;
      a.click();
      showToast("Export téléchargé");
    }
    setExportOpen(false);
  }

  const designFilter =
    designMode === "pastel"
      ? "saturate(0.62)"
      : designMode === "neutre"
        ? "saturate(0)"
        : "none";

  const inner = (
    <div
      className={cn(
        "flex flex-col",
        fullscreen && "fixed inset-0 z-[900] overflow-y-auto bg-background p-5 sm:p-6",
      )}
    >
      {!embedded && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card px-4 py-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700",
                meta.colorClass,
              )}
            >
              {meta.icon ?? <Grid3X3 className="h-6 w-6" />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                Méthode choisie
              </p>
              <p className="truncate text-lg font-extrabold tracking-tight">{meta.title}</p>
              {stats && (
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  {stats}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border bg-muted/30 px-2 py-1">
              <TimerRing secs={secs} total={duration} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setRunning((r) => !r)}
                title={running ? "Pause" : "Démarrer"}
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setSecs(0);
                  setRunning(false);
                }}
                title="Réinitialiser"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDurOpen((o) => !o)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {durOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDurOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 min-w-[168px] rounded-xl border bg-popover p-1 shadow-lg">
                      <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        Durée de l&apos;étape
                      </p>
                      {[15, 30, 45, 60, 90, 120].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-semibold hover:bg-muted",
                            duration === m * 60 && "bg-primary/10 text-primary",
                          )}
                          onClick={() => {
                            setDuration(m * 60);
                            setDurOpen(false);
                          }}
                        >
                          <span className="flex-1">{m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60}` : ""}`}</span>
                          {duration === m * 60 && <Check className="h-3.5 w-3.5" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="relative">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setDesignOpen((o) => !o);
                  setExportOpen(false);
                  setMenuOpen(false);
                }}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Design
                <ChevronDown className="h-3 w-3" />
              </Button>
              {designOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDesignOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border bg-popover p-1 shadow-lg">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">Saturation</p>
                    {(
                      [
                        ["couleur", "Couleurs vives"],
                        ["pastel", "Pastel"],
                        ["neutre", "Neutre"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold hover:bg-muted",
                          designMode === id && "bg-primary/10 text-primary",
                        )}
                        onClick={() => {
                          onDesignModeChange?.(id);
                          setDesignOpen(false);
                        }}
                      >
                        <span className="flex-1 text-left">{label}</span>
                        {designMode === id && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                    {onThemeChange && (
                      <>
                        <div className="my-1 h-px bg-border" />
                        <p className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">Thème</p>
                        {BMC_THEMES.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            className={cn(
                              "flex w-full flex-col rounded-lg px-2.5 py-2 text-left hover:bg-muted",
                              themeId === t.id && "bg-primary/10 text-primary",
                            )}
                            onClick={() => {
                              onThemeChange(t.id);
                              setDesignOpen(false);
                            }}
                          >
                            <span className="text-sm font-bold">{t.label}</span>
                            <span className="text-xs text-muted-foreground">{t.desc}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setExportOpen((o) => !o);
                  setDesignOpen(false);
                }}
              >
                <Download className="h-4 w-4" />
                Exporter
                <ChevronDown className="h-3 w-3" />
              </Button>
              {exportOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border bg-popover p-1 shadow-lg">
                    {(
                      [
                        ["file", "Fichier .txt", Download],
                        ["copy", "Copier", Copy],
                        ["print", "Imprimer / PDF", Printer],
                      ] as const
                    ).map(([mode, label, Icon]) => (
                      <button
                        key={mode}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold hover:bg-muted"
                        onClick={() => doExport(mode)}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {label}
                      </button>
                    ))}
                    <div className="my-1 h-px bg-border" />
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold hover:bg-muted"
                      onClick={() => {
                        setExportOpen(false);
                        setShareOpen(true);
                      }}
                    >
                      <Download className="h-4 w-4 text-muted-foreground" />
                      Envoyer par courriel
                    </button>
                  </div>
                </>
              )}
              {shareOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShareOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border bg-popover p-3 shadow-lg">
                    <p className="mb-2 text-sm font-extrabold">Envoyer le BMC</p>
                    <p className="mb-2 text-[10px] font-bold uppercase text-muted-foreground">Destinataires</p>
                    {DEFAULT_LIB_MEMBERS.map((m) => (
                      <label key={m.id} className="mb-1 flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={shareMembers.includes(m.id)}
                          onChange={() =>
                            setShareMembers((ids) =>
                              ids.includes(m.id)
                                ? ids.filter((x) => x !== m.id)
                                : [...ids, m.id],
                            )
                          }
                        />
                        {m.you ? "Vous" : m.name}
                      </label>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      className="mt-3 w-full rounded-xl"
                      onClick={() => {
                        showToast(
                          `BMC envoyé à ${shareMembers.length} personne${shareMembers.length > 1 ? "s" : ""}`,
                        );
                        setShareOpen(false);
                      }}
                    >
                      Envoyer à {shareMembers.length} pers.
                    </Button>
                  </div>
                </>
              )}
            </div>

            <Button
              type="button"
              variant={fullscreen ? "default" : "secondary"}
              size="sm"
              className="gap-1.5"
              onClick={() => setFullscreen((f) => !f)}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              {fullscreen ? "Quitter" : "Plein écran"}
            </Button>

            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border bg-popover p-1 shadow-lg">
                    <button
                      type="button"
                      className="flex w-full rounded-lg px-2.5 py-2 text-sm font-semibold hover:bg-muted"
                      onClick={() => {
                        setFullscreen(true);
                        setMenuOpen(false);
                      }}
                    >
                      Plein écran
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ filter: designFilter, transition: "filter .2s" }} className="flex-1">
        {children}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[1000] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
          <Check className="h-4 w-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );

  return inner;
}
