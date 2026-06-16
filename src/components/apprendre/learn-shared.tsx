"use client";

import Image from "next/image";
import { useEffect } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ExternalLink,
  Info,
  Search,
  X,
} from "lucide-react";
import { LEVEL_BG, LEVEL_COLOR, LEARN_PAL } from "@/lib/learn/data";
import { MethodIcon, MethodIconTile } from "@/components/modeles/method-icon";
import { Button } from "@/components/ui/button";
import { MotionOverlay } from "@/components/ui/motion-overlay";
import { cn } from "@/lib/utils";

export function LevelBadge({ level }: { level?: string }) {
  if (!level) return null;
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-bold whitespace-nowrap"
      style={{ color: LEVEL_COLOR[level] ?? "#64748b", background: LEVEL_BG[level] ?? "#f1f5f9" }}
    >
      {level}
    </span>
  );
}

export function LearnProgress({ pct, color }: { pct: number; color?: string }) {
  const c = pct >= 100 ? "#059669" : pct === 0 ? "#94a3b8" : (color ?? "hsl(var(--primary))");
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: c }}
      />
    </div>
  );
}

export function RailItemThumb({
  src,
  alt,
  size = 40,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border border-border/60 shadow-sm"
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" />
    </div>
  );
}

export function SectionHead({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-3.5 flex items-center justify-between">
      <div className="text-[17px] font-extrabold">{title}</div>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1 text-[13px] font-bold text-primary"
        >
          {action} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export function BackBtn({ onClick, label = "Retour" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3.5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-muted-foreground transition-colors hover:text-primary"
    >
      <ChevronLeft className="h-4 w-4" /> {label}
    </button>
  );
}

export function EmptyState({
  icon = "Search",
  title,
  sub,
  action,
  onAction,
}: {
  icon?: string;
  title: string;
  sub?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center">
      <MethodIconTile icon={icon} color="slate" size={56} />
      <div className="mt-3.5 text-base font-extrabold">{title}</div>
      {sub && <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">{sub}</p>}
      {action && onAction && (
        <Button className="mt-4 rounded-xl" onClick={onAction}>{action}</Button>
      )}
    </div>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "secondary"}
      size="sm"
      className="rounded-full font-bold"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function LoadingGrid({ cols = 4, count = 4 }: { cols?: number; count?: number }) {
  return (
    <div
      className="grid gap-3.5"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-2xl border bg-muted/40" />
      ))}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-red-200 px-6 py-12 text-center">
      <MethodIconTile icon="Info" color="amber" size={52} />
      <div className="mt-3.5 text-base font-extrabold">Impossible de charger ce contenu</div>
      <p className="mt-1.5 text-[13.5px] text-muted-foreground">Vérifiez votre connexion, puis réessayez.</p>
      <Button className="mt-4 rounded-xl" onClick={onRetry}>Réessayer</Button>
    </div>
  );
}

export function LearnDrawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <MotionOverlay
      open={open}
      onClose={onClose}
      variant="drawer-right"
      zIndex={1400}
      className="bg-foreground/40"
      panelClassName="w-[420px] bg-card shadow-2xl"
    >
      <div className="flex shrink-0 items-center justify-between border-b px-5 py-4">
        <div className="text-base font-extrabold">{title}</div>
        <button type="button" onClick={onClose} className="rounded-lg bg-muted p-2 text-muted-foreground hover:bg-muted/80">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
      {footer && <div className="shrink-0 border-t px-5 py-3.5">{footer}</div>}
    </MotionOverlay>
  );
}

export interface LearnVideo {
  vid: string;
  title: string;
  channel: string;
  dur?: string;
}

export function VideoModal({ video, onClose }: { video: LearnVideo | null; onClose: () => void }) {
  useEffect(() => {
    if (!video) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [video, onClose]);

  const src = video
    ? `https://www.youtube-nocookie.com/embed/${video.vid}?autoplay=1&rel=0&modestbranding=1`
    : "";

  return (
    <MotionOverlay
      open={Boolean(video)}
      onClose={onClose}
      variant="center"
      zIndex={1500}
      className="bg-black/80"
      panelClassName="max-w-4xl overflow-hidden rounded-2xl bg-[#0b0f17] shadow-2xl"
    >
      {video && (
        <>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-600 text-white text-xs font-bold">▶</span>
              <div className="truncate text-sm font-bold text-white">{video.title}</div>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg bg-white/10 p-2 text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative aspect-video bg-black">
            <iframe
              src={src}
              title={video.title}
              allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="text-xs font-semibold text-white/60">{video.channel}</div>
            <a
              href={`https://www.youtube.com/watch?v=${video.vid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-white/85 hover:underline"
            >
              Ouvrir sur YouTube <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </>
      )}
    </MotionOverlay>
  );
}

export function parcoursGrad(color: string) {
  const grads: Record<string, string> = {
    amber: "from-amber-50 to-amber-100",
    green: "from-emerald-50 to-emerald-100",
    violet: "from-violet-50 to-violet-100",
    blue: "from-blue-50 to-blue-100",
  };
  return grads[color] ?? grads.blue;
}

export function palColor(color: string) {
  return LEARN_PAL[color] ?? LEARN_PAL.blue;
}

export { MethodIconTile };
