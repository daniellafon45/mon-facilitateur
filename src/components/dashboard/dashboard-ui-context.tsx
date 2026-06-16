"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

interface DashboardUiContextValue {
  openAssistant: (seed?: string) => void;
  setAssistantFocusHandler: (handler: (() => string) | null) => void;
}

const DashboardUiContext = createContext<DashboardUiContextValue | null>(null);

export function DashboardUiProvider({
  children,
  openAssistant,
  setAssistantFocusHandler,
}: DashboardUiContextValue & { children: ReactNode }) {
  return (
    <DashboardUiContext.Provider value={{ openAssistant, setAssistantFocusHandler }}>
      {children}
    </DashboardUiContext.Provider>
  );
}

export function useDashboardUi() {
  const ctx = useContext(DashboardUiContext);
  if (!ctx) {
    throw new Error("useDashboardUi must be used within DashboardUiProvider");
  }
  return ctx;
}

export function useDashboardUiOptional() {
  return useContext(DashboardUiContext);
}

/** Enregistre le texte à préremplir quand l'utilisateur focus la recherche du header. */
export function useAssistantFocusHandler(getter: () => string) {
  const ctx = useDashboardUiOptional();
  const getterRef = useRef(getter);
  getterRef.current = getter;

  const stableGetter = useCallback(() => getterRef.current(), []);

  useEffect(() => {
    if (!ctx) return;
    ctx.setAssistantFocusHandler(stableGetter);
    return () => ctx.setAssistantFocusHandler(null);
  }, [ctx, stableGetter]);
}
