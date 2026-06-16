"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SessionState } from "@/components/session/methods/column-workspace";

interface GuidedNotesPanelProps {
  title?: string;
  questions: string[];
  notesKey?: string;
  state?: SessionState;
  onChange?: (state: SessionState) => void;
}

export function GuidedNotesPanel({
  title = "Questions guidées & notes",
  questions,
  notesKey = "guided_notes",
  state = {},
  onChange,
}: GuidedNotesPanelProps) {
  const [open, setOpen] = useState(true);
  const [qs, setQs] = useState(() =>
    questions.map((text, i) => ({ id: `q${i}`, text, done: false })),
  );
  const notes = (state[notesKey] as string) ?? "";

  function toggle(id: string) {
    setQs((arr) =>
      arr.map((q) => (q.id === id ? { ...q, done: !q.done } : q)),
    );
  }

  const done = qs.filter((q) => q.done).length;

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-primary transition-transform", !open && "-rotate-90")}
        />
        <span className="text-sm font-extrabold">{title}</span>
        <span className="text-xs font-semibold text-muted-foreground">
          {done}/{qs.length} questions
        </span>
        <span className="ml-auto text-xs font-bold text-muted-foreground">
          {open ? "Réduire" : "Afficher"}
        </span>
      </button>
      {open && (
        <div className="grid gap-4 border-t p-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-extrabold">Questions guidées</p>
            <div className="flex flex-col gap-1.5">
              {qs.map((q, i) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => toggle(q.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                    q.done
                      ? "border-emerald-300 bg-emerald-50/80 text-muted-foreground line-through"
                      : "hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold",
                      q.done ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {q.done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  {q.text}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-extrabold">Notes de l&apos;équipe</p>
            <Textarea
              value={notes}
              onChange={(e) => onChange?.({ ...state, [notesKey]: e.target.value })}
              rows={6}
              placeholder="Notes visibles par votre équipe, modifiables en tout temps…"
              className="min-h-[150px] resize-y rounded-xl text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
