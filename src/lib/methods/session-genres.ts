import type { SessionMode } from "@/types/facilitation";

export type GenreBand = "short" | "medium" | "long" | "extended";

export interface SessionGenre {
  id: string;
  mode: SessionMode;
  band: GenreBand;
  cats: string[];
  icon: string;
  color: string;
  title: string;
  dur: string;
  idealMin: number;
  desc: string;
  use: string[];
  reco?: boolean;
}

export const GENRE_THEMES = [
  { id: "all", label: "Tous" },
  { id: "start", label: "Démarrer un projet" },
  { id: "ideas", label: "Produire des idées" },
  { id: "decide", label: "Suivre et décider" },
  { id: "align", label: "S'aligner et informer" },
  { id: "study", label: "Étudier et approfondir" },
  { id: "reflect", label: "Réfléchir et analyser" },
  { id: "stake", label: "Avec parties prenantes" },
] as const;

export const GENRE_BANDS = [
  { id: "short" as const, label: "Courtes", color: "#059669" },
  { id: "medium" as const, label: "Moyennes", color: "#2563eb" },
  { id: "long" as const, label: "Longues", color: "#7c3aed" },
  { id: "extended" as const, label: "Étendues", color: "#d97706" },
];

export const BAND_RANGE: Record<SessionMode, Record<GenreBand, string>> = {
  solo: { short: "≤ 45 min", medium: "45 min – 2 h", long: "2 h – 1 jour", extended: "Au long cours" },
  equipe: { short: "≤ 45 min", medium: "45 min – 2 h", long: "2 h – 1 jour", extended: "Plusieurs jours" },
  atelier: { short: "≤ 45 min", medium: "45 min – 2 h", long: "2 h – 1 jour", extended: "Plusieurs jours" },
};

export const GENRE_PAL: Record<string, string> = {
  blue: "#2563eb", green: "#059669", violet: "#7c3aed", amber: "#d97706", slate: "#64748b",
};
export const GENRE_PAL_BG: Record<string, string> = {
  blue: "#eff6ff", green: "#ecfdf5", violet: "#f5f3ff", amber: "#fffbeb", slate: "#f8fafc",
};

export const SESSION_GENRES: SessionGenre[] = [
  { id: "s_capture", mode: "solo", band: "short", cats: ["ideas"], icon: "Bolt", color: "amber", title: "Capture d'idées", dur: "10 – 15 min", idealMin: 15, desc: "Vider sa tête : noter rapidement tout ce qui vient, sans filtrer.", use: ["Saisir une intuition avant qu'elle s'échappe.", "Préparer une réflexion plus longue."] },
  { id: "s_clarifier", mode: "solo", band: "short", cats: ["decide"], icon: "Check", color: "blue", title: "Clarifier une décision", dur: "15 – 30 min", idealMin: 25, desc: "Poser les options, peser le pour et le contre, trancher.", use: ["Sortir d'une hésitation.", "Documenter le raisonnement derrière un choix."] },
  { id: "s_brainstorm", mode: "solo", band: "short", cats: ["ideas"], icon: "Sparkle", color: "green", title: "Brainstorming solo", dur: "30 – 45 min", idealMin: 45, desc: "Générer un maximum d'idées seul, l'IA comme partenaire de rebond.", use: ["Explorer un sujet en largeur.", "Alimenter une séance d'équipe à venir."] },
  { id: "s_structurer", mode: "solo", band: "medium", cats: ["start"], icon: "Document", color: "blue", title: "Structurer un document / plan", dur: "45 – 90 min", idealMin: 75, desc: "Donner une ossature claire à un livrable : plan, sections, messages.", use: ["Démarrer un rapport ou une présentation.", "Transformer des notes en plan."] },
  { id: "s_probleme", mode: "solo", band: "medium", cats: ["reflect"], icon: "Target", color: "violet", title: "Résolution de problème", dur: "60 – 90 min", idealMin: 75, desc: "Analyser une situation bloquée et identifier des pistes d'action.", use: ["Comprendre une cause.", "Sortir d'un blocage personnel ou de projet."] },
  { id: "s_ecriture", mode: "solo", band: "long", cats: ["study"], icon: "Pencil", color: "blue", title: "Session d'écriture / création", dur: "2 – 3 h", idealMin: 150, desc: "Un bloc profond et protégé pour écrire, créer, produire.", use: ["Avancer un chapitre, un script, un design.", "Entrer en concentration durable."] },
  { id: "s_reflexion", mode: "solo", band: "long", cats: ["reflect"], icon: "Eye", color: "violet", title: "Atelier de réflexion personnelle", dur: "2 – 3 h", idealMin: 150, desc: "Prendre du recul sur un sujet large : vision, priorités, bilan.", use: ["Clarifier une direction.", "Faire le point sur un projet ou un parcours."] },
  { id: "s_projet", mode: "solo", band: "extended", cats: ["study"], icon: "Calendar", color: "amber", title: "Projet perso au long cours", dur: "Libre", idealMin: 0, desc: "Un espace ouvert que vous reprenez au fil du temps, à votre rythme.", use: ["Faire mûrir un projet sur des semaines.", "Capitaliser idées et avancées."] },
  { id: "e_daily", mode: "equipe", band: "short", cats: ["align"], icon: "Bolt", color: "green", title: "Daily stand-up", dur: "15 min", idealMin: 15, desc: "Synchronisation éclair : hier, aujourd'hui, blocages.", use: ["Garder l'équipe alignée chaque jour.", "Faire remonter vite les obstacles."] },
  { id: "e_avancement", mode: "equipe", band: "short", cats: ["decide"], icon: "Target", color: "blue", title: "Point d'avancement", dur: "20 min", idealMin: 20, desc: "Faire le tour des sujets en cours et des prochaines étapes.", use: ["Suivre l'avancement.", "Réajuster les priorités."] },
  { id: "e_valid", mode: "equipe", band: "short", cats: ["decide"], icon: "Check", color: "violet", title: "Validation / décision rapide", dur: "15 – 30 min", idealMin: 25, desc: "Trancher un point précis et acter la décision.", use: ["Débloquer un choix.", "Confirmer une action immédiate."] },
  { id: "e_reunion", mode: "equipe", band: "short", cats: ["align"], icon: "Users", color: "blue", title: "Réunion d'équipe", dur: "30 – 45 min", idealMin: 40, desc: "Coordination régulière : informations, sujets ouverts, suites.", use: ["Aligner toute l'équipe.", "Partager le contexte."] },
  { id: "e_kickoff", mode: "equipe", band: "medium", cats: ["start"], icon: "Sparkle", color: "blue", title: "Kick-off de projet", dur: "45 – 60 min", idealMin: 60, reco: true, desc: "Lancer le projet : objectifs, rôles, périmètre, premières actions.", use: ["Démarrer du bon pied.", "Aligner l'équipe et les attentes."] },
  { id: "e_brainstorm", mode: "equipe", band: "medium", cats: ["ideas"], icon: "Sparkle", color: "green", title: "Brainstorming d'équipe", dur: "45 – 60 min", idealMin: 55, desc: "Générer collectivement un maximum d'idées avant de converger.", use: ["Explorer des solutions.", "Mobiliser l'intelligence collective."] },
  { id: "e_retro", mode: "equipe", band: "medium", cats: ["reflect"], icon: "Arrow", color: "green", title: "Rétrospective", dur: "45 – 60 min", idealMin: 55, desc: "Analyser ce qui a marché, ce qui coince, ce qu'on améliore.", use: ["Apprendre d'un cycle.", "Décider d'actions d'amélioration."] },
  { id: "e_cadrage", mode: "equipe", band: "medium", cats: ["start"], icon: "Document", color: "violet", title: "Atelier de cadrage", dur: "1 h", idealMin: 60, desc: "Définir le périmètre, les objectifs, les livrables et critères.", use: ["Clarifier un mandat.", "Éviter les malentendus de départ."] },
  { id: "e_probleme", mode: "equipe", band: "medium", cats: ["reflect"], icon: "Target", color: "blue", title: "Résolution de problème", dur: "1 h – 1 h 30", idealMin: 75, desc: "Comprendre une cause racine et construire des solutions ensemble.", use: ["Débloquer une situation.", "Aligner sur un plan d'action."] },
  { id: "e_decision", mode: "equipe", band: "medium", cats: ["decide"], icon: "Check", color: "violet", title: "Atelier de décision", dur: "1 h 30 – 2 h", idealMin: 105, desc: "Évaluer des options structurées et arrêter une décision partagée.", use: ["Choisir entre plusieurs scénarios.", "Obtenir l'adhésion."] },
  { id: "e_parties", mode: "equipe", band: "medium", cats: ["stake", "align"], icon: "Handshake", color: "amber", title: "Rencontre avec les parties prenantes", dur: "45 – 90 min", idealMin: 75, desc: "Informer, recueillir les besoins ou gérer les attentes des parties prenantes.", use: ["Aligner les attentes externes.", "Recueillir besoins et préoccupations."] },
  { id: "e_travail", mode: "equipe", band: "long", cats: ["ideas"], icon: "Briefcase", color: "green", title: "Atelier de travail", dur: "2 – 3 h", idealMin: 150, desc: "Produire ensemble un livrable concret en profondeur.", use: ["Avancer significativement sur un sujet.", "Co-construire un résultat."] },
  { id: "a_priorisation", mode: "atelier", band: "long", cats: ["decide"], icon: "Target", color: "blue", title: "Priorisation collective", dur: "2 h", idealMin: 120, desc: "Faire converger plusieurs groupes vers des priorités communes.", use: ["Trier et hiérarchiser à grande échelle.", "Aligner de nombreux participants."] },
  { id: "a_cocreation", mode: "atelier", band: "long", cats: ["ideas"], icon: "Heart", color: "amber", title: "Co-création", dur: "2 – 3 h", idealMin: 150, desc: "Construire une solution à plusieurs mains, en sous-groupes.", use: ["Mobiliser des perspectives variées.", "Produire des prototypes d'idées."] },
  { id: "a_ideation", mode: "atelier", band: "long", cats: ["ideas"], icon: "Sparkle", color: "green", title: "Idéation à grande échelle", dur: "2 – 3 h", idealMin: 150, desc: "Générer un grand volume d'idées via des sous-groupes orchestrés.", use: ["Explorer largement un problème.", "Synthétiser en plénière."] },
  { id: "a_designthink", mode: "atelier", band: "long", cats: ["ideas"], icon: "Eye", color: "violet", title: "Design thinking", dur: "3 h", idealMin: 180, desc: "Empathie, idéation, prototype : un parcours centré utilisateur.", use: ["Résoudre un problème d'expérience.", "Faire émerger des concepts testables."] },
  { id: "a_hackathon", mode: "atelier", band: "long", cats: ["ideas"], icon: "Bolt", color: "amber", title: "Hackathon", dur: "3 – 6 h / journée", idealMin: 300, desc: "Créer et prototyper intensément en équipes, contre la montre.", use: ["Produire des prototypes concrets.", "Stimuler l'énergie collective."] },
  { id: "a_sprint", mode: "atelier", band: "long", cats: ["start"], icon: "Calendar", color: "blue", title: "Design sprint", dur: "Journée", idealMin: 420, desc: "Un format cadencé pour passer d'un problème à une solution testée.", use: ["Avancer vite et structuré.", "Aligner et décider en une journée."] },
  { id: "a_worldcafe", mode: "atelier", band: "long", cats: ["stake"], icon: "Users", color: "violet", title: "World café", dur: "Demi-journée", idealMin: 240, desc: "Conversations tournantes en petits groupes autour de questions clés.", use: ["Faire participer un large public.", "Récolter une diversité de points de vue."] },
  { id: "a_strategie", mode: "atelier", band: "long", cats: ["reflect"], icon: "Target", color: "blue", title: "Planification stratégique", dur: "Demi-journée", idealMin: 240, desc: "Définir vision, enjeux et priorités avec l'ensemble des parties.", use: ["Aligner sur une direction.", "Construire une feuille de route."] },
  { id: "a_bootcamp", mode: "atelier", band: "extended", cats: ["study"], icon: "Globe", color: "green", title: "Sprint pluri-jours / bootcamp", dur: "1 jour +", idealMin: 0, desc: "Un programme immersif sur plusieurs jours, multi-salles.", use: ["Mener un projet d'ampleur.", "Former et produire en profondeur."] },
];

export const GENRE_BY_ID = Object.fromEntries(SESSION_GENRES.map((g) => [g.id, g])) as Record<string, SessionGenre>;

export function fmtMin(m: number): string {
  if (!m || m <= 0) return "Libre";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r}` : `${h} h`;
}

export function adjustDurationOptions(idealMin: number): number[] {
  if (!idealMin || idealMin <= 0) return [];
  const round5 = (x: number) => Math.max(5, Math.round(x / 5) * 5);
  const set = [round5(idealMin * 0.5), round5(idealMin * 0.75), idealMin];
  return [...new Set(set)].sort((a, b) => a - b);
}

export function genresForMode(mode: SessionMode) {
  return SESSION_GENRES.filter((g) => g.mode === mode);
}

export function visibleGenreBands(mode: SessionMode, theme: string) {
  const modeGenres = genresForMode(mode);
  return GENRE_BANDS.map((b) => ({
    ...b,
    range: BAND_RANGE[mode][b.id],
    genres: modeGenres.filter(
      (g) => g.band === b.id && (theme === "all" || g.cats.includes(theme)),
    ),
  })).filter((b) => b.genres.length > 0);
}

export function presentGenreThemes(mode: SessionMode) {
  const cats = new Set(genresForMode(mode).flatMap((g) => g.cats));
  return GENRE_THEMES.filter((t) => t.id === "all" || cats.has(t.id));
}
