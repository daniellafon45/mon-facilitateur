"use client";

import { SessionShell } from "@/components/session/session-shell";
import { useLaunchedSession } from "@/lib/session/use-launched-session";

export default function SoloSessionPage() {
  const session = useLaunchedSession("solo");

  return (
    <SessionShell
      mode={session.mode}
      methodIds={session.methodIds}
      projectId={session.projectId}
      meetingId={session.meetingId}
      objective={session.objective}
      simulating={session.simulating}
    />
  );
}
