"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScrollReelTestimonial {
  quote: string;
  author: string;
  image: string;
  alt?: string;
}

export interface ScrollReelTestimonialsProps {
  testimonials: ScrollReelTestimonial[];
  charStaggerMs?: number;
  className?: string;
}

const CELL = 121.33;
const GAP = 8;
const STEP = 3 * (CELL + GAP);

const EXIT_MS = 240;
const SLIDE_MS = 800;

const EASE_INOUT = "cubic-bezier(0.65,0,0.35,1)";

const CELL_PALETTE = [
  "from-teal-300/70 to-cyan-200/90",
  "from-amber-300/70 to-orange-200/90",
  "from-violet-300/70 to-purple-200/90",
  "from-rose-300/70 to-pink-200/90",
  "from-sky-300/70 to-blue-200/90",
  "from-emerald-300/70 to-green-200/90",
] as const;

const ACCENT_PALETTE = [
  { quote: "text-teal-900", author: "text-teal-700", icon: "text-teal-500", btn: "border-teal-300/80 bg-teal-50/80 text-teal-800 hover:bg-teal-100" },
  { quote: "text-amber-950", author: "text-amber-800", icon: "text-amber-500", btn: "border-amber-300/80 bg-amber-50/80 text-amber-900 hover:bg-amber-100" },
  { quote: "text-violet-950", author: "text-violet-700", icon: "text-violet-500", btn: "border-violet-300/80 bg-violet-50/80 text-violet-900 hover:bg-violet-100" },
] as const;

const FEATURED_SHADOW =
  "0 1.008px 0.705px -0.563px rgba(13,148,136,0.15), 0 4.357px 3.05px -1.688px rgba(13,148,136,0.12), 0 11.698px 8.188px -2.813px rgba(13,148,136,0.1), 0 32.972px 23.08px -3.938px rgba(13,148,136,0.06)";

function Cell({ index }: { index: number }) {
  const gradient = CELL_PALETTE[index % CELL_PALETTE.length];
  return (
    <div
      aria-hidden="true"
      className={cn(
        "shrink-0 rounded-xl border border-white/60 bg-gradient-to-br shadow-[0_2px_8px_rgba(13,148,136,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]",
        gradient,
      )}
      style={{ width: CELL, height: CELL }}
    />
  );
}

function Featured({ src, alt, accentIndex }: { src: string; alt?: string; accentIndex: number }) {
  const ringColors = ["ring-teal-400/40", "ring-amber-400/40", "ring-violet-400/40"] as const;
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl ring-2",
        ringColors[accentIndex % ringColors.length],
      )}
      style={{ width: CELL, height: CELL, boxShadow: FEATURED_SHADOW }}
    >
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/25 via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] opacity-60 mix-blend-soft-light"
        style={{
          background:
            accentIndex % 3 === 0
              ? "linear-gradient(135deg, rgba(45,212,191,0.35) 0%, rgba(56,189,248,0.2) 100%)"
              : accentIndex % 3 === 1
                ? "linear-gradient(135deg, rgba(251,191,36,0.35) 0%, rgba(251,146,60,0.2) 100%)"
                : "linear-gradient(135deg, rgba(167,139,250,0.35) 0%, rgba(192,132,252,0.2) 100%)",
        }}
      />
    </div>
  );
}

function Chars({
  text,
  startIndex,
  staggerMs,
  exiting,
}: {
  text: string;
  startIndex: number;
  staggerMs: number;
  exiting: boolean;
}) {
  let idx = startIndex;
  const words = text.split(" ");
  return (
    <>
      {words.map((word, wi) => {
        const wordSpan = (
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((ch, ci) => {
              const delay = idx * staggerMs;
              idx++;
              return (
                <span
                  key={ci}
                  className={exiting ? undefined : "scroll-reel-char"}
                  style={exiting ? undefined : { animationDelay: `${delay}ms` }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        );
        if (wi < words.length - 1) idx++;
        return (
          <React.Fragment key={wi}>
            {wordSpan}
            {wi < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

export function ScrollReelTestimonials({
  testimonials,
  charStaggerMs = 6,
  className,
}: ScrollReelTestimonialsProps) {
  const [index, setIndex] = React.useState(0);
  const [displayIndex, setDisplayIndex] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const animating = React.useRef(false);
  const timeouts = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const count = testimonials.length;

  React.useEffect(() => {
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setMounted(true)),
    );
    return () => {
      cancelAnimationFrame(raf);
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  const paginate = React.useCallback(
    (dir: 1 | -1) => {
      if (animating.current) return;
      const next = index + dir;
      if (next < 0 || next >= count) return;
      animating.current = true;

      setIndex(next);
      setExiting(true);

      timeouts.current.push(
        setTimeout(() => {
          setDisplayIndex(next);
          setExiting(false);
        }, EXIT_MS),
      );
      timeouts.current.push(
        setTimeout(() => {
          animating.current = false;
        }, SLIDE_MS),
      );
    },
    [index, count],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      paginate(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      paginate(-1);
    }
  };

  const middleItems = React.useMemo(() => {
    const items: Array<{ type: "cell"; cellIndex: number } | { type: "featured"; i: number }> = [];
    let cellIndex = 0;
    for (let i = 0; i < 3; i++) items.push({ type: "cell", cellIndex: cellIndex++ });
    testimonials.forEach((_, i) => {
      items.push({ type: "featured", i });
      if (i < count - 1) {
        items.push({ type: "cell", cellIndex: cellIndex++ }, { type: "cell", cellIndex: cellIndex++ });
      }
    });
    for (let i = 0; i < 3; i++) items.push({ type: "cell", cellIndex: cellIndex++ });
    return items;
  }, [testimonials, count]);

  const sideCellCount = 4 + 2 * count;
  const centerIdx = (count - 1) / 2;
  const middleY = (centerIdx - index) * STEP;
  const sideY = -middleY;

  const colStyle = (y: number): React.CSSProperties => ({
    transform: `translateY(${y}px)`,
    transition: mounted ? `transform ${SLIDE_MS}ms ${EASE_INOUT}` : "none",
  });

  const current = testimonials[displayIndex];
  const accent = ACCENT_PALETTE[displayIndex % ACCENT_PALETTE.length];

  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Témoignages"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "relative flex w-full min-w-0 flex-col items-stretch gap-2.5 overflow-hidden rounded-3xl border border-teal-200/50 bg-gradient-to-br from-teal-50/90 via-white to-amber-50/70 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 md:min-h-[320px] md:flex-row",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="relative h-56 w-full min-w-0 shrink-0 self-stretch overflow-hidden md:h-auto md:w-[min(100%,380px)] md:max-w-[380px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-2 overflow-hidden">
          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(sideY)}
          >
            {Array.from({ length: sideCellCount }).map((_, i) => (
              <Cell key={i} index={i} />
            ))}
          </div>

          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(middleY)}
          >
            {middleItems.map((item, i) =>
              item.type === "featured" ? (
                <Featured
                  key={i}
                  src={testimonials[item.i].image}
                  alt={testimonials[item.i].alt}
                  accentIndex={item.i}
                />
              ) : (
                <Cell key={i} index={item.cellIndex} />
              ),
            )}
          </div>

          <div
            className="flex shrink-0 flex-col gap-2 will-change-transform motion-reduce:[transition:none!important]"
            style={colStyle(sideY)}
          >
            {Array.from({ length: sideCellCount }).map((_, i) => (
              <Cell key={i} index={i + sideCellCount} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch px-5 py-7 md:px-8 md:py-10">
        <div className="flex min-w-0 flex-col gap-[9px]">
          <svg
            className={cn("block h-12 w-12", accent.icon)}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M4.58 17.32C3.55 16.23 3 15 3 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18zm10 0C13.55 16.23 13 15 13 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18z" />
          </svg>

          <div className="relative min-w-0 w-full overflow-hidden" aria-live="polite">
            <div aria-hidden="true" className="invisible flex min-h-[140px] flex-col gap-[19px]">
              <p className={cn("m-0 text-lg font-medium leading-[1.3] tracking-[-0.02em] sm:text-[22px]", accent.quote)}>
                {current.quote}
              </p>
              <p className={cn("m-0 text-sm font-medium leading-[1.3]", accent.author)}>{current.author}</p>
            </div>
            <div
              key={displayIndex}
              className={cn(
                "absolute inset-x-0 top-0 flex flex-col gap-[19px] will-change-[transform,opacity]",
                exiting && "scroll-reel-exit",
              )}
            >
              <p className={cn("m-0 text-lg font-medium leading-[1.3] tracking-[-0.02em] sm:text-[22px]", accent.quote)}>
                <Chars
                  text={current.quote}
                  startIndex={0}
                  staggerMs={charStaggerMs}
                  exiting={exiting}
                />
              </p>
              <p className={cn("m-0 text-sm font-medium leading-[1.3]", accent.author)}>
                <Chars
                  text={current.author}
                  startIndex={current.quote.length + 6}
                  staggerMs={charStaggerMs}
                  exiting={exiting}
                />
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-1.5 md:mt-0">
          <button
            type="button"
            onClick={() => paginate(-1)}
            disabled={index === 0}
            aria-label="Citation précédente"
            className={cn(
              "grid h-7 w-7 cursor-pointer place-items-center rounded-full border p-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:enabled:scale-[1.08] active:enabled:scale-[0.94] disabled:cursor-default disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50",
              accent.btn,
            )}
          >
            <svg
              className="h-3 w-3 opacity-80"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7.5 2.5 3.5 6l4 3.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            disabled={index === count - 1}
            aria-label="Citation suivante"
            className={cn(
              "grid h-7 w-7 cursor-pointer place-items-center rounded-full border p-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:enabled:scale-[1.08] active:enabled:scale-[0.94] disabled:cursor-default disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50",
              accent.btn,
            )}
          >
            <svg
              className="h-3 w-3 opacity-80"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m4.5 2.5 4 3.5-4 3.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScrollReelTestimonials;
