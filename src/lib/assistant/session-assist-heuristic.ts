import type { SessionAssistContext } from "@/lib/session/build-session-assist-context";
import type { SessionAssistResult, SessionAssistTip } from "@/lib/assistant/session-assist-prompt";

const COLORS = ["#2563eb", "#059669", "#d97706", "#7c3aed"] as const;

function tip(title: string, desc: string, i: number): SessionAssistTip {
  return { title, desc, color: COLORS[i % COLORS.length] };
}

export function sessionAssistHeuristic(ctx: SessionAssistContext): SessionAssistResult {
  const tips: SessionAssistTip[] = [];
  const active = ctx.methods.find((m) => m.isActive);
  const progress = active?.progress ?? 0;
  const timeRatio = ctx.durationMin > 0 ? ctx.elapsedMin / ctx.durationMin : 0;
  const methodsDone = ctx.methods.filter((m) => m.isPast || m.progress >= 60).length;
  const modeLabel =
    ctx.mode === "solo" ? "session solo" : ctx.mode === "atelier" ? "grand atelier" : "séance d'équipe";

  if (!active) {
    return {
      status: "Séance en cours — choisis une méthode pour commencer.",
      nextAction: "Ouvre la première méthode du déroulé.",
      tips: [
        tip("Démarre par le cadrage", "Formule l'objectif en une phrase avant de remplir les outils.", 0),
        tip("Garde le rythme", "Annonce la durée de chaque étape avant de commencer.", 1),
      ],
    };
  }

  if (progress < 20 && ctx.elapsedMin >= 8) {
    tips.push(
      tip(
        "Débloque la méthode",
        `${active.title} est peu remplie (${active.statsLabel}). Lance un tour de table de 2 min ou une saisie silencieuse.`,
        tips.length,
      ),
    );
  } else if (progress < 45) {
    tips.push(
      tip(
        "Remplis zone par zone",
        `Sur ${active.title}, vise une zone à la fois. ${active.statsLabel} — ne cherche pas la perfection.`,
        tips.length,
      ),
    );
  } else if (progress < 75) {
    tips.push(
      tip(
        "Consolide avant de passer",
        `Bonne progression sur ${active.title}. Relis les idées saisies et élimine les doublons.`,
        tips.length,
      ),
    );
  } else {
    tips.push(
      tip(
        "Prêt pour l'étape suivante",
        `${active.title} est bien avancé (${active.statsLabel}). Validez en 1 phrase puis passez à la suite.`,
        tips.length,
      ),
    );
  }

  if (timeRatio > 0.7 && ctx.activeMethodIndex < ctx.methodIds.length - 1) {
    tips.push(
      tip(
        "Temps serré",
        `${ctx.elapsedMin}/${ctx.durationMin} min écoulées. Timeboxe 10 min sur la méthode actuelle puis avance.`,
        tips.length,
      ),
    );
  }

  if (ctx.capture.notesCount === 0 && ctx.elapsedMin > 5) {
    tips.push(
      tip(
        "Capture les décisions",
        "Aucune note enregistrée — note les décisions au fil de l'eau (note flottante ou journal).",
        tips.length,
      ),
    );
  }

  if (ctx.mode !== "solo" && ctx.capture.discussionCount === 0 && ctx.elapsedMin > 10) {
    tips.push(
      tip(
        "Inclus le groupe",
        "Peu d'échanges capturés. Ouvre Discussion ou fais un tour de table avant de décider.",
        tips.length,
      ),
    );
  }

  if (active.snippets.length > 0 && tips.length < 3) {
    const hint = active.snippets[0].slice(0, 60);
    tips.push(
      tip(
        "Piste sur le contenu",
        `Tu as déjà noté « ${hint}${hint.length >= 60 ? "…" : ""} » — creuse cette piste avec une question ouverte.`,
        tips.length,
      ),
    );
  }

  const status =
    progress >= 60
      ? `${methodsDone}/${ctx.methodIds.length} outils avancés · ${active.title} en bonne voie`
      : `${active.title} à ${progress}% · ${ctx.elapsedMin} min sur ${ctx.durationMin}`;

  let nextAction = "Continue à remplir la méthode active.";
  if (progress >= 70 && ctx.activeMethodIndex < ctx.methodIds.length - 1) {
    nextAction = "Clique « Outil suivant » pour passer à la prochaine méthode.";
  } else if (progress < 30) {
    nextAction = `Ajoute au moins 2 éléments dans ${active.title}.`;
  } else if (timeRatio > 0.85) {
    nextAction = "Priorise une décision et prépare la clôture.";
  }

  return {
    status: `${modeLabel.charAt(0).toUpperCase() + modeLabel.slice(1)} — ${status}`,
    nextAction,
    tips: tips.slice(0, 3),
  };
}
