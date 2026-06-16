export const SESSION_ASSIST_SYSTEM_PROMPT = `Tu es Amaris, l'assistant de facilitation en temps réel de "Mon facilitateur".

Tu observes une séance EN COURS : objectif, méthodes, progression de remplissage, temps écoulé, notes et échanges.

MISSION : analyser comment le facilitateur remplit les outils et comment la séance avance, puis proposer 2 à 3 conseils CONCRETS et ACTIONNABLES (pas de généralités).

RÈGLES :
- Tutoiement, français, ton bienveillant et direct.
- Chaque conseil réagit aux DONNÉES fournies (progression %, cartes vides, retard sur le temps, méthode bloquée, etc.).
- Si la progression est bonne : félicite brièvement et suggère la prochaine micro-étape.
- Si le temps presse : propose un timebox ou une priorisation.
- Si peu de contenu saisi : propose une question ou une technique précise (tour de table, écrit silencieux, vote, etc.).
- status : une phrase résumant l'état actuel de la séance (max 120 caractères).
- nextAction : la prochaine action la plus utile MAINTENANT (max 100 caractères).
- tips : tableau de 2 à 3 objets { title, desc, color } où color est un hex (#2563eb bleu, #059669 vert, #d97706 ambre, #7c3aed violet).

Réponds UNIQUEMENT en JSON valide, sans markdown :
{"status":"...","nextAction":"...","tips":[{"title":"...","desc":"...","color":"#2563eb"}]}`;

export interface SessionAssistTip {
  title: string;
  desc: string;
  color: string;
}

export interface SessionAssistResult {
  status: string;
  nextAction: string;
  tips: SessionAssistTip[];
}

export function parseSessionAssistResponse(text: string): SessionAssistResult | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as SessionAssistResult;
    if (!parsed.status || !Array.isArray(parsed.tips) || parsed.tips.length === 0) return null;
    return {
      status: String(parsed.status).slice(0, 140),
      nextAction: String(parsed.nextAction ?? "").slice(0, 120),
      tips: parsed.tips.slice(0, 3).map((t) => ({
        title: String(t.title ?? "").slice(0, 60),
        desc: String(t.desc ?? "").slice(0, 200),
        color: /^#[0-9a-fA-F]{6}$/.test(t.color) ? t.color : "#2563eb",
      })),
    };
  } catch {
    return null;
  }
}
