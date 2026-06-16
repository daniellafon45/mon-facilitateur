"use client";

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
  onClose: () => void;
}

function mockReply(question: string, method: string): string {
  const q = question.toLowerCase();
  if (/silencieux|participant/.test(q)) {
    return "Invitez la personne par son prénom avec une question fermée, puis élargissez. Ex. : « Marie, qu'est-ce qui vous semble le plus important dans ce bloc ? »";
  }
  if (/résume|synthèse|idées/.test(q)) {
    return `Voici une synthèse rapide pour ${method} : listez 2–3 idées fortes par bloc, puis cherchez les incohérences entre proposition de valeur et segments.`;
  }
  if (/prochaine|étape|suite/.test(q)) {
    return `Prochaine étape suggérée : compléter les blocs vides (coûts et revenus), puis faire un dot voting sur les hypothèses à valider.`;
  }
  return `Pour ${method}, gardez le rythme : une question à la fois, notez sans juger, et validez la cohérence entre les 9 blocs avant de conclure.`;
}

export function SessionAiPanel({ open, methodTitle, onClose }: SessionAiPanelProps) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [val, setVal] = useState("");

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
    }
  }, [open]);

  if (!open) return null;

  const suggestions = [
    "Relance le groupe avec une question ouverte",
    "Résume les idées clés jusqu'ici",
    `Propose la prochaine étape pour ${methodTitle}`,
    "Comment gérer un participant silencieux ?",
  ];

  function ask(q: string) {
    setMsgs((m) => [
      ...m,
      { role: "user", text: q },
      { role: "ai", text: mockReply(q, methodTitle) },
    ]);
    setVal("");
  }

  return (
    <div
      className="fixed inset-0 z-[1700] flex justify-end bg-slate-900/35"
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
              <p className="text-sm text-muted-foreground leading-relaxed">
                Je vous accompagne pendant la séance — relances, suggestions, aide sur la méthode. L&apos;outil principal n&apos;est pas modifié.
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Suggestions
              </p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold hover:border-primary hover:bg-primary/5"
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
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t p-3">
          <Input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && val.trim() && ask(val.trim())}
            placeholder="Posez votre question…"
            className="rounded-xl"
          />
          <Button
            type="button"
            size="icon"
            className="shrink-0 rounded-xl"
            disabled={!val.trim()}
            onClick={() => val.trim() && ask(val.trim())}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
