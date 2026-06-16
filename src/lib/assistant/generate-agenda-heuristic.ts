import { generateAgendaPlan } from "@/lib/meetings/agenda-generator";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import { agendaImageIdForKind } from "@/lib/wizard/agenda-images";
import type { MeetingAgendaBlock, SessionMode } from "@/types/facilitation";
import type { WizardAgendaResult } from "@/lib/assistant/wizard-agenda-prompt";

const ACTIVITY_HINTS: Record<string, string> = {
  intro: "Poser le cadre, l'objectif et les règles du jeu.",
  focus: "Travail guidé sur le cœur du sujet avec la méthode choisie.",
  pause: "Pause courte pour souffler et revenir frais.",
  synthèse: "Consolider les décisions et définir les prochaines étapes.",
  breakout: "Travail en sous-groupes sur une question précise.",
  plénière: "Mise en commun et alignement collectif.",
};

export interface GenerateAgendaInput {
  mode: SessionMode;
  methodIds: string[];
  objective: string;
  targetMin: number;
  pomodoro?: boolean;
  condensed?: boolean;
  genreTitle?: string;
}

function enrichBlock(b: MeetingAgendaBlock, objective: string): MeetingAgendaBlock {
  const kind = b.kind ?? "focus";
  const hint = ACTIVITY_HINTS[kind] ?? ACTIVITY_HINTS.focus;
  const objSnippet = objective.trim().slice(0, 60);
  return {
    ...b,
    imageId: agendaImageIdForKind(kind),
    activity:
      b.activity ??
      (objSnippet && kind === "focus"
        ? `Avancer sur : ${objSnippet}`
        : hint),
  };
}

export function generateAgendaFromContext(input: GenerateAgendaInput): WizardAgendaResult {
  const { mode, methodIds, objective, targetMin, pomodoro, condensed, genreTitle } = input;
  const raw = generateAgendaPlan(mode, methodIds, targetMin, { pomodoro, condensed });
  const blocks = raw.map((b) => enrichBlock(b, objective));
  const primary = METHOD_BY_ID[methodIds[0] ?? "brainstorm"]?.title ?? "la méthode";
  const label = genreTitle ?? "cette séance";

  return {
    blocks: blocks.map(({ id: _id, docs, ...rest }) => rest),
    summary: `Déroulé de ${label} avec ${primary}, ajusté à ton objectif.`,
  };
}
