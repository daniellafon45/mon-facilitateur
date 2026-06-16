"use client";

import { Check, ChevronLeft, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getProjectUniverse, PAL, wizardTitleFromMode } from "@/lib/wizard/project-types";
import type { SessionMode } from "@/types/facilitation";

interface WizardHeaderProps {
  steps: string[];
  current: number;
  mode: SessionMode | null;
  ptype: string | null;
  onBack: () => void;
  onStepClick?: (index: number) => void;
  rightCollapsed?: boolean;
  onToggleRight?: () => void;
}

export function WizardHeader({
  steps,
  current,
  mode,
  ptype,
  onBack,
  onStepClick,
  rightCollapsed,
  onToggleRight,
}: WizardHeaderProps) {
  const stepTitle = wizardTitleFromMode(mode);
  const ptypeEntry = getProjectUniverse(ptype);

  const ptypeBorder = ptypeEntry ? `${PAL[ptypeEntry.color]}40` : undefined;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur-xl sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Retour"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold tracking-tight sm:text-base">{stepTitle}</div>
          {ptypeEntry ? (
            <Badge variant="outline" className="mt-0.5 hidden rounded-full text-[10px] sm:inline-flex" style={{ borderColor: ptypeBorder }}>
              {ptypeEntry.title}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center gap-1 overflow-x-auto px-1">
        {steps.map((label, i) => {
          const done = i < current;
          const on = i === current;
          const clickable = done && onStepClick;

          return (
            <div key={`${label}-${i}`} className="flex items-center gap-1">
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(i)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-muted",
                  )}
                  aria-label={`Revenir à ${label}`}
                >
                  <span className="flex size-[23px] items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                    <Check className="size-3.5" />
                  </span>
                </button>
              ) : (
                <div
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1",
                    on && "bg-primary/10",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-[23px] items-center justify-center rounded-full text-xs font-bold",
                      done && "bg-emerald-500 text-white",
                      on && !done && "bg-primary text-primary-foreground",
                      !done && !on && "bg-muted text-muted-foreground",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  {on ? (
                    <span className="hidden whitespace-nowrap text-xs font-extrabold text-primary lg:inline">
                      {label}
                    </span>
                  ) : null}
                </div>
              )}
              {i < steps.length - 1 ? (
                <span
                  className={cn(
                    "h-0.5 w-[18px] shrink-0 rounded-full",
                    done ? "bg-emerald-500" : "bg-border",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex w-9 shrink-0 justify-end">
        {onToggleRight ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground"
            onClick={onToggleRight}
            aria-label={rightCollapsed ? "Afficher le panneau latéral" : "Masquer le panneau latéral"}
          >
            {rightCollapsed ? (
              <PanelRightOpen className="size-[18px]" />
            ) : (
              <PanelRightClose className="size-[18px]" />
            )}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
