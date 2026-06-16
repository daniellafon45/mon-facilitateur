"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

type Card = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  className: string;
  config: {
    y: number;
    rotate: number;
    zIndex: number;
  };
};

type SpringConfig = {
  type: "spring";
  bounce?: number;
  visualDuration?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
};

export interface CardsProps {
  spring?: SpringConfig;
  activeScale?: number;
  cardSpacing?: number;
}

const defaultSpring: SpringConfig = {
  type: "spring",
  visualDuration: 0.6,
  bounce: 0.25,
};

export const controls = {
  spring: defaultSpring,
  activeScale: [1.15, 1, 1.6, 0.01],
  cardSpacing: [180, 40, 320, 5],
};

function CardCover({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-36 w-full overflow-hidden rounded-xl sm:h-40 lg:h-50">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 220px, 280px"
      />
    </div>
  );
}

const CARDS: Card[] = [
  {
    title: "Sessions solo",
    description:
      "Préparez et facilitez seul une session structurée, avec un plan clair et des activités prêtes à l'emploi.",
    image: "/cards/session-solo.png",
    imageAlt: "Session solo",
    className: "bg-orange-500 [&_h2]:text-white",
    config: { y: -12, rotate: -15, zIndex: 2 },
  },
  {
    title: "Rencontres d'équipe",
    description:
      "Animez des réunions courtes et productives avec des méthodes adaptées à votre contexte d'équipe.",
    image: "/cards/rencontre-equipe.png",
    imageAlt: "Rencontre d'équipe",
    className: "border-stone-300/80 bg-stone-200 [&_h2]:text-black [&_p]:text-black",
    config: { y: 12, rotate: 8, zIndex: 3 },
  },
  {
    title: "Grands ateliers",
    description:
      "Organisez des ateliers à grande échelle avec synchronisation, timers et facilitation assistée.",
    image: "/cards/grands-ateliers.png",
    imageAlt: "Grand atelier",
    className: "bg-blue-500 [&_h2]:text-white",
    config: { y: -28, rotate: -5, zIndex: 4 },
  },
  {
    title: "Ateliers d'idéation",
    description:
      "Lancez des sessions créatives — Brainwriting, SCAMPER, Six chapeaux — en quelques clics.",
    image: "/cards/ideation.png",
    imageAlt: "Atelier d'idéation",
    className: "bg-purple-500 [&_h2]:text-white",
    config: { y: 12, rotate: 12, zIndex: 5 },
  },
  {
    title: "Pilotage & rapports",
    description:
      "Suivez l'avancement, exportez les livrables et capitalisez sur chaque session facilitée.",
    image: "/cards/rapport.png",
    imageAlt: "Pilotage et rapports",
    className: "bg-neutral-900 [&_h2]:text-white",
    config: { y: 12, rotate: -5, zIndex: 6 },
  },
];

function CardBody({
  card,
  expanded,
  spring,
}: {
  card: Card;
  expanded: boolean;
  spring: SpringConfig;
}) {
  return (
    <>
      <CardCover src={card.image} alt={card.imageAlt} />
      <div className="mt-3 sm:mt-5">
        <h2
          className={cn(
            "max-w-full text-left text-sm font-normal sm:text-base lg:max-w-40 lg:text-2xl xl:text-3xl",
            card.className.includes("stone") ? "text-black" : "text-white",
          )}
        >
          {card.title}
        </h2>
        <AnimatePresence mode="popLayout">
          {expanded && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={spring}
              className={cn(
                "mt-2 text-left text-xs sm:text-sm lg:text-base",
                card.className.includes("stone") ? "text-black/70" : "text-white/80",
              )}
            >
              {card.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function MobileCardsCarousel({ spring }: { spring: SpringConfig }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="w-full lg:hidden">
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CARDS.map((card) => {
          const expanded = active === card.title;
          return (
            <button
              key={card.title}
              type="button"
              onClick={() => setActive(expanded ? null : card.title)}
              className={cn(
                "flex w-[min(78vw,220px)] shrink-0 snap-center flex-col items-start justify-between overflow-hidden rounded-2xl border border-white/20 p-3 shadow-lg ring-1 ring-black/10 sm:w-[220px] sm:p-4",
                card.className,
              )}
            >
              <CardBody card={card} expanded={expanded} spring={spring} />
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Glissez pour voir les formats · Touchez pour en savoir plus
      </p>
    </div>
  );
}

function DesktopCardsFan({
  spring,
  activeScale,
  cardSpacing,
}: {
  spring: SpringConfig;
  activeScale: number;
  cardSpacing: number;
}) {
  const [active, setActive] = useState<Card | null>(null);
  const [spacing, setSpacing] = useState(cardSpacing);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setActive(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const middle = (CARDS.length - 1) / 2;
  const isAnyCardActive = Boolean(active?.title);
  const isCurrentActive = (card: Card) => active?.title === card.title;

  return (
    <div className="relative hidden min-h-[360px] w-full items-center justify-center py-10 lg:flex lg:min-h-[480px] lg:py-14">
      <motion.div
        ref={ref}
        onClick={() => setActive(null)}
        className="relative mx-auto flex min-h-[360px] w-full max-w-5xl items-center justify-center [--height:360px] [--width:280px]"
      >
        {CARDS.map((card, index) => {
          const offsetX = (index - middle) * spacing;
          return (
            <motion.div key={card.title}>
              <motion.button
                type="button"
                initial={{ x: 0, scale: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(card);
                }}
                animate={{
                  y: isCurrentActive(card)
                    ? 0
                    : isAnyCardActive
                      ? 400
                      : card.config.y,
                  x: isCurrentActive(card)
                    ? 0
                    : isAnyCardActive
                      ? offsetX * 0.4
                      : offsetX,
                  rotate: isCurrentActive(card)
                    ? 0
                    : isAnyCardActive
                      ? 0.2 * card.config.rotate
                      : card.config.rotate,
                  scale: isCurrentActive(card)
                    ? activeScale
                    : isAnyCardActive
                      ? 0.7
                      : 1,
                }}
                whileHover={{
                  scale: isCurrentActive(card)
                    ? activeScale
                    : isAnyCardActive
                      ? 0.7
                      : 1.05,
                }}
                transition={spring}
                style={{
                  width: "var(--width)",
                  height: "var(--height)",
                  marginLeft: "calc(var(--width) / -2)",
                  marginTop: "calc(var(--height) / -2)",
                  zIndex: isCurrentActive(card) ? 50 : card.config.zIndex,
                }}
                className={cn(
                  "absolute top-1/2 left-1/2 flex cursor-pointer flex-col items-start justify-between overflow-hidden rounded-2xl border border-white/20 p-4 shadow-lg ring-1 ring-black/10",
                  card.className,
                )}
              >
                <CardCover src={card.image} alt={card.imageAlt} />
                <div className="mt-5">
                  <motion.h2
                    layoutId={card.title + "title"}
                    className="max-w-40 text-left text-2xl font-normal xl:text-3xl"
                  >
                    {card.title}
                  </motion.h2>
                  <AnimatePresence mode="popLayout">
                    {active?.title === card.title && (
                      <motion.p
                        layoutId={card.title + "description"}
                        initial={{ opacity: 0, x: 20, y: 20, height: 0 }}
                        animate={{ opacity: 1, x: 0, y: 0, height: 100 }}
                        exit={{ opacity: 0, x: 40, y: 40 }}
                        transition={spring}
                        className={cn(
                          "mt-3 text-left text-sm lg:text-base",
                          card.className.includes("stone")
                            ? "text-black/70"
                            : "text-white/80",
                        )}
                      >
                        {card.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function Cards({
  spring = defaultSpring,
  activeScale = 1.15,
  cardSpacing = 180,
}: CardsProps = {}) {
  return (
    <div className="relative w-full overflow-x-hidden">
      <MobileCardsCarousel spring={spring} />
      <DesktopCardsFan
        spring={spring}
        activeScale={activeScale}
        cardSpacing={cardSpacing}
      />
    </div>
  );
}

export default Cards;
