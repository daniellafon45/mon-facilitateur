export interface LibMethodItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  desc: string;
  qt?: boolean;
  full?: boolean;
}

export interface LibFamily {
  id: string;
  label: string;
  icon: string;
  color: string;
  desc: string;
  items: LibMethodItem[];
}

export const LIB_FAMILIES: LibFamily[] = [
  {
    id: "cadrer",
    label: "Cadrer",
    icon: "Target",
    color: "violet",
    desc: "Clarifier le sujet, le mandat, les objectifs et les acteurs.",
    items: [
      { id: "qqoqcp", title: "QQOQCP", icon: "Target", color: "green", desc: "Clarifier une situation en 6 questions : Qui, Quoi, Où, Quand, Comment, Pourquoi." },
      { id: "5-pourquoi", title: "5 Pourquoi", icon: "Search", color: "blue", desc: "Remonter à la cause racine d'un problème par 5 « pourquoi » successifs." },
      { id: "objectifs-smart", title: "Objectifs SMART", icon: "Target", color: "violet", desc: "Rendre un objectif Spécifique, Mesurable, Atteignable, Réaliste et Temporel." },
      { id: "clarification-du-mandat", title: "Clarification du mandat", icon: "Flag", color: "violet", desc: "Cadrer contexte, problème, objectifs, livrables, contraintes et critères de réussite." },
      { id: "analyse-des-parties-prenantes", title: "Analyse des parties prenantes", icon: "Users", color: "blue", desc: "Cartographier les acteurs par groupe, avec leur influence et leur engagement." },
      { id: "matrice-pouvoir-interet", title: "Matrice pouvoir / intérêt", icon: "Grid", color: "amber", desc: "Positionner les acteurs selon leur pouvoir et leur intérêt (4 zones)." },
    ],
  },
  {
    id: "analyser",
    label: "Analyser",
    icon: "Search",
    color: "blue",
    desc: "Comprendre une situation, un système, un marché ou un utilisateur.",
    items: [
      { id: "ishikawa", title: "Ishikawa / causes-effets", icon: "Layers", color: "violet", desc: "Structurer les causes possibles d'un problème par catégories (les 6 M)." },
      { id: "bono", title: "6 chapeaux de Bono", icon: "Hat", color: "violet", desc: "Examiner un sujet sous six angles complémentaires, un chapeau à la fois." },
      { id: "swot", title: "SWOT", icon: "Sliders", color: "blue", desc: "Forces, faiblesses, opportunités et menaces sur une grille en 4 axes." },
      { id: "pestel", title: "PESTEL", icon: "Globe", color: "green", desc: "Analyser l'environnement : Politique, Économique, Socioculturel, Technologique, Environnemental, Légal." },
      { id: "analyse-des-risques", title: "Analyse des risques", icon: "Shield", color: "amber", desc: "Matrice probabilité / impact + registre des risques et mesures de mitigation." },
      { id: "benchmark-concurrentiel", title: "Benchmark concurrentiel", icon: "Document", color: "blue", desc: "Comparer votre offre aux concurrents sur des critères notés." },
      { id: "persona", title: "Persona", icon: "User", color: "blue", desc: "Portrait-robot d'un utilisateur type : objectifs, besoins, frustrations, canaux." },
      { id: "carte-d-empathie", title: "Carte d'empathie", icon: "Heart", color: "rose", desc: "Ce que l'utilisateur dit, pense, fait et ressent — freins et besoins." },
      { id: "parcours-utilisateur", title: "Parcours utilisateur", icon: "Bolt", color: "green", desc: "Cartographier les étapes, actions, émotions, frictions et opportunités." },
    ],
  },
  {
    id: "generer",
    label: "Générer",
    icon: "Sparkle",
    color: "amber",
    desc: "Produire des idées, des options, des solutions ou des alternatives.",
    items: [
      { id: "brainstorming", title: "Brainstorming", icon: "Bulb", color: "green", desc: "Générer un maximum d'idées en groupe, puis regrouper et retenir." },
      { id: "brainwriting", title: "Brainwriting 6-3-5", icon: "Pencil", color: "amber", desc: "6 participants, 3 idées, 5 tours — idéation silencieuse et équitable." },
      { id: "scamper", title: "SCAMPER", icon: "Rocket", color: "green", desc: "Sept leviers d'innovation pour transformer une idée existante." },
    ],
  },
  {
    id: "modeliser",
    label: "Modéliser / Structurer",
    icon: "Layers",
    color: "green",
    desc: "Organiser un modèle, une équipe, des responsabilités.",
    items: [
      { id: "bmc", title: "Business Model Canvas", icon: "Grid", color: "blue", desc: "Modéliser toute une activité sur une seule page, en neuf blocs." },
      { id: "lean-canvas", title: "Lean Canvas", icon: "Grid", color: "violet", desc: "Le canevas Lean en 9 blocs, orienté problème / solution." },
      { id: "value-proposition-canvas", title: "Value Proposition Canvas", icon: "Grid", color: "green", desc: "Aligner l'offre (gains, anti-douleurs) sur le profil client." },
      { id: "raci", title: "Matrice RACI", icon: "Sliders", color: "blue", desc: "Clarifier qui Réalise, Approuve, est Consulté ou Informé pour chaque tâche." },
      { id: "roles", title: "Matrice des rôles", icon: "Users", color: "green", desc: "Attribuer facilitateur, scribe, responsables et participants." },
      { id: "charter", title: "Charte d'équipe", icon: "Handshake", color: "blue", desc: "Définir valeurs, règles de collaboration, attentes et disponibilités." },
      { id: "commplan", title: "Plan de communication", icon: "Send", color: "green", desc: "Qui reçoit quelle information, quand et sous quel format." },
    ],
  },
  {
    id: "prioriser",
    label: "Prioriser & décider",
    icon: "Scale",
    color: "violet",
    desc: "Choisir entre plusieurs options et classer par importance.",
    items: [
      { id: "matrice-impact-effort", title: "Matrice impact / effort", icon: "Grid", color: "green", desc: "Prioriser les idées selon leur impact et l'effort requis (4 quadrants)." },
      { id: "moscow", title: "MoSCoW", icon: "Flag", color: "blue", desc: "Classer les exigences en Must / Should / Could / Won't have." },
      { id: "rice", title: "RICE", icon: "Scale", color: "blue", desc: "Prioriser par Reach × Impact × Confidence / Effort." },
    ],
  },
  {
    id: "planifier",
    label: "Planifier / Suivre",
    icon: "Calendar",
    color: "blue",
    desc: "Transformer les décisions en actions concrètes et suivre l'avancement.",
    items: [
      { id: "plan-d-action", title: "Plan d'action", icon: "List", color: "blue", desc: "Actions, responsables, échéances, priorités et statuts." },
      { id: "kanban", title: "Kanban", icon: "Grid", color: "blue", desc: "Tableau de cartes par colonnes (Idées → Terminé)." },
      { id: "scrum-sprint-board", title: "Scrum Sprint Board", icon: "Grid", color: "violet", desc: "Backlog, sprint et story points par colonnes." },
      { id: "gantt-simplifie", title: "Gantt simplifié", icon: "List", color: "green", desc: "Planning par phases avec barres temporelles et statuts." },
      { id: "tracabilite", title: "Suivi des décisions", icon: "Link", color: "blue", desc: "Relier décisions, actions et responsables — traçabilité du projet." },
    ],
  },
  {
    id: "retro",
    label: "Rétrospective & synthèse",
    icon: "Reset",
    color: "slate",
    desc: "Conclure, apprendre et transmettre.",
    items: [
      { id: "start-stop-continue", title: "Start / Stop / Continue", icon: "Reset", color: "green", desc: "Ce qu'on commence, ce qu'on arrête, ce qu'on continue." },
      { id: "retrospective-4l", title: "Rétrospective 4L", icon: "Reset", color: "blue", desc: "Liked / Learned / Lacked / Longed for — rétro structurée." },
    ],
  },
];

export const LIB_SEANCE: LibMethodItem[] = [
  { id: "vote", qt: true, title: "Vote & sondage", icon: "Vote", color: "violet", desc: "Vote par points, pondéré, échelle, pour / contre, classement — résultats en direct." },
  { id: "desaccord", qt: true, title: "Point de désaccord", icon: "Bolt", color: "amber", desc: "Entente spontanée, compromis, consensus, vote majoritaire pour trancher." },
  { id: "reflexion", qt: true, title: "Pousser la réflexion", icon: "Sparkle", color: "blue", desc: "Questions puissantes, avocat du diable, « Et si…? », inversion, analogies." },
  { id: "probleme", qt: true, title: "Résoudre le problème", icon: "Target", color: "green", desc: "HMW, impact / effort, pré-mortem, pour / contre, plan d'action." },
  { id: "minuteur", qt: true, title: "Minuteur", icon: "Clock", color: "blue", desc: "Décompte, Pomodoro, timebox par étape, compte à rebours, chrono." },
  { id: "parking", qt: true, title: "Parking lot", icon: "Stop", color: "amber", desc: "Capturer les sujets hors-propos pour y revenir plus tard." },
  { id: "tableau-blanc", qt: false, full: true, title: "Tableau blanc", icon: "Pencil", color: "violet", desc: "Canevas libre : dessin, formes, post-it, connecteurs, modèles." },
];

export const METHOD_PAL_BG: Record<string, string> = {
  blue: "#eff6ff",
  green: "#ecfdf5",
  violet: "#f5f3ff",
  amber: "#fffbeb",
  rose: "#fff1f2",
  red: "#fef2f2",
  slate: "#f8fafc",
};

export const SPECIAL_TOOL_IDS = new Set(["raci", "roles", "charter", "commplan", "tableau-blanc"]);

/** Retrouve un outil de la bibliothèque par id (familles + séance). */
export function findLibMethodItem(id: string): LibMethodItem | undefined {
  for (const fam of LIB_FAMILIES) {
    const hit = fam.items.find((i) => i.id === id);
    if (hit) return hit;
  }
  return LIB_SEANCE.find((i) => i.id === id);
}
