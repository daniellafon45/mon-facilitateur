"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createInitialProgress } from "@/lib/learn/data";

interface LearnStore {
  progress: Record<string, boolean[]>;
  saved: string[];
  toggleModule: (parcoursId: string, idx: number) => void;
  toggleSave: (methodId: string) => void;
  resetProgress: () => void;
}

export const useLearnStore = create<LearnStore>()(
  persist(
    (set, get) => ({
      progress: createInitialProgress(),
      saved: ["bmc"],

      toggleModule: (parcoursId, idx) => {
        set((s) => {
          const arr = [...(s.progress[parcoursId] || [])];
          arr[idx] = !arr[idx];
          return { progress: { ...s.progress, [parcoursId]: arr } };
        });
      },

      toggleSave: (methodId) => {
        const cur = get().saved;
        set({
          saved: cur.includes(methodId)
            ? cur.filter((x) => x !== methodId)
            : [...cur, methodId],
        });
      },

      resetProgress: () => set({ progress: createInitialProgress() }),
    }),
    { name: "mf-learn-v1" },
  ),
);
