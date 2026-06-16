"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MethodDef } from "@/lib/methods/catalog";
import type { MethodRecommendationInsight } from "@/lib/methods/method-recommendation";
import { getMethodIllustration } from "@/lib/methods/method-images";

interface WizardMethodCardProps {
  method: MethodDef;
  categoryLabel: string;
  insight: MethodRecommendationInsight;
  selected: boolean;
  onToggle: () => void;
  featured?: boolean;
  durationLabel?: string;
}

export function WizardMethodCard({
  method,
  categoryLabel,
  insight,
  selected,
  onToggle,
  featured = false,
  durationLabel,
}: WizardMethodCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(() => getMethodIllustration(method.id, method.cats[0]));
  const fallbackSrc = getMethodIllustration(method.id, method.cats[0]);

  React.useEffect(() => {
    setImgSrc(getMethodIllustration(method.id, method.cats[0]));
  }, [method.id, method.cats]);

  const detailVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: "0.75rem",
      transition: { duration: 0.3, ease: "easeInOut" as const },
    },
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={selected ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="h-full w-full min-w-0"
    >
      <Card
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        data-testid={`method-${method.id}`}
        data-selected={selected ? "true" : "false"}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          "relative h-full cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200",
          featured && !selected && "border-primary/30 ring-2 ring-primary/10",
          selected
            ? "border-primary bg-primary/[0.07] ring-4 ring-primary/20"
            : "border-border/80 bg-card shadow-sm hover:border-primary/35 hover:shadow-md",
        )}
      >
        {selected && (
          <div
            className="absolute right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
            aria-hidden
          >
            <Check className="h-4 w-4 stroke-[2.5]" />
          </div>
        )}

        <div className={cn("relative w-full", featured ? "h-36 sm:h-40" : "h-28 sm:h-32")}>
          <img
            src={imgSrc}
            alt=""
            className={cn(
              "h-full w-full object-cover transition-opacity duration-200",
              selected && "opacity-90",
            )}
            loading="lazy"
            onError={() => {
              if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
            }}
          />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t to-transparent",
              selected ? "from-primary/45" : "from-black/40",
            )}
          />
          {insight.recommended && !selected && (
            <Badge
              className={cn(
                "absolute left-3 top-3 border-0 text-[10px] font-bold",
                insight.level === "main"
                  ? "bg-emerald-500 text-white hover:bg-emerald-500"
                  : "bg-white/90 text-foreground hover:bg-white/90",
              )}
            >
              {insight.level === "main" ? "Recommandé" : "Complément"}
            </Badge>
          )}
          {selected && (
            <Badge className="absolute left-3 top-3 border-0 bg-primary text-[10px] font-bold text-primary-foreground hover:bg-primary">
              Sélectionné
            </Badge>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span>{categoryLabel}</span>
              <span aria-hidden>•</span>
              <span>{method.est} min</span>
            </div>
            <h3
              className={cn(
                "mt-1 line-clamp-2 font-semibold leading-snug",
                featured ? "text-base sm:text-lg" : "text-sm sm:text-base",
                selected ? "text-primary" : "text-card-foreground",
              )}
            >
              {method.title}
            </h3>
            {featured && (
              <p className="mt-1 text-sm font-semibold text-primary">{method.tagline}</p>
            )}
          </div>

          {featured ? (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">{method.why || method.tagline}</p>
              {durationLabel && (
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  Durée indicative · {durationLabel}
                </p>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  key="details"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={detailVariants}
                  className="overflow-hidden"
                >
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      insight.recommended ? "text-emerald-600" : "text-muted-foreground",
                    )}
                  >
                    {insight.headline}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {insight.justification}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
