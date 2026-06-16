export const SESSION_RAIL_ITEMS = [
  { id: "tableau", icon: "Pencil", label: "Tableau blanc" },
  { id: "methodes", icon: "Grid", label: "Méthodes" },
  { id: "seance", icon: "Calendar", label: "Séance" },
  { id: "participants", icon: "Users", label: "Participants" },
  { id: "discussion", icon: "MessageSquare", label: "Discussion" },
  { id: "documents", icon: "FileText", label: "Documents" },
  { id: "notes", icon: "List", label: "Notes" },
  { id: "minuteur", icon: "Clock", label: "Minuteur" },
  { id: "votes", icon: "Vote", label: "Journal" },
] as const;

export type SessionRailId = (typeof SESSION_RAIL_ITEMS)[number]["id"];

export const PERSONAL_TOOLS = [
  { id: "chatgpt", label: "ChatGPT", url: "https://chat.openai.com", color: "#059669" },
  { id: "claude", label: "Claude", url: "https://claude.ai", color: "#D97706" },
  { id: "canva", label: "Canva", url: "https://canva.com", color: "#7C3AED" },
  { id: "figma", label: "Figma", url: "https://figma.com", color: "#F24E1E" },
  { id: "docs", label: "Google Docs", url: "https://docs.google.com", color: "#4285F4" },
];

export const QUICK_TOOLS = [
  { id: "vote", label: "Vote & sondage", icon: "Vote" },
  { id: "desaccord", label: "Point de désaccord", icon: "Bolt" },
  { id: "reflexion", label: "Pousser la réflexion", icon: "Sparkle" },
  { id: "probleme", label: "Résoudre le problème", icon: "Target" },
  { id: "minuteur", label: "Minuteur", icon: "Clock" },
  { id: "parking", label: "Parking lot", icon: "Stop" },
] as const;

export const PROJECT_TOOLS = [
  { id: "gantt", label: "Gantt" },
  { id: "raci", label: "RACI" },
  { id: "charte", label: "Charte d'équipe" },
  { id: "comms", label: "Plan de comm." },
  { id: "suppliers", label: "Fournisseurs" },
  { id: "stakeholders", label: "Parties prenantes" },
] as const;

export const FACILITATOR_TIPS = [
  { icon: "Sparkle", color: "#2563eb", title: "Gardez le rythme", desc: "Une question à la fois, notez sans juger." },
  { icon: "Users", color: "#059669", title: "Incluez tout le monde", desc: "Tour de table ou écrit silencieux avant débat." },
  { icon: "Clock", color: "#d97706", title: "Timeboxez", desc: "Annoncez la durée avant chaque étape." },
];
