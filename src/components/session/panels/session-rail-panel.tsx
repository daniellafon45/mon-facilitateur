"use client";

import dynamic from "next/dynamic";
import { DEFAULT_LIB_MEMBERS } from "@/lib/methods/tool-constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SessionVotePanel } from "@/components/session/session-vote-panel";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { SessionRailId } from "@/lib/session/session-rail-config";
import { METHOD_BY_ID } from "@/lib/methods/catalog";

const WhiteboardBoard = dynamic(
  () => import("@/components/whiteboard/whiteboard-board").then((m) => m.WhiteboardBoard),
  { ssr: false, loading: () => <div className="p-8 text-center text-muted-foreground">Chargement…</div> },
);

interface SessionRailPanelProps {
  railId: SessionRailId;
  methodIds: string[];
  activeMethodId: string;
  onSelectMethod: (id: string) => void;
  projectId?: string;
  mode: string;
}

export function SessionRailPanel({
  railId,
  methodIds,
  activeMethodId,
  onSelectMethod,
  projectId,
  mode,
}: SessionRailPanelProps) {
  switch (railId) {
    case "tableau":
      return (
        <div className="min-h-[400px]">
          <WhiteboardBoard className="h-full min-h-[420px]" height={420} />
        </div>
      );
    case "methodes":
      return (
        <SessionMethodsPanel
          methodIds={methodIds}
          activeMethodId={activeMethodId}
          onSelectMethod={onSelectMethod}
        />
      );
    case "participants":
      return <SessionParticipantsPanel />;
    case "votes":
      return <SessionVotePanel projectId={projectId} />;
    case "notes":
      return <SessionNotesPanel />;
    case "documents":
      return <SessionDocumentsPanel />;
    case "minuteur":
      return <SessionTimerPanel />;
    case "discussion":
      return (
        <div className="rounded-2xl border p-6 text-center text-sm text-muted-foreground">
          Discussion de séance — ouvrez Messages depuis le menu principal pour les échanges async.
        </div>
      );
    default:
      return null;
  }
}

function SessionMethodsPanel({
  methodIds,
  activeMethodId,
  onSelectMethod,
}: {
  methodIds: string[];
  activeMethodId: string;
  onSelectMethod: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {methodIds.length} méthode{methodIds.length > 1 ? "s" : ""} dans cette séance.
      </p>
      {methodIds.map((id, idx) => {
        const meta = METHOD_BY_ID[id];
        const on = id === activeMethodId;
        return (
          <div
            key={id}
            className={`flex items-center gap-3 rounded-xl border p-3 ${on ? "border-primary bg-primary/5" : ""}`}
          >
            <span className="w-5 text-center text-xs font-extrabold text-muted-foreground">
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">{meta?.title ?? id}</p>
              <p className="text-xs text-muted-foreground">{meta?.tagline}</p>
            </div>
            {!on && (
              <Button type="button" size="sm" variant="secondary" className="h-7 rounded-lg text-xs" onClick={() => onSelectMethod(id)}>
                Activer
              </Button>
            )}
            {on && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                Actif
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SessionParticipantsPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          En direct
        </span>
      </div>
      {DEFAULT_LIB_MEMBERS.map((m) => (
        <div key={m.id} className="flex items-center gap-3 rounded-xl border px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback style={{ background: m.c, color: "#fff" }} className="text-xs font-bold">
              {m.init}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold">{m.you ? "Vous" : m.name}</p>
            <p className="text-xs text-muted-foreground">{m.you ? "Facilitateur" : "Participant"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SessionNotesPanel() {
  const [notes, setNotes] = useState("");
  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">Notes personnelles de séance.</p>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={10}
        className="rounded-xl"
        placeholder="Vos notes…"
      />
    </div>
  );
}

function SessionDocumentsPanel() {
  const docs = ["Étude de besoins.pdf", "Benchmark_concurrents.xlsx", "Feedback.xlsx"];
  return (
    <ul className="space-y-2">
      {docs.map((d) => (
        <li key={d} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold">
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase">
            {d.split(".").pop()}
          </span>
          {d}
        </li>
      ))}
    </ul>
  );
}

function SessionTimerPanel() {
  const [secs, setSecs] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || secs <= 0) return;
    const t = window.setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [running, secs]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="text-center">
      <p className="mb-4 text-5xl font-extrabold tabular-nums">{fmt(secs)}</p>
      <div className="flex justify-center gap-2">
        <Button type="button" size="sm" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Démarrer"}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => { setSecs(25 * 60); setRunning(false); }}>
          Reset
        </Button>
      </div>
    </div>
  );
}
