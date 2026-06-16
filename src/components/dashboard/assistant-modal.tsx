"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AssistantComposer } from "@/components/ui/assistant-composer";
import { AssistantMessageList, type AssistantChatMessage } from "@/components/ui/assistant-message-list";
import { ChatPanel, assistantChatTheme } from "@/components/ui/chat-preview";
import { Button } from "@/components/ui/button";
import {
  formatMessageWithAttachments,
  type ChatAttachment,
} from "@/lib/assistant/chat-attachments";
import {
  buildQuickRecommendation,
  fastHeuristicRecommendation,
  genresForMode,
} from "@/lib/assistant/quick-cadrage";
import { SESSION_GENRES } from "@/lib/methods/catalog";
import { getStepPath, getStepRoute } from "@/lib/wizard/steps";
import { startWizardSession } from "@/lib/wizard/start-wizard-session";
import type { ChatRecommendation, SessionMode } from "@/types/facilitation";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { useWizardStore } from "@/lib/store/wizard-store";
import { MotionOverlay } from "@/components/ui/motion-overlay";
import { cn } from "@/lib/utils";

const ASSISTANT_CHANNEL = {
  name: "cadrage-session",
  description: "Choisis le format et le type de projet",
};

const MODE_OPTIONS: { id: SessionMode; label: string }[] = [
  { id: "solo", label: "Session solo" },
  { id: "equipe", label: "Rencontre d'équipe" },
  { id: "atelier", label: "Grand atelier" },
];

function wizardEntryRoute(mode: SessionMode, genreId: string | null, objective: string, forceMethod = false) {
  if (forceMethod) return getStepRoute("method");
  const path = getStepPath(mode);
  if (genreId && objective.trim()) {
    const wb = path.indexOf("1");
    return getStepRoute(wb >= 0 ? "1" : "genre");
  }
  if (genreId) {
    const wb = path.indexOf("1");
    return getStepRoute(wb >= 0 ? "1" : "genre");
  }
  if (mode) return getStepRoute("genre");
  return getStepRoute("0");
}

function wizardEntryStepIndex(mode: SessionMode, genreId: string | null, objective: string, forceMethod = false) {
  if (forceMethod) return getStepPath(mode).indexOf("method");
  const path = getStepPath(mode);
  if (genreId) {
    const wb = path.indexOf("1");
    return wb >= 0 ? wb : path.indexOf("genre");
  }
  if (mode) return path.indexOf("genre");
  return 0;
}

function resolveGenreId(label: string, mode: SessionMode | null): string | null {
  const normalized = label.trim().toLowerCase();
  const pool = mode ? genresForMode(mode) : SESSION_GENRES;
  const byTitle = pool.find((g) => g.title.toLowerCase() === normalized);
  if (byTitle) return byTitle.id;
  const byId = pool.find((g) => g.id === normalized);
  return byId?.id ?? null;
}

function resolveModeFromLabel(label: string): SessionMode | null {
  const lower = label.trim().toLowerCase();
  if (/solo/.test(lower)) return "solo";
  if (/atelier/.test(lower)) return "atelier";
  if (/équipe|equipe|groupe/.test(lower)) return "equipe";
  return null;
}

interface AssistantModalProps {
  open: boolean;
  initialText?: string;
  onClose: () => void;
}

export function AssistantModal({ open, initialText, onClose }: AssistantModalProps) {
  const router = useRouter();
  const setWizardSeed = useFacilitationStore((s) => s.setWizardSeed);
  const wizardSeed = useWizardStore((s) => s.seed);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [recommendation, setRecommendation] = useState<ChatRecommendation | null>(null);
  const [pickedMode, setPickedMode] = useState<SessionMode | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startedRef = useRef(false);

  const suggestions = [
    "Rétrospective d'équipe",
    "Brainstorming en solo",
    "Kick-off de projet",
  ];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy, recommendation, pickedMode]);

  const launchWizard = useCallback(
    (rec?: ChatRecommendation | null, forceMethod = false) => {
      const payload = rec ?? recommendation;
      if (!payload?.mode) return;

      const mode = payload.mode;
      const genreId = payload.genreId ?? null;
      const genreEntry = SESSION_GENRES.find((g) => g.id === genreId);
      const objective =
        payload.objective ||
        genreEntry?.title ||
        [...messages].reverse().find((m) => m.role === "user")?.content ||
        "";
      const methods = payload.methodIds ?? [];

      sessionStorage.setItem("mf-wizard-skip-draft", "1");
      setWizardSeed(objective, mode, methods);
      const stepIdx = wizardEntryStepIndex(mode, genreId, objective, forceMethod);
      wizardSeed({
        objective,
        mode,
        genre: genreId,
        genreDur: genreEntry?.dur ?? null,
        genreMin: genreEntry?.idealMin ?? 0,
        methods,
        method: methods[0] ?? null,
        stepIdx,
      });
      void useWizardStore.getState().persistDraft();
      onClose();
      router.push(wizardEntryRoute(mode, genreId, objective, forceMethod));
    },
    [messages, onClose, recommendation, router, setWizardSeed, wizardSeed],
  );

  const applyRecommendation = useCallback(
    (data: ChatRecommendation, history: AssistantChatMessage[]) => {
      if (data.mode) setPickedMode(data.mode);
      if (data.ready) {
        setRecommendation(data);
        setMessages([...history, { role: "assistant", content: data.reply }]);
        return;
      }
      setRecommendation(null);
      setMessages([...history, { role: "assistant", content: data.reply }]);
    },
    [],
  );

  const finishQuickPick = useCallback(
    (mode: SessionMode, genreId: string, objective = "") => {
      const data = buildQuickRecommendation(mode, genreId, objective);
      setRecommendation(data);
      setPickedMode(mode);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
      launchWizard(data, false);
    },
    [launchWizard],
  );

  const send = useCallback(
    async (text: string, history: AssistantChatMessage[], pendingAttachments: ChatAttachment[]) => {
      const trimmed = text.trim();
      if (!trimmed && pendingAttachments.length === 0) return;

      const modeFromLabel = resolveModeFromLabel(trimmed);
      if (modeFromLabel && !resolveGenreId(trimmed, modeFromLabel)) {
        onClose();
        void startWizardSession(router, modeFromLabel);
        return;
      }

      const genreId = resolveGenreId(trimmed, pickedMode ?? modeFromLabel);
      if (genreId && (pickedMode || modeFromLabel)) {
        const mode = pickedMode ?? modeFromLabel!;
        finishQuickPick(mode, genreId, trimmed);
        setInput("");
        setAttachments([]);
        return;
      }

      const displayContent =
        trimmed || "J'ai joint des documents pour donner le contexte de ma session.";
      const apiContent = formatMessageWithAttachments(trimmed, pendingAttachments);

      const userMsg: AssistantChatMessage = {
        role: "user",
        content: displayContent,
        apiContent,
        attachments: pendingAttachments.map((doc) => ({ name: doc.name })),
      };

      const apiMessages = history.map((m) => ({
        role: m.role,
        content: m.apiContent ?? m.content,
      }));
      apiMessages.push({ role: "user", content: apiContent });

      const next = [...history, userMsg];
      setMessages(next);
      setInput("");
      setAttachments([]);
      setBusy(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as ChatRecommendation;
        if (!data?.reply) throw new Error("Réponse invalide");

        applyRecommendation(data, next);
      } catch {
        const fallback = fastHeuristicRecommendation(
          apiMessages.map((m) => ({ role: m.role, content: m.content })),
          { mode: pickedMode, genreId: null },
        );
        applyRecommendation(fallback, next);
      } finally {
        setBusy(false);
        window.setTimeout(() => inputRef.current?.focus(), 60);
      }
    },
    [applyRecommendation, finishQuickPick, onClose, pickedMode, router],
  );

  useEffect(() => {
    if (!open) {
      startedRef.current = false;
      setRecommendation(null);
      setPickedMode(null);
      setAttachments([]);
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;
    setInput("");

    if (initialText?.trim()) {
      setMessages([]);
      void send(initialText.trim(), [], []);
      return;
    }

    setMessages([
      {
        role: "assistant",
        content:
          "Choisis ton format et ton type de projet — je te propose tout de suite les méthodes adaptées.",
      },
    ]);
    window.setTimeout(() => inputRef.current?.focus(), 120);
  }, [open, initialText, send]);

  function submit() {
    if (busy) return;
    void send(input, messages, attachments);
  }

  function pickMode(mode: SessionMode) {
    onClose();
    void startWizardSession(router, mode);
  }

  function pickGenre(genreId: string) {
    const mode = pickedMode;
    if (!mode) return;
    finishQuickPick(mode, genreId);
  }

  const genreOptions = pickedMode ? genresForMode(pickedMode) : [];
  const quickPicks = recommendation?.followUpQuestions?.length
    ? recommendation.followUpQuestions
    : !pickedMode
      ? MODE_OPTIONS.map((m) => m.label)
      : [];

  return (
    <MotionOverlay
      open={open}
      onClose={onClose}
      variant="center"
      zIndex={50}
      className="bg-slate-900/40 backdrop-blur-md"
      panelClassName="h-[min(680px,88vh)] max-w-[500px]"
    >
      <div data-testid="assistant-modal" className="h-full">
        <ChatPanel
          channel={ASSISTANT_CHANNEL}
          className="h-full max-w-none"
          gradientBackground
          pulseShadow
          theme={assistantChatTheme}
          headerAction={
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Fermer
            </button>
          }
          bodyClassName="min-h-0 flex-1 overflow-y-auto p-2.5 pt-0 sm:p-4 sm:pt-0"
          footer={
            <>
              {recommendation?.ready && !busy && (
                <div className="mx-3 mb-2 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 sm:mx-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                      Méthodes recommandées
                    </p>
                    <p className="truncate text-sm font-semibold">
                      {recommendation.methodIds?.slice(0, 3).join(", ") || "Voir le catalogue"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 rounded-lg"
                    onClick={() => launchWizard(recommendation, true)}
                    data-testid="launch-wizard-btn"
                  >
                    Voir les méthodes
                  </Button>
                </div>
              )}

              <AssistantComposer
                value={input}
                onChange={setInput}
                onSubmit={submit}
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                busy={busy}
                inputTestId="assistant-input"
                inputRef={inputRef}
                onLaunchProject={() => launchWizard()}
                showLaunchLink={false}
              />
            </>
          }
        >
          <div ref={scrollRef} className="relative flex min-h-full flex-col justify-end">
            <div className="pointer-events-none sticky top-0 z-10 h-8 bg-gradient-to-b from-white to-transparent" />
            <AssistantMessageList messages={messages} busy={busy} theme={assistantChatTheme} />

            {!busy && !recommendation?.ready && (
              <div className="mt-4 space-y-3">
                {!pickedMode && (
                  <div className="flex flex-wrap gap-2">
                    {MODE_OPTIONS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => pickMode(m.id)}
                        className={cn(
                          "rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5",
                          "text-[12px] font-medium text-foreground/75 transition-colors",
                          "hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}

                {pickedMode && genreOptions.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {genreOptions.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => pickGenre(g.id)}
                        className={cn(
                          "rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left transition-colors",
                          "hover:border-primary/40 hover:bg-primary/5",
                        )}
                      >
                        <span className="block text-sm font-semibold">{g.title}</span>
                        <span className="text-[11px] text-muted-foreground">{g.dur}</span>
                      </button>
                    ))}
                  </div>
                )}

                {messages.length <= 1 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void send(s, messages, [])}
                        className={cn(
                          "rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5",
                          "text-[12px] font-medium text-foreground/75 transition-colors",
                          "hover:border-zinc-300 hover:bg-white hover:text-foreground",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {quickPicks.length > 0 && messages.length > 1 && !pickedMode && (
                  <div className="flex flex-wrap gap-2">
                    {quickPicks.map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => void send(label, messages, [])}
                        className={cn(
                          "rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5",
                          "text-[12px] font-medium text-foreground/75 transition-colors",
                          "hover:border-zinc-300 hover:bg-white hover:text-foreground",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </ChatPanel>
      </div>
    </MotionOverlay>
  );
}
