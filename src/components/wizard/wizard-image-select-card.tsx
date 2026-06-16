"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface WizardImageSelectCardProps {
  imageSrc: string;
  imageFallbackSrc?: string;
  title: string;
  tag: string;
  metaLabel?: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  testId?: string;
}

export function WizardImageSelectCard({
  imageSrc,
  imageFallbackSrc,
  title,
  tag,
  metaLabel = "Univers",
  description,
  selected = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  testId,
}: WizardImageSelectCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [src, setSrc] = React.useState(imageSrc);

  React.useEffect(() => {
    setSrc(imageSrc);
  }, [imageSrc]);

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
      onHoverStart={() => {
        setIsHovered(true);
        onMouseEnter?.();
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        onMouseLeave?.();
      }}
      whileHover={selected ? undefined : { y: -3 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      className="h-full w-full min-w-0"
    >
      <Card
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        data-testid={testId}
        data-selected={selected ? "true" : "false"}
        onClick={onClick}
        onFocus={() => onFocus?.()}
        onBlur={() => onBlur?.()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        className={cn(
          "relative h-full cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200",
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

        <div className="relative h-28 w-full sm:h-32">
          <img
            src={src}
            alt=""
            className={cn(
              "h-full w-full object-cover transition-opacity duration-200",
              selected && "opacity-90",
            )}
            loading="lazy"
            onError={() => {
              if (imageFallbackSrc && src !== imageFallbackSrc) {
                setSrc(imageFallbackSrc);
                return;
              }
              setSrc(
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e2e8f0' width='400' height='300'/%3E%3C/svg%3E",
              );
            }}
          />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t to-transparent",
              selected ? "from-primary/45" : "from-black/40",
            )}
          />
          {selected && (
            <Badge className="absolute left-3 top-3 border-0 bg-primary text-[10px] font-bold text-primary-foreground hover:bg-primary">
              Sélectionné
            </Badge>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <span>{tag}</span>
              <span aria-hidden>•</span>
              <span>{metaLabel}</span>
            </div>
            <h3
              className={cn(
                "mt-1 line-clamp-2 text-sm font-semibold leading-snug sm:text-base",
                selected ? "text-primary" : "text-card-foreground",
              )}
            >
              {title}
            </h3>
          </div>

          {description && (
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
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
