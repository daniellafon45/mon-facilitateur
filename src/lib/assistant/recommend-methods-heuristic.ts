import {
  METHOD_BY_ID,
  recommendMethod,
  resolveMethodId,
  getMethodCatalogIds,
} from "@/lib/methods/catalog";
import { describeBoardElements } from "@/lib/whiteboard/describe-board";
import { objectiveFromWhiteboard } from "@/lib/whiteboard/objective-from-board";
import type { WbElement } from "@/lib/whiteboard/elements";
import type { SessionMode } from "@/types/facilitation";
import type { WizardMethodRecommendation } from "@/lib/assistant/wizard-method-prompt";

export interface RecommendMethodsContext {
  mode: SessionMode | null;
  ptype?: string | null;
  ptypeTitle?: string;
  genreId: string | null;
  genreTitle: string;
  genreCat: string;
  durationMin: number;
}

export interface RecommendMethodsInput {
  objective: string;
  elements: WbElement[];
  context: RecommendMethodsContext;
}

function buildSequence(mainId: string, altIds: string[], targetMin: number): string[] {
  const main = resolveMethodId(mainId);
  const seq = [main];
  let total = METHOD_BY_ID[main]?.est ?? 45;
  for (const alt of altIds) {
    const id = resolveMethodId(alt);
    if (seq.includes(id)) continue;
    const est = METHOD_BY_ID[id]?.est ?? 30;
    if (targetMin <= 0 || total + est <= targetMin * 1.15) {
      seq.push(id);
      total += est;
    }
  }
  return seq.filter((id) => getMethodCatalogIds().includes(id));
}

function combineObjective(textObjective: string, elements: WbElement[]): string {
  const fromBoard = objectiveFromWhiteboard(elements);
  const trimmed = textObjective.trim();
  if (trimmed && fromBoard) return `${trimmed} · ${fromBoard}`.slice(0, 300);
  return (trimmed || fromBoard || describeBoardElements(elements).slice(0, 200)).slice(0, 300);
}

export function recommendMethodsFromContext(input: RecommendMethodsInput): WizardMethodRecommendation {
  const { objective, elements, context } = input;
  const combined = combineObjective(objective, elements);
  const genreCat = context.genreCat || "ideas";
  const reco = recommendMethod(genreCat, combined, {
    ptype: context.ptype ?? null,
    genreId: context.genreId ?? null,
  });
  const targetMin = context.durationMin || 75;
  const methodIds = buildSequence(reco.main, reco.alts, targetMin);

  const fallbackObjective =
    combined ||
    context.genreTitle ||
    (context.mode === "solo" ? "Session solo" : "Rencontre de groupe");

  const mainTitle = METHOD_BY_ID[methodIds[0]]?.title ?? methodIds[0];

  return {
    objective: fallbackObjective,
    methodIds: methodIds.length ? methodIds : [resolveMethodId(reco.main)],
    summary: `Pour « ${fallbackObjective.slice(0, 80)} », je te propose ${mainTitle} en priorité.`,
  };
}
