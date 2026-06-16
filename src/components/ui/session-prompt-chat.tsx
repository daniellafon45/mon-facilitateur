"use client";

import { useState, useEffect } from "react";
import { useReducedMotion } from "motion/react";
import { VoiceChatButton } from "@/components/ui/voice-chat-button";
import { cn } from "@/lib/utils";

const PLACEHOLDER_PHRASES = [
  "Décrivez la session que vous voulez faciliter…",
  "Ex. : une rétrospective d'équipe en 45 minutes…",
  "Ex. : un atelier SWOT pour notre lancement produit…",
  "Ex. : une session Brainwriting avec 8 participants…",
];

function TypewriterPlaceholder({
  active,
  dark,
}: {
  active: boolean;
  dark?: boolean;
}) {
  const reduced = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      setIsDeleting(false);
      return;
    }

    if (reduced) {
      setDisplayed(PLACEHOLDER_PHRASES[0]);
      return;
    }

    const full = PLACEHOLDER_PHRASES[phraseIndex];
    const timeout = window.setTimeout(
      () => {
        if (!isDeleting && displayed.length < full.length) {
          setDisplayed(full.slice(0, displayed.length + 1));
          return;
        }

        if (!isDeleting && displayed.length === full.length) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && displayed.length > 0) {
          setDisplayed(full.slice(0, displayed.length - 1));
          return;
        }

        setIsDeleting(false);
        setPhraseIndex((i) => (i + 1) % PLACEHOLDER_PHRASES.length);
      },
      !isDeleting && displayed.length < full.length
        ? 42
        : !isDeleting
          ? 2400
          : 22,
    );

    return () => window.clearTimeout(timeout);
  }, [active, reduced, displayed, isDeleting, phraseIndex]);

  if (!active) return null;

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 text-left text-[13px] leading-[1.6] sm:text-sm",
        dark ? "text-white/55" : "text-muted-foreground/55",
      )}
    >
      {displayed}
      <span className={cn("ml-px animate-pulse", dark ? "text-white/45" : "text-muted-foreground/45")}>
        |
      </span>
    </span>
  );
}

export interface SessionPromptChatProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  inputTestId?: string;
  variant?: "default" | "embedded" | "chat-preview";
  appearance?: "light" | "dark";
}

export function SessionPromptChat({
  prompt,
  onPromptChange,
  onSubmit,
  submitLabel = "Créer ma session gratuite",
  inputTestId,
  variant = "default",
  appearance = "light",
}: SessionPromptChatProps) {
  const [focused, setFocused] = useState(false);
  const showTypewriter = !prompt && !focused;
  const embedded = variant === "embedded";
  const chatPreview = variant === "chat-preview";
  const dark = embedded && appearance === "dark";

  const appendVoiceTranscript = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onPromptChange(prompt.trim() ? `${prompt.trim()} ${trimmed}` : trimmed);
  };

  if (chatPreview) {
    return (
      <div className="relative w-full min-w-0">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500/15 via-pink-500/15 to-purple-500/15 opacity-75 blur-2xl" />
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-zinc-200/80 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
            <span className="text-[13px] font-medium sm:text-sm">#cadrage-session</span>
            <span className="text-muted-foreground">|</span>
            <span className="truncate text-[13px] text-muted-foreground sm:text-sm">
              Décrivez votre session pour commencer
            </span>
          </div>
          <div className="p-3 sm:p-4">
            <div
              className={cn(
                "flex items-end gap-2 rounded-xl border border-zinc-200 bg-white p-2 pl-3 transition-colors",
                "focus-within:border-zinc-300",
              )}
            >
              <div className="relative min-h-[36px] flex-1">
                <TypewriterPlaceholder active={showTypewriter} />
                <textarea
                  value={prompt}
                  onChange={(e) => onPromptChange(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  rows={2}
                  aria-label="Décrivez la session que vous voulez faciliter"
                  data-testid={inputTestId}
                  className="relative min-h-[36px] w-full resize-none bg-transparent text-left text-[13px] leading-[1.6] text-foreground focus:outline-none sm:text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSubmit();
                    }
                  }}
                />
              </div>
              <VoiceChatButton variant="inline" onTranscript={appendVoiceTranscript} />
              <button
                type="button"
                onClick={onSubmit}
                className="mb-0.5 shrink-0 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background hover:bg-foreground/90 sm:text-sm"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full min-w-0">
      {!embedded && (
        <div
          className="pointer-events-none absolute -inset-x-2 -inset-y-3 rounded-[1.35rem] bg-linear-to-b from-zinc-300/50 via-zinc-200/35 to-zinc-300/25 blur-2xl sm:-inset-x-4"
          aria-hidden
        />
      )}
      <div
        className={cn(
          "relative flex min-h-[168px] w-full flex-col rounded-2xl p-5 sm:min-h-[180px] sm:p-7 lg:p-8",
          embedded
            ? cn(
                "border backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
                dark
                  ? "border-white/25 bg-black/20"
                  : "border-white/55 bg-white/45",
              )
            : "border border-zinc-200/80 bg-zinc-50/95 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_12px_48px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset]",
        )}
      >
        <div className="relative min-h-[3.5rem] w-full flex-1">
          <TypewriterPlaceholder active={showTypewriter} dark={dark} />
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={2}
            aria-label="Décrivez la session que vous voulez faciliter"
            data-testid={inputTestId}
            className={cn(
              "relative min-h-[3.5rem] w-full resize-none bg-transparent text-left text-[15px] leading-[1.6] focus:outline-none",
              dark ? "text-white placeholder:text-white/40" : "text-foreground",
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
        </div>
        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-8 lg:pt-10">
          <VoiceChatButton onTranscript={appendVoiceTranscript} />
          <button
            type="button"
            onClick={onSubmit}
            className={cn(
              "inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-[13px] font-medium transition-colors sm:w-auto",
              dark
                ? "bg-white text-zinc-900 hover:bg-white/90"
                : "bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
