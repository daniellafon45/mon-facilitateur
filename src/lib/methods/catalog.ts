import type { SessionMode } from "@/types/facilitation";

export interface MethodDef {
  id: string;
  title: string;
  tagline: string;
  est: number;
  icon: string;
  color: string;
  cats: string[];
  why: string;
  produces: string;
  steps: string[];
  interactive: boolean;
}

export const METHODS_V4: MethodDef[] = [
  { id: "brainstorm", title: "Brainstorming libre", tagline: "Tableau blanc + post-it", icon: "Sparkles", color: "green", est: 45,
    why: "générer un maximum d'idées sans se censurer", produces: "un mur d'idées", cats: ["ideas", "start", "align"],
    steps: ["Lancez la question de départ", "Chacun ajoute ses idées en post-it", "Regroupez, votez et retenez les meilleures"], interactive: true },
  { id: "ishikawa", title: "Ishikawa", tagline: "Causes / effets", icon: "Sliders", color: "violet", est: 75,
    why: "cartographier les causes derrière un effet", produces: "une carte des causes", cats: ["reflect"],
    steps: ["Énoncez l'effet observé", "Classez les causes par catégories", "Identifiez les causes principales"], interactive: true },
  { id: "fivewhys", title: "5 Pourquoi", tagline: "Cause racine", icon: "Target", color: "blue", est: 30,
    why: "creuser jusqu'à la cause racine", produces: "la cause racine", cats: ["reflect", "decide"],
    steps: ["Décrivez le problème", "Demandez « Pourquoi ? » 5 fois", "La dernière réponse révèle la cause racine"], interactive: true },
  { id: "concept", title: "Carte conceptuelle", tagline: "Concepts et liens", icon: "Link", color: "blue", est: 45,
    why: "relier les concepts et révéler leur structure", produces: "une carte des liens", cats: ["study", "align", "stake"],
    steps: ["Posez le concept central", "Ajoutez les concepts liés", "Reliez-les et nommez chaque relation"], interactive: true },
  { id: "functional", title: "Schéma fonctionnel", tagline: "Fonctions et flux", icon: "Grid", color: "green", est: 45,
    why: "décrire les fonctions et la circulation", produces: "un schéma de flux", cats: ["study", "start"],
    steps: ["Listez les fonctions", "Disposez-les en blocs", "Tracez les flux"], interactive: false },
  { id: "logic", title: "Schéma logique", tagline: "Hiérarchie / arbre", icon: "List", color: "amber", est: 30,
    why: "organiser en hiérarchie claire", produces: "un arbre logique", cats: ["study", "decide"],
    steps: ["Partez de la racine", "Décomposez en branches", "Hiérarchisez"], interactive: false },
  { id: "bono", title: "Six Chapeaux de Bono", tagline: "Six angles", icon: "Eye", color: "violet", est: 60,
    why: "examiner sous six angles", produces: "six perspectives", cats: ["decide", "reflect", "ideas"],
    steps: ["Choisissez le sujet", "Portez chaque chapeau", "Synthétisez en décision"], interactive: true },
  { id: "bmc", title: "Business Model Canvas", tagline: "Modèle sur une page", icon: "FileText", color: "blue", est: 60,
    why: "modéliser toute l'activité", produces: "un modèle sur 1 page", cats: ["start", "stake"],
    steps: ["Proposition de valeur", "Remplissez les 9 blocs", "Vérifiez la cohérence"], interactive: true },
];

export const SESSION_METHODS: MethodDef[] = [
  { id: "brainstorming", title: "Brainstorming structuré", tagline: "Colonnes divergent/convergent", icon: "Sparkles", color: "green", est: 45, cats: ["ideas"], why: "", produces: "", steps: [], interactive: true },
  { id: "qqoqcp", title: "QQOQCP", tagline: "6 questions clés", icon: "HelpCircle", color: "blue", est: 45, cats: ["start"], why: "", produces: "", steps: [], interactive: true },
  { id: "swot", title: "SWOT", tagline: "F/S/O/M", icon: "Grid", color: "violet", est: 45, cats: ["reflect"], why: "", produces: "", steps: [], interactive: true },
  { id: "pestel", title: "PESTEL", tagline: "Macro-environnement", icon: "Globe", color: "amber", est: 45, cats: ["reflect"], why: "", produces: "", steps: [], interactive: true },
  { id: "brainwriting", title: "Brainwriting", tagline: "Idéation silencieuse", icon: "Pencil", color: "green", est: 40, cats: ["ideas"], why: "", produces: "", steps: [], interactive: true },
  { id: "bw635", title: "Brainwriting 6-3-5", tagline: "6×3×5", icon: "Users", color: "green", est: 45, cats: ["ideas"], why: "", produces: "", steps: [], interactive: true },
  { id: "scamper", title: "SCAMPER", tagline: "7 leviers créatifs", icon: "Lightbulb", color: "amber", est: 45, cats: ["ideas"], why: "", produces: "", steps: [], interactive: true },
  { id: "5-pourquoi", title: "5 Pourquoi", tagline: "Cause racine", icon: "Target", color: "blue", est: 30, cats: ["reflect"], why: "", produces: "", steps: [], interactive: true },
  { id: "carte-d-empathie", title: "Carte d'empathie", tagline: "Voir, entendre, penser", icon: "Heart", color: "red", est: 50, cats: ["stake"], why: "", produces: "", steps: [], interactive: true },
  { id: "analyse-des-parties-prenantes", title: "Parties prenantes", tagline: "Cartographie acteurs", icon: "Users", color: "blue", est: 45, cats: ["stake"], why: "", produces: "", steps: [], interactive: true },
  { id: "analyse-des-risques", title: "Analyse des risques", tagline: "P×I", icon: "AlertTriangle", color: "red", est: 50, cats: ["reflect"], why: "", produces: "", steps: [], interactive: true },
  { id: "benchmark-concurrentiel", title: "Benchmark", tagline: "Comparaison marché", icon: "BarChart", color: "violet", est: 45, cats: ["study"], why: "", produces: "", steps: [], interactive: true },
  { id: "clarification-du-mandat", title: "Clarification mandat", tagline: "Périmètre", icon: "Clipboard", color: "blue", est: 40, cats: ["start"], why: "", produces: "", steps: [], interactive: true },
  { id: "lean-canvas", title: "Lean Canvas", tagline: "Hypothèses startup", icon: "Layers", color: "amber", est: 50, cats: ["start"], why: "", produces: "", steps: [], interactive: true },
  { id: "matrice-pouvoir-interet", title: "Pouvoir / intérêt", tagline: "Priorisation", icon: "Grid", color: "violet", est: 40, cats: ["stake"], why: "", produces: "", steps: [], interactive: true },
  { id: "objectifs-smart", title: "SMART", tagline: "Objectifs mesurables", icon: "Target", color: "green", est: 35, cats: ["decide"], why: "", produces: "", steps: [], interactive: true },
  { id: "persona", title: "Persona", tagline: "Profil type", icon: "User", color: "blue", est: 45, cats: ["stake"], why: "", produces: "", steps: [], interactive: true },
  { id: "parcours-utilisateur", title: "Parcours utilisateur", tagline: "UX journey", icon: "Route", color: "violet", est: 55, cats: ["stake"], why: "", produces: "", steps: [], interactive: true },
  { id: "value-proposition-canvas", title: "Value Proposition", tagline: "Proposition de valeur", icon: "Sparkles", color: "amber", est: 50, cats: ["start"], why: "", produces: "", steps: [], interactive: true },
  { id: "matrice-impact-effort", title: "Impact / Effort", tagline: "Priorisation", icon: "Grid", color: "green", est: 40, cats: ["decide"], why: "", produces: "", steps: [], interactive: true },
  { id: "moscow", title: "MoSCoW", tagline: "Must/Should/Could/Won't", icon: "List", color: "blue", est: 35, cats: ["decide"], why: "", produces: "", steps: [], interactive: true },
  { id: "start-stop-continue", title: "Start/Stop/Continue", tagline: "Rétro rapide", icon: "RefreshCw", color: "green", est: 30, cats: ["reflect"], why: "", produces: "", steps: [], interactive: true },
  { id: "retrospective-4l", title: "Rétrospective 4L", tagline: "4L", icon: "Heart", color: "violet", est: 40, cats: ["reflect"], why: "", produces: "", steps: [], interactive: true },
  { id: "rice", title: "RICE", tagline: "Scoring priorités", icon: "BarChart", color: "blue", est: 35, cats: ["decide"], why: "", produces: "", steps: [], interactive: true },
  { id: "plan-d-action", title: "Plan d'action", tagline: "Qui/quoi/quand", icon: "CheckSquare", color: "green", est: 30, cats: ["decide"], why: "", produces: "", steps: [], interactive: true },
  { id: "kanban", title: "Kanban", tagline: "Flux visuel", icon: "Columns", color: "blue", est: 45, cats: ["align"], why: "", produces: "", steps: [], interactive: true },
  { id: "scrum-sprint-board", title: "Sprint Board", tagline: "Scrum", icon: "Layout", color: "violet", est: 50, cats: ["align"], why: "", produces: "", steps: [], interactive: true },
  { id: "gantt-simplifie", title: "Gantt", tagline: "Planning", icon: "Calendar", color: "amber", est: 45, cats: ["align"], why: "", produces: "", steps: [], interactive: true },
  { id: "raci", title: "RACI", tagline: "Rôles", icon: "Users", color: "blue", est: 40, cats: ["align"], why: "", produces: "", steps: [], interactive: true },
  { id: "tracabilite", title: "Traçabilité", tagline: "Suivi décisions", icon: "Link", color: "slate", est: 30, cats: ["align"], why: "", produces: "", steps: [], interactive: true },
];

export const ALL_METHODS: MethodDef[] = [
  ...METHODS_V4,
  ...SESSION_METHODS.filter((m) => !METHODS_V4.some((c) => c.id === m.id)),
];

export const METHOD_BY_ID = Object.fromEntries(ALL_METHODS.map((m) => [m.id, m]));

/** Alias mapping for AI recommendations */
export const METHOD_ALIASES: Record<string, string> = {
  brainstorm: "brainstorming",
  fivewhys: "5-pourquoi",
};

export function resolveMethodId(id: string): string {
  return METHOD_ALIASES[id] ?? id;
}

export function getMethodCatalogIds(): string[] {
  return ALL_METHODS.map((m) => m.id);
}

export function recommendMethod(genreCat: string, objective: string) {
  const byCat: Record<string, { main: string; alts: string[] }> = {
    ideas: { main: "brainstorm", alts: ["bono", "concept"] },
    reflect: { main: "ishikawa", alts: ["fivewhys", "concept"] },
    decide: { main: "bono", alts: ["logic", "fivewhys"] },
    start: { main: "bmc", alts: ["concept", "brainstorm"] },
    align: { main: "concept", alts: ["brainstorm", "bono"] },
    stake: { main: "concept", alts: ["bmc", "brainstorm"] },
    study: { main: "concept", alts: ["logic", "functional"] },
  };
  const cat = genreCat || "ideas";
  let reco = byCat[cat] ?? byCat.ideas;
  const o = (objective || "").toLowerCase();
  if (/racine|root/.test(o)) reco = { main: "fivewhys", alts: ["ishikawa", "concept"] };
  else if (/cause|problème|probleme|panne|blocage/.test(o)) reco = { main: "ishikawa", alts: ["fivewhys", "concept"] };
  else if (/mod[èe]le|business|affaires/.test(o)) reco = { main: "bmc", alts: ["concept", "functional"] };
  else if (/d[ée]cid|choisir|prioris/.test(o)) reco = { main: "bono", alts: ["logic", "fivewhys"] };
  else if (/id[ée]e|brainstorm|cr[ée]ati/.test(o)) reco = { main: "brainstorm", alts: ["bono", "concept"] };
  else if (/structur|plan|hiérarch|organis/.test(o)) reco = { main: "logic", alts: ["concept", "functional"] };
  const alts = reco.alts.filter((a) => a !== reco.main).slice(0, 2);
  return { main: reco.main, alts, set: [reco.main, ...alts] };
}

export const METHOD_TABS = [
  { id: "all", label: "Toutes les méthodes" },
  { id: "start", label: "Cadrer" },
  { id: "reflect", label: "Analyser" },
  { id: "study", label: "Structurer" },
  { id: "ideas", label: "Générer" },
  { id: "decide", label: "Prioriser / Décider" },
];

export { SESSION_GENRES, GENRE_BY_ID, genresForMode, fmtMin } from "@/lib/methods/session-genres";

export const IMPLEMENTED_METHOD_IDS = new Set([
  "bono", "bmc", "tracabilite", "raci", "ishikawa", "brainwriting", "bw635", "scamper",
  "qqoqcp", "swot", "pestel", "5-pourquoi", "carte-d-empathie", "analyse-des-parties-prenantes",
  "analyse-des-risques", "benchmark-concurrentiel", "clarification-du-mandat", "lean-canvas",
  "matrice-pouvoir-interet", "objectifs-smart", "persona", "parcours-utilisateur",
  "value-proposition-canvas", "brainstorming", "matrice-impact-effort", "moscow",
  "start-stop-continue", "retrospective-4l", "rice", "plan-d-action", "kanban",
  "scrum-sprint-board", "gantt-simplifie", "brainstorm", "fivewhys", "concept",
]);
