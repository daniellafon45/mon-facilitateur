import type { SessionMode, WizardPayload } from "@/types/facilitation";

export const STEP_LABELS: Record<string, string> = {
  "0": "Projet & format",
  genre: "Genre de séance",
  "1": "Tableau blanc",
  method: "Méthode",
  agenda: "Ordre du jour",
  s4: "Ambiance de session",
  e4: "Équipe & rôles",
  e6: "Outils",
  e7: "Lancement",
};

export const STEP_KEYS: Record<string, string> = {
  "0": "project-type",
  genre: "session-genre",
  "1": "whiteboard",
  method: "method",
  agenda: "agenda",
  s4: "solo-config",
  e4: "team",
  e6: "tools",
  e7: "invite",
};

export const WIZARD_COMMON_KEYS = ["0", "genre", "1", "method", "agenda"] as const;

export function getStepPath(mode: SessionMode | null): string[] {
  const common = [...WIZARD_COMMON_KEYS];
  if (!mode) return common;
  if (mode === "solo") return [...common, "s4", "e7"];
  return [...common, "e4", "e7"];
}

export function getStepRoute(stepKey: string): string {
  return `/dashboard/wizard/${STEP_KEYS[stepKey] ?? stepKey}`;
}

/** Indique si le wizard contient une progression à reprendre. */
export function hasWizardProgress(state: {
  mode: SessionMode | null;
  ptype: string | null;
  stepIdx: number;
  genre: string | null;
  objective: string;
  methods: string[];
}): boolean {
  if (!state.mode) return false;
  return (
    state.stepIdx > 0 ||
    Boolean(state.ptype) ||
    Boolean(state.genre) ||
    Boolean(state.objective.trim()) ||
    state.methods.length > 0
  );
}

/** Variante pour un payload brut (Supabase / fusion). */
export function hasWizardDraftPayload(payload: WizardPayload | null | undefined): boolean {
  if (!payload?.mode) return false;
  return hasWizardProgress({
    mode: payload.mode ?? null,
    ptype: payload.ptype ?? null,
    stepIdx: Number(payload.stepIdx ?? 0),
    genre: payload.genre ?? null,
    objective: payload.objective ?? "",
    methods: payload.methods ?? [],
  });
}

export function pickWizardDraftWinner(
  local: WizardPayload,
  remote: WizardPayload,
): WizardPayload | null {
  const localHas = hasWizardDraftPayload(local);
  const remoteHas = hasWizardDraftPayload(remote);
  if (!localHas && !remoteHas) return null;
  if (remoteHas && !localHas) return remote;
  if (localHas && !remoteHas) return local;
  const localStep = Number(local.stepIdx ?? 0);
  const remoteStep = Number(remote.stepIdx ?? 0);
  if (remoteStep > localStep) return remote;
  if (localStep > remoteStep) return local;
  return remote;
}

export function getResumeStepKey(mode: SessionMode | null, stepIdx: number): string {
  const path = getStepPath(mode);
  const idx = Math.min(Math.max(0, stepIdx), path.length - 1);
  return path[idx] ?? "0";
}
