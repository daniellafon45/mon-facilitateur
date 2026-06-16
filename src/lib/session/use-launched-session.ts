"use client";

import { useMemo } from "react";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { useWizardStore } from "@/lib/store/wizard-store";
import type { SessionMode } from "@/types/facilitation";

const DEFAULT_METHODS: Record<SessionMode, string[]> = {
  solo: ["brainstorm"],
  equipe: ["brainstorming"],
  atelier: ["brainstorming"],
};

export interface LaunchedSession {
  mode: SessionMode;
  methodIds: string[];
  projectId?: string;
  meetingId?: string;
  objective?: string;
  genre?: string | null;
  simulating?: boolean;
  durationMin?: number;
}

/**
 * Résout la séance à afficher : d'abord `activeSession` (lancement wizard),
 * puis repli sur le brouillon wizard (legacy).
 */
export function useLaunchedSession(fallbackMode: SessionMode): LaunchedSession {
  const activeSession = useFacilitationStore((s) => s.activeSession);
  const wizard = useWizardStore();
  const facilitation = useFacilitationStore();

  return useMemo(() => {
    if (activeSession) {
      return {
        mode: activeSession.mode,
        methodIds:
          activeSession.methodIds.length > 0
            ? activeSession.methodIds
            : DEFAULT_METHODS[activeSession.mode],
        projectId: activeSession.projectId ?? undefined,
        meetingId: activeSession.meetingId ?? undefined,
        objective: activeSession.objective,
        genre: activeSession.genre,
        simulating: activeSession.simulating,
        durationMin: activeSession.durationMin,
      };
    }

    const mode = wizard.mode ?? facilitation.wizardMode ?? fallbackMode;
    const methodIds =
      wizard.methods.length > 0
        ? wizard.methods
        : facilitation.wizardMethodIds.length > 0
          ? facilitation.wizardMethodIds
          : wizard.method
            ? [wizard.method]
            : DEFAULT_METHODS[mode];

    return {
      mode,
      methodIds,
      projectId: wizard.projectId ?? undefined,
      objective: wizard.objective || facilitation.wizardObjective || undefined,
      genre: wizard.genre,
    };
  }, [activeSession, wizard, facilitation, fallbackMode]);
}
