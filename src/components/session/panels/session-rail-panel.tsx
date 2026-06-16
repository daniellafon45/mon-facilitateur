"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LIB_MEMBERS } from "@/lib/methods/tool-constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users, Vote, MessageSquare, List } from "lucide-react";
import type { MeetingNoteEntry, MeetingQuickLogEntry, MeetingVoteEntry } from "@/types/facilitation";
import { useDocumentsStore } from "@/lib/store/documents-store";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import type { SessionCaptureState } from "@/lib/session/session-capture";
import type { SessionRailId } from "@/lib/session/session-rail-config";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import { WHITEBOARD_STORAGE_KEY } from "@/lib/whiteboard/constants";

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
  durationMin?: number;
  capture: SessionCaptureState;
  onPrivateNotesChange: (text: string) => void;
  onDiscussionSend: (text: string) => void;
  onOpenQuickTool?: (id: string) => void;
}

export function SessionRailPanel({
  railId,
  methodIds,
  activeMethodId,
  onSelectMethod,
  projectId,
  mode,
  durationMin = 60,
  capture,
  onPrivateNotesChange,
  onDiscussionSend,
  onOpenQuickTool,
}: SessionRailPanelProps) {
  const boardStorageKey = projectId ? `${WHITEBOARD_STORAGE_KEY}-${projectId}` : WHITEBOARD_STORAGE_KEY;

  switch (railId) {
    case "tableau":
      return (
        <div className="min-h-[400px]">
          <WhiteboardBoard className="h-full min-h-[420px]" height={420} boardId={boardStorageKey} />
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
      return <SessionParticipantsPanel mode={mode} />;
    case "votes":
      return (
        <SessionJournalPanel
          quickLog={capture.quickLog}
          votes={capture.votes}
          notes={capture.notes}
        />
      );
    case "notes":
      return (
        <SessionNotesPanel
          value={capture.privateNotes}
          onChange={onPrivateNotesChange}
        />
      );
    case "documents":
      return <SessionDocumentsPanel projectId={projectId} />;
    case "minuteur":
      return (
        <SessionTimerPanel
          initialSecs={durationMin * 60}
          onDone={() => onOpenQuickTool?.("minuteur")}
        />
      );
    case "discussion":
      return (
        <SessionDiscussionPanel
          messages={capture.discussion}
          onSend={onDiscussionSend}
        />
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

function SessionParticipantsPanel({ mode }: { mode: string }) {
  const contacts = useFacilitationStore((s) => s.contacts);
  const members = contacts.length
    ? contacts.slice(0, 8).map((c, i) => ({
        id: c.id,
        name: c.name,
        init: c.name.slice(0, 2).toUpperCase(),
        c: ["#2563eb", "#059669", "#d97706", "#7c3aed"][i % 4],
        you: i === 0,
      }))
    : DEFAULT_LIB_MEMBERS;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          En direct
        </span>
        <span className="text-xs text-muted-foreground capitalize">{mode}</span>
      </div>
      {members.map((m) => (
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
      <Button type="button" variant="outline" size="sm" className="w-full rounded-xl" asChild>
        <Link href="/dashboard/dreamteam">
          <Users className="mr-1 h-4 w-4" />
          Gérer l&apos;équipe
        </Link>
      </Button>
    </div>
  );
}

function SessionNotesPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-muted-foreground">Notes personnelles de séance (sauvegardées automatiquement).</p>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        className="rounded-xl"
        placeholder="Vos notes…"
      />
    </div>
  );
}

function SessionDocumentsPanel({ projectId }: { projectId?: string }) {
  const allDocs = useDocumentsStore((s) => s.docs);

  const docs = useMemo(
    () =>
      allDocs.filter(
        (d) => !d.trashed && (!projectId || d.projectId === projectId),
      ),
    [allDocs, projectId],
  );

  if (!docs.length) {
    return (
      <div className="space-y-3 rounded-2xl border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">Aucun document lié à ce projet.</p>
        <Button type="button" size="sm" className="rounded-xl" asChild>
          <Link href="/dashboard/documents">Ajouter des documents</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {docs.map((d) => (
        <li key={d.id}>
          <Link
            href={`/dashboard/documents?doc=${d.id}`}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold hover:bg-muted/50"
          >
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase">
              {d.type}
            </span>
            {d.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SessionTimerPanel({
  initialSecs,
  onDone,
}: {
  initialSecs: number;
  onDone?: () => void;
}) {
  const [secs, setSecs] = useState(initialSecs);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setSecs(initialSecs);
  }, [initialSecs]);

  useEffect(() => {
    if (!running || secs <= 0) return;
    const t = window.setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          setRunning(false);
          onDone?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [running, secs, onDone]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="text-center">
      <p className="mb-4 text-5xl font-extrabold tabular-nums">{fmt(secs)}</p>
      <div className="flex justify-center gap-2">
        <Button type="button" size="sm" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : "Démarrer"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setSecs(initialSecs);
            setRunning(false);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

function SessionJournalPanel({
  quickLog,
  votes,
  notes,
}: {
  quickLog: MeetingQuickLogEntry[];
  votes: MeetingVoteEntry[];
  notes: MeetingNoteEntry[];
}) {
  const empty = quickLog.length === 0 && votes.length === 0 && notes.length === 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Historique en direct de la séance : votes, outils rapides et notes capturées.
      </p>

      {empty ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Le journal se remplit au fil de la séance (votes, outils rapides, notes flottantes).
        </div>
      ) : (
        <>
          {votes.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <Vote className="h-4 w-4" /> Votes
              </h3>
              <ul className="space-y-2">
                {votes.map((v, i) => (
                  <li key={i} className="rounded-xl border px-3 py-2 text-sm">
                    <p className="text-[10px] font-bold text-muted-foreground">{v.time} · {v.kind}</p>
                    <p className="font-semibold">{v.q}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {v.options.map((o) => `${o.label} (${o.pct} %)`).join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {quickLog.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <List className="h-4 w-4" /> Outils rapides
              </h3>
              <ul className="space-y-2">
                {quickLog.map((e, i) => (
                  <li key={i} className="rounded-xl border px-3 py-2 text-sm">
                    <p className="text-[10px] font-bold text-muted-foreground">{e.time} · {e.kind}</p>
                    <p className="font-semibold">{e.q}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{e.result}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {notes.length > 0 && (
            <section>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                <MessageSquare className="h-4 w-4" /> Notes
              </h3>
              <ul className="space-y-2">
                {notes.map((n, i) => (
                  <li key={i} className="rounded-xl border px-3 py-2 text-sm">
                    <p className="text-[10px] font-bold text-muted-foreground">
                      {n.time} · {n.author} · {n.vis === "prive" ? "Privé" : "Public"}
                    </p>
                    <p className="mt-0.5">{n.text}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SessionDiscussionPanel({
  messages,
  onSend,
}: {
  messages: SessionCaptureState["discussion"];
  onSend: (text: string) => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState("");

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    onSend(t);
    setDraft("");
  };

  return (
    <div className="flex h-[min(480px,60vh)] flex-col rounded-2xl border">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Échangez ici pendant la séance. Les messages sont enregistrés dans le compte rendu.
          </p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="rounded-xl bg-muted/50 px-3 py-2 text-sm">
              <p className="text-[10px] font-bold text-muted-foreground">
                {m.author} · {m.time}
              </p>
              <p className="mt-0.5">{m.text}</p>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2 border-t p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Votre message…"
          className="rounded-xl"
        />
        <Button type="button" size="icon" className="shrink-0 rounded-xl" onClick={submit} disabled={!draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="border-t px-3 py-2">
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => router.push("/dashboard/messages")}>
          Ouvrir Messages
        </Button>
      </div>
    </div>
  );
}
