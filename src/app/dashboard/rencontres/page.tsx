"use client";

import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AssistantModal } from "@/components/dashboard/assistant-modal";
import { MeetingsPage } from "@/components/meetings/meetings-page";

export default function RencontresPage() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <DashboardShell onOpenAssistant={() => setAiOpen(true)}>
      <MeetingsPage />
      <AssistantModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </DashboardShell>
  );
}
