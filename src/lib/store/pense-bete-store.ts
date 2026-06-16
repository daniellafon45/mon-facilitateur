"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PenseBeteNote } from "@/lib/pense-bete/types";

let noteSeq = 0;
const noteId = () => `pb${++noteSeq}`;

export function sortPenseBeteNotes(notes: PenseBeteNote[]) {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

interface PenseBeteStore {
  notes: PenseBeteNote[];
  list: () => PenseBeteNote[];
  get: (id: string) => PenseBeteNote | undefined;
  add: (opts?: Partial<Pick<PenseBeteNote, "title" | "content" | "color">>) => PenseBeteNote;
  update: (id: string, patch: Partial<Pick<PenseBeteNote, "title" | "content" | "color" | "pinned">>) => void;
  remove: (id: string) => void;
  togglePin: (id: string) => void;
  resetAll: () => void;
}

export const usePenseBeteStore = create<PenseBeteStore>()(
  persist(
    (set, get) => ({
      notes: [],

      list: () => sortPenseBeteNotes(get().notes),

      get: (id) => get().notes.find((n) => n.id === id),

      add: (opts = {}) => {
        const now = Date.now();
        const note: PenseBeteNote = {
          id: noteId(),
          title: opts.title ?? "Nouveau pense-bête",
          content: opts.content ?? "",
          color: opts.color ?? Math.floor(Math.random() * 5),
          pinned: false,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ notes: [note, ...s.notes] }));
        return note;
      },

      update: (id, patch) => {
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
          ),
        }));
      },

      remove: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      togglePin: (id) => {
        const note = get().get(id);
        if (!note) return;
        get().update(id, { pinned: !note.pinned });
      },

      resetAll: () => set({ notes: [] }),
    }),
    { name: "mf-pense-bete" },
  ),
);
