"use client";

import type { ReactNode } from "react";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WizardFooterProps {
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  hint?: string;
  slot?: ReactNode;
  continueDisabled?: boolean;
  loading?: boolean;
  secondaryAction?: { label: string; onClick: () => void };
}

export function WizardFooter({
  onBack,
  onContinue,
  continueLabel = "Continuer",
  hint,
  slot,
  continueDisabled,
  loading,
  secondaryAction,
}: WizardFooterProps) {
  const centerContent = slot ?? (hint ? (
    <p className="truncate text-sm text-muted-foreground">{hint}</p>
  ) : null);

  const continueButton = (
    <Button
      type="button"
      size="sm"
      className={cn("group shrink-0 gap-1.5 rounded-xl px-4", (continueDisabled || loading) && "opacity-60")}
      onClick={onContinue}
      disabled={continueDisabled || loading}
      data-testid="wizard-next"
    >
      {loading ? continueLabel ?? "Chargement…" : continueLabel}
      {!loading && <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />}
    </Button>
  );

  return (
    <footer className="shrink-0 border-t bg-background pb-safe">
      {/* Mobile */}
      <div className="flex flex-col gap-2 px-4 py-3 sm:hidden">
        <div className="flex min-h-[2.5rem] items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" className="shrink-0 gap-1 rounded-xl" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Button>
          <div className="flex shrink-0 items-center gap-2">
            {secondaryAction && (
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
            {continueButton}
          </div>
        </div>
        {centerContent && <div className="min-w-0">{centerContent}</div>}
      </div>

      {/* Desktop */}
      <div className="hidden min-h-[3.25rem] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-8 py-3 sm:grid">
        <Button type="button" variant="ghost" size="sm" className="gap-1 rounded-xl" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
          Retour
        </Button>
        <div className="min-w-0">{centerContent}</div>
        <div className="flex shrink-0 items-center gap-2">
          {secondaryAction && (
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {continueButton}
        </div>
      </div>
    </footer>
  );
}
