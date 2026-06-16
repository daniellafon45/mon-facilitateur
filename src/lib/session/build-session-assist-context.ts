import type { SessionState } from "@/components/session/methods/column-workspace";
import { METHOD_CONFIGS } from "@/components/session/methods/configs";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import { buildMethodExportText, computeMethodStats } from "@/lib/methods/method-workspace-helpers";
import type { SessionCaptureState } from "@/lib/session/session-capture";
import type { SessionMode } from "@/types/facilitation";

export interface SessionMethodAssistSnapshot {
  id: string;
  title: string;
  progress: number;
  statsLabel: string;
  isActive: boolean;
  isPast: boolean;
  snippets: string[];
}

export interface SessionAssistContext {
  objective: string;
  mode: SessionMode;
  durationMin: number;
  elapsedMin: number;
  activeMethodId: string;
  activeMethodIndex: number;
  methodIds: string[];
  methods: SessionMethodAssistSnapshot[];
  capture: {
    notesCount: number;
    votesCount: number;
    quickLogCount: number;
    discussionCount: number;
    recentNotes: string[];
    recentDiscussion: string[];
  };
}

function methodSnippets(methodId: string, state: SessionState, max = 4): string[] {
  const config = METHOD_CONFIGS[methodId];
  if (!config) return [];
  const text = buildMethodExportText(methodId, config, state);
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3 && !l.startsWith("#"))
    .slice(0, max);
}

export function buildSessionAssistContext(input: {
  objective: string;
  mode: SessionMode;
  durationMin: number;
  methodIds: string[];
  activeMethodIndex: number;
  activeMethodId: string;
  states: Record<string, SessionState>;
  capture: SessionCaptureState;
}): SessionAssistContext {
  const {
    objective,
    mode,
    durationMin,
    methodIds,
    activeMethodIndex,
    activeMethodId,
    states,
    capture,
  } = input;

  const elapsedMs = Date.now() - new Date(capture.startedAt).getTime();
  const elapsedMin = Math.max(0, Math.round(elapsedMs / 60000));

  const methods: SessionMethodAssistSnapshot[] = methodIds.map((id, idx) => {
    const config = METHOD_CONFIGS[id];
    const state = states[id] ?? {};
    const stats = config ? computeMethodStats(config, state) : { label: "—", progress: 0 };
    return {
      id,
      title: METHOD_BY_ID[id]?.title ?? id,
      progress: stats.progress ?? 0,
      statsLabel: stats.label,
      isActive: id === activeMethodId,
      isPast: idx < activeMethodIndex,
      snippets: methodSnippets(id, state),
    };
  });

  return {
    objective,
    mode,
    durationMin,
    elapsedMin,
    activeMethodId,
    activeMethodIndex,
    methodIds,
    methods,
    capture: {
      notesCount: capture.notes.length,
      votesCount: capture.votes.length,
      quickLogCount: capture.quickLog.length,
      discussionCount: capture.discussion.length,
      recentNotes: capture.notes.slice(-3).map((n) => n.text),
      recentDiscussion: capture.discussion.slice(-3).map((m) => m.text),
    },
  };
}

export function sessionAssistFingerprint(ctx: SessionAssistContext): string {
  const active = ctx.methods.find((m) => m.isActive);
  return JSON.stringify({
    obj: ctx.objective.slice(0, 80),
    elapsed: ctx.elapsedMin,
    idx: ctx.activeMethodIndex,
    active: active?.progress,
    stats: active?.statsLabel,
    snippets: active?.snippets?.length,
    notes: ctx.capture.notesCount,
    votes: ctx.capture.votesCount,
    disc: ctx.capture.discussionCount,
  });
}
