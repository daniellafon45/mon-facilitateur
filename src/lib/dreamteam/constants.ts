export const DT_AVATAR_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#059669",
  "#f97316",
  "#ec4899",
  "#0f766e",
  "#d97706",
  "#e11d48",
  "#8b5cf6",
  "#0ea5e9",
];

export const DT_ROLES = [
  "Sans rôle",
  "Facilitateur",
  "Chef de projet",
  "Scribe",
  "Minuteur",
  "Décideur",
  "Participant",
  "Observateur",
  "Collaborateur",
] as const;

export type DreamTeamRole = (typeof DT_ROLES)[number];

export const KANBAN_COLUMNS = [
  { id: "todo" as const, title: "To do", labelFr: "À inviter" },
  { id: "in_progress" as const, title: "In progress", labelFr: "En attente" },
  { id: "done" as const, title: "Done", labelFr: "Confirmé" },
];

export function dtInitials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function dtAvatarColor(name: string, index = 0) {
  let hash = index;
  for (const ch of name) hash = (hash + ch.charCodeAt(0)) % DT_AVATAR_COLORS.length;
  return DT_AVATAR_COLORS[hash];
}

export function dtTeamColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash + ch.charCodeAt(0)) % DT_AVATAR_COLORS.length;
  return DT_AVATAR_COLORS[hash];
}

export function dtRoleClasses(role: string) {
  const map: Record<string, string> = {
    Facilitateur: "bg-blue-50 text-blue-700 border-blue-100",
    "Chef de projet": "bg-blue-50 text-blue-700 border-blue-100",
    Scribe: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Minuteur: "bg-orange-50 text-orange-700 border-orange-100",
    Décideur: "bg-violet-50 text-violet-700 border-violet-100",
    Participant: "bg-slate-50 text-slate-600 border-slate-200",
    Observateur: "bg-slate-50 text-slate-500 border-slate-200",
    Collaborateur: "bg-amber-50 text-amber-800 border-amber-100",
  };
  return map[role] ?? "bg-slate-50 text-slate-500 border-slate-200";
}

export function contactShortId(id: string) {
  return `DT-${id.replace(/-/g, "").slice(0, 4).toUpperCase()}`;
}
