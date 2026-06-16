"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { AiLoaderCore } from "@/components/ui/ai-loader";

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: { 0?: { transcript?: string } };
};

type SpeechRecognitionResultEvent = {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface VoiceChatButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  /** Compact pour barre de saisie (chat-preview, composer). */
  variant?: "default" | "inline";
  disabled?: boolean;
}

const LOADER_SIZE_DEFAULT = 56;
const LOADER_SIZE_INLINE = 40;

export function VoiceChatButton({
  onTranscript,
  className,
  variant = "default",
  disabled = false,
}: VoiceChatButtonProps) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setSupported(!!getSpeechRecognition());
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const SpeechRecognitionClass = getSpeechRecognition();
      if (!SpeechRecognitionClass) return;

      if (listening) {
        stopListening();
        return;
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript ?? "")
          .join(" ")
          .trim();

        if (transcript) {
          setProcessing(true);
          onTranscript(transcript);
          window.setTimeout(() => setProcessing(false), 1200);
        }
      };

      recognition.onerror = () => {
        setListening(false);
        setProcessing(false);
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      setListening(true);
      recognition.start();
    },
    [listening, onTranscript, stopListening],
  );

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const active = listening || processing;
  const loaderText = listening ? "Écoute" : "Génère";
  const inline = variant === "inline";
  const loaderSize = inline ? LOADER_SIZE_INLINE : LOADER_SIZE_DEFAULT;

  return (
    <button
      type="button"
      onClick={startListening}
      disabled={!supported || disabled}
      aria-label={
        active
          ? "Arrêter la dictée vocale"
          : supported
            ? "Décrire à la voix"
            : "Dictée vocale non supportée par ce navigateur"
      }
      aria-pressed={active}
      title={
        supported
          ? active
            ? "Arrêter"
            : "Saisie vocale"
          : "Non supporté sur ce navigateur"
      }
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-visible transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40",
        inline
          ? active
            ? "mb-0.5 size-10 border-0 bg-transparent p-0 shadow-none"
            : "mb-0.5 size-9 rounded-lg border border-foreground/10 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          : active
            ? "size-14 rounded-full border-0 bg-transparent p-0 shadow-none"
            : "size-10 rounded-full border border-zinc-200/90 bg-white text-foreground shadow-sm hover:bg-zinc-50",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {active ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center"
          >
            <AiLoaderCore size={loaderSize} text={loaderText} variant="inline" />
          </motion.div>
        ) : (
          <motion.span
            key="mic"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex"
          >
            <Mic className={cn(inline ? "size-4" : "size-4")} strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
