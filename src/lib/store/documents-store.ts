"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CURRENT_USER_OWNER,
  docTypeFromName,
  isRecentDoc,
} from "@/lib/documents/constants";
import type { DocItem } from "@/lib/documents/types";

let docSeq = 100;
const docId = () => `d${++docSeq}`;

interface AddDocOpts {
  name?: string;
  type?: string;
  projectId?: string | null;
  meetingId?: string | null;
  owner?: string;
  size?: number;
  fav?: boolean;
  shared?: boolean;
  sharedWith?: string[];
  source?: string;
  ts?: number;
}

interface DocumentsStore {
  docs: DocItem[];
  list: (includeTrashed?: boolean) => DocItem[];
  get: (id: string) => DocItem | undefined;
  isRecent: (d: DocItem) => boolean;
  add: (opts?: AddDocOpts) => DocItem;
  addSessionOutputs: (meetingId: string, meetingName?: string, projectId?: string | null) => void;
  update: (id: string, patch: Partial<DocItem>) => void;
  toggleFav: (id: string) => void;
  rename: (id: string, name: string) => void;
  duplicate: (id: string) => DocItem | undefined;
  move: (id: string, projectId: string | null, meetingId?: string | null) => void;
  share: (id: string, withList: string[]) => void;
  trash: (id: string) => void;
  trashMany: (ids: string[]) => void;
  restore: (id: string) => void;
  purge: (id: string) => void;
  purgeAll: () => void;
  resetAll: () => void;
}

export const useDocumentsStore = create<DocumentsStore>()(
  persist(
    (set, get) => ({
      docs: [],

      list: (includeTrashed) => {
        const docs = get().docs;
        return includeTrashed ? docs : docs.filter((d) => !d.trashed);
      },

      get: (id) => get().docs.find((d) => d.id === id),

      isRecent: isRecentDoc,

      add: (opts = {}) => {
        const type = opts.type ?? (opts.name ? docTypeFromName(opts.name) : "DOCX");
        const doc: DocItem = {
          id: docId(),
          name: opts.name || "Nouveau document",
          type,
          projectId: opts.projectId ?? null,
          meetingId: opts.meetingId ?? null,
          owner: opts.owner || CURRENT_USER_OWNER,
          ts: opts.ts ?? Date.now(),
          size: opts.size ?? Math.round(200000 + Math.random() * 2500000),
          fav: !!opts.fav,
          shared: !!opts.shared,
          sharedWith: opts.sharedWith ?? [],
          source: (opts.source as DocItem["source"]) || "manuel",
          trashed: false,
        };
        set((s) => ({ docs: [doc, ...s.docs] }));
        return doc;
      },

      addSessionOutputs: (meetingId, meetingName, projectId) => {
        const base = meetingName ? ` ${meetingName}` : "";
        const now = Date.now();
        get().add({
          name: `Compte rendu de séance${base}.pdf`,
          type: "PDF",
          projectId: projectId ?? null,
          meetingId,
          owner: CURRENT_USER_OWNER,
          size: 980000,
          source: "compte rendu",
          ts: now,
        });
        get().add({
          name: `Plan d'action${base}.xlsx`,
          type: "XLSX",
          projectId: projectId ?? null,
          meetingId,
          owner: CURRENT_USER_OWNER,
          size: 410000,
          source: "séance",
          ts: now + 1,
        });
      },

      update: (id, patch) => {
        set((s) => ({
          docs: s.docs.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        }));
      },

      toggleFav: (id) => {
        const d = get().get(id);
        if (d) get().update(id, { fav: !d.fav });
      },

      rename: (id, name) => {
        if (name.trim()) get().update(id, { name: name.trim() });
      },

      duplicate: (id) => {
        const d = get().get(id);
        if (!d) return undefined;
        const copy: DocItem = {
          ...d,
          id: docId(),
          name: d.name.replace(/(\.\w+)?$/, " (copie)$1"),
          ts: Date.now(),
          shared: false,
          sharedWith: [],
          trashed: false,
        };
        set((s) => ({ docs: [copy, ...s.docs] }));
        return copy;
      },

      move: (id, projectId, meetingId) => {
        const patch: Partial<DocItem> = { projectId: projectId || null };
        if (meetingId !== undefined) patch.meetingId = meetingId || null;
        get().update(id, patch);
      },

      share: (id, withList) => {
        get().update(id, {
          shared: withList.length > 0,
          sharedWith: withList,
        });
      },

      trash: (id) => {
        get().update(id, { trashed: true, deletedTs: Date.now() });
      },

      trashMany: (ids) => {
        const now = Date.now();
        set((s) => ({
          docs: s.docs.map((d) =>
            ids.includes(d.id) ? { ...d, trashed: true, deletedTs: now } : d,
          ),
        }));
      },

      restore: (id) => {
        set((s) => ({
          docs: s.docs.map((d) =>
            d.id === id ? { ...d, trashed: false, deletedTs: undefined } : d,
          ),
        }));
      },

      purge: (id) => {
        set((s) => ({ docs: s.docs.filter((d) => d.id !== id) }));
      },

      purgeAll: () => {
        set((s) => ({ docs: s.docs.filter((d) => !d.trashed) }));
      },

      resetAll: () => set({ docs: [] }),
    }),
    { name: "mf-docs-v1" },
  ),
);
