export interface LearnTheme {
  id: string;
  label: string;
  icon: string;
}

export interface LearnStep {
  t: string;
  d: string;
}

export interface LearnMethod {
  id: string;
  kind: "methode" | "outil";
  title: string;
  cat: string;
  theme: string;
  level: string;
  dur: string;
  rating: number;
  color: string;
  icon: string;
  pitch: string;
  forWhat: string;
  when: string[];
  steps: LearnStep[];
  template: string;
  sessionId?: string;
}

export interface LearnModule {
  t: string;
  type: "video" | "lecture" | "exercice" | "methode";
  dur: string;
  vid?: string;
  method?: string;
}

export interface LearnParcours {
  id: string;
  title: string;
  level: string;
  theme: string;
  color: string;
  icon: string;
  dur: string;
  recommended?: boolean;
  desc: string;
  modules: LearnModule[];
}

export interface LearnResource {
  title: string;
  type: string;
  meta: string;
  theme: string;
  isNew?: boolean;
  cat: string;
  catTitle: string;
  icon: string;
  color: string;
}

export const LEARN_THEMES: LearnTheme[] = [
  { id: "creativite", label: "Créativité", icon: "Sparkle" },
  { id: "innovation", label: "Innovation", icon: "Bolt" },
  { id: "design", label: "Design Thinking", icon: "Target" },
  { id: "strategie", label: "Stratégie", icon: "Document" },
  { id: "resolution", label: "Résolution de problèmes", icon: "Search" },
  { id: "collaboration", label: "Collaboration", icon: "Users" },
  { id: "leadership", label: "Leadership", icon: "Star" },
  { id: "facilitation", label: "Facilitation", icon: "Globe" },
];

export const THEME_LABEL: Record<string, string> = Object.fromEntries(
  LEARN_THEMES.map((t) => [t.id, t.label]),
);

export const LEVEL_COLOR: Record<string, string> = {
  Débutant: "#D97706",
  Intermédiaire: "#7C3AED",
  Avancé: "#DC2626",
};

export const LEVEL_BG: Record<string, string> = {
  Débutant: "#FFFBEB",
  Intermédiaire: "#F5F3FF",
  Avancé: "#FEF2F2",
};

export const LEARN_PAL: Record<string, { bg: string; fg: string }> = {
  blue: { bg: "#eff6ff", fg: "#2563eb" },
  green: { bg: "#ecfdf5", fg: "#059669" },
  violet: { bg: "#f5f3ff", fg: "#7c3aed" },
  amber: { bg: "#fffbeb", fg: "#d97706" },
  slate: { bg: "#f1f5f9", fg: "#64748b" },
  red: { bg: "#fef2f2", fg: "#dc2626" },
};

export const LEARN_METHODS: LearnMethod[] = [
  {
    id: "brainstorming", kind: "methode", title: "Brainstorming libre", cat: "Génération",
    theme: "creativite", level: "Débutant", dur: "30 min", rating: 4.8, color: "amber", icon: "Bulb",
    pitch: "Produire un maximum d'idées en groupe, sans filtre.",
    forWhat: "Faire émerger rapidement une grande quantité d'idées sur un sujet, en suspendant le jugement pour libérer la créativité collective.",
    when: ["Démarrer la recherche de solutions", "Sortir d'une impasse créative", "Mobiliser un groupe autour d'un défi"],
    steps: [
      { t: "Cadrer la question", d: "Formuler un défi clair et ouvert (« Comment pourrions-nous… ? »)." },
      { t: "Générer sans juger", d: "Chacun propose, on note tout, aucune idée n'est critiquée." },
      { t: "Rebondir", d: "S'appuyer sur les idées des autres pour aller plus loin." },
      { t: "Regrouper", d: "Classer les idées par thèmes proches." },
      { t: "Retenir", d: "Sélectionner les pistes les plus prometteuses." },
    ],
    template: "Trame de brainstorming",
    sessionId: "brainstorming",
  },
  {
    id: "ishikawa", kind: "methode", title: "Ishikawa", cat: "Analyse",
    theme: "resolution", level: "Intermédiaire", dur: "25 min", rating: 4.7, color: "violet", icon: "Layers",
    pitch: "Structurer les causes d'un problème par familles.",
    forWhat: "Identifier de façon exhaustive les causes possibles d'un problème en les classant par catégories (les 6 M).",
    when: ["Analyser la cause d'un dysfonctionnement", "Préparer un plan d'action correctif", "Éviter les solutions superficielles"],
    steps: [
      { t: "Poser le problème", d: "Décrire l'effet observé en tête de l'arête." },
      { t: "Définir les familles", d: "Méthode, Matière, Matériel, Main-d'œuvre, Milieu, Mesure." },
      { t: "Lister les causes", d: "Pour chaque famille, recenser les causes possibles." },
      { t: "Creuser", d: "Demander « pourquoi » sur les causes majeures." },
      { t: "Prioriser", d: "Repérer les causes racines à traiter en priorité." },
    ],
    template: "Diagramme Ishikawa vierge",
    sessionId: "ishikawa",
  },
  {
    id: "5pourquoi", kind: "methode", title: "5 Pourquoi", cat: "Analyse",
    theme: "resolution", level: "Débutant", dur: "15 min", rating: 4.6, color: "blue", icon: "Search",
    pitch: "Remonter à la cause racine en cinq questions.",
    forWhat: "Atteindre la cause profonde d'un problème en demandant « pourquoi ? » de façon successive jusqu'à la racine.",
    when: ["Aller au-delà du symptôme", "Analyser un incident", "Compléter un Ishikawa"],
    steps: [
      { t: "Énoncer le problème", d: "Décrire le fait constaté, sans interprétation." },
      { t: "Pourquoi ? × 5", d: "Répondre puis re-questionner la réponse précédente." },
      { t: "Vérifier la chaîne", d: "S'assurer que chaque cause explique bien la suivante." },
      { t: "Agir sur la racine", d: "Définir une action sur la cause profonde identifiée." },
    ],
    template: "Grille 5 Pourquoi",
    sessionId: "5-pourquoi",
  },
  {
    id: "carte-conceptuelle", kind: "methode", title: "Carte conceptuelle", cat: "Visualisation",
    theme: "creativite", level: "Débutant", dur: "30 min", rating: 4.5, color: "blue", icon: "Map",
    pitch: "Relier les concepts d'un sujet pour le clarifier.",
    forWhat: "Représenter visuellement les notions clés d'un sujet et les liens qui les unissent, pour structurer la pensée collective.",
    when: ["Explorer un sujet complexe", "Aligner une équipe sur un vocabulaire", "Préparer une synthèse"],
    steps: [
      { t: "Poser le concept central", d: "Placer l'idée principale au centre." },
      { t: "Ajouter les concepts liés", d: "Rattacher les notions associées autour." },
      { t: "Nommer les liens", d: "Étiqueter chaque relation (« entraîne », « comprend »…)." },
      { t: "Hiérarchiser", d: "Organiser du général au particulier." },
    ],
    template: "Canevas de carte conceptuelle",
    sessionId: "concept",
  },
  {
    id: "schema-fonctionnel", kind: "methode", title: "Schéma fonctionnel", cat: "Modélisation",
    theme: "strategie", level: "Intermédiaire", dur: "35 min", rating: 4.4, color: "green", icon: "Layers",
    pitch: "Représenter les fonctions d'un système et leurs flux.",
    forWhat: "Décrire ce que fait un système — ses fonctions et les flux entre elles — indépendamment de la manière dont elles sont réalisées.",
    when: ["Cadrer un produit ou service", "Aligner les parties prenantes", "Préparer une conception"],
    steps: [
      { t: "Délimiter le système", d: "Tracer la frontière et l'environnement." },
      { t: "Lister les fonctions", d: "Identifier les fonctions principales et de support." },
      { t: "Relier par les flux", d: "Représenter matières, énergies, informations." },
      { t: "Valider", d: "Vérifier la cohérence avec les besoins." },
    ],
    template: "Modèle de schéma fonctionnel",
    sessionId: "functional",
  },
  {
    id: "schema-logique", kind: "methode", title: "Schéma logique", cat: "Modélisation",
    theme: "strategie", level: "Intermédiaire", dur: "35 min", rating: 4.4, color: "green", icon: "Grid",
    pitch: "Lier ressources, activités, résultats et impacts.",
    forWhat: "Rendre explicite la logique d'un projet : comment les ressources et activités produisent des résultats puis des impacts.",
    when: ["Cadrer un projet", "Préparer une évaluation", "Convaincre un financeur"],
    steps: [
      { t: "Définir l'impact visé", d: "Le changement de long terme recherché." },
      { t: "Décliner les résultats", d: "Les effets attendus à court et moyen terme." },
      { t: "Lister activités & ressources", d: "Ce qu'on fait et ce qu'on mobilise." },
      { t: "Vérifier la chaîne", d: "S'assurer de la logique « si… alors »." },
    ],
    template: "Modèle logique",
    sessionId: "logic",
  },
  {
    id: "six-chapeaux", kind: "methode", title: "Six Chapeaux de Bono", cat: "Décision",
    theme: "collaboration", level: "Intermédiaire", dur: "40 min", rating: 4.7, color: "violet", icon: "Hat",
    pitch: "Examiner un sujet sous six angles complémentaires.",
    forWhat: "Structurer une réflexion de groupe en explorant tour à tour six modes de pensée, pour une analyse complète et apaisée.",
    when: ["Décider en équipe", "Dépasser les blocages d'opinion", "Évaluer une idée à 360°"],
    steps: [
      { t: "Blanc — les faits", d: "Recenser les données objectives disponibles." },
      { t: "Rouge — les émotions", d: "Exprimer ressentis et intuitions sans justification." },
      { t: "Noir — les risques", d: "Identifier les dangers et points faibles." },
      { t: "Jaune — les bénéfices", d: "Mettre en avant les avantages et opportunités." },
      { t: "Vert — la créativité", d: "Générer des alternatives et des idées neuves." },
      { t: "Bleu — le pilotage", d: "Organiser la réflexion et conclure." },
    ],
    template: "Trame Six Chapeaux",
    sessionId: "bono",
  },
  {
    id: "bmc", kind: "methode", title: "Business Model Canvas", cat: "Stratégie",
    theme: "innovation", level: "Avancé", dur: "45 min", rating: 4.9, color: "blue", icon: "Grid",
    pitch: "Décrire un modèle d'affaires sur 9 blocs clés.",
    forWhat: "Représenter sur une seule page la logique économique d'une organisation à travers neuf blocs interdépendants.",
    when: ["Concevoir un nouveau service", "Aligner une équipe sur le modèle", "Préparer un pitch"],
    steps: [
      { t: "Segments de clientèle", d: "À qui s'adresse-t-on ?" },
      { t: "Proposition de valeur", d: "Quel problème résout-on, quelle valeur apporte-t-on ?" },
      { t: "Canaux & relations", d: "Comment atteindre et fidéliser les clients ?" },
      { t: "Revenus & coûts", d: "Comment gagne-t-on de l'argent, qu'est-ce qui coûte ?" },
      { t: "Ressources, activités, partenaires", d: "Ce qu'il faut pour délivrer la valeur." },
    ],
    template: "Canevas Business Model",
    sessionId: "bmc",
  },
  {
    id: "raci", kind: "outil", title: "RACI", cat: "Outil",
    theme: "leadership", level: "Débutant", dur: "20 min", rating: 4.6, color: "blue", icon: "Sliders",
    pitch: "Clarifier qui fait quoi sur chaque tâche.",
    forWhat: "Attribuer pour chaque tâche un rôle clair : Réalise, Approuve, est Consulté ou Informé pour éviter les zones grises.",
    when: ["Lancer un projet d'équipe", "Clarifier des responsabilités floues", "Réduire les frictions"],
    steps: [
      { t: "Lister les tâches", d: "En lignes du tableau." },
      { t: "Lister les acteurs", d: "En colonnes du tableau." },
      { t: "Attribuer R/A/C/I", d: "Un seul « A » par tâche." },
      { t: "Valider", d: "Vérifier l'équilibre et lever les conflits." },
    ],
    template: "Matrice RACI vierge",
    sessionId: "raci",
  },
  {
    id: "gantt", kind: "outil", title: "Gantt simplifié", cat: "Outil",
    theme: "facilitation", level: "Débutant", dur: "25 min", rating: 4.5, color: "blue", icon: "Grid",
    pitch: "Planifier les phases d'un projet dans le temps.",
    forWhat: "Visualiser les phases d'un projet sous forme de barres temporelles pour suivre l'enchaînement et les échéances.",
    when: ["Planifier un projet", "Coordonner plusieurs phases", "Suivre l'avancement"],
    steps: [
      { t: "Découper en phases", d: "Identifier les grandes étapes." },
      { t: "Estimer les durées", d: "Début et fin de chaque phase." },
      { t: "Placer les barres", d: "Sur une frise temporelle." },
      { t: "Marquer les jalons", d: "Repérer les points de validation." },
    ],
    template: "Gantt simplifié",
    sessionId: "gantt-simplifie",
  },
  {
    id: "risques", kind: "outil", title: "Matrice des risques", cat: "Outil",
    theme: "resolution", level: "Intermédiaire", dur: "25 min", rating: 4.5, color: "amber", icon: "Sliders",
    pitch: "Évaluer les risques par probabilité et impact.",
    forWhat: "Positionner les risques d'un projet selon leur probabilité et leur impact, pour prioriser les mesures de mitigation.",
    when: ["Cadrer un projet", "Préparer un plan de mitigation", "Présenter à un comité"],
    steps: [
      { t: "Recenser les risques", d: "Lister les événements redoutés." },
      { t: "Coter", d: "Probabilité × impact pour chacun." },
      { t: "Positionner", d: "Placer sur la matrice 3×3 ou 5×5." },
      { t: "Mitiger", d: "Définir une action pour les risques majeurs." },
    ],
    template: "Matrice probabilité / impact",
    sessionId: "analyse-des-risques",
  },
];

export const LEARN_METHOD_BY_ID: Record<string, LearnMethod> = Object.fromEntries(
  LEARN_METHODS.map((m) => [m.id, m]),
);

export const LEARN_PARCOURS: LearnParcours[] = [
  {
    id: "p1", title: "De l'idée à la solution", level: "Débutant", theme: "creativite",
    color: "amber", icon: "Bolt", dur: "2h30", recommended: true,
    desc: "Transformez vos idées en solutions concrètes et désirables.",
    modules: [
      { t: "Poser le bon problème", type: "lecture", dur: "12 min" },
      { t: "Diverger : générer des idées", type: "video", dur: "18 min", vid: "H0_yKBitO8M" },
      { t: "Atelier : brainstorming libre", type: "methode", dur: "30 min", method: "brainstorming" },
      { t: "Converger : trier et choisir", type: "lecture", dur: "15 min" },
      { t: "Prototyper une solution", type: "exercice", dur: "25 min" },
      { t: "Pitcher son idée", type: "video", dur: "16 min", vid: "5kPP07jY_rQ" },
    ],
  },
  {
    id: "p2", title: "Innover avec impact", level: "Intermédiaire", theme: "innovation",
    color: "green", icon: "Sparkle", dur: "3h45", recommended: true,
    desc: "Les méthodes clés pour innover de façon structurée et efficace.",
    modules: [
      { t: "Qu'est-ce que l'innovation ?", type: "lecture", dur: "14 min" },
      { t: "Comprendre les besoins", type: "exercice", dur: "30 min" },
      { t: "Business Model Canvas", type: "methode", dur: "45 min", method: "bmc" },
      { t: "Tester ses hypothèses", type: "lecture", dur: "20 min" },
      { t: "Mesurer l'impact", type: "lecture", dur: "18 min" },
      { t: "Itérer", type: "exercice", dur: "25 min" },
      { t: "Présenter à un comité", type: "video", dur: "16 min", vid: "PwEp0kUNW5o" },
      { t: "Synthèse du parcours", type: "lecture", dur: "10 min" },
    ],
  },
  {
    id: "p3", title: "Ateliers créatifs efficaces", level: "Intermédiaire", theme: "facilitation",
    color: "violet", icon: "Users", dur: "2h15", recommended: true,
    desc: "Animez des ateliers qui libèrent la créativité et engagent les équipes.",
    modules: [
      { t: "Concevoir le déroulé", type: "lecture", dur: "15 min" },
      { t: "Ouvrir et créer le climat", type: "video", dur: "16 min", vid: "PwEp0kUNW5o" },
      { t: "Six Chapeaux de Bono", type: "methode", dur: "40 min", method: "six-chapeaux" },
      { t: "Gérer l'énergie du groupe", type: "lecture", dur: "14 min" },
      { t: "Clôturer et restituer", type: "exercice", dur: "20 min" },
    ],
  },
  {
    id: "p4", title: "Résoudre des problèmes complexes", level: "Avancé", theme: "resolution",
    color: "blue", icon: "Target", dur: "2h30", recommended: true,
    desc: "Analyser et résoudre des problèmes complexes avec méthode.",
    modules: [
      { t: "Cadrer le problème", type: "lecture", dur: "16 min" },
      { t: "5 Pourquoi", type: "methode", dur: "15 min", method: "5pourquoi" },
      { t: "Ishikawa : causes-effets", type: "methode", dur: "25 min", method: "ishikawa" },
      { t: "Évaluer les risques", type: "methode", dur: "25 min", method: "risques" },
      { t: "Décider et planifier", type: "exercice", dur: "30 min" },
    ],
  },
  {
    id: "p5", title: "Les fondamentaux du Design Thinking", level: "Débutant", theme: "design",
    color: "blue", icon: "Target", dur: "2h45",
    desc: "Une approche centrée utilisateur, en cinq étapes.",
    modules: [
      { t: "Le Design Thinking en 6 min", type: "video", dur: "7 min", vid: "H0_yKBitO8M" },
      { t: "Empathie : comprendre l'utilisateur", type: "lecture", dur: "18 min" },
      { t: "Définir le problème", type: "exercice", dur: "25 min" },
      { t: "Idéer : carte conceptuelle", type: "methode", dur: "30 min", method: "carte-conceptuelle" },
      { t: "Prototyper", type: "lecture", dur: "20 min" },
      { t: "Tester", type: "exercice", dur: "25 min" },
    ],
  },
  {
    id: "p6", title: "Faciliter avec aisance", level: "Intermédiaire", theme: "facilitation",
    color: "violet", icon: "Globe", dur: "3h00",
    desc: "Les postures et réflexes d'un·e facilitateur·rice serein·e.",
    modules: [
      { t: "La posture du facilitateur", type: "video", dur: "16 min", vid: "5kPP07jY_rQ" },
      { t: "Préparer sa séance", type: "lecture", dur: "18 min" },
      { t: "Cadrer et contractualiser", type: "lecture", dur: "14 min" },
      { t: "Gérer les tensions", type: "lecture", dur: "20 min" },
      { t: "Faire émerger la décision", type: "methode", dur: "40 min", method: "six-chapeaux" },
      { t: "Clarifier les rôles : RACI", type: "methode", dur: "20 min", method: "raci" },
      { t: "Restituer et conclure", type: "exercice", dur: "22 min" },
    ],
  },
];

export const PARCOURS_BY_ID: Record<string, LearnParcours> = Object.fromEntries(
  LEARN_PARCOURS.map((p) => [p.id, p]),
);

export const MODULE_TYPE: Record<string, { label: string; icon: string; color: string }> = {
  video: { label: "Vidéo", icon: "Video", color: "blue" },
  lecture: { label: "Lecture", icon: "Document", color: "slate" },
  exercice: { label: "Exercice", icon: "Pencil", color: "green" },
  methode: { label: "Méthode", icon: "Bulb", color: "amber" },
};

export const RESOURCE_CATS = [
  {
    id: "creativite", title: "Méthodes de créativité", icon: "Sparkle", color: "amber",
    desc: "Techniques pour générer des idées",
    items: [
      { title: "Animer un brainstorming qui marche", type: "Guide", meta: "8 min", theme: "creativite", isNew: true },
      { title: "10 déclencheurs d'idées", type: "Article", meta: "5 min", theme: "creativite" },
      { title: "Trame d'atelier d'idéation", type: "Template", meta: "PDF", theme: "creativite" },
      { title: "Stimuler la créativité en équipe", type: "Guide", meta: "10 min", theme: "creativite", isNew: true },
    ],
  },
  {
    id: "innovation", title: "Innovation & design thinking", icon: "Target", color: "blue",
    desc: "Approches centrées utilisateur",
    items: [
      { title: "Le Design Thinking en 5 étapes", type: "Guide", meta: "12 min", theme: "design" },
      { title: "Construire un Business Model Canvas", type: "Guide", meta: "9 min", theme: "innovation" },
      { title: "Carte d'empathie : mode d'emploi", type: "Article", meta: "6 min", theme: "design" },
      { title: "Du prototype au test utilisateur", type: "Article", meta: "7 min", theme: "innovation" },
    ],
  },
  {
    id: "outils", title: "Outils & templates", icon: "Document", color: "violet",
    desc: "Fiches, canevas et supports prêts à l'emploi",
    items: [
      { title: "Canevas Business Model (vierge)", type: "Template", meta: "PDF", theme: "innovation" },
      { title: "Matrice RACI (vierge)", type: "Template", meta: "PDF", theme: "leadership" },
      { title: "3 nouveaux templates d'atelier", type: "Template", meta: "ZIP", theme: "facilitation", isNew: true },
      { title: "Grille 5 Pourquoi", type: "Template", meta: "PDF", theme: "resolution" },
    ],
  },
  {
    id: "guides", title: "Guides pratiques", icon: "BookOpen", color: "green",
    desc: "Conseils et bonnes pratiques",
    items: [
      { title: "Préparer une séance en 30 minutes", type: "Guide", meta: "8 min", theme: "facilitation" },
      { title: "Gérer un groupe difficile", type: "Guide", meta: "11 min", theme: "facilitation" },
      { title: "Clôturer une rencontre efficacement", type: "Article", meta: "5 min", theme: "facilitation" },
      { title: "Réussir une rétrospective", type: "Guide", meta: "9 min", theme: "collaboration" },
    ],
  },
];

export const ALL_RESOURCES: LearnResource[] = RESOURCE_CATS.flatMap((c) =>
  c.items.map((it) => ({
    ...it,
    cat: c.id,
    catTitle: c.title,
    icon: c.icon,
    color: c.color,
  })),
);

export const LEARN_NEWS = [
  { icon: "Document", color: "blue", text: "Nouveau guide : Stimuler la créativité en équipe", date: "2026-06-05", res: "Stimuler la créativité en équipe" },
  { icon: "Document", color: "green", text: "Ajout de 3 nouveaux templates d'atelier d'innovation", date: "2026-06-02", res: "3 nouveaux templates d'atelier" },
  { icon: "Sparkle", color: "amber", text: "Méthode mise à jour : Brainstorming libre", date: "2026-05-28", method: "brainstorming" },
];

export const LEARN_CHANNELS = [
  { name: "AJ&Smart", handle: "@AJSmart", url: "https://www.youtube.com/@AJSmart", desc: "Design sprints & facilitation d'ateliers", c: "#2563eb", init: "AJ" },
  { name: "Chad Littlefield", handle: "@ChadLittlefield", url: "https://www.youtube.com/@ChadLittlefield", desc: "Questions puissantes & engagement", c: "#7c3aed", init: "CL" },
  { name: "SessionLab", handle: "@SessionLab", url: "https://www.youtube.com/@SessionLab", desc: "Méthodes et design de workshops", c: "#059669", init: "SL" },
];

export const LEARN_VIDEOS = [
  { vid: "H0_yKBitO8M", title: "Construire une tour, bâtir une équipe", channel: "TED · Tom Wujec", dur: "6:51" },
  { vid: "5kPP07jY_rQ", title: "Les 8 compétences d'un grand facilitateur", channel: "AJ&Smart", dur: "16:10" },
  { vid: "PwEp0kUNW5o", title: "Top 5 des compétences de facilitation", channel: "Chad Littlefield", dur: "16:27" },
  { vid: "-cWV1Vg8cTs", title: "Faciliter un atelier : les fondamentaux", channel: "Facilitation", dur: "" },
];

export function createInitialProgress(): Record<string, boolean[]> {
  const map: Record<string, boolean[]> = {};
  LEARN_PARCOURS.forEach((p) => {
    map[p.id] = p.modules.map(() => false);
  });
  if (map.p1) map.p1[0] = map.p1[1] = map.p1[2] = true;
  if (map.p5) map.p5[0] = map.p5[1] = true;
  return map;
}
