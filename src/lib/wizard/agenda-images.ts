import type { MeetingAgendaBlock } from "@/types/facilitation";
import { getWizardIllustration, getWizardIllustrationFallback } from "@/lib/wizard/wizard-images";

/** Illustrations par type de bloc — générables via scripts/generate-wizard-images.mjs (groupe agenda). */
export const AGENDA_KIND_IMAGE_IDS: Record<NonNullable<MeetingAgendaBlock["kind"]>, string> = {
  intro: "agenda_intro",
  focus: "agenda_focus",
  pause: "agenda_pause",
  synthèse: "agenda_synthese",
  breakout: "agenda_breakout",
  plénière: "agenda_pleniere",
};

export function agendaImageIdForKind(kind?: MeetingAgendaBlock["kind"]): string {
  return AGENDA_KIND_IMAGE_IDS[kind ?? "focus"] ?? "agenda_focus";
}

export function getAgendaBlockIllustration(block: MeetingAgendaBlock): string {
  const id = block.imageId ?? agendaImageIdForKind(block.kind);
  return getWizardIllustration(id);
}

export function getAgendaBlockIllustrationFallback(block: MeetingAgendaBlock): string {
  const id = block.imageId ?? agendaImageIdForKind(block.kind);
  return getWizardIllustrationFallback(id);
}
