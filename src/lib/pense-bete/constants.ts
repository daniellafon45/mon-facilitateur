export const PENSE_BETE_COLORS = [
  { bg: "#FEF3C7", bd: "#FDE68A", fg: "#78350F" },
  { bg: "#DBEAFE", bd: "#BFDBFE", fg: "#1E3A8A" },
  { bg: "#D1FAE5", bd: "#A7F3D0", fg: "#065F46" },
  { bg: "#FCE7F3", bd: "#FBCFE8", fg: "#9D174B" },
  { bg: "#F3E8FF", bd: "#DDD6FE", fg: "#5B21B6" },
] as const;

export function fmtPenseBeteDate(ts: number) {
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
