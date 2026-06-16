"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  User,
  Users,
  Globe,
  Lightbulb,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Cards } from "@/components/ui/cards";
import { Badge } from "@/components/ui/badge";
import { SessionPromptChat } from "@/components/ui/session-prompt-chat";

const LEFT_METHODS = ["SCAMPER", "Brainwriting", "Rétrospective", "Ishikawa"];

const RIGHT_METHODS = ["OpenAI", "SWOT", "Six chapeaux", "RACI"];

const CATEGORIES = [
  { label: "Sessions solo", icon: User, variant: "solo" as const },
  { label: "Rencontres d'équipe", icon: Users, variant: "team" as const },
  { label: "Grands ateliers", icon: Globe, variant: "workshop" as const },
  { label: "Ateliers d'idéation", icon: Lightbulb, variant: "ideation" as const },
];

function HeroBadges({ setPrompt }: { setPrompt: (v: string) => void }) {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-7">
      {CATEGORIES.map((cat) => (
        <Badge
          key={cat.label}
          variant={cat.variant}
          size="lg"
          role="button"
          tabIndex={0}
          className="cursor-pointer"
          onClick={() => setPrompt(`Je veux organiser : ${cat.label.toLowerCase()}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setPrompt(`Je veux organiser : ${cat.label.toLowerCase()}`);
            }
          }}
        >
          <cat.icon strokeWidth={2} />
          {cat.label}
        </Badge>
      ))}
    </div>
  );
}

const LABEL_COUNT = 4;
const ROW_H = 40;
const VIEWPORT_H = ROW_H * LABEL_COUNT;
const CENTER_ROW = (LABEL_COUNT - 1) / 2;
const SCROLL_INTERVAL_MS = 2600;

/** Courbe convexe selon la position visible dans la fenêtre (0 → 3). */
function convexOffsetForSlot(slot: number, side: "left" | "right"): number {
  const slotFromCenter = slot - CENTER_ROW;
  const dist = Math.abs(slotFromCenter);
  const inv = Math.max(0, CENTER_ROW - dist);
  const push = 10 * inv + 6 * inv * inv;
  return side === "left" ? -push : push;
}

function InfiniteSideLabels({
  items,
  side,
  position,
  instant,
}: {
  items: string[];
  side: "left" | "right";
  position: number;
  instant: boolean;
}) {
  const isLeft = side === "left";
  const extended = [...items, ...items, ...items];

  return (
    <div
      className="pointer-events-none hidden w-[176px] shrink-0 overflow-hidden lg:block"
      style={{ height: VIEWPORT_H }}
      aria-hidden
    >
      <motion.div
        animate={{ y: CENTER_ROW * ROW_H - position * ROW_H }}
        transition={
          instant
            ? { duration: 0 }
            : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
        }
        className="will-change-transform"
      >
        {extended.map((name, i) => {
          const slot = i - position + CENTER_ROW;
          const isActive = i === position;

          return (
            <div key={`${name}-${i}`} className="relative" style={{ height: ROW_H }}>
              <span
                className={`absolute top-1/2 h-px -translate-y-1/2 border-t border-dotted border-muted-foreground/30 ${
                  isLeft ? "right-0" : "left-0"
                } ${isActive ? "w-5 xl:w-6" : "w-3"}`}
              />
              <motion.span
                animate={{ x: convexOffsetForSlot(slot, side) }}
                transition={
                  instant
                    ? { duration: 0 }
                    : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
                }
                className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[13px] ${
                  isLeft ? "right-7 text-right" : "left-7 text-left"
                } ${
                  isActive
                    ? "font-semibold text-foreground/85"
                    : "font-normal text-muted-foreground/50"
                }`}
              >
                {name}
              </motion.span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

function HeroChatBlock({
  prompt,
  setPrompt,
  onCreate,
  submitLabel,
}: {
  prompt: string;
  setPrompt: (v: string) => void;
  onCreate: () => void;
  submitLabel: string;
}) {
  const reduced = useReducedMotion();
  const n = LABEL_COUNT;
  const [position, setPosition] = useState(n);
  const [instant, setInstant] = useState(false);
  const positionRef = useRef(n);

  useEffect(() => {
    if (reduced) return;

    const timer = setInterval(() => {
      const next = positionRef.current + 1;

      if (next >= n * 2) {
        setInstant(true);
        positionRef.current = n;
        setPosition(n);
        return;
      }

      setInstant(false);
      positionRef.current = next;
      setPosition(next);
    }, SCROLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [reduced, n]);

  useEffect(() => {
    if (!instant) return;
    const frame = requestAnimationFrame(() => setInstant(false));
    return () => cancelAnimationFrame(frame);
  }, [instant, position]);

  const scrollPosition = reduced ? n + 1 : position;

  return (
    <>
      <div className="mx-auto hidden w-full max-w-[1064px] items-center justify-items-center lg:grid lg:grid-cols-[176px_minmax(0,672px)_176px] lg:gap-x-10 xl:max-w-[1080px] xl:gap-x-14">
        <InfiniteSideLabels
          items={LEFT_METHODS}
          side="left"
          position={scrollPosition}
          instant={instant}
        />
        <div className="w-full min-w-0">
          <SessionPromptChat
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={onCreate}
            submitLabel={submitLabel}
          />
          <HeroBadges setPrompt={setPrompt} />
        </div>
        <InfiniteSideLabels
          items={RIGHT_METHODS}
          side="right"
          position={scrollPosition}
          instant={instant}
        />
      </div>

      <div className="mx-auto max-w-2xl lg:hidden">
        <SessionPromptChat
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmit={onCreate}
          submitLabel={submitLabel}
        />
        <HeroBadges setPrompt={setPrompt} />
      </div>
    </>
  );
}

export function HeroSection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    } catch {
      setLoggedIn(false);
    }
  }, []);

  function handleCreate() {
    const text = prompt.trim();
    if (text) sessionStorage.setItem("mf-hero-prompt", text);
    router.push(loggedIn ? "/dashboard" : "/signup");
  }

  const submitLabel = loggedIn ? "Lancer une session" : "Créer ma session gratuite";

  return (
    <section id="hero" className="relative overflow-x-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          <div className="mb-10 inline-flex max-w-lg items-center gap-2 rounded-full border border-border/80 bg-background px-4 py-2 text-[12px] leading-snug text-muted-foreground">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" aria-hidden />
            Mon facilitateur · Accélérez l&apos;innovation collective
          </div>

          <h1 className="max-w-xl text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-[2.35rem] sm:text-5xl lg:text-[3.1rem]">
            Facilitez des sessions
            <br />
            prêtes à l&apos;échelle.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-[17px] sm:leading-[1.65]">
            Mon facilitateur aide les équipes à créer des réunions courtes et productives,
            sans improvisation ni prototypes fragiles.
          </p>
        </motion.div>

        {/* Zone chat — 4 labels de chaque côté, alignés sur les mêmes lignes */}
        <motion.div
          className="relative mx-auto mt-12 w-full sm:mt-14"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroChatBlock
            prompt={prompt}
            setPrompt={setPrompt}
            onCreate={handleCreate}
            submitLabel={submitLabel}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
          className="relative mx-auto mt-10 w-full overflow-x-hidden py-4 sm:mt-12"
        >
          <Cards />
        </motion.div>
      </div>
    </section>
  );
}
