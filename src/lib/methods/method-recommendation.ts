import {
  METHOD_BY_ID,
  METHOD_TABS,
  recommendMethod,
  resolveMethodId,
  type MethodDef,
} from "@/lib/methods/catalog";
import { getMethodMarketingCopy } from "@/lib/methods/method-marketing-copy";

export type MethodRecoLevel = "main" | "alt" | "other";

export interface MethodRecommendationInsight {
  recommended: boolean;
  level: MethodRecoLevel;
  headline: string;
  justification: string;
}

function objectiveSnippet(objective: string) {
  const t = objective.trim();
  if (!t) return "votre objectif";
  return `« ${t.slice(0, 100)}${t.length > 100 ? "…" : ""} »`;
}

export function getMethodRecommendationInsight(
  methodId: string,
  objective: string,
  reco: ReturnType<typeof recommendMethod>,
  genreCat?: string,
): MethodRecommendationInsight {
  const method = METHOD_BY_ID[methodId];
  if (!method) {
    return {
      recommended: false,
      level: "other",
      headline: "Méthode",
      justification: "Description non disponible.",
    };
  }

  const resolvedMain = resolveMethodId(reco.main);
  const resolvedSet = reco.set.map(resolveMethodId);
  const isMain = methodId === resolvedMain || resolvedSet[0] === methodId;
  const isAlt = !isMain && resolvedSet.includes(methodId);
  const snippet = objectiveSnippet(objective);
  const benefit = method.why
    ? method.why
    : getMethodMarketingCopy(methodId, method.tagline);
  const mainMethod = METHOD_BY_ID[resolvedMain];
  const mainTitle = mainMethod?.title ?? "la méthode recommandée";

  if (isMain) {
    return {
      recommended: true,
      level: "main",
      headline: "Recommandé en priorité",
      justification: `Votre besoin ${snippet} appelle une méthode pour ${benefit}. ${
        method.produces
          ? `Elle produit typiquement ${method.produces} — adapté à ce que vous décrivez.`
          : "C'est la piste la plus directe pour votre objectif."
      }`,
    };
  }

  if (isAlt) {
    return {
      recommended: true,
      level: "alt",
      headline: "Recommandé en complément",
      justification: `Bonne alternative ou complément à ${mainTitle} : ${benefit}. Utile pour enrichir la séance ou explorer un angle différent.`,
    };
  }

  const matchesGenre = genreCat ? method.cats.includes(genreCat) : false;
  const genreLabel = METHOD_TABS.find((t) => t.id === genreCat)?.label ?? "cette séance";

  if (genreCat && !matchesGenre) {
    return {
      recommended: false,
      level: "other",
      headline: "Moins adapté à cette séance",
      justification: `Cette méthode s'inscrit plutôt dans d'autres types d'atelier que « ${genreLabel} ». Pour ${snippet}, privilégiez ${mainTitle}.`,
    };
  }

  return {
    recommended: false,
    level: "other",
    headline: "Option secondaire",
    justification: `Pertinente ailleurs (${benefit}), mais moins prioritaire ici : ${mainTitle} répond mieux à ${snippet}.`,
  };
}

export function getMethodCategoryLabel(method: MethodDef): string {
  const tab = METHOD_TABS.find((t) => t.id !== "all" && method.cats.includes(t.id));
  return tab?.label ?? "Méthode";
}
