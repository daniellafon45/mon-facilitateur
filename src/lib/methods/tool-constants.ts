export interface LibMember {
  id: string;
  name: string;
  you?: boolean;
  init: string;
  c: string;
}

export interface MeetingRole {
  id: string;
  baseId?: string;
  title: string;
  icon: string;
  member: string | null;
}

export interface RoleLibEntry {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

export const DEFAULT_LIB_MEMBERS: LibMember[] = [
  { id: "me", name: "Vous", you: true, init: "VU", c: "#2563eb" },
  { id: "alex", name: "Alex K.", init: "AK", c: "#059669" },
  { id: "lea", name: "Léa B.", init: "LB", c: "#7c3aed" },
  { id: "marc", name: "Marc D.", init: "MD", c: "#f97316" },
];

export const ROLE_LIBRARY: RoleLibEntry[] = [
  { id: "demandeur", title: "Demandeur", icon: "User", desc: "Demande la rencontre" },
  { id: "responsable", title: "Responsable", icon: "Flag", desc: "Porte le résultat attendu" },
  { id: "facilitateur", title: "Facilitateur", icon: "Sparkle", desc: "Anime la séance" },
  { id: "cofacilitateur", title: "Co-facilitateur", icon: "Handshake", desc: "Assiste l'animation" },
  { id: "minuteur", title: "Gardien du temps", icon: "Clock", desc: "Gère le temps" },
  { id: "secretaire", title: "Secrétaire", icon: "Document", desc: "Produit le compte rendu" },
  { id: "scribe", title: "Scribe", icon: "Pencil", desc: "Prend les notes en direct" },
  { id: "chef", title: "Chef de projet", icon: "Briefcase", desc: "Suit le projet global" },
  { id: "section", title: "Responsable de section", icon: "List", desc: "Prend une partie du livrable" },
  { id: "participant", title: "Participant", icon: "Users", desc: "Contribue, vote, commente" },
];

export const DEFAULT_MEETING_ROLES: MeetingRole[] = [
  { id: "r-fac", baseId: "facilitateur", title: "Facilitateur", icon: "Sparkle", member: "me" },
  { id: "r-scr", baseId: "scribe", title: "Scribe", icon: "Pencil", member: null },
  { id: "r-min", baseId: "minuteur", title: "Gardien du temps", icon: "Clock", member: null },
];

export const RACI_TASKS = [
  { id: "t1", label: "Cadrer le problème & le mandat" },
  { id: "t2", label: "Recherche & analyse des besoins" },
  { id: "t3", label: "Génération d'idées (atelier)" },
  { id: "t4", label: "Sélection de la solution" },
  { id: "t5", label: "Rédaction du rapport" },
  { id: "t6", label: "Présentation finale" },
];

export const RACI_LEGEND = [
  { k: "R", label: "Réalise", desc: "Exécute la tâche", c: "#2563EB", bg: "#EFF6FF" },
  { k: "A", label: "Approuve", desc: "Responsable, valide", c: "#059669", bg: "#ECFDF5" },
  { k: "C", label: "Consulté", desc: "Donne un avis", c: "#D97706", bg: "#FFFBEB" },
  { k: "I", label: "Informé", desc: "Tenu au courant", c: "#64748B", bg: "#F1F5F9" },
];

export const RACI_CYCLE = ["", "R", "A", "C", "I"];

export function createEmptyRaci(memberIds: string[]) {
  const raci: Record<string, Record<string, string>> = {};
  RACI_TASKS.forEach((t) => {
    raci[t.id] = {};
    memberIds.forEach((mid, i) => {
      if (i === 0) raci[t.id][mid] = "A";
      else if (i === 1) raci[t.id][mid] = "R";
    });
  });
  return raci;
}

export const CHARTER_VALUES = [
  { id: "v1", icon: "Heart", c: "#DC2626", label: "Respect & bienveillance" },
  { id: "v2", icon: "Headphones", c: "#2563EB", label: "Écoute active" },
  { id: "v3", icon: "Handshake", c: "#059669", label: "Engagement" },
  { id: "v4", icon: "Eye", c: "#D97706", label: "Transparence" },
  { id: "v5", icon: "Star", c: "#7C3AED", label: "Esprit d'équipe" },
];

export const CHARTER_RULES_INIT = [
  "On se respecte et on valorise chaque idée.",
  "On écoute sans couper la parole.",
  "On arrive préparé et à l'heure.",
  "On communique rapidement les changements.",
  "On assume nos engagements.",
];

export const CHARTER_EXPECT_INIT = [
  { label: "Qualité du travail", level: 2 },
  { label: "Respect des délais", level: 2 },
  { label: "Communication", level: 1 },
  { label: "Implication", level: 2 },
];

export const ALL_CHANNELS = [
  { id: "teams", icon: "Video", label: "Teams" },
  { id: "email", icon: "Mail", label: "Courriel" },
  { id: "mf", icon: "Users", label: "Mon facilitateur" },
  { id: "gcal", icon: "Calendar", label: "Google Agenda" },
];

export interface CommPlanRow {
  id: string;
  icon: string;
  iconBg: string;
  iconC: string;
  title: string;
  desc: string;
  recipient: string;
  freq: string;
  format: string;
  fmtIcon: string;
  who: string;
  date: string;
}

export const COMM_PLAN_INIT: CommPlanRow[] = [
  {
    id: "c1", icon: "Document", iconBg: "#EFF6FF", iconC: "#2563EB",
    title: "Compte rendu de rencontre", desc: "Décisions, actions, suivi",
    recipient: "Équipe projet", freq: "Après chaque rencontre", format: "PDF via email", fmtIcon: "Mail",
    who: "lea", date: "Aujourd'hui",
  },
  {
    id: "c2", icon: "Layers", iconBg: "#ECFDF5", iconC: "#059669",
    title: "Suivi d'avancement", desc: "Statut des tâches & livrables",
    recipient: "Équipe + Client", freq: "Hebdomadaire (ven.)", format: "Tableau de bord", fmtIcon: "Grid",
    who: "alex", date: "Vendredi",
  },
  {
    id: "c3", icon: "Bell", iconBg: "#FFFBEB", iconC: "#D97706",
    title: "Alertes & changements", desc: "Risques, changements, enjeux",
    recipient: "Chef de projet", freq: "En temps réel", format: "Notification", fmtIcon: "Bell",
    who: "marc", date: "En continu",
  },
];

export const RECIPIENT_OPTIONS = ["Équipe projet", "Équipe + Client", "Chef de projet", "Direction", "Tous les participants"];
export const FREQ_OPTIONS = ["Après chaque rencontre", "Hebdomadaire (ven.)", "En temps réel", "À chaque jalon", "Mensuel", "À définir"];
