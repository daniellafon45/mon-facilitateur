import type { DocItem, DocView } from "@/lib/documents/types";

export const DOC_VIEWS: { key: DocView; label: string }[] = [
  { key: "tous", label: "Tous les documents" },
  { key: "projets", label: "Par projet" },
  { key: "reunions", label: "Par réunion" },
  { key: "partages", label: "Partagés avec moi" },
  { key: "favoris", label: "Favoris" },
  { key: "corbeille", label: "Corbeille" },
];

export const DOC_SORTS = [
  { key: "recent" as const, label: "Dernière modification" },
  { key: "name" as const, label: "Nom (A→Z)" },
  { key: "size" as const, label: "Taille" },
  { key: "type" as const, label: "Type" },
  { key: "old" as const, label: "Plus anciens" },
];

export const DOC_FILE_TYPES = ["PDF", "DOCX", "XLSX", "PPTX", "PNG", "G DOC", "Dossier"];

export const DOC_OWNERS: Record<string, { name: string; color: string }> = {
  ME: { name: "Vous", color: "#2563eb" },
  AK: { name: "Alex K.", color: "#059669" },
  LB: { name: "Léa B.", color: "#7c3aed" },
  MD: { name: "Marc D.", color: "#f97316" },
};

export const DOC_TYPE_COLOR: Record<string, string> = {
  PDF: "#ef4444",
  XLSX: "#22c55e",
  DOCX: "#3b82f6",
  PPTX: "#f97316",
  PNG: "#8b5cf6",
  JPG: "#8b5cf6",
  "G DOC": "#4285f4",
  CSV: "#16a34a",
  ZIP: "#64748b",
  "": "#f59e0b",
};

export const RECENT_WINDOW = 7 * 24 * 3600 * 1000;
export const CURRENT_USER_OWNER = "ME";

const MOIS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juill.", "août", "sept.", "oct.", "nov.", "déc.",
];

export function docTypeColor(t?: string) {
  if (!t) return "#f59e0b";
  return DOC_TYPE_COLOR[t] ?? "#64748b";
}

export function docTypeFromName(n: string) {
  const ext = (n.split(".").pop() || "").toUpperCase();
  const map: Record<string, string> = {
    PDF: "PDF", XLSX: "XLSX", XLS: "XLSX", DOC: "DOCX", DOCX: "DOCX",
    PPT: "PPTX", PPTX: "PPTX", PNG: "PNG", JPG: "JPG", JPEG: "JPG", CSV: "CSV", ZIP: "ZIP",
  };
  return map[ext] || "DOCX";
}

export function fmtSize(bytes?: number) {
  if (bytes == null || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${Math.round((bytes / 1024 / 1024) * 10) / 10} Mo`;
}

export function fmtDate(ts: number) {
  const d = new Date(ts);
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtTime(ts: number) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function isRecentDoc(d: DocItem) {
  return Date.now() - d.ts <= RECENT_WINDOW;
}

export function docMatchesView(d: DocItem, view: DocView) {
  if (view === "corbeille") return d.trashed;
  if (d.trashed) return false;
  if (view === "projets") return !!d.projectId;
  if (view === "reunions") return !!d.meetingId;
  if (view === "partages") return d.owner !== CURRENT_USER_OWNER;
  if (view === "favoris") return d.fav;
  if (view === "recents") return isRecentDoc(d);
  return true;
}

export function sourceLabel(source?: string) {
  const map: Record<string, string> = {
    séance: "Produit en séance",
    "compte rendu": "Compte rendu de séance",
    import: "Importé",
    manuel: "Ajout manuel",
  };
  return (source && map[source]) || source || "Document";
}
