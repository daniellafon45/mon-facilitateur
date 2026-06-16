"use client";

import type { MouseEvent } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { FileEdit, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clearWizardDraft,
  resumeWizardDraft,
  useWizardDraftInfo,
} from "@/lib/wizard/use-wizard-draft";

interface WizardDraftBlockProps {
  router: AppRouterInstance;
  expanded?: boolean;
  className?: string;
  onDeleted?: () => void;
}

export function WizardDraftBlock({
  router,
  expanded = true,
  className,
  onDeleted,
}: WizardDraftBlockProps) {
  const { draftHydrated, hasDraft, stepInfo } = useWizardDraftInfo();

  if (!draftHydrated || !hasDraft || !stepInfo) return null;

  const handleDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    await clearWizardDraft();
    onDeleted?.();
  };

  if (!expanded) {
    return (
      <button
        type="button"
        title={`${stepInfo.label} · Étape ${stepInfo.stepNum}/${stepInfo.stepTotal}`}
        onClick={() => resumeWizardDraft(router)}
        className={cn(
          "mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-primary/40 bg-primary/5 text-primary transition-colors hover:bg-primary/10",
          className,
        )}
      >
        <FileEdit className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => resumeWizardDraft(router)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          resumeWizardDraft(router);
        }
      }}
      className={cn(
        "mb-3 cursor-pointer rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 transition-colors hover:bg-primary/10",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <FileEdit className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">Création en cours</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {stepInfo.label} · Étape {stepInfo.stepNum}/{stepInfo.stepTotal}
          </p>
        </div>
        <button
          type="button"
          title="Supprimer le brouillon"
          onClick={handleDelete}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-background hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function WizardDraftHomeCard({
  router,
  className,
}: {
  router: AppRouterInstance;
  className?: string;
}) {
  const { draftHydrated, hasDraft, stepInfo } = useWizardDraftInfo();

  if (!draftHydrated || !hasDraft || !stepInfo) return null;

  return (
    <div
      className={cn(
        "rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6 group cursor-pointer hover:shadow-lg transition-shadow md:col-span-2",
        className,
      )}
      onClick={() => resumeWizardDraft(router)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          resumeWizardDraft(router);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <FileEdit className="h-8 w-8 text-primary mb-2" />
          <h3 className="text-lg font-semibold">Reprendre le brouillon</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {stepInfo.label} · Étape {stepInfo.stepNum}/{stepInfo.stepTotal}
          </p>
        </div>
        <button
          type="button"
          title="Supprimer le brouillon"
          onClick={async (e) => {
            e.stopPropagation();
            await clearWizardDraft();
          }}
          className="rounded-xl p-2 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-destructive group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-4">
        Continuer →
      </span>
    </div>
  );
}
