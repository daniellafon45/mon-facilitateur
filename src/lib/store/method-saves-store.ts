"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/supabase/client";
import { fetchMethodSaves, saveMethodToProject } from "@/lib/supabase/queries/project-extras";

export interface MethodProjectSave {
  id: string;
  projectId: string;
  methodId: string;
  methodTitle: string;
  payload: unknown;
  savedAt: number;
}

let saveSeq = 0;
const nextId = () => `ms${Date.now()}-${++saveSeq}`;

interface MethodSavesStore {
  saves: MethodProjectSave[];
  hydratedProjects: string[];
  add: (entry: Omit<MethodProjectSave, "id" | "savedAt">) => MethodProjectSave;
  listForProject: (projectId: string) => MethodProjectSave[];
  loadForProject: (projectId: string) => Promise<void>;
}

export const useMethodSavesStore = create<MethodSavesStore>()(
  persist(
    (set, get) => ({
      saves: [],
      hydratedProjects: [],

      loadForProject: async (projectId) => {
        if (get().hydratedProjects.includes(projectId)) return;
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;
        try {
          const rows = await fetchMethodSaves(supabase, projectId);
          const mapped: MethodProjectSave[] = rows.map((r) => ({
            id: r.id,
            projectId: r.projectId,
            methodId: r.methodId,
            methodTitle: r.title,
            payload: r.payload,
            savedAt: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
          }));
          set((s) => ({
            saves: [...s.saves.filter((x) => x.projectId !== projectId), ...mapped],
            hydratedProjects: [...s.hydratedProjects, projectId],
          }));
        } catch {
          set((s) => ({ hydratedProjects: [...s.hydratedProjects, projectId] }));
        }
      },

      add: (entry) => {
        const record: MethodProjectSave = {
          id: nextId(),
          savedAt: Date.now(),
          ...entry,
        };
        set((s) => ({ saves: [record, ...s.saves] }));
        void (async () => {
          const supabase = createClient();
          const { data: auth } = await supabase.auth.getUser();
          if (!auth.user) return;
          try {
            const row = await saveMethodToProject(supabase, auth.user.id, {
              projectId: entry.projectId,
              methodId: entry.methodId,
              title: entry.methodTitle,
              payload: (entry.payload as Record<string, unknown>) ?? {},
            });
            set((s) => ({
              saves: s.saves.map((x) =>
                x.id === record.id ? { ...x, id: row.id } : x,
              ),
            }));
          } catch {
            /* local only */
          }
        })();
        return record;
      },

      listForProject: (projectId) =>
        get().saves.filter((s) => s.projectId === projectId),
    }),
    { name: "mf-method-saves-v1" },
  ),
);
