"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AssistantModal } from "@/components/dashboard/assistant-modal";
import { ModelesPage } from "@/components/modeles/modeles-page";
import { useFacilitationStore } from "@/lib/store/facilitation-store";

export default function Page() {
  const [aiOpen, setAiOpen] = useState(false);
  const store = useFacilitationStore();

  useEffect(() => {
    if (!store.hydrated) void store.hydrateFromSupabase();
  }, [store.hydrated, store.hydrateFromSupabase]);

  return (
    <DashboardShell onOpenAssistant={() => setAiOpen(true)}>
      <ModelesPage />
      <AssistantModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </DashboardShell>
  );
}
