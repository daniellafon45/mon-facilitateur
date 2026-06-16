import type { WbElement } from "@/lib/whiteboard/elements";

/** Extrait un objectif textuel depuis les notes et textes du tableau. */
export function objectiveFromWhiteboard(els: WbElement[]): string {
  const parts = els
    .filter((e): e is Extract<WbElement, { type: "note" } | { type: "text" }> =>
      e.type === "note" || e.type === "text",
    )
    .map((e) => e.text.trim())
    .filter(Boolean);
  return parts.join(" · ").slice(0, 240);
}
