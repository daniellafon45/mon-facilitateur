import type { SessionMode, WizardLaunchMode } from "@/types/facilitation";

export function getWizardContinueLabel(
  stepKey: string,
  mode: SessionMode | null,
  launchMode?: WizardLaunchMode,
): string {
  switch (stepKey) {
    case "agenda":
      if (mode === "solo") return "Configurer la session";
      if (mode === "atelier") return "Lancer l'atelier";
      return "Composer l'équipe";
    case "s4":
      return "Lancer ma session solo";
    case "e4":
      return "Continuer";
    case "e7":
      if (launchMode === "schedule") {
        return mode === "solo" ? "Programmer ma session" : "Programmer la rencontre";
      }
      if (launchMode === "simulate") {
        return mode === "solo" ? "Simuler ma session" : "Simuler la rencontre";
      }
      if (mode === "solo") return "Lancer ma session";
      return "Lancer la rencontre";
    case "1":
      if (mode === "solo") return "Configurer la session";
      if (mode === "atelier") return "Lancer l'atelier";
      return "Configurer l'équipe";
    case "method":
      return "Continuer";
    default:
      return "Continuer";
  }
}

export function getWizardFooterHint(
  stepKey: string,
  ctx: {
    genreTitle?: string;
    genreDur?: string | null;
    methodCount?: number;
    agendaBlocks?: number;
    agendaMin?: number;
    objective?: string;
  },
): string {
  switch (stepKey) {
    case "genre":
      return ctx.genreTitle
        ? `${ctx.genreTitle} · ${ctx.genreDur ?? ""}`
        : "Sélectionnez un genre pour continuer";
    case "method":
      return "";
    case "agenda":
      return ctx.agendaBlocks
        ? `${ctx.agendaBlocks} blocs · ${ctx.agendaMin ?? 0} min`
        : "Validez le déroulé";
    case "1":
      return ctx.objective?.trim()
        ? "Prêt à analyser votre objectif"
        : "Décrivez votre objectif";
    case "0":
      return "Sélectionnez un univers et un mode pour continuer";
    case "e7":
      return "Votre plan de travail est prêt à démarrer.";
    default:
      return "";
  }
}

export const STEP_HAS_RIGHT_PANEL: Record<string, boolean> = {
  "0": true,
  genre: true,
  method: true,
  e4: true,
  e7: true,
};

export function defaultRightCollapsed(stepKey: string): boolean {
  if (stepKey === "e4") return false;
  if (stepKey === "genre") return true;
  return false;
}
