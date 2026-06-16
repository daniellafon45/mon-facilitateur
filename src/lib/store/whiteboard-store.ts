"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WbElement } from "@/lib/whiteboard/elements";
import { WHITEBOARD_STORAGE_KEY } from "@/lib/whiteboard/constants";
import { createClient } from "@/lib/supabase/client";
import {
  assignWhiteboardProject,
  deleteWhiteboard,
  fetchWhiteboards,
  upsertWhiteboard,
  type WhiteboardRecord,
} from "@/lib/supabase/queries/whiteboards";

interface WhiteboardStore {
  boards: WhiteboardRecord[];
  currentId: string | null;
  hydrated: boolean;
  loading: boolean;
  hydrate: () => Promise<void>;
  setCurrent: (id: string | null) => void;
  saveBoard: (payload: {
    id?: string | null;
    name: string;
    elements: WbElement[];
    viewState?: { tx: number; ty: number; k: number };
    projectId?: string | null;
  }) => Promise<WhiteboardRecord>;
  removeBoard: (id: string) => Promise<void>;
  assignProject: (boardId: string, projectId: string | null) => Promise<void>;
  getCurrent: () => WhiteboardRecord | null;
  migrateLocalBoards: () => Promise<void>;
}

async function getUserId() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export const useWhiteboardStore = create<WhiteboardStore>()(
  persist(
    (set, get) => ({
      boards: [],
      currentId: null,
      hydrated: false,
      loading: false,

      hydrate: async () => {
        set({ loading: true });
        const { supabase, userId } = await getUserId();
        if (!userId) {
          set({ loading: false, hydrated: true });
          return;
        }
        try {
          await get().migrateLocalBoards();
          const boards = await fetchWhiteboards(supabase, userId);
          set({ boards, hydrated: true, loading: false });
        } catch {
          set({ hydrated: true, loading: false });
        }
      },

      setCurrent: (id) => set({ currentId: id }),

      getCurrent: () => {
        const { boards, currentId } = get();
        return boards.find((b) => b.id === currentId) ?? null;
      },

      saveBoard: async (payload) => {
        const { supabase, userId } = await getUserId();
        if (!userId) {
          const local: WhiteboardRecord = {
            id: payload.id ?? `local-${Date.now()}`,
            name: payload.name,
            projectId: payload.projectId ?? null,
            elements: payload.elements,
            viewState: payload.viewState ?? { tx: 0, ty: 0, k: 1 },
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          };
          set((s) => {
            const exists = s.boards.some((b) => b.id === local.id);
            const boards = exists
              ? s.boards.map((b) => (b.id === local.id ? local : b))
              : [local, ...s.boards];
            return { boards, currentId: local.id };
          });
          return local;
        }

        const saved = await upsertWhiteboard(supabase, userId, {
          id: payload.id ?? undefined,
          name: payload.name,
          elements: payload.elements,
          projectId: payload.projectId,
          viewState: payload.viewState,
        });

        set((s) => {
          const exists = s.boards.some((b) => b.id === saved.id);
          const boards = exists
            ? s.boards.map((b) => (b.id === saved.id ? saved : b))
            : [saved, ...s.boards];
          return { boards, currentId: saved.id };
        });
        return saved;
      },

      removeBoard: async (id) => {
        const { supabase, userId } = await getUserId();
        if (userId && !id.startsWith("local-")) {
          try {
            await deleteWhiteboard(supabase, userId, id);
          } catch {
            /* fallback local */
          }
        }
        set((s) => ({
          boards: s.boards.filter((b) => b.id !== id),
          currentId: s.currentId === id ? null : s.currentId,
        }));
      },

      assignProject: async (boardId, projectId) => {
        const { supabase, userId } = await getUserId();
        if (!userId || boardId.startsWith("local-")) {
          set((s) => ({
            boards: s.boards.map((b) =>
              b.id === boardId ? { ...b, projectId } : b,
            ),
          }));
          return;
        }
        const updated = await assignWhiteboardProject(
          supabase,
          userId,
          boardId,
          projectId,
        );
        set((s) => ({
          boards: s.boards.map((b) => (b.id === boardId ? updated : b)),
        }));
      },

      migrateLocalBoards: async () => {
        if (typeof window === "undefined") return;
        const flag = "mf-boards-migrated-v2";
        if (localStorage.getItem(flag)) return;

        const { supabase, userId } = await getUserId();
        if (!userId) return;

        try {
          const raw = localStorage.getItem(WHITEBOARD_STORAGE_KEY);
          if (!raw) {
            localStorage.setItem(flag, "1");
            return;
          }
          const list = JSON.parse(raw) as {
            id: string;
            name: string;
            els: WbElement[];
            createdAt: number;
          }[];
          for (const item of list) {
            await upsertWhiteboard(supabase, userId, {
              name: item.name,
              elements: item.els ?? [],
            });
          }
          localStorage.removeItem(WHITEBOARD_STORAGE_KEY);
          localStorage.setItem(flag, "1");
        } catch {
          /* ignore */
        }
      },
    }),
    {
      name: "mf-whiteboard-store-v1",
      partialize: (s) => ({ currentId: s.currentId }),
    },
  ),
);
