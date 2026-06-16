"use client";

import { useState } from "react";
import { Crown, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { saveMethodToProject } from "@/lib/supabase/queries/project-extras";
import { cn } from "@/lib/utils";

export function SessionVotePanel({
  projectId,
  onSaved,
  onVoteClosed,
}: {
  projectId?: string;
  onSaved?: () => void;
  onVoteClosed?: (data: {
    question: string;
    options: { label: string; pct: number }[];
    total: number;
  }) => void;
}) {
  const [question, setQuestion] = useState("Quelle option priorisez-vous ?");
  const [options, setOptions] = useState(["Option A", "Option B", "Option C"]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState(true);
  const [myVote, setMyVote] = useState<string | null>(null);

  const cast = (opt: string) => {
    if (!active || myVote) return;
    setVotes((v) => ({ ...v, [opt]: (v[opt] || 0) + 1 }));
    setMyVote(opt);
  };

  const total = Object.values(votes).reduce((s, n) => s + n, 0);
  const maxVotes = Math.max(0, ...options.map((o) => votes[o] || 0));

  const saveToProject = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      await saveMethodToProject(supabase, data.user.id, {
        projectId,
        methodId: "dot-vote",
        title: "Dot voting — séance",
        payload: { question, options, votes, total, active },
      });
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-extrabold">Dot voting</h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              active
                ? "border border-emerald-500 bg-emerald-50 text-emerald-700"
                : "bg-muted text-muted-foreground",
            )}
          >
            {active ? "En cours" : "Terminé"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 rounded-lg text-xs"
            onClick={() => {
              setActive((a) => {
                const next = !a;
                if (a && total > 0 && onVoteClosed) {
                  onVoteClosed({
                    question,
                    total,
                    options: options.map((opt) => ({
                      label: opt,
                      pct: total ? Math.round(((votes[opt] || 0) / total) * 100) : 0,
                    })),
                  });
                }
                return next;
              });
              setMyVote(null);
            }}
          >
            {active ? "Clôturer" : "Rouvrir"}
          </Button>
          {projectId && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 rounded-lg text-xs"
              disabled={saving || !total}
              onClick={saveToProject}
            >
              {saving ? "…" : "Sauver vers projet"}
            </Button>
          )}
        </div>
      </div>

      <Input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="mb-3 h-9 rounded-lg text-sm font-semibold"
        placeholder="Question du vote…"
      />

      <p className="mb-3 text-xs text-muted-foreground">
        {active ? "Cliquez pour attribuer un point." : "Vote clôturé — résultats ci-dessous."}
      </p>

      <div className="space-y-2">
        {options.map((opt) => {
          const n = votes[opt] || 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          const isWinner = !active && n === maxVotes && n > 0;
          return (
            <button
              key={opt}
              type="button"
              disabled={!active || !!myVote}
              onClick={() => cast(opt)}
              className={cn(
                "relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                active && !myVote && "hover:bg-slate-50",
                myVote === opt && "border-primary",
                isWinner && "border-violet-400",
              )}
            >
              <div
                className="absolute inset-y-0 left-0 bg-primary/10 transition-all"
                style={{ width: `${pct}%` }}
              />
              <span className="relative flex flex-1 items-center gap-1 font-semibold">
                {isWinner && <Crown className="h-4 w-4 text-violet-600" />}
                {opt}
              </span>
              <span className="relative text-xs font-bold text-muted-foreground">
                {n} pt{n > 1 ? "s" : ""} · {pct}%
              </span>
              <div className="relative h-2 w-16 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", isWinner ? "bg-violet-500" : "bg-primary")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {myVote && active && (
        <p className="mt-2 text-xs font-bold text-emerald-600">Votre vote : {myVote}</p>
      )}

      <div className="mt-3 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Nouvelle option…"
          className="h-8 rounded-lg text-sm"
          disabled={!active}
        />
        <Button
          type="button"
          size="sm"
          className="h-8 rounded-lg"
          disabled={!active}
          onClick={() => {
            if (!draft.trim()) return;
            setOptions([...options, draft.trim()]);
            setDraft("");
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 h-7 rounded-lg text-xs"
        onClick={() => {
          setVotes({});
          setMyVote(null);
        }}
      >
        <RotateCcw className="mr-1 h-3 w-3" /> Réinitialiser
      </Button>
    </div>
  );
}
