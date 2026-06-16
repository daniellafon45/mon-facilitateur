"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AssistantModal } from "@/components/dashboard/assistant-modal";
import { PenseBetePage } from "@/components/pense-bete/pense-bete-page";

export default function Page() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <DashboardShell onOpenAssistant={() => setAiOpen(true)}>
      <PenseBetePage />
      <AssistantModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </DashboardShell>
  );
}
