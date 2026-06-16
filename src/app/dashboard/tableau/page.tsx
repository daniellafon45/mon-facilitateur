"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { WhiteboardPage } from "@/components/whiteboard/whiteboard-page";

export default function TableauPage() {
  return (
    <DashboardShell>
      <WhiteboardPage />
    </DashboardShell>
  );
}
