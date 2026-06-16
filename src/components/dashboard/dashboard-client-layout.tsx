"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AssistantModal } from "@/components/dashboard/assistant-modal";
import { DashboardUiProvider } from "@/components/dashboard/dashboard-ui-context";

interface DashboardClientLayoutProps {
  children: ReactNode;
}

export function DashboardClientLayout({ children }: DashboardClientLayoutProps) {
  const pathname = usePathname();
  const [aiOpen, setAiOpen] = useState(false);
  const [aiSeed, setAiSeed] = useState("");
  const focusHandlerRef = useRef<(() => string) | null>(null);

  const openAssistant = useCallback((seed = "") => {
    setAiSeed(seed);
    setAiOpen(true);
  }, []);

  const setAssistantFocusHandler = useCallback((handler: (() => string) | null) => {
    focusHandlerRef.current = handler;
  }, []);

  const handleSearchFocus = useCallback(() => {
    openAssistant(focusHandlerRef.current?.() ?? "");
  }, [openAssistant]);

  const isFullBleed =
    pathname?.startsWith("/dashboard/wizard") || pathname?.startsWith("/dashboard/session");

  return (
    <DashboardUiProvider openAssistant={openAssistant} setAssistantFocusHandler={setAssistantFocusHandler}>
      <DashboardShell onOpenAssistant={handleSearchFocus} fullBleed={isFullBleed}>
        {children}
      </DashboardShell>
      <AssistantModal open={aiOpen} initialText={aiSeed} onClose={() => setAiOpen(false)} />
    </DashboardUiProvider>
  );
}
