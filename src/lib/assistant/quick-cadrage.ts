import {
  recommendMethod,
  resolveMethodId,
  SESSION_GENRES,
} from "@/lib/methods/catalog";
import type { ChatRecommendation, SessionMode } from "@/types/facilitation";

export function genresForMode(mode: SessionMode) {
  return SESSION_GENRES.filter((g) => g.mode === mode);
}

export function inferModeFromText(text: string): SessionMode | null {
  const lower = text.toLowerCase();
  if (
    /\bsolo\b|seul|seule|moi-même|personnel|individuel/.test(lower) &&
    !/groupe|équipe|equipe/.test(lower)
  ) {
    return "solo";
  }
  if (/atelier|grand groupe|15\+|vingt|trente|plénière|pleniere/.test(lower)) {
    return "atelier";
  }
  if (/groupe|équipe|equipe|collaboratif|classe|cours|rétro|retro|kick-?off/.test(lower)) {
    return "equipe";
  }
  return null;
}

export function inferGenreFromText(text: string, mode: SessionMode | null): string | null {
  const lower = text.toLowerCase();
  const pool = mode ? genresForMode(mode) : SESSION_GENRES;

  if (/rétro|retro|bilan/.test(lower)) {
    return pool.find((g) => g.id === "e_retro")?.id ?? null;
  }
  if (/kick-?off|lancement|cadrage|démarrage|demarrage/.test(lower)) {
    return pool.find((g) => g.id === "e_kickoff")?.id ?? null;
  }
  if (/problème|probleme|cause|ishikawa|blocage/.test(lower)) {
    return pool.find((g) => g.id === "s_probleme")?.id ?? null;
  }
  if (/co-?création|cocreation|atelier créatif/.test(lower)) {
    return pool.find((g) => g.id === "a_cocreation")?.id ?? null;
  }
  if (/brainstorm|idéation|ideation|idées|idees/.test(lower)) {
    return (
      pool.find((g) => g.id === "e_brainstorm")?.id ??
      pool.find((g) => g.id === "s_brainstorm")?.id ??
      null
    );
  }
  if (/environnement|écologie|ecologie|durable|climat/.test(lower)) {
    return mode === "solo" ? "s_brainstorm" : "e_brainstorm";
  }

  return null;
}

function extractObjective(messages: { role: string; content: string }[]): string {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.replace(/\[Documents joints\][\s\S]*/g, "").trim())
    .filter(Boolean)
    .join(" · ");
  return userText.slice(0, 300);
}

export function buildQuickRecommendation(
  mode: SessionMode,
  genreId: string,
  objective = "",
): ChatRecommendation {
  const genre = SESSION_GENRES.find((g) => g.id === genreId) ?? SESSION_GENRES[0];
  const cat = genre.cats[0] ?? "ideas";
  const reco = recommendMethod(cat, objective || genre.title, { genreId: genre.id });
  const methodIds = reco.set.map(resolveMethodId);

  return {
    ready: true,
    objective: objective || genre.title,
    mode,
    genreId: genre.id,
    methodIds,
    reply: `Parfait — pour « ${genre.title} », je te recommande ${methodIds
      .slice(0, 2)
      .map((id) => id)
      .join(" et ")}. On passe aux méthodes pour affiner ta sélection.`,
  };
}

/** Cadrage rapide : au plus 2 questions (format + type), puis méthodes. */
export function fastHeuristicRecommendation(
  messages: { role: string; content: string }[],
  hints?: { mode?: SessionMode | null; genreId?: string | null },
): ChatRecommendation {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");
  const objective = extractObjective(messages);

  const mode = hints?.mode ?? inferModeFromText(userText);
  const genreId = hints?.genreId ?? inferGenreFromText(userText, mode);

  if (!mode) {
    return {
      ready: false,
      reply:
        "Pour te proposer les bonnes méthodes tout de suite : c'est une session solo ou une rencontre de groupe ?",
      followUpQuestions: ["Session solo", "Rencontre d'équipe", "Grand atelier"],
    };
  }

  if (!genreId) {
    const options = genresForMode(mode);
    const labels = options.map((g) => g.title).join(", ");
    return {
      ready: false,
      reply: `Compris (${mode === "solo" ? "solo" : mode === "atelier" ? "grand atelier" : "équipe"}). Quel type de projet ? Par ex. : ${labels}.`,
      mode,
      followUpQuestions: options.map((g) => g.title),
    };
  }

  return buildQuickRecommendation(mode, genreId, objective);
}
