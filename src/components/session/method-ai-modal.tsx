"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Suggestion {
  label?: string;
  text: string;
  on: boolean;
}

interface MethodAiModalProps {
  open: boolean;
  title: string;
  labels?: string[];
  onInsert: (items: { label?: string; text: string }[]) => void;
  onClose: () => void;
}

export function MethodAiModal({
  open,
  title,
  labels,
  onInsert,
  onClose,
}: MethodAiModalProps) {
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTopic("");
    setSuggestions([]);
    setError("");
    setBusy(false);
    window.setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function generate() {
    const t = topic.trim();
    if (!t || busy) return;
    setBusy(true);
    setError("");

    const labelLine =
      labels && labels.length
        ? `Répartis tes propositions parmi ces catégories : ${labels.join(", ")}. Préfixe CHAQUE ligne par la catégorie exacte suivie de " :: ".`
        : "";

    const prompt =
      `Tu es l'assistant de facilitation de Mon facilitateur. La méthode en cours est "${title}". ` +
      `Le sujet/problème est : "${t}".\n` +
      `Propose 8 idées concrètes, courtes (max 8 mots chacune), variées et pertinentes, en français. ${labelLine}\n` +
      `Réponds UNIQUEMENT par une liste, une proposition par ligne, sans numéro ni puce.` +
      (labelLine ? ` Format : "Catégorie :: proposition".` : "");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          channel: "method-suggestions",
        }),
      });
      if (!res.ok) throw new Error("api");
      const data = (await res.json()) as { reply?: string; content?: string };
      const reply = data.reply ?? data.content ?? "";
      const lines = reply
        .split("\n")
        .map((l) => l.replace(/^[\s\-*\d.)]+/, "").trim())
        .filter(Boolean);

      const parsed: Suggestion[] = lines
        .map((l) => {
          const parts = l.split("::");
          if (labels?.length && parts.length >= 2) {
            const lab = parts[0].trim();
            const match =
              labels.find((x) => x.toLowerCase() === lab.toLowerCase()) ??
              labels.find(
                (x) =>
                  lab.toLowerCase().includes(x.toLowerCase()) ||
                  x.toLowerCase().includes(lab.toLowerCase()),
              );
            return {
              label: match ?? labels[0],
              text: parts.slice(1).join("::").trim(),
              on: true,
            };
          }
          return { text: l.replace(/^[^:]*::/, "").trim(), on: true };
        })
        .filter((s) => s.text);

      if (!parsed.length) {
        setError("Aucune proposition générée. Reformulez le sujet.");
      }
      setSuggestions(parsed.slice(0, 10));
    } catch {
      const fallback = labels?.length
        ? labels.slice(0, 4).map((label) => ({
            label,
            text: `Piste pour ${t.slice(0, 40)}`,
            on: true,
          }))
        : [
            { text: "À valider avec l'équipe", on: true },
            { text: "Hypothèse à tester", on: true },
            { text: "Piste prioritaire", on: true },
          ];
      setSuggestions(fallback);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const chosen = suggestions.filter((s) => s.on);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b bg-gradient-to-r from-primary/10 to-background px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold">Amaris · {title}</p>
            <p className="text-xs text-muted-foreground">
              Décrivez le sujet, Amaris propose des idées.
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto p-4">
          <div className="mb-4 flex gap-2">
            <Input
              ref={inputRef}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void generate()}
              placeholder="Ex. Service d'accueil des nouveaux arrivants"
              className="rounded-xl"
            />
            <Button
              type="button"
              disabled={!topic.trim() || busy}
              onClick={() => void generate()}
              className="shrink-0 rounded-xl"
            >
              <Sparkles className="mr-1 h-4 w-4" />
              {busy ? "…" : "Générer"}
            </Button>
          </div>

          {error && (
            <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {busy && (
            <p className="mb-3 text-sm text-muted-foreground">L&apos;IA réfléchit…</p>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Propositions — cochez celles à ajouter
              </p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    setSuggestions((ss) =>
                      ss.map((x, j) => (j === i ? { ...x, on: !x.on } : x)),
                    )
                  }
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold",
                    s.on ? "border-primary bg-primary/5" : "opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                      s.on && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {s.on && <Check className="h-3 w-3" />}
                  </span>
                  {s.label && (
                    <span className="text-xs font-bold text-primary">{s.label} ·</span>
                  )}
                  {s.text}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t p-4">
          <Button type="button" variant="secondary" className="rounded-xl" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            disabled={!chosen.length}
            onClick={() => {
              onInsert(chosen.map(({ label, text }) => ({ label, text })));
              onClose();
            }}
          >
            Insérer {chosen.length} idée{chosen.length > 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}
