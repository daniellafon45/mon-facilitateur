"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardThemeId } from "@/lib/data/dashboard-themes";

interface DashboardThemeStore {
  themeId: DashboardThemeId | null;
  setThemeId: (id: DashboardThemeId | null) => void;
  toggleThemeId: (id: DashboardThemeId) => void;
}

export const useDashboardThemeStore = create<DashboardThemeStore>()(
  persist(
    (set, get) => ({
      themeId: null,
      setThemeId: (themeId) => set({ themeId }),
      toggleThemeId: (id) => set({ themeId: get().themeId === id ? null : id }),
    }),
    { name: "mf-dashboard-theme" },
  ),
);
