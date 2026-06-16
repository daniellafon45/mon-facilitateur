export const WBP_NOTE = [
  { bg: "#FEF9C3", bd: "#FDE68A", fg: "#854D0E" },
  { bg: "#DBEAFE", bd: "#BFDBFE", fg: "#1E40AF" },
  { bg: "#DCFCE7", bd: "#BBF7D0", fg: "#166534" },
  { bg: "#FCE7F3", bd: "#FBCFE8", fg: "#9D174D" },
  { bg: "#EDE9FE", bd: "#DDD6FE", fg: "#5B21B6" },
  { bg: "#FFEDD5", bd: "#FED7AA", fg: "#9A3412" },
] as const;

export const WBP_INK = [
  "#1e293b",
  "#2563eb",
  "#059669",
  "#dc2626",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
] as const;

export const WBP_MARKER_COLORS = [...WBP_INK, "#64748b", "#cbd5e1", "#93c5fd", "#c4b5fd"];

export const TEMPLATE_PAL: Record<string, { bg: string; fg: string }> = {
  blue: { bg: "#eff6ff", fg: "#2563eb" },
  green: { bg: "#ecfdf5", fg: "#059669" },
  violet: { bg: "#f5f3ff", fg: "#7c3aed" },
  amber: { bg: "#fffbeb", fg: "#d97706" },
};

export const WHITEBOARD_STORAGE_KEY = "mf-boards-v1";

export type WhiteboardTool =
  | "select"
  | "hand"
  | "pen"
  | "note"
  | "rect"
  | "ellipse"
  | "arrow"
  | "text"
  | "eraser";
