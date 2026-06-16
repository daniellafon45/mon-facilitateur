export const PIZZA_MAX = 10;
export const PIZZA_MIN_IDEAL = 3;

export const GROUP_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#ec4899",
  "#0f766e",
] as const;

export const GROUP_NAMES = [
  "Groupe A",
  "Groupe B",
  "Groupe C",
  "Groupe D",
  "Groupe E",
  "Groupe F",
] as const;

export const MEMBER_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#db2777",
  "#0f766e",
  "#f59e0b",
  "#8b5cf6",
] as const;

export const ACCESS_ROLES = [
  "Propriétaire",
  "Éditeur",
  "Commentateur",
  "Lecteur",
  "Observateur",
] as const;

export const MEETING_ROLES = [
  "Facilitatrice",
  "Facilitateur",
  "Chef de projet",
  "Scribe",
  "Minuteur",
  "Participante",
  "Observateur",
] as const;

export const WIZARD_DRAFT_PROJECT_ID = "wizard-draft";

export interface EssentialRoleDef {
  id: string;
  icon: "Users" | "Pencil" | "Clock" | "Zap";
  color: string;
  label: string;
  meetingRoleMatch?: string;
}

export const ESSENTIAL_ROLES: EssentialRoleDef[] = [
  { id: "facilitateur", icon: "Users", color: "#7c3aed", label: "Facilitateur", meetingRoleMatch: "Facilitateur" },
  { id: "scribe", icon: "Pencil", color: "#059669", label: "Scribe", meetingRoleMatch: "Scribe" },
  { id: "minuteur", icon: "Clock", color: "#f97316", label: "Minuteur", meetingRoleMatch: "Minuteur" },
  { id: "chef", icon: "Zap", color: "#2563eb", label: "Chef de projet", meetingRoleMatch: "Chef de projet" },
];
