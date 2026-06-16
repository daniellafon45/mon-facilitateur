"use client";

import { ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WizardFooterProps {
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  hint?: string;
  continueDisabled?: boolean;
  loading?: boolean;
  secondaryAction?: { label: string; onClick: () => void };
}

export function WizardFooter({
  onBack,
  onContinue,
  continueLabel = "Continuer",
  hint,
  continueDisabled,
  loading,
  secondaryAction,
}: WizardFooterProps) {
  return (
    <footer className="flex shrink-0 items-center justify-between gap-3 border-t bg-background px-4 py-3 sm:px-8">
      <Button type="button" variant="ghost" size="sm" className="gap-1 rounded-xl" onClick={onBack}>
        <ChevronLeft className="h-4 w-4" />
        Retour
      </Button>
      {hint ? (
        <p className="hidden flex-1 truncate text-center text-sm text-muted-foreground sm:block">{hint}</p>
      ) : (
        <div className="flex-1" />
      )}
      <div className="flex items-center gap-2">
        {secondaryAction && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="hidden rounded-xl sm:inline-flex"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          className={cn("gap-1.5 rounded-xl px-4", (continueDisabled || loading) && "opacity-60")}
          onClick={onContinue}
          disabled={continueDisabled || loading}
          data-testid="wizard-next"
        >
          {loading ? "Chargement…" : continueLabel}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </footer>
  );
}
