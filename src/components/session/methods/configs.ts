export interface ColumnDef {
  id: string;
  title: string;
  color: string;
  sub?: string;
}

export interface MethodWorkspaceConfig {
  id: string;
  title: string;
  columns?: ColumnDef[];
  blocks?: { id: string; title: string; color: string }[];
  type: "columns" | "blocks" | "list" | "matrix" | "bono" | "bmc" | "kanban" | "gantt";
}

export const METHOD_CONFIGS: Record<string, MethodWorkspaceConfig> = {
  swot: {
    id: "swot",
    title: "SWOT",
    type: "columns",
    columns: [
      { id: "s", title: "Forces", color: "green" },
      { id: "w", title: "Faiblesses", color: "red" },
      { id: "o", title: "Opportunités", color: "blue" },
      { id: "t", title: "Menaces", color: "amber" },
    ],
  },
  pestel: {
    id: "pestel",
    title: "PESTEL",
    type: "columns",
    columns: [
      { id: "p", title: "Politique", color: "violet" },
      { id: "e", title: "Économique", color: "blue" },
      { id: "s", title: "Social", color: "green" },
      { id: "t", title: "Technologique", color: "amber" },
      { id: "en", title: "Environnement", color: "teal" },
      { id: "l", title: "Légal", color: "red" },
    ],
  },
  qqoqcp: {
    id: "qqoqcp",
    title: "QQOQCP",
    type: "columns",
    columns: [
      { id: "qui", title: "Qui ?", color: "blue" },
      { id: "quoi", title: "Quoi ?", color: "violet" },
      { id: "ou", title: "Où ?", color: "green" },
      { id: "quand", title: "Quand ?", color: "amber" },
      { id: "comment", title: "Comment ?", color: "red" },
      { id: "pourquoi", title: "Pourquoi ?", color: "blue" },
    ],
  },
  "start-stop-continue": {
    id: "start-stop-continue",
    title: "Start / Stop / Continue",
    type: "columns",
    columns: [
      { id: "start", title: "Start", color: "green" },
      { id: "stop", title: "Stop", color: "red" },
      { id: "continue", title: "Continue", color: "blue" },
    ],
  },
  "retrospective-4l": {
    id: "retrospective-4l",
    title: "Rétrospective 4L",
    type: "columns",
    columns: [
      { id: "liked", title: "Liked", color: "green" },
      { id: "learned", title: "Learned", color: "blue" },
      { id: "lacked", title: "Lacked", color: "amber" },
      { id: "longed", title: "Longed for", color: "red" },
    ],
  },
  moscow: {
    id: "moscow",
    title: "MoSCoW",
    type: "columns",
    columns: [
      { id: "must", title: "Must have", color: "red" },
      { id: "should", title: "Should have", color: "amber" },
      { id: "could", title: "Could have", color: "green" },
      { id: "wont", title: "Won't have", color: "violet" },
    ],
  },
  brainstorming: {
    id: "brainstorming",
    title: "Brainstorming",
    type: "columns",
    columns: [
      { id: "diverge", title: "Idées", color: "green" },
      { id: "cluster", title: "Regroupements", color: "blue" },
      { id: "select", title: "Sélection", color: "violet" },
    ],
  },
  brainwriting: {
    id: "brainwriting",
    title: "Brainwriting",
    type: "columns",
    columns: [
      { id: "round1", title: "Tour 1", color: "green" },
      { id: "round2", title: "Tour 2", color: "blue" },
      { id: "round3", title: "Tour 3", color: "violet" },
    ],
  },
  bw635: {
    id: "bw635",
    title: "Brainwriting 6-3-5",
    type: "columns",
    columns: Array.from({ length: 6 }, (_, i) => ({
      id: `p${i + 1}`,
      title: `Participant ${i + 1}`,
      color: ["green", "blue", "violet", "amber", "red", "teal"][i % 6],
    })),
  },
  scamper: {
    id: "scamper",
    title: "SCAMPER",
    type: "columns",
    columns: [
      { id: "s", title: "Substituer", color: "blue" },
      { id: "c", title: "Combiner", color: "green" },
      { id: "a", title: "Adapter", color: "violet" },
      { id: "m", title: "Modifier", color: "amber" },
      { id: "p", title: "Proposer", color: "red" },
      { id: "e", title: "Éliminer", color: "slate" },
      { id: "r", title: "Réorganiser", color: "teal" },
    ],
  },
  bmc: { id: "bmc", title: "Business Model Canvas", type: "bmc" },
  "lean-canvas": {
    id: "lean-canvas",
    title: "Lean Canvas",
    type: "columns",
    columns: [
      { id: "prob", title: "Problème", color: "red" },
      { id: "sol", title: "Solution", color: "amber" },
      { id: "ind", title: "Indicateurs clés", color: "blue" },
      { id: "uvp", title: "Proposition de valeur unique", color: "red" },
      { id: "adv", title: "Avantage injuste", color: "green" },
      { id: "can", title: "Canaux", color: "red" },
      { id: "seg", title: "Segments de clientèle", color: "blue" },
      { id: "cost", title: "Structure des coûts", color: "amber" },
      { id: "rev", title: "Sources de revenus", color: "green" },
    ],
  },
  bono: { id: "bono", title: "Six Chapeaux de Bono", type: "bono" },
  ishikawa: {
    id: "ishikawa",
    title: "Ishikawa",
    type: "columns",
    columns: [
      { id: "methodes", title: "Méthodes", color: "violet" },
      { id: "mo", title: "Main-d'œuvre", color: "amber" },
      { id: "materiel", title: "Matériel", color: "green" },
      { id: "milieu", title: "Milieu", color: "blue" },
      { id: "mesures", title: "Mesures", color: "red" },
      { id: "matieres", title: "Matières", color: "amber" },
    ],
  },
  "5-pourquoi": { id: "5-pourquoi", title: "5 Pourquoi", type: "list" },
  fivewhys: { id: "fivewhys", title: "5 Pourquoi", type: "list" },
  brainstorm: { id: "brainstorm", title: "Brainstorming libre", type: "columns", columns: [{ id: "ideas", title: "Idées", color: "green" }] },
  "objectifs-smart": {
    id: "objectifs-smart",
    title: "SMART",
    type: "columns",
    columns: [
      { id: "s", title: "Spécifique", color: "violet" },
      { id: "m", title: "Mesurable", color: "blue" },
      { id: "a", title: "Atteignable", color: "green" },
      { id: "r", title: "Réaliste", color: "amber" },
      { id: "t", title: "Temporel", color: "red" },
    ],
  },
  persona: {
    id: "persona",
    title: "Persona",
    type: "columns",
    columns: [
      { id: "obj", title: "Objectifs", color: "green" },
      { id: "bes", title: "Besoins", color: "blue" },
      { id: "fru", title: "Frustrations", color: "red" },
      { id: "mot", title: "Motivations", color: "amber" },
    ],
  },
  "carte-d-empathie": {
    id: "carte-d-empathie",
    title: "Carte d'empathie",
    type: "columns",
    columns: [
      { id: "voir", title: "Voir", color: "blue" },
      { id: "entendre", title: "Entendre", color: "green" },
      { id: "penser", title: "Penser", color: "violet" },
      { id: "ressentir", title: "Ressentir", color: "red" },
    ],
  },
  "analyse-des-parties-prenantes": {
    id: "analyse-des-parties-prenantes",
    title: "Parties prenantes",
    type: "columns",
    columns: [
      { id: "internes", title: "Internes", color: "blue" },
      { id: "externes", title: "Externes", color: "green" },
      { id: "influence", title: "Influence", color: "violet" },
    ],
  },
  "analyse-des-risques": { id: "analyse-des-risques", title: "Analyse des risques", type: "matrix" },
  "benchmark-concurrentiel": { id: "benchmark-concurrentiel", title: "Benchmark", type: "matrix" },
  "clarification-du-mandat": {
    id: "clarification-du-mandat",
    title: "Clarification du mandat",
    type: "columns",
    columns: [
      { id: "ctx", title: "Contexte", color: "blue" },
      { id: "prob", title: "Problème à résoudre", color: "violet" },
      { id: "obj", title: "Objectifs", color: "green" },
      { id: "liv", title: "Livrables attendus", color: "amber" },
      { id: "con", title: "Contraintes", color: "red" },
      { id: "crit", title: "Critères de réussite", color: "blue" },
    ],
  },
  "matrice-pouvoir-interet": { id: "matrice-pouvoir-interet", title: "Pouvoir / intérêt", type: "matrix" },
  "matrice-impact-effort": { id: "matrice-impact-effort", title: "Impact / Effort", type: "matrix" },
  "parcours-utilisateur": {
    id: "parcours-utilisateur",
    title: "Parcours utilisateur",
    type: "columns",
    columns: [
      { id: "avant", title: "Avant l'arrivée", color: "blue", sub: "Préparation" },
      { id: "arrivee", title: "Arrivée sur le campus", color: "violet", sub: "Premier contact" },
      { id: "demarches", title: "Premières démarches", color: "red", sub: "Formalités" },
      { id: "decouverte", title: "Découverte des services", color: "amber", sub: "Intégration" },
      { id: "suivi", title: "Suivi après accueil", color: "green", sub: "Accompagnement" },
    ],
  },
  "value-proposition-canvas": {
    id: "value-proposition-canvas",
    title: "Value Proposition Canvas",
    type: "columns",
    columns: [
      { id: "prod", title: "Produits & services", color: "blue" },
      { id: "gain", title: "Créateurs de gains", color: "green" },
      { id: "pain", title: "Anti-douleurs", color: "violet" },
      { id: "cgain", title: "Gains", color: "green" },
      { id: "task", title: "Tâches du client", color: "blue" },
      { id: "cpain", title: "Douleurs", color: "red" },
    ],
  },
  rice: { id: "rice", title: "RICE", type: "list" },
  "plan-d-action": { id: "plan-d-action", title: "Plan d'action", type: "list" },
  kanban: { id: "kanban", title: "Kanban", type: "kanban" },
  "scrum-sprint-board": { id: "scrum-sprint-board", title: "Sprint Board", type: "kanban" },
  "gantt-simplifie": { id: "gantt-simplifie", title: "Gantt", type: "gantt" },
  raci: { id: "raci", title: "RACI", type: "matrix" },
  tracabilite: { id: "tracabilite", title: "Traçabilité", type: "list" },
  concept: { id: "concept", title: "Carte conceptuelle", type: "columns", columns: [{ id: "nodes", title: "Concepts", color: "blue" }] },
  functional: {
    id: "functional",
    title: "Schéma fonctionnel",
    type: "columns",
    columns: [
      { id: "in", title: "Entrées", color: "blue" },
      { id: "proc", title: "Traitements", color: "violet" },
      { id: "out", title: "Sorties", color: "green" },
      { id: "flow", title: "Flux & liens", color: "amber" },
    ],
  },
  logic: { id: "logic", title: "Schéma logique", type: "list" },
};

export const IMPLEMENTED_IDS = Object.keys(METHOD_CONFIGS);
