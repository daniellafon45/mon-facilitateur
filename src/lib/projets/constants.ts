import type { ProjectStatusId } from "@/types/facilitation";

export const PRJ_SORTS = [
  { id: "modified", label: "Dernière modification" },
  { id: "name", label: "Nom (A→Z)" },
  { id: "progress", label: "Avancement" },
  { id: "members", label: "Participants" },
] as const;

export const PRJ_TABS = [
  "Tous les projets",
  "Mes projets favoris",
  "Partagés avec moi",
  "Archivés",
] as const;

export const PROJECT_ICONS = [
  "Folder",
  "Users",
  "Zap",
  "Sparkles",
  "Target",
  "Briefcase",
  "Rocket",
  "BookOpen",
] as const;

export const ICON_PALETTES = [
  { iconBg: "#ede9fe", iconFg: "#7c3aed", pc: "#22c55e", tile: "violet" },
  { iconBg: "#dbeafe", iconFg: "#2563eb", pc: "#2563eb", tile: "blue" },
  { iconBg: "#dcfce7", iconFg: "#059669", pc: "#94a3b8", tile: "green" },
  { iconBg: "#fff7ed", iconFg: "#f97316", pc: "#f97316", tile: "orange" },
  { iconBg: "#fce7f3", iconFg: "#db2777", pc: "#22c55e", tile: "rose" },
  { iconBg: "#eff6ff", iconFg: "#2563eb", pc: "#2563eb", tile: "sky" },
];

export const ROW_ACTIONS = [
  { id: "rename", icon: "Pencil", label: "Renommer" },
  { id: "duplicate", icon: "Copy", label: "Dupliquer" },
  { id: "share", icon: "Link", label: "Partager" },
  { id: "archive", icon: "Archive", label: "Archiver" },
  { id: "delete", icon: "Trash2", label: "Supprimer", danger: true },
] as const;

export function statusMeta(statusId: ProjectStatusId) {
  if (statusId === "actif")
    return { label: "Actif", c: "text-emerald-700", bg: "bg-emerald-50", bd: "border-emerald-200" };
  if (statusId === "attente")
    return { label: "En attente", c: "text-amber-700", bg: "bg-amber-50", bd: "border-amber-200" };
  return { label: "Terminé", c: "text-slate-600", bg: "bg-slate-100", bd: "border-slate-200" };
}

export function priorityMeta(statusId: ProjectStatusId) {
  if (statusId === "actif")
    return { label: "Priorité haute", bg: "bg-emerald-50", c: "text-emerald-800" };
  if (statusId === "attente")
    return { label: "Priorité moyenne", bg: "bg-amber-50", c: "text-amber-800" };
  return { label: "Priorité basse", bg: "bg-violet-50", c: "text-violet-800" };
}

export function normalizeStatusId(status: string): ProjectStatusId {
  const s = status.toLowerCase();
  if (s === "attente" || s === "en attente" || s === "pending") return "attente";
  if (s === "termine" || s === "terminé" || s === "completed" || s === "done") return "termine";
  return "actif";
}

export function formatFrDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" }).replace(",", "");
}

export function formatShortDate(iso: string | null | undefined) {
  if (!iso || iso === "—") return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export const BOARD_COLUMNS = [
  "Owner",
  "Status",
  "Due Date",
  "Numbers",
  "Tags",
  "Time Tracking",
  "Timeline",
  "People",
] as const;

export const KANBAN_COLUMNS = [
  { id: "todo" as const, label: "Nouvelle demande", dot: "bg-red-500" },
  { id: "in-progress" as const, label: "En cours", dot: "bg-amber-400" },
  { id: "done" as const, label: "Terminé", dot: "bg-emerald-500" },
];

export const TAG_PRESETS: { label: string; bg: string; text: string }[] = [
  { label: "Site web", bg: "#dbeafe", text: "#2563eb" },
  { label: "Design", bg: "#dcfce7", text: "#059669" },
  { label: "App", bg: "#ffedd5", text: "#ea580c" },
  { label: "Dribbble", bg: "#fce7f3", text: "#db2777" },
  { label: "Planification", bg: "#e0f2fe", text: "#0284c7" },
];
