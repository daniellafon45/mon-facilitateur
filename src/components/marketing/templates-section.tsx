"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Layers,
  PenLine,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImagesBadge } from "@/components/ui/images-badge";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { cn } from "@/lib/utils";

const FLOATING_PROMPTS = [
  {
    text: "Préparer une rétrospective d'équipe en 45 minutes avec actions concrètes et synthèse.",
    className:
      "top-[6%] left-[2%] max-w-[220px] rotate-[-5deg] bg-emerald-700 text-white lg:left-[6%] lg:max-w-[260px]",
    blur: false,
    delay: 0,
  },
  {
    text: "Lancer un atelier SWOT avec plan de facilitation, timers et votes intégrés.",
    className:
      "bottom-[18%] left-[0%] max-w-[240px] rotate-[-3deg] bg-blue-600 text-white lg:left-[4%] lg:max-w-[280px]",
    blur: false,
    delay: 0.1,
  },
  {
    text: "Faciliter un brainwriting à distance avec 12 participants et restitution automatique.",
    className:
      "bottom-[8%] left-[22%] hidden max-w-[260px] rotate-[1deg] bg-zinc-800 text-white md:block lg:left-[26%]",
    blur: true,
    delay: 0.15,
  },
  {
    text: "Créer une session solo pour cadrer un projet avant de réunir l'équipe.",
    className:
      "top-[12%] right-[2%] max-w-[220px] rotate-[4deg] border border-border/60 bg-background text-foreground shadow-md lg:right-[6%] lg:max-w-[250px]",
    blur: false,
    delay: 0.05,
    meta: "15 juin 2026 · 09:42",
  },
  {
    text: "Animer un grand atelier Six chapeaux avec synthèse et export des livrables.",
    className:
      "bottom-[22%] right-[0%] max-w-[230px] rotate-[3deg] bg-amber-800 text-white lg:right-[4%] lg:max-w-[270px]",
    blur: false,
    delay: 0.2,
  },
  {
    text: "Générer une matrice RACI et un plan de décision en une seule séance.",
    className:
      "top-[38%] right-[8%] hidden max-w-[240px] rotate-[-2deg] border border-border/60 bg-background text-foreground shadow-md xl:block",
    blur: true,
    delay: 0.25,
    meta: "15 juin 2026 · 10:15",
  },
];

const FEATURE_BADGES = [
  { label: "Génération IA", icon: Sparkles },
  { label: "Méthodes éprouvées", icon: Layers },
  { label: "Plan ajustable", icon: PenLine },
  { label: "Cohérence d'équipe", icon: Users },
];

function FloatingPrompt({
  text,
  className,
  blur,
  delay,
  meta,
}: (typeof FLOATING_PROMPTS)[number]) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "pointer-events-none absolute z-[1] hidden rounded-xl px-4 py-3 text-left text-[11px] leading-snug shadow-lg sm:text-xs sm:leading-relaxed lg:block",
        blur && "scale-[0.97] opacity-75 blur-[1px]",
        className,
      )}
    >
      {meta ? (
        <p className="mb-1.5 text-[10px] text-muted-foreground">{meta}</p>
      ) : null}
      {text}
    </motion.div>
  );
}

export function TemplatesSection() {
  return (
    <section id="modeles" className="relative overflow-x-hidden py-16 sm:py-20 lg:py-28">
      <div className="relative mx-auto max-w-6xl px-4 sm:min-h-[420px] lg:min-h-[640px] lg:px-8">
        {FLOATING_PROMPTS.map((prompt) => (
          <FloatingPrompt key={prompt.text} {...prompt} />
        ))}

        <RevealOnScroll className="relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center" y={22}>
          <Badge
            variant="outline"
            className="mb-6 gap-1.5 border-violet-200 bg-violet-50 px-3 py-1 text-violet-700"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
            Faciliter
          </Badge>

          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
            Concevez vos sessions
            <br />
            <span className="text-muted-foreground">avec le langage naturel.</span>
          </h2>

          <p className="mt-3 text-base text-muted-foreground sm:text-lg md:text-xl">
            Ne limitez plus votre pratique — choisissez la méthode qui convient.
          </p>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Votre outil ne doit pas devenir votre limite. Partez de rétrospectives,
            SWOT, brainwriting ou Six chapeaux sans repartir de zéro. Ajustez le plan
            quand la situation le demande. Chaque rencontre gagne en clarté, en rythme
            et en décisions concrètes.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {FEATURE_BADGES.map(({ label, icon: Icon }) => (
              <Badge
                key={label}
                variant="outline"
                className="gap-1.5 border-border/80 bg-muted/40 px-3 py-1.5 text-foreground"
              >
                <Icon className="size-3.5" strokeWidth={2} />
                {label}
              </Badge>
            ))}
          </div>

          <div className="mt-6 flex h-52 w-full items-center justify-center sm:h-56">
            <ImagesBadge
              text="Galerie de modèles"
              images={[
                "https://assets.aceternity.com/pro/agenforce-1.webp",
                "https://assets.aceternity.com/pro/agenforce-2.webp",
                "https://assets.aceternity.com/pro/agenforce-3.webp",
              ]}
              folderSize={{ width: 52, height: 38 }}
              teaserImageSize={{ width: 34, height: 24 }}
              hoverImageSize={{ width: 80, height: 54 }}
              hoverTranslateY={-52}
              hoverSpread={50}
              hoverRotation={22}
              textClassName="text-lg font-semibold sm:text-xl"
              className="gap-3"
            />
          </div>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Découvrir toutes les possibilités IA
            <ArrowRight className="size-4" />
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  );
}
