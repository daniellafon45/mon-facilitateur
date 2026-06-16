"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AssistantModal } from "@/components/dashboard/assistant-modal";
import { ProjetsPage } from "@/components/projets/projets-page";
import { useFacilitationStore } from "@/lib/store/facilitation-store";

export default function ProjetsDashboardPage() {
  const store = useFacilitationStore();
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (!store.hydrated) void store.hydrateFromSupabase();
  }, [store.hydrated, store.hydrateFromSupabase]);

  return (
    <DashboardShell onOpenAssistant={() => setAiOpen(true)}>
      <ProjetsPage />
      <AssistantModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </DashboardShell>
  );
}
