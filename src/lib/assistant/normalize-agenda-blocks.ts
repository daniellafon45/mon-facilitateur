import { agendaImageIdForKind } from "@/lib/wizard/agenda-images";
import type { MeetingAgendaBlock } from "@/types/facilitation";
import type { WizardAgendaResult } from "@/lib/assistant/wizard-agenda-prompt";

const ALLOWED_KINDS = new Set<MeetingAgendaBlock["kind"]>([
  "intro",
  "focus",
  "pause",
  "synthèse",
  "breakout",
  "plénière",
]);

const ALLOWED_IMPORTANCE = new Set<MeetingAgendaBlock["importance"]>([
  "haute",
  "normale",
  "basse",
]);

const ALLOWED_IMAGES = new Set([
  "agenda_intro",
  "agenda_focus",
  "agenda_pause",
  "agenda_synthese",
  "agenda_breakout",
  "agenda_pleniere",
]);

let blockSeq = 1;

function scaleBlocksToTarget(blocks: MeetingAgendaBlock[], targetMin: number): MeetingAgendaBlock[] {
  const total = blocks.reduce((s, b) => s + b.min, 0);
  if (total === 0 || Math.abs(total - targetMin) <= 10) return blocks;
  const ratio = targetMin / total;
  const scaled = blocks.map((b) => ({
    ...b,
    min: Math.max(5, Math.round((b.min * ratio) / 5) * 5),
  }));
  const newTotal = scaled.reduce((s, b) => s + b.min, 0);
  const diff = targetMin - newTotal;
  if (diff !== 0 && scaled.length) {
    const last = scaled.length - 1;
    scaled[last] = { ...scaled[last], min: Math.max(5, scaled[last].min + diff) };
  }
  return scaled;
}

export function normalizeAgendaBlocks(
  raw: WizardAgendaResult,
  targetMin: number,
): { blocks: MeetingAgendaBlock[]; summary: string } {
  blockSeq = 1;
  const blocks: MeetingAgendaBlock[] = raw.blocks.slice(0, 10).map((b) => {
    const kind = ALLOWED_KINDS.has(b.kind as MeetingAgendaBlock["kind"])
      ? (b.kind as MeetingAgendaBlock["kind"])
      : "focus";
    const importance = ALLOWED_IMPORTANCE.has(b.importance as MeetingAgendaBlock["importance"])
      ? (b.importance as MeetingAgendaBlock["importance"])
      : "normale";
    const imageId =
      b.imageId && ALLOWED_IMAGES.has(b.imageId) ? b.imageId : agendaImageIdForKind(kind);

    return {
      id: `ag${blockSeq++}`,
      title: String(b.title ?? "Bloc").trim().slice(0, 120),
      min: Math.max(5, Math.min(120, Math.round(Number(b.min ?? 10) / 5) * 5)),
      method: String(b.method ?? "—").slice(0, 80),
      importance,
      kind,
      activity: String(b.activity ?? "").trim().slice(0, 200),
      imageId,
      docs: [],
    };
  });

  return {
    blocks: scaleBlocksToTarget(blocks, targetMin),
    summary: raw.summary.trim().slice(0, 280),
  };
}
