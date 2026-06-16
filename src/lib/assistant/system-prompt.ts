import { resolveMethodId, getMethodCatalogIds } from "@/lib/methods/catalog";
import type { ChatRecommendation } from "@/types/facilitation";
import { fastHeuristicRecommendation } from "@/lib/assistant/quick-cadrage";

const METHOD_IDS = getMethodCatalogIds();

export const ASSISTANT_SYSTEM_PROMPT = `Tu es l'assistant IA de "Mon facilitateur".

OBJECTIF : proposer des méthodes de facilitation RAPIDEMENT — pas de questionnaire long.

ÉTAPES (maximum 2 questions avant recommandation) :
1. Si le format n'est pas clair : demander solo OU rencontre d'équipe OU grand atelier.
2. Si le type de projet n'est pas clair : demander le genre (brainstorming, rétro, kick-off, résolution de problème, co-création…).
3. Dès que format + type sont connus : ready=true avec methodIds recommandés.

NE DEMANDE JAMAIS : durée, nombre exact de participants, contexte détaillé, ni autres détails avant ready=true.
Si l'utilisateur refuse de répondre ("non", "passer", "lancer"), déduis le format/type du contexte et passe ready=true.

Style : français, tutoiement, 1-2 phrases max par message.

RÈGLES TECHNIQUES :
- JSON valide uniquement, sans markdown.
- methodIds parmi: ${METHOD_IDS.join(", ")}.
- mode: solo | equipe | atelier
- genreId parmi: s_brainstorm, s_probleme, e_kickoff, e_brainstorm, e_retro, a_cocreation

Format:
{"ready":false,"reply":"...","followUpQuestions":[],"objective":"","mode":"","methodIds":[],"genreId":""}`;

export function parseRecommendation(text: string): ChatRecommendation | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as ChatRecommendation;
    if (!parsed.reply) return null;
    if (parsed.methodIds) {
      parsed.methodIds = parsed.methodIds
        .map(resolveMethodId)
        .filter((id) => METHOD_IDS.includes(id));
    }
    return parsed;
  } catch {
    return null;
  }
}

/** @deprecated Utiliser fastHeuristicRecommendation */
export function heuristicRecommendation(
  messages: { role: string; content: string }[],
): ChatRecommendation {
  return fastHeuristicRecommendation(messages);
}
