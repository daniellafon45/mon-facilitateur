import type { SessionState } from "@/components/session/methods/column-workspace";
import { METHOD_CONFIGS } from "@/components/session/methods/configs";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import { buildMethodExportText } from "@/lib/methods/method-workspace-helpers";
import { captureDurationLabel, type SessionCaptureState } from "@/lib/session/session-capture";
import type {
  Meeting,
  MeetingAgendaTiming,
  MeetingDetailSnapshot,
  MeetingMethodResult,
  MeetingReport,
  SessionMode,
} from "@/types/facilitation";

const AGENDA_COLORS = ["slate", "blue", "violet", "amber", "green"] as const;

function methodHighlights(methodId: string, state: SessionState): string[] {
  const config = METHOD_CONFIGS[methodId];
  if (!config) return [];
  const text = buildMethodExportText(methodId, config, state);
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 4 && !l.startsWith("#"))
    .slice(0, 5);
}

function methodColor(id: string): string {
  const cats = METHOD_BY_ID[id]?.cats ?? [];
  if (cats.includes("decide")) return "amber";
  if (cats.includes("reflect")) return "violet";
  if (cats.includes("plan") || cats.includes("align")) return "green";
  return METHOD_BY_ID[id]?.color ?? "blue";
}

function buildAgendaTiming(meeting: Meeting | null, capture: SessionCaptureState): MeetingAgendaTiming[] {
  const plan = meeting?.agendaPlan ?? [];
  if (plan.length === 0) {
    const totalMin = Math.max(10, Math.round(
      (new Date(capture.endedAt ?? Date.now()).getTime() - new Date(capture.startedAt).getTime()) / 60000,
    ));
    return [{ title: "Séance", planned: totalMin, real: totalMin, color: "blue" }];
  }
  const perBlock = plan.map((b) => b.min || 0);
  const totalPlanned = perBlock.reduce((a, b) => a + b, 0) || plan.length * 10;
  const totalReal = Math.max(
    1,
    Math.round(
      (new Date(capture.endedAt ?? Date.now()).getTime() - new Date(capture.startedAt).getTime()) / 60000,
    ),
  );
  return plan.map((b, i) => {
    const planned = b.min || Math.round(totalPlanned / plan.length);
    const share = totalPlanned > 0 ? planned / totalPlanned : 1 / plan.length;
    const real = Math.max(1, Math.round(totalReal * share));
    return {
      title: b.title,
      planned,
      real,
      color: AGENDA_COLORS[i % AGENDA_COLORS.length],
    };
  });
}

function buildMethodResults(
  methodIds: string[],
  states: Record<string, SessionState>,
): MeetingMethodResult[] {
  return methodIds.map((id) => {
    const meta = METHOD_BY_ID[id];
    const state = states[id] ?? {};
    const highlights = methodHighlights(id, state);
    const cards = (state as { cards?: { text?: string }[] }).cards;
    const noteCount = Array.isArray(cards) ? cards.filter((c) => c.text?.trim()).length : highlights.length;
    return {
      id,
      title: meta?.title ?? id,
      icon: "FileText",
      color: methodColor(id),
      filled: noteCount > 0 ? `${noteCount} éléments` : "Complété",
      notes: noteCount,
      highlights: highlights.length > 0 ? highlights : [`Travail effectué sur ${meta?.title ?? id}`],
    };
  });
}

export interface BuildSnapshotInput {
  meeting: Meeting | null;
  capture: SessionCaptureState;
  methodIds: string[];
  methodStates: Record<string, SessionState>;
  mode: SessionMode;
  name: string;
  projectId?: string;
  participants?: number;
  reportDraft?: Partial<MeetingReport>;
}

export function buildMeetingSnapshot(input: BuildSnapshotInput): MeetingDetailSnapshot {
  const {
    meeting,
    capture,
    methodIds,
    methodStates,
    mode,
    name,
    participants = meeting?.participants ?? 2,
    reportDraft,
  } = input;

  const dateISO = meeting?.dateISO ?? new Date().toISOString().slice(0, 10);
  const ref = meeting
    ? `MF-${dateISO.replace(/-/g, "")}-${meeting.id.slice(-4)}`
    : `MF-${dateISO.replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;

  const methods = buildMethodResults(methodIds, methodStates);
  const report: MeetingReport = {
    scribe: reportDraft?.scribe ?? "Scribe",
    scribeRole: reportDraft?.scribeRole ?? "Scribe",
    state: reportDraft?.state ?? (reportDraft?.summary?.trim() ? "redige" : "brouillon"),
    channels: reportDraft?.channels ?? ["My Facilitator"],
    recipients: reportDraft?.recipients ?? `${participants} participants`,
    summary: reportDraft?.summary ?? "",
    decisions: reportDraft?.decisions ?? [],
  };

  return {
    ref,
    duration: captureDurationLabel(capture),
    facilitator: "Facilitateur",
    participants: [
      { init: "FL", name: "Facilitateur", role: "Facilitatrice", color: "#2563eb" },
      { init: "SC", name: "Scribe", role: "Scribe", color: "#7c3aed" },
    ],
    journal: [],
    methods,
    projTools: [],
    notes: capture.notes,
    votes: capture.votes,
    quickLog: capture.quickLog,
    tasks: [],
    whiteboard: [],
    agenda: buildAgendaTiming(meeting, capture),
    documents: [],
    report,
  };
}

export function snapshotSummaryFromSession(name: string, mode: SessionMode, methodIds: string[]): string {
  const titles = methodIds.map((id) => METHOD_BY_ID[id]?.title ?? id).join(", ");
  const modeLabel =
    mode === "solo" ? "Session solo" : mode === "atelier" ? "Grand atelier" : "Séance d'équipe";
  return `La rencontre « ${name} » (${modeLabel}) a permis de travailler avec ${titles || "les méthodes choisies"}.`;
}
