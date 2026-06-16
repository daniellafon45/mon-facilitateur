"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Pin, Plus, StickyNote, Trash2, X } from "lucide-react";
import { sortPenseBeteNotes, usePenseBeteStore } from "@/lib/store/pense-bete-store";
import { fmtPenseBeteDate, PENSE_BETE_COLORS } from "@/lib/pense-bete/constants";
import type { PenseBeteNote } from "@/lib/pense-bete/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function StickyCard({
  note,
  onClick,
}: {
  note: PenseBeteNote;
  onClick: () => void;
}) {
  const palette = PENSE_BETE_COLORS[note.color % PENSE_BETE_COLORS.length];
  const preview = note.content.trim() || "Cliquez pour écrire votre note…";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-[148px] w-full rounded-xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{
        background: palette.bg,
        borderColor: palette.bd,
        color: palette.fg,
        transform: `rotate(${note.id.charCodeAt(note.id.length - 1) % 2 === 0 ? -0.6 : 0.6}deg)`,
      }}
    >
      {note.pinned && (
        <Pin
          className="absolute right-3 top-3 h-3.5 w-3.5 opacity-70"
          style={{ color: palette.fg }}
        />
      )}
      <p className="pr-6 text-sm font-extrabold leading-snug">{note.title}</p>
      <p className="mt-2 line-clamp-4 text-xs font-semibold leading-relaxed opacity-85">
        {preview}
      </p>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-wide opacity-60">
        {fmtPenseBeteDate(note.updatedAt)}
      </p>
    </button>
  );
}

function NoteEditor({
  note,
  open,
  onClose,
  onDelete,
}: {
  note: PenseBeteNote | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const update = usePenseBeteStore((s) => s.update);
  const togglePin = usePenseBeteStore((s) => s.togglePin);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  const palette = note
    ? PENSE_BETE_COLORS[note.color % PENSE_BETE_COLORS.length]
    : PENSE_BETE_COLORS[0];

  const syncFromNote = (n: PenseBeteNote | null) => {
    setTitle(n?.title ?? "");
    setContent(n?.content ?? "");
    setSaved(false);
  };

  useEffect(() => {
    if (open && note) syncFromNote(note);
  }, [open, note]);

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  const save = () => {
    if (!note) return;
    update(note.id, { title: title.trim() || "Sans titre", content });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-lg gap-0 overflow-hidden border-0 p-0 shadow-xl sm:rounded-2xl"
      >
        {note && (
          <div
            className="p-5"
            style={{ background: palette.bg, color: palette.fg }}
          >
            <DialogHeader className="space-y-0 text-left">
              <div className="mb-3 flex items-start justify-between gap-3">
                <DialogTitle className="sr-only">Éditer le pense-bête</DialogTitle>
                <StickyNote className="h-5 w-5 shrink-0 opacity-70" />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title={note.pinned ? "Désépingler" : "Épingler"}
                    onClick={() => togglePin(note.id)}
                    className="rounded-lg p-1.5 opacity-70 transition hover:bg-black/5 hover:opacity-100"
                  >
                    <Pin className={cn("h-4 w-4", note.pinned && "fill-current")} />
                  </button>
                  <button
                    type="button"
                    title="Supprimer"
                    onClick={() => {
                      onDelete(note.id);
                      onClose();
                    }}
                    className="rounded-lg p-1.5 opacity-70 transition hover:bg-black/5 hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Fermer"
                    onClick={onClose}
                    className="rounded-lg p-1.5 opacity-70 transition hover:bg-black/5 hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3 flex gap-1.5">
                {PENSE_BETE_COLORS.map((c, i) => (
                  <button
                    key={c.bg}
                    type="button"
                    title={`Couleur ${i + 1}`}
                    onClick={() => update(note.id, { color: i })}
                    className={cn(
                      "h-5 w-5 rounded-full border-2 transition-transform hover:scale-110",
                      note.color % PENSE_BETE_COLORS.length === i && "scale-110 border-foreground/70",
                    )}
                    style={{
                      background: c.bg,
                      borderColor: note.color % PENSE_BETE_COLORS.length === i ? c.fg : c.bd,
                    }}
                  />
                ))}
              </div>

              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre du pense-bête"
                className="mb-3 border-0 bg-white/50 font-extrabold shadow-none focus-visible:ring-1"
                style={{ color: palette.fg }}
              />
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrivez votre idée, rappel ou note rapide…"
                rows={8}
                className="resize-none border-0 bg-white/40 font-semibold shadow-none focus-visible:ring-1"
                style={{ color: palette.fg }}
              />
            </DialogHeader>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold opacity-60">
                Modifié le {fmtPenseBeteDate(note.updatedAt)}
              </p>
              <Button
                size="sm"
                className="gap-1.5 rounded-xl"
                style={{ background: palette.fg, color: palette.bg }}
                onClick={save}
              >
                {saved ? <Check className="h-4 w-4" /> : null}
                {saved ? "Enregistré" : "Enregistrer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PenseBetePage() {
  const rawNotes = usePenseBeteStore((s) => s.notes);
  const notes = useMemo(() => sortPenseBeteNotes(rawNotes), [rawNotes]);
  const add = usePenseBeteStore((s) => s.add);
  const remove = usePenseBeteStore((s) => s.remove);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeId) ?? null,
    [notes, activeId],
  );

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const createNote = () => {
    const note = add();
    setActiveId(note.id);
    flash("Pense-bête créé");
  };

  const openNote = (id: string) => setActiveId(id);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Pense-bête</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Capturez vos idées, rappels et notes rapides en un clic.
          </p>
        </div>
        <Button className="gap-1.5 rounded-xl" onClick={createNote}>
          <Plus className="h-4 w-4" />
          Nouveau pense-bête
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
          <StickyNote className="mx-auto mb-4 h-14 w-14 text-muted-foreground/40" />
          <p className="text-lg font-extrabold">Aucun pense-bête pour l&apos;instant</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Créez votre première note pour garder une idée sous la main pendant vos séances.
          </p>
          <Button className="mt-5 gap-1.5 rounded-xl" size="sm" onClick={createNote}>
            <Plus className="h-4 w-4" />
            Créer un pense-bête
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note) => (
            <StickyCard key={note.id} note={note} onClick={() => openNote(note.id)} />
          ))}
          <button
            type="button"
            onClick={createNote}
            className="flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 text-sm font-bold text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground"
          >
            <Plus className="h-6 w-6" />
            Ajouter
          </button>
        </div>
      )}

      <NoteEditor
        note={activeNote}
        open={!!activeId}
        onClose={() => setActiveId(null)}
        onDelete={(id) => {
          remove(id);
          flash("Pense-bête supprimé");
        }}
      />

      {toast && (
        <div className="fixed bottom-7 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-xl">
          <Check className="h-4 w-4" />
          {toast}
        </div>
      )}
    </div>
  );
}
