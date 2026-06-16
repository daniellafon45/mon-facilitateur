"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WizardHeader } from "@/components/wizard/wizard-header";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import type { SessionMode } from "@/types/facilitation";

interface WizardShellProps {
  steps: string[];
  current: number;
  mode: SessionMode | null;
  ptype: string | null;
  onBack: () => void;
  onStepClick?: (index: number) => void;
  rightCollapsed?: boolean;
  onToggleRight?: () => void;
  hasRightPanel?: boolean;
  rightPanel?: ReactNode;
  footerHint?: string;
  continueLabel?: string;
  onContinue: () => void;
  continueDisabled?: boolean;
  loading?: boolean;
  secondaryAction?: { label: string; onClick: () => void };
  children: ReactNode;
  fullBleed?: boolean;
}

export function WizardShell({
  steps,
  current,
  mode,
  ptype,
  onBack,
  onStepClick,
  rightCollapsed,
  onToggleRight,
  hasRightPanel,
  rightPanel,
  footerHint,
  continueLabel,
  onContinue,
  continueDisabled,
  loading,
  secondaryAction,
  children,
  fullBleed,
}: WizardShellProps) {
  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden" data-testid="wizard-page">
      <WizardHeader
        steps={steps}
        current={current}
        mode={mode}
        ptype={ptype}
        onBack={onBack}
        onStepClick={onStepClick}
        rightCollapsed={rightCollapsed}
        onToggleRight={hasRightPanel ? onToggleRight : undefined}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main
          className={cn(
            "min-w-0 flex-1 overflow-y-auto",
            fullBleed ? "bg-slate-50" : "bg-background px-8 py-6",
          )}
        >
          {children}
        </main>
        {hasRightPanel && !rightCollapsed && rightPanel && (
          <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-l bg-background p-4 lg:block">
            {rightPanel}
          </aside>
        )}
      </div>
      <WizardFooter
        onBack={onBack}
        onContinue={onContinue}
        continueLabel={continueLabel}
        hint={footerHint}
        continueDisabled={continueDisabled}
        loading={loading}
        secondaryAction={secondaryAction}
      />
    </div>
  );
}
