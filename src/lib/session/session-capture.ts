import type {
  MeetingNoteEntry,
  MeetingQuickLogEntry,
  MeetingVoteEntry,
} from "@/types/facilitation";

export interface SessionCaptureState {
  startedAt: string;
  endedAt?: string;
  quickLog: MeetingQuickLogEntry[];
  votes: MeetingVoteEntry[];
  notes: MeetingNoteEntry[];
}

export function createSessionCapture(): SessionCaptureState {
  return {
    startedAt: new Date().toISOString(),
    quickLog: [],
    votes: [],
    notes: [],
  };
}

export function captureTimeLabel(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
}

export function appendNote(
  capture: SessionCaptureState,
  text: string,
  vis: "public" | "prive" = "public",
  author = "Vous",
): SessionCaptureState {
  if (!text.trim()) return capture;
  const entry: MeetingNoteEntry = {
    author,
    time: captureTimeLabel(),
    vis,
    text: text.trim(),
  };
  return { ...capture, notes: [...capture.notes, entry] };
}

export function appendQuickLog(
  capture: SessionCaptureState,
  entry: Omit<MeetingQuickLogEntry, "time">,
): SessionCaptureState {
  return {
    ...capture,
    quickLog: [
      ...capture.quickLog,
      { ...entry, time: captureTimeLabel() },
    ],
  };
}

export function appendVote(
  capture: SessionCaptureState,
  vote: Omit<MeetingVoteEntry, "time">,
): SessionCaptureState {
  return {
    ...capture,
    votes: [
      ...capture.votes,
      { ...vote, time: captureTimeLabel() },
    ],
  };
}

export function finalizeCaptureTiming(capture: SessionCaptureState): SessionCaptureState {
  return { ...capture, endedAt: new Date().toISOString() };
}

export function captureDurationLabel(capture: SessionCaptureState): string {
  const start = new Date(capture.startedAt).getTime();
  const end = capture.endedAt ? new Date(capture.endedAt).getTime() : Date.now();
  const min = Math.max(1, Math.round((end - start) / 60000));
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h 00`;
  }
  return `${min} min`;
}
