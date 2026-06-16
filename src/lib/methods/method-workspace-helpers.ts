import { buildBmcExportText } from "@/lib/methods/bmc-blocks";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import type { MethodWorkspaceConfig } from "@/components/session/methods/configs";
import type { SessionState } from "@/components/session/methods/column-workspace";

type CardItem = { id: string; text: string };

const GUIDED: Record<string, string[]> = {
  swot: [
    "Quelles forces internes pouvons-nous exploiter ?",
    "Quelles faiblesses doivent être adressées en priorité ?",
    "Quelles opportunités externes voyons-nous ?",
    "Quelles menaces pourraient impacter le projet ?",
  ],
  pestel: [
    "Quels facteurs politiques influencent notre contexte ?",
    "Quelles tendances économiques sont pertinentes ?",
    "Quels changements sociaux touchent nos utilisateurs ?",
  ],
  qqoqcp: [
    "Qui est concerné par ce sujet ?",
    "Quel est le problème ou l'objectif précis ?",
    "Où et quand cela se produit-il ?",
    "Pourquoi est-ce important maintenant ?",
  ],
  moscow: [
    "Qu'est-ce qui est indispensable pour livrer ?",
    "Qu'est-ce qui apporte une vraie valeur ajoutée ?",
    "Qu'est-ce qui peut attendre une prochaine itération ?",
  ],
  brainstorming: [
    "Quelle question de départ ouvre le plus d'idées ?",
    "Quels regroupements émergent naturellement ?",
    "Quelles idées recueillent le plus d'adhésion ?",
  ],
  ishikawa: [
    "Le problème central est-il formulé clairement ?",
    "Quelles causes humaines ou organisationnelles ressortent ?",
    "Quelles causes techniques ou processus sont en jeu ?",
  ],
  bono: [
    "Les faits objectifs sont-ils bien séparés des opinions ?",
    "Tous les angles ont-ils été explorés ?",
    "Quelle synthèse permet de décider ?",
  ],
  "start-stop-continue": [
    "Que devrions-nous commencer à faire ?",
    "Que devrions-nous arrêter ?",
    "Que faisons-nous bien et devons-nous continuer ?",
  ],
  "retrospective-4l": [
    "Qu'avons-nous particulièrement apprécié ?",
    "Qu'avons-nous appris ?",
    "Qu'est-ce qui nous a manqué ?",
    "Que souhaitons-nous pour la suite ?",
  ],
  scamper: [
    "Quels éléments pourrions-nous substituer ou combiner ?",
    "Quelles pistes sont les plus innovantes ?",
    "Qu'est-ce qu'on peut éliminer ou simplifier ?",
  ],
  "5-pourquoi": [
    "Le problème initial est-il bien formulé ?",
    "Chaque « pourquoi » creuse-t-il vraiment la couche précédente ?",
    "La cause racine est-elle actionnable ?",
  ],
  kanban: [
    "Quelles cartes sont bloquées et pourquoi ?",
    "La charge est-elle équilibrée entre colonnes ?",
    "Quelles cartes peuvent avancer dès maintenant ?",
  ],
  "lean-canvas": [
    "Quel est le problème le plus urgent à résoudre ?",
    "Quelle est la valeur unique que nous apportons ?",
    "Quelle solution est faisable rapidement ?",
    "Comment allons-nous mesurer le succès ?",
  ],
  "clarification-du-mandat": [
    "Quel est le contexte actuel et pourquoi ce mandat est-il important ?",
    "Quel problème central voulons-nous résoudre ?",
    "Quels livrables concrets attendons-nous ?",
    "Comment mesurerons-nous le succès ?",
  ],
  "value-proposition-canvas": [
    "Quels produits ou services aidons-nous nos clients à accomplir ?",
    "Quels bénéfices recherchent-ils ?",
    "Qu'est-ce qui les freine ou les frustre ?",
    "Quelles correspondances offre / attentes sont les plus fortes ?",
  ],
  "parcours-utilisateur": [
    "Quelles actions clés l'utilisateur réalise-t-il à chaque étape ?",
    "Quelles pensées ou émotions ressent-il ?",
    "Quels sont les principaux points de friction ?",
    "Quelles opportunités d'amélioration émergent ?",
  ],
  persona: [
    "Qui est cette personne et quel est son contexte ?",
    "Quels sont ses objectifs principaux ?",
    "Quelles frustrations rencontre-t-elle ?",
    "Qu'est-ce qui la motive vraiment ?",
  ],
  "carte-d-empathie": [
    "Que voit cette personne dans son environnement ?",
    "Qu'entend-elle de son entourage ?",
    "À quoi pense-t-elle et que ressent-elle ?",
    "Quelles douleurs et gains en découle-t-on ?",
  ],
  "objectifs-smart": [
    "L'objectif est-il spécifique et clairement formulé ?",
    "Comment le mesurerons-nous concrètement ?",
    "Est-il atteignable dans le délai prévu ?",
    "Quelle échéance fixons-nous ?",
  ],
  "analyse-des-parties-prenantes": [
    "Qui sont les acteurs internes et externes clés ?",
    "Quel est leur niveau d'influence ?",
    "Quels sont leurs intérêts respectifs ?",
    "Comment les impliquer efficacement ?",
  ],
  "analyse-des-risques": [
    "Quels risques majeurs identifions-nous ?",
    "Quelle est leur probabilité et leur impact ?",
    "Quelles mesures de mitigation envisageons-nous ?",
  ],
  "matrice-pouvoir-interet": [
    "Quels acteurs ont un fort pouvoir et un fort intérêt ?",
    "Qui doit être géré de près ?",
    "Qui peut être informé ou surveillé ?",
  ],
  "matrice-impact-effort": [
    "Quelles actions sont des quick wins (fort impact, faible effort) ?",
    "Quelles initiatives demandent plus de ressources ?",
    "Que devrions-nous éviter ou reporter ?",
  ],
  rice: [
    "Quel est l'impact attendu de chaque option ?",
    "Quelle confiance avons-nous dans l'estimation ?",
    "Quel effort est nécessaire pour chaque piste ?",
  ],
  "plan-d-action": [
    "Quelles actions concrètes découle de cette séance ?",
    "Qui est responsable de chaque action ?",
    "Quelles échéances fixons-nous ?",
  ],
  raci: [
    "Qui est Responsable de chaque tâche ?",
    "Qui doit être Consulté ou Informé ?",
    "Y a-t-il des zones de chevauchement ou de vide ?",
  ],
  tracabilite: [
    "Quelles décisions avons-nous prises ?",
    "Sur quoi nous sommes-nous mis d'accord ?",
    "Quels points restent ouverts ?",
  ],
  brainwriting: [
    "Chaque tour apporte-t-il de nouvelles idées ?",
    "Quelles idées méritent d'être approfondies ?",
    "Quelles pistes retenir pour la suite ?",
  ],
  bw635: [
    "Les idées circulent-elles bien entre participants ?",
    "Quels thèmes reviennent le plus souvent ?",
    "Quelles idées émergent comme prioritaires ?",
  ],
  "benchmark-concurrentiel": [
    "Quels critères comparons-nous ?",
    "Où sommes-nous en avance ou en retard ?",
    "Quelles bonnes priques pouvons-nous reprendre ?",
  ],
  "gantt-simplifie": [
    "Les dépendances entre tâches sont-elles claires ?",
    "Le planning est-il réaliste ?",
    "Quels jalons critiques identifions-nous ?",
  ],
  "scrum-sprint-board": [
    "Le sprint goal est-il clair pour tous ?",
    "Y a-t-il des blocages sur les cartes en cours ?",
    "Le flux de livraison est-il fluide ?",
  ],
  concept: [
    "Quel est le concept central ?",
    "Quels concepts y sont liés ?",
    "Comment nommer chaque relation ?",
  ],
  functional: [
    "Quelles sont les entrées du système ?",
    "Quels traitements ou fonctions s'appliquent ?",
    "Quelles sorties et flux en résultent ?",
  ],
  logic: [
    "Quelle est la racine de l'arbre logique ?",
    "Comment décomposer en branches ?",
    "La hiérarchie est-elle cohérente ?",
  ],
  brainstorm: [
    "La question de départ ouvre-t-elle assez de possibilités ?",
    "Quelles idées surprennent ou méritent d'être creusées ?",
    "Quelles idées retenir en priorité ?",
  ],
};

export function getGuidedQuestions(
  methodId: string,
  config: MethodWorkspaceConfig,
): string[] {
  if (GUIDED[methodId]) return GUIDED[methodId];
  if (config.columns?.length) {
    return config.columns
      .slice(0, 4)
      .map((c) => `Qu'avez-vous identifié pour « ${c.title} » ?`);
  }
  if (config.blocks?.length) {
    return config.blocks
      .slice(0, 4)
      .map((b) => `Que mettez-vous dans « ${b.title} » ?`);
  }
  return [
    "Quel est l'objectif de cette étape ?",
    "Quelles idées ou éléments clés émergent ?",
    "Quelles décisions ou actions en découle ?",
    "Que reste-t-il à clarifier ?",
  ];
}

function getColumnCards(state: SessionState, colId: string): CardItem[] {
  const cols = (state.columns as Record<string, CardItem[]>) ?? {};
  return cols[colId] ?? [];
}

export function computeMethodStats(
  config: MethodWorkspaceConfig,
  state: SessionState,
): { label: string; progress?: number } {
  if (config.type === "bmc" && state.bmc) {
    const blocks = state.bmc as Record<string, CardItem[]>;
    const ids = Object.keys(blocks);
    const filled = ids.filter((id) => (blocks[id]?.length ?? 0) > 0).length;
    const notes = ids.reduce((a, id) => a + (blocks[id]?.length ?? 0), 0);
    return {
      label: `${filled}/9 blocs · ${notes} notes`,
      progress: Math.round((filled / 9) * 100),
    };
  }

  if (config.type === "columns" && config.columns) {
    const total = config.columns.reduce(
      (a, c) => a + getColumnCards(state, c.id).length,
      0,
    );
    const filled = config.columns.filter(
      (c) => getColumnCards(state, c.id).length > 0,
    ).length;
    return {
      label: `${filled}/${config.columns.length} zones · ${total} cartes`,
      progress: config.columns.length
        ? Math.round((filled / config.columns.length) * 100)
        : 0,
    };
  }

  if (config.type === "blocks") {
    const blocks = config.blocks ?? [];
    const data = (state.blocks as Record<string, string>) ?? {};
    const filled = blocks.filter((b) => (data[b.id] ?? "").trim()).length;
    return {
      label: `${filled}/${blocks.length} blocs remplis`,
      progress: blocks.length ? Math.round((filled / blocks.length) * 100) : 0,
    };
  }

  if (config.type === "list") {
    const items = ((state.items as string[]) ?? []).filter((i) => i.trim());
    return { label: `${items.length} éléments`, progress: undefined };
  }

  if (config.type === "kanban") {
    const board = (state.kanban as Record<string, string[]>) ?? {};
    const total = Object.values(board).reduce((a, arr) => a + arr.length, 0);
    return { label: `${total} cartes`, progress: undefined };
  }

  if (config.type === "bono") {
    const notes = (state.bono as Record<string, string>) ?? {};
    const filled = Object.values(notes).filter((n) => n.trim()).length;
    return { label: `${filled}/6 chapeaux`, progress: Math.round((filled / 6) * 100) };
  }

  if (config.type === "matrix") {
    const rows = (state.matrix as { label: string }[]) ?? [];
    const filled = rows.length;
    return {
      label: `${filled} élément${filled > 1 ? "s" : ""} positionné${filled > 1 ? "s" : ""}`,
      progress: filled > 0 ? Math.min(filled * 15, 100) : 0,
    };
  }

  if (config.type === "gantt") {
    const tasks = (state.gantt as { name: string }[]) ?? [];
    return {
      label: `${tasks.length} tâche${tasks.length > 1 ? "s" : ""}`,
      progress: tasks.length > 0 ? Math.min(tasks.length * 20, 100) : 0,
    };
  }

  return { label: "En cours", progress: undefined };
}

export function buildMethodExportText(
  methodId: string,
  config: MethodWorkspaceConfig,
  state: SessionState,
): string {
  const title = METHOD_BY_ID[methodId]?.title ?? config.title;
  const header = `${title.toUpperCase()}\n${"=".repeat(Math.min(title.length, 40))}\n\n`;

  if (methodId === "bmc" && state.bmc) {
    return buildBmcExportText(state.bmc as Record<string, CardItem[]>);
  }

  if (config.type === "columns" && config.columns) {
    return (
      header +
      config.columns
        .map((col) => {
          const cards = getColumnCards(state, col.id);
          const lines = cards.length
            ? cards.map((c) => `  • ${c.text || "(vide)"}`).join("\n")
            : "  (aucune carte)";
          return `■ ${col.title}\n${lines}`;
        })
        .join("\n\n")
    );
  }

  if (config.type === "blocks") {
    const blocks = config.blocks ?? [];
    const data = (state.blocks as Record<string, string>) ?? {};
    return (
      header +
      blocks
        .map((b) => `■ ${b.title}\n  ${data[b.id]?.trim() || "(vide)"}`)
        .join("\n\n")
    );
  }

  if (config.type === "list") {
    const items = (state.items as string[]) ?? [];
    return (
      header +
      (items.filter((i) => i.trim()).length
        ? items.map((i, n) => `${n + 1}. ${i}`).join("\n")
        : "(aucun élément)")
    );
  }

  if (config.type === "bono") {
    const hats = [
      ["white", "Faits"],
      ["red", "Émotions"],
      ["black", "Risques"],
      ["yellow", "Bénéfices"],
      ["green", "Idées"],
      ["blue", "Synthèse"],
    ];
    const notes = (state.bono as Record<string, string>) ?? {};
    return (
      header +
      hats.map(([id, label]) => `■ ${label}\n  ${notes[id]?.trim() || "(vide)"}`).join("\n\n")
    );
  }

  if (config.type === "kanban") {
    const board = (state.kanban as Record<string, string[]>) ?? {};
    return (
      header +
      Object.entries(board)
        .map(([col, cards]) => `■ ${col}\n${cards.map((c) => `  • ${c}`).join("\n") || "  (vide)"}`)
        .join("\n\n")
    );
  }

  if (config.type === "matrix") {
    const rows = (state.matrix as { label: string }[]) ?? [];
    return header + (rows.length ? rows.map((r) => `• ${r.label}`).join("\n") : "(vide)");
  }

  if (config.type === "gantt") {
    const tasks = (state.gantt as { name: string }[]) ?? [];
    return header + (tasks.length ? tasks.map((t) => `• ${t.name}`).join("\n") : "(vide)");
  }

  return header + JSON.stringify(state, null, 2);
}

export const METHOD_COLOR_CLASS: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  violet: "bg-violet-100 text-violet-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  teal: "bg-teal-100 text-teal-700",
  slate: "bg-slate-100 text-slate-700",
};
