"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MethodTemplate {
  id: string;
  name: string;
  methods: string[];
  createdAt: number;
}

interface MethodTemplatesStore {
  templates: MethodTemplate[];
  list: () => MethodTemplate[];
  save: (name: string, methodIds: string[]) => MethodTemplate;
  remove: (id: string) => void;
}

export const useMethodTemplatesStore = create<MethodTemplatesStore>()(
  persist(
    (set, get) => ({
      templates: [],

      list: () => get().templates,

      save: (name, methodIds) => {
        const t: MethodTemplate = {
          id: `tpl${Date.now()}`,
          name: (name || "Modèle sans nom").trim(),
          methods: [...methodIds],
          createdAt: Date.now(),
        };
        set((s) => ({ templates: [t, ...s.templates] }));
        return t;
      },

      remove: (id) => {
        set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
      },
    }),
    { name: "mf-perso-templates-v1" },
  ),
);
