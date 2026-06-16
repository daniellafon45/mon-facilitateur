"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Expand,
  Eye,
  Link2,
  Minimize2,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { MethodRenderer } from "@/components/session/methods/registry";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import { buildMethodExportText } from "@/lib/methods/method-workspace-helpers";
import { METHOD_CONFIGS } from "@/components/session/methods/configs";
import type { SessionRailId } from "@/lib/session/session-rail-config";
import { QUICK_TOOLS } from "@/lib/session/session-rail-config";
import { createClient } from "@/lib/supabase/client";
import { createSessionRun, updateSessionState, endSession } from "@/lib/supabase/queries/sessions";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import type { Meeting, SessionMode } from "@/types/facilitation";
import type { SessionState } from "@/components/session/methods/column-workspace";
import { SessionReportPage } from "@/components/session/session-report-page";
import { MeetingDetail } from "@/components/meetings/meeting-detail";
import {
  FloatingSessionNote,
  SessionConfirmDialog,
  SessionMethodShell,
  SessionToast,
} from "@/components/session/session-method-shell";
import { SessionRightHub } from "@/components/session/session-right-hub";
import { SessionRailPanel } from "@/components/session/panels/session-rail-panel";
import { SessionAiPanel } from "@/components/session/session-ai-panel";
import { SessionQuickToolModal } from "@/components/session/session-quick-tool-modal";
import { SessionVotePanel } from "@/components/session/session-vote-panel";
import {
  appendActivity,
  appendNote,
  appendQuickLog,
  appendVote,
  appendDiscussion,
  setPrivateNotes,
  createSessionCapture,
  type SessionActivityCategory,
  type SessionActivityEntry,
  type SessionCaptureState,
} from "@/lib/session/session-capture";
import { findLibMethodItem } from "@/lib/methods/library-data";
import { buildSessionAssistContext } from "@/lib/session/build-session-assist-context";
import { MethodLiveOverlay } from "@/components/modeles/method-live-overlay";
import type { LibMethodItem } from "@/lib/methods/library-data";
import { Button } from "@/components/ui/button";

interface SessionShellProps {
  mode: SessionMode;
  methodIds: string[];
  projectId?: string;
  meetingId?: string;
  objective?: string;
  simulating?: boolean;
  durationMin?: number;
}

function quickLogCategory(kind: string): SessionActivityCategory {
  const k = kind.toLowerCase();
  if (k.includes("équipe") || k.includes("equipe")) return "team";
  if (k.includes("document")) return "document";
  if (k.includes("discussion")) return "discussion";
  return "tool";
}

export function SessionShell({
  mode,
  methodIds,
  projectId,
  meetingId,
  objective,
  simulating = false,
  durationMin = 60,
}: SessionShellProps) {
  const router = useRouter();
  const finalizeMeeting = useFacilitationStore((s) => s.finalizeMeeting);
  const clearActiveSession = useFacilitationStore((s) => s.clearActiveSession);
  const meetings = useFacilitationStore((s) => s.meetings);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [methodIndex, setMethodIndex] = useState(0);
  const [states, setStates] = useState<Record<string, SessionState>>({});
  const [capture, setCapture] = useState<SessionCaptureState>(() => createSessionCapture());
  const [finishedMeeting, setFinishedMeeting] = useState<Meeting | null>(null);
  const [viewJournal, setViewJournal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeRail, setActiveRail] = useState<SessionRailId>("seance");
  const [sessTitle, setSessTitle] = useState(objective || "Ma séance");
  const [aiOpen, setAiOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [previewFs, setPreviewFs] = useState(false);
  const [quickTool, setQuickTool] = useState<string | null>(null);
  const [projectTool, setProjectTool] = useState<LibMethodItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [elapsedTick, setElapsedTick] = useState(0);
  const contentLogTimerRef = useRef<number | undefined>(undefined);
  const titleLogTimerRef = useRef<number | undefined>(undefined);
  const prevMethodRef = useRef<string | null>(null);
  const prevTitleRef = useRef(objective || "Ma séance");

  const logActivity = useCallback((entry: Omit<SessionActivityEntry, "id" | "time">) => {
    setCapture((c) => appendActivity(c, entry));
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setElapsedTick((n) => n + 1), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const currentMethodId = methodIds[methodIndex] ?? methodIds[0];
  const methodMeta = METHOD_BY_ID[currentMethodId];

  useEffect(() => {
    if (prevMethodRef.current === null) {
      prevMethodRef.current = currentMethodId;
      logActivity({
        actor: "Vous",
        category: "method",
        action: "Méthode active",
        summary: methodMeta?.title ?? currentMethodId,
      });
      return;
    }
    if (prevMethodRef.current !== currentMethodId) {
      const prevTitle = METHOD_BY_ID[prevMethodRef.current]?.title ?? prevMethodRef.current;
      logActivity({
        actor: "Vous",
        category: "method",
        action: "Changement de méthode",
        summary: methodMeta?.title ?? currentMethodId,
        detail: `Méthode précédente : ${prevTitle}`,
      });
      prevMethodRef.current = currentMethodId;
    }
  }, [currentMethodId, methodMeta?.title, logActivity]);

  const assistContext = useMemo(
    () =>
      buildSessionAssistContext({
        objective: sessTitle || objective || "",
        mode,
        durationMin,
        methodIds,
        activeMethodIndex: methodIndex,
        activeMethodId: currentMethodId,
        states,
        capture,
      }),
    [sessTitle, objective, mode, durationMin, methodIds, methodIndex, currentMethodId, states, capture, elapsedTick],
  );

  const journalize = useCallback((entry: Parameters<typeof appendQuickLog>[1]) => {
    setCapture((c) => {
      const withLog = appendQuickLog(c, entry);
      return appendActivity(withLog, {
        actor: "Vous",
        category: quickLogCategory(entry.kind),
        action: entry.kind,
        summary: entry.q,
        detail: entry.result,
      });
    });
    setToast("Entrée ajoutée au journal de la séance");
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const handleVoteClosed = useCallback(
    (data: { question: string; options: { label: string; pct: number }[]; total: number }) => {
      setCapture((c) => {
        const withVote = appendVote(c, {
          kind: "Vote pondéré",
          q: data.question,
          total: data.total,
          options: data.options,
        });
        return appendActivity(withVote, {
          actor: "Vous",
          category: "vote",
          action: "Vote enregistré",
          summary: data.question,
          detail: data.options.map((o) => `${o.label} (${o.pct} %)`).join(" · "),
        });
      });
      setToast("Vote enregistré dans le journal");
      window.setTimeout(() => setToast(null), 2200);
    },
    [],
  );

  const openProjectTool = useCallback((methodId: string) => {
    const item = findLibMethodItem(methodId);
    if (item) {
      setProjectTool(item);
      setToast(`Ouverture : ${item.title}`);
      window.setTimeout(() => setToast(null), 2200);
    } else {
      setToast("Outil indisponible");
      window.setTimeout(() => setToast(null), 2400);
    }
  }, []);

  const openQuickTool = useCallback((id: string) => {
    setQuickTool(id);
    const label = QUICK_TOOLS.find((q) => q.id === id)?.label ?? "Outil";
    setToast(`Ouverture : ${label}`);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    if (!previewFs) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewFs(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [previewFs]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || sessionId) return;
      try {
        const run = await createSessionRun(supabase, data.user.id, {
          project_id: projectId,
          meeting_id: meetingId,
          mode,
          method_ids: methodIds,
        });
        setSessionId(run.id);
      } catch {
        /* offline session */
      }
    });
  }, [mode, methodIds, projectId, meetingId, sessionId]);

  const persist = useCallback(
    async (nextStates: Record<string, SessionState>, idx: number) => {
      if (!sessionId) return;
      setSaving(true);
      try {
        const supabase = createClient();
        await updateSessionState(supabase, sessionId, { methods: nextStates }, idx);
      } finally {
        setSaving(false);
      }
    },
    [sessionId],
  );

  function updateCurrentState(patch: SessionState) {
    const next = { ...states, [currentMethodId]: patch };
    setStates(next);
    void persist(next, methodIndex);
    window.clearTimeout(contentLogTimerRef.current);
    contentLogTimerRef.current = window.setTimeout(() => {
      logActivity({
        actor: "Vous",
        category: "content",
        action: "Contenu modifié",
        summary: methodMeta?.title ?? currentMethodId,
        detail: "Remplissage ou modification dans l'outil actif",
      });
    }, 4000);
  }

  function goMethod(id: string) {
    const idx = methodIds.indexOf(id);
    if (idx >= 0) {
      setMethodIndex(idx);
      setActiveRail("seance");
    }
  }

  function prevTool() {
    if (methodIndex > 0) setMethodIndex((i) => i - 1);
  }

  function nextTool() {
    if (methodIndex < methodIds.length - 1) setMethodIndex((i) => i + 1);
    else setConfirmEnd(true);
  }

  function handleTitleChange(title: string) {
    setSessTitle(title);
    window.clearTimeout(titleLogTimerRef.current);
    titleLogTimerRef.current = window.setTimeout(() => {
      if (title.trim() && title !== prevTitleRef.current) {
        logActivity({
          actor: "Vous",
          category: "session",
          action: "Titre modifié",
          summary: title.trim(),
          detail: prevTitleRef.current ? `Ancien titre : ${prevTitleRef.current}` : undefined,
        });
        prevTitleRef.current = title;
      }
    }, 1500);
  }

  async function finishSession() {
    const captureWithEnd = appendActivity(capture, {
      actor: "Vous",
      category: "session",
      action: "Séance terminée",
      summary: sessTitle || objective || "Session",
    });
    setCapture(captureWithEnd);

    const report = {
      objective: sessTitle || objective,
      mode,
      methods: methodIds.map((id) => ({
        id,
        title: METHOD_BY_ID[id]?.title ?? id,
        state: states[id] ?? {},
      })),
      completedAt: new Date().toISOString(),
    };
    if (sessionId) {
      const supabase = createClient();
      await endSession(supabase, sessionId, report);
    }

    const meeting = await finalizeMeeting({
      meetingId,
      mode,
      name: sessTitle || objective || "Session",
      projectId,
      methodIds,
      capture: captureWithEnd,
      methodStates: states,
      simulating,
    });

    clearActiveSession();

    if (simulating) {
      router.push("/dashboard/rencontres");
      return;
    }

    if (mode === "solo") {
      router.push(
        meetingId
          ? `/dashboard/session/solo/summary?meeting=${meetingId}`
          : "/dashboard/session/solo/summary",
      );
      return;
    }

    const resolved = meeting ?? (meetingId ? meetings.find((m) => m.id === meetingId) ?? null : null);
    if (resolved) setFinishedMeeting(resolved);
  }

  function exportSession() {
    const st = states[currentMethodId] ?? {};
    const config = METHOD_CONFIGS[currentMethodId];
    const text = config
      ? buildMethodExportText(currentMethodId, config, st)
      : `${methodMeta?.title ?? currentMethodId}\n\n`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(
        `<pre style="font-family:ui-monospace,monospace;font-size:13px;white-space:pre-wrap;padding:24px">${text.replace(/</g, "&lt;")}</pre>`,
      );
      w.document.close();
      w.print();
    }
    setToast("Export PDF lancé");
    window.setTimeout(() => setToast(null), 2400);
  }

  if (viewJournal && finishedMeeting) {
    return (
      <MeetingDetail
        meeting={finishedMeeting}
        onBack={() => setViewJournal(false)}
        onToast={(msg) => {
          setToast(msg);
          window.setTimeout(() => setToast(null), 2400);
        }}
      />
    );
  }

  if (finishedMeeting) {
    return (
      <SessionReportPage
        meeting={finishedMeeting}
        onViewJournal={() => setViewJournal(true)}
        onReplay={() => router.push("/dashboard/session")}
      />
    );
  }

  const centerContent =
    activeRail === "seance" ? (
      <MethodRenderer
        methodId={currentMethodId}
        state={states[currentMethodId] ?? {}}
        onChange={updateCurrentState}
        embedded
      />
    ) : (
      <SessionRailPanel
        railId={activeRail}
        methodIds={methodIds}
        activeMethodId={currentMethodId}
        onSelectMethod={goMethod}
        projectId={projectId}
        mode={mode}
        durationMin={durationMin}
        capture={capture}
        onPrivateNotesChange={(text) => setCapture((c) => setPrivateNotes(c, text))}
        onDiscussionSend={(text) => {
          setCapture((c) => {
            const withDiscussion = appendDiscussion(c, text);
            return appendActivity(withDiscussion, {
              actor: "Vous",
              category: "discussion",
              action: "Message envoyé",
              summary: text,
            });
          });
        }}
        onOpenQuickTool={openQuickTool}
        onJournalize={journalize}
      />
    );

  const votePanel = (
    <SessionVotePanel
      projectId={projectId}
      onVoteClosed={handleVoteClosed}
    />
  );

  return (
    <div className="space-y-3" data-testid="session-shell">
        {simulating && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
            Mode simulation — cette séance ne créera pas de rencontre terminée dans l&apos;historique.
          </div>
        )}
        {saving && (
          <p className="flex items-center gap-1 px-1 text-xs text-muted-foreground">
            <Save className="h-3 w-3" /> Sauvegarde…
          </p>
        )}

        <SessionMethodShell
          title={sessTitle}
          onTitleChange={handleTitleChange}
          badge={mode}
          focusMode={focusMode}
          previewFullscreen={previewFs}
          menuActions={[
            {
              label: focusMode ? "Quitter la présentation" : "Mode présentation",
              icon: <Eye className="h-4 w-4" />,
              onClick: () => setFocusMode((f) => !f),
            },
            {
              label: "Aperçu plein écran",
              icon: <Expand className="h-4 w-4" />,
              onClick: () => setPreviewFs(true),
            },
            {
              label: "Exporter (PDF)",
              icon: <Download className="h-4 w-4" />,
              onClick: exportSession,
            },
            {
              label: "Changer le design",
              icon: <SlidersHorizontal className="h-4 w-4" />,
              onClick: () => {
                setFocusMode((f) => {
                  const next = !f;
                  setToast(next ? "Mode présentation activé" : "Mode présentation désactivé");
                  window.setTimeout(() => setToast(null), 2400);
                  return next;
                });
              },
            },
            {
              label: "Partager la séance",
              icon: <Link2 className="h-4 w-4" />,
              onClick: () => {
                void navigator.clipboard?.writeText(window.location.href);
                setToast("Lien de séance copié");
                window.setTimeout(() => setToast(null), 2400);
              },
            },
          ]}
          onFinish={() => setConfirmEnd(true)}
          activeRail={activeRail}
          onRailChange={setActiveRail}
          hideParticipantsRail={mode === "solo"}
          right={
            <SessionRightHub
              methodIds={methodIds}
              activeMethodId={currentMethodId}
              projectId={projectId}
              durationMin={durationMin}
              onSelectMethod={goMethod}
              onOpenQuickTool={openQuickTool}
              onOpenProjectTool={openProjectTool}
              onOpenDocuments={() => router.push("/dashboard/documents")}
              onPreviewFullscreen={() => setPreviewFs((f) => !f)}
              previewFullscreen={previewFs}
              assistContext={assistContext}
              onOpenAmaris={() => setAiOpen(true)}
            />
          }
          footer={
            activeRail === "seance" ? (
              <div className="flex flex-wrap justify-between gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-1 rounded-xl"
                  disabled={methodIndex === 0}
                  onClick={prevTool}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Étape précédente
                </Button>
                <Button type="button" className="gap-1 rounded-xl" onClick={nextTool}>
                  {methodIndex < methodIds.length - 1 ? "Outil suivant" : "Conclure & résumé"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : undefined
          }
          overlays={
            <>
              <SessionAiPanel
                open={aiOpen}
                methodTitle={methodMeta?.title ?? currentMethodId}
                objective={sessTitle || objective}
                onClose={() => setAiOpen(false)}
              />
              <SessionQuickToolModal
                toolId={quickTool}
                onClose={() => setQuickTool(null)}
                onJournalize={journalize}
              />
              {projectTool && (
                <MethodLiveOverlay
                  item={projectTool}
                  context="session"
                  projectId={projectId}
                  onClose={() => setProjectTool(null)}
                  onToast={(msg) => {
                    setToast(msg);
                    window.setTimeout(() => setToast(null), 2400);
                  }}
                />
              )}
              <SessionConfirmDialog
                open={confirmEnd}
                title="Terminer la séance ?"
                body="La séance sera close et vous passerez au compte rendu. Vous pourrez toujours la consulter ensuite."
                confirmLabel="Terminer la séance"
                onConfirm={() => void finishSession()}
                onClose={() => setConfirmEnd(false)}
              />
              <FloatingSessionNote
                hidden={focusMode}
                onSave={(text) => {
                  setCapture((c) => {
                    const withNote = appendNote(c, text, "public");
                    return appendActivity(withNote, {
                      actor: "Vous",
                      category: "note",
                      action: "Note ajoutée",
                      summary: text.length > 120 ? `${text.slice(0, 120)}…` : text,
                    });
                  });
                  setToast("Note enregistrée");
                  window.setTimeout(() => setToast(null), 2200);
                }}
              />
              <SessionToast message={toast} />
              {previewFs && (
                <button
                  type="button"
                  onClick={() => setPreviewFs(false)}
                  className="fixed right-4 top-4 z-[3000] inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg"
                >
                  <Minimize2 className="h-4 w-4" />
                  Quitter le plein écran
                  <span className="ml-0.5 rounded border border-white/35 px-1.5 py-0.5 text-[11px] font-semibold opacity-65">
                    Échap
                  </span>
                </button>
              )}
            </>
          }
        >
          {activeRail === "seance" && !previewFs && <div className="mb-4 lg:hidden">{votePanel}</div>}
          {centerContent}
          {activeRail === "seance" && !previewFs && <div className="mt-6 hidden lg:block">{votePanel}</div>}
        </SessionMethodShell>
      </div>
  );
}
