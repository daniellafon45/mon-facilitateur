"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatMsg {
  role: "user" | "ai";
  text: string;
}

interface SessionAiPanelProps {
  open: boolean;
  methodTitle: string;
  objective?: string;
  onClose: () => void;
}

export function SessionAiPanel({ open, methodTitle, objective, onClose }: SessionAiPanelProps) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [val, setVal] = useState("");
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setMsgs([]);
      setVal("");
      setBusy(false);
    }
  }, [open]);

  if (!open || !mounted) return null;

  const suggestions = [
    "Relance le groupe avec une question ouverte",
    "Résume les idées clés jusqu'ici",
    `Propose la prochaine étape pour ${methodTitle}`,
    "Comment gérer un participant silencieux ?",
  ];

  async function ask(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setVal("");

    const prompt =
      `Tu es Amaris, assistant de facilitation. Méthode en cours : "${methodTitle}".` +
      (objective ? ` Objectif de séance : "${objective}".` : "") +
      ` Question du facilitateur : "${question}". Réponds en français, 2-4 phrases, concrètes et actionnables.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          channel: "session-assist",
        }),
      });
      const data = await res.json();
      const reply =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : "Gardez le rythme : une question à la fois, notez sans juger, puis validez avant de passer à l'étape suivante.";
      setMsgs((m) => [...m, { role: "ai", text: reply }]);
    } catch {
      setMsgs((m) => [
        ...m,
        {
          role: "ai",
          text: `Pour ${methodTitle}, structurez la prochaine intervention en une question claire, puis laissez 2 minutes de réflexion silencieuse avant le débat.`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[2600] flex justify-end bg-slate-900/35"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">Amaris</p>
            <p className="truncate text-xs text-muted-foreground">
              Contextuel · {methodTitle}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {msgs.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Je vous accompagne pendant la séance — relances, suggestions, aide sur la méthode.
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Suggestions
              </p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={busy}
                  onClick={() => void ask(s)}
                  className="flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold hover:border-primary hover:bg-primary/5 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.text}
                </div>
              ))}
              {busy && (
                <p className="text-xs text-muted-foreground">Amaris réfléchit…</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t p-3">
          <Input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && val.trim() && void ask(val)}
            placeholder="Posez votre question…"
            className="rounded-xl"
            disabled={busy}
          />
          <Button
            type="button"
            size="icon"
            className="shrink-0 rounded-xl"
            disabled={!val.trim() || busy}
            onClick={() => void ask(val)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
