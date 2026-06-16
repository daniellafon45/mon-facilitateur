"use client";

import { useMemo } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useWizardStore } from "@/lib/store/wizard-store";
import {
  getResumeStepKey,
  getStepPath,
  getStepRoute,
  hasWizardProgress,
} from "@/lib/wizard/steps";

export function useWizardDraftInfo() {
  const draftHydrated = useWizardStore((s) => s.draftHydrated);
  const mode = useWizardStore((s) => s.mode);
  const stepIdx = useWizardStore((s) => s.stepIdx);
  const ptype = useWizardStore((s) => s.ptype);
  const genre = useWizardStore((s) => s.genre);
  const objective = useWizardStore((s) => s.objective);
  const methods = useWizardStore((s) => s.methods);
  const meetingTitle = useWizardStore((s) => s.meetingTitle);

  const hasDraft = useMemo(
    () =>
      draftHydrated &&
      hasWizardProgress({
        mode,
        ptype,
        stepIdx,
        genre,
        objective,
        methods,
      }),
    [draftHydrated, mode, ptype, stepIdx, genre, objective, methods],
  );

  const stepInfo = useMemo(() => {
    if (!hasDraft || !mode) return null;
    const path = getStepPath(mode);
    const idx = Math.min(stepIdx, path.length - 1);
    return {
      stepNum: idx + 1,
      stepTotal: path.length,
      label: meetingTitle || "Création en cours",
    };
  }, [hasDraft, mode, stepIdx, meetingTitle]);

  return { draftHydrated, hasDraft, stepInfo };
}

export function resumeWizardDraft(router: AppRouterInstance) {
  const w = useWizardStore.getState();
  const key = getResumeStepKey(w.mode, w.stepIdx);
  router.push(getStepRoute(key));
}

export async function clearWizardDraft() {
  await useWizardStore.getState().deleteDraft();
}
