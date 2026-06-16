"use client";

import { useEffect, useState } from "react";
import { Pause, Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { LibMethodItem } from "@/lib/methods/library-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const PROMPTS: Record<string, { title: string; items: string[] }> = {
  desaccord: {
    title: "Point de désaccord",
    items: [
      "Quelle est la divergence principale ?",
      "Quelles options de compromis sont acceptables ?",
      "Peut-on obtenir un consensus ? Sinon, vote majoritaire.",
    ],
  },
  reflexion: {
    title: "Pousser la réflexion",
    items: [
      "Quelle question puissante ouvrirait une nouvelle piste ?",
      "Que dirait l'avocat du diable ?",
      "Et si on inversait complètement l'approche ?",
    ],
  },
  probleme: {
    title: "Résoudre le problème",
    items: [
      "Comment pourrions-nous… (HMW) ?",
      "Quels sont les impacts et efforts des options ?",
      "Pré-mortem : qu'est-ce qui pourrait faire échouer la solution ?",
    ],
  },
};

import type { MeetingQuickLogEntry } from "@/types/facilitation";

interface SessionQuickToolProps {
  item: LibMethodItem;
  onJournalize?: (entry: Omit<MeetingQuickLogEntry, "time">) => void;
}

export function SessionQuickTool({ item, onJournalize }: SessionQuickToolProps) {
  if (item.id === "vote") return <VoteTool onJournalize={onJournalize} />;
  if (item.id === "minuteur") return <TimerTool onJournalize={onJournalize} />;
  if (item.id === "parking") return <ParkingTool onJournalize={onJournalize} />;
  if (PROMPTS[item.id]) return <PromptTool config={PROMPTS[item.id]} onJournalize={onJournalize} itemId={item.id} />;
  return null;
}

function VoteTool({ onJournalize }: { onJournalize?: SessionQuickToolProps["onJournalize"] }) {
  const [options, setOptions] = useState(["Option A", "Option B", "Option C"]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState("");

  const cast = (opt: string) => setVotes((v) => ({ ...v, [opt]: (v[opt] || 0) + 1 }));
  const total = Object.values(votes).reduce((s, n) => s + n, 0);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <p className="text-sm text-muted-foreground">Vote par points — cliquez pour attribuer un point.</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const n = votes[opt] || 0;
          const pct = total ? Math.round((n / total) * 100) : 0;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => cast(opt)}
              className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors hover:bg-muted/50"
            >
              <span className="flex-1 font-semibold">{opt}</span>
              <span className="text-sm font-bold text-muted-foreground">{n} pt{n > 1 ? "s" : ""}</span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nouvelle option…" className="rounded-xl" />
        <Button
          size="sm"
          className="rounded-xl"
          onClick={() => {
            if (!draft.trim()) return;
            setOptions([...options, draft.trim()]);
            setDraft("");
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setVotes({})}>
        <RotateCcw className="mr-1 h-4 w-4" /> Réinitialiser les votes
      </Button>
      {total > 0 && onJournalize && (
        <Button
          size="sm"
          className="mt-2 w-full rounded-xl"
          onClick={() => {
            const top = options.reduce((best, opt) => ((votes[opt] || 0) > (votes[best] || 0) ? opt : best), options[0]);
            onJournalize({
              kind: "Vote",
              icon: "Vote",
              color: "violet",
              q: "Vote rapide",
              result: `${top} (${total ? Math.round(((votes[top] || 0) / total) * 100) : 0} %)`,
            });
          }}
        >
          Enregistrer dans le journal
        </Button>
      )}
    </div>
  );
}

function TimerTool({ onJournalize }: { onJournalize?: SessionQuickToolProps["onJournalize"] }) {
  const [secs, setSecs] = useState(300);
  const [running, setRunning] = useState(false);
  const [preset, setPreset] = useState(300);

  useEffect(() => {
    if (!running || secs <= 0) return;
    const t = window.setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [running, secs]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-sm text-center">
      <p className="mb-6 text-6xl font-extrabold tabular-nums tracking-tight">{fmt(secs)}</p>
      <div className="mb-4 flex justify-center gap-2">
        {[5, 10, 15, 25].map((m) => (
          <Button
            key={m}
            variant={preset === m * 60 ? "default" : "secondary"}
            size="sm"
            className="rounded-xl"
            onClick={() => { setPreset(m * 60); setSecs(m * 60); setRunning(false); }}
          >
            {m} min
          </Button>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        <Button className="rounded-xl" onClick={() => setRunning((r) => !r)}>
          {running ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
          {running ? "Pause" : "Démarrer"}
        </Button>
        <Button variant="secondary" className="rounded-xl" onClick={() => { setSecs(preset); setRunning(false); }}>
          <RotateCcw className="mr-1 h-4 w-4" /> Reset
        </Button>
        {secs === 0 && onJournalize && (
          <Button
            className="rounded-xl"
            onClick={() =>
              onJournalize({
                kind: "Minuteur",
                icon: "Clock",
                color: "blue",
                q: `Minuteur ${Math.floor(preset / 60)} min`,
                result: "Terminé à l'heure",
              })
            }
          >
            Journaliser
          </Button>
        )}
      </div>
    </div>
  );
}

function ParkingTool({ onJournalize }: { onJournalize?: SessionQuickToolProps["onJournalize"] }) {
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <p className="text-sm text-muted-foreground">Sujets hors-propos à traiter plus tard.</p>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              setItems([...items, draft.trim()]);
              setDraft("");
            }
          }}
          placeholder="Ajouter un sujet au parking…"
          className="rounded-xl"
        />
        <Button className="rounded-xl" onClick={() => { if (draft.trim()) { setItems([...items, draft.trim()]); setDraft(""); } }}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center justify-between rounded-xl border bg-amber-50/50 px-4 py-2.5">
            <span className="text-sm font-medium">{it}</span>
            <button type="button" onClick={() => setItems(items.filter((_, k) => k !== i))} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {items.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Parking vide.</p>}
      </ul>
      {items.length > 0 && onJournalize && (
        <Button
          className="w-full rounded-xl"
          onClick={() =>
            onJournalize({
              kind: "Parking lot",
              icon: "Stop",
              color: "slate",
              q: "Sujets reportés",
              result: `${items.length} sujet${items.length > 1 ? "s" : ""} : ${items.slice(0, 2).join(", ")}${items.length > 2 ? "…" : ""}`,
            })
          }
        >
          Enregistrer dans le journal
        </Button>
      )}
    </div>
  );
}

function PromptTool({
  config,
  onJournalize,
  itemId,
}: {
  config: { title: string; items: string[] };
  onJournalize?: SessionQuickToolProps["onJournalize"];
  itemId: string;
}) {
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [done, setDone] = useState<Record<number, boolean>>({});

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {config.items.map((q, i) => (
        <div key={i} className={cn("rounded-2xl border p-4", done[i] && "bg-emerald-50/50 border-emerald-200")}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-bold">{q}</p>
            <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs" onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}>
              {done[i] ? "Réouvrir" : "Fait"}
            </Button>
          </div>
          <Textarea
            value={notes[i] ?? ""}
            onChange={(e) => setNotes((n) => ({ ...n, [i]: e.target.value }))}
            rows={3}
            className="rounded-xl"
            placeholder="Vos notes…"
          />
        </div>
      ))}
      {onJournalize && (
        <Button
          className="w-full rounded-xl"
          onClick={() =>
            onJournalize({
              kind: config.title,
              icon: "Bolt",
              color: itemId === "desaccord" ? "amber" : "green",
              q: config.title,
              result: `${Object.values(done).filter(Boolean).length}/${config.items.length} points traités`,
            })
          }
        >
          Enregistrer dans le journal
        </Button>
      )}
    </div>
  );
}
