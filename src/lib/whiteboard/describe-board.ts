import type { WbElement } from "@/lib/whiteboard/elements";
import { objectiveFromWhiteboard } from "@/lib/whiteboard/objective-from-board";

export function hasVisualBoardContent(els: WbElement[]): boolean {
  return els.some((e) => e.type === "path" || e.type === "rect" || e.type === "ellipse" || e.type === "arrow");
}

export function describeBoardElements(els: WbElement[]): string {
  if (els.length === 0) return "Tableau vide.";

  const counts = {
    notes: 0,
    texts: 0,
    paths: 0,
    rects: 0,
    ellipses: 0,
    arrows: 0,
  };

  for (const el of els) {
    if (el.type === "note") counts.notes++;
    else if (el.type === "text") counts.texts++;
    else if (el.type === "path") counts.paths++;
    else if (el.type === "rect") counts.rects++;
    else if (el.type === "ellipse") counts.ellipses++;
    else if (el.type === "arrow") counts.arrows++;
  }

  const parts: string[] = [];
  if (counts.notes) parts.push(`${counts.notes} note(s) post-it`);
  if (counts.texts) parts.push(`${counts.texts} zone(s) de texte`);
  if (counts.paths) parts.push(`${counts.paths} tracé(s) main levée`);
  if (counts.rects) parts.push(`${counts.rects} rectangle(s)`);
  if (counts.ellipses) parts.push(`${counts.ellipses} ellipse(s)`);
  if (counts.arrows) parts.push(`${counts.arrows} flèche(s)`);

  const textContent = objectiveFromWhiteboard(els);
  const lines = [`Éléments sur le tableau : ${parts.join(", ")}.`];
  if (textContent) lines.push(`Texte lisible : « ${textContent} ».`);
  else if (hasVisualBoardContent(els)) {
    lines.push("Le tableau contient surtout des schémas ou dessins sans texte explicite.");
  }

  return lines.join(" ");
}

export function shouldExportBoardImage(els: WbElement[], textObjective: string): boolean {
  if (hasVisualBoardContent(els)) return true;
  const extracted = objectiveFromWhiteboard(els);
  const combined = textObjective.trim() || extracted;
  return !combined || combined.length < 12;
}
