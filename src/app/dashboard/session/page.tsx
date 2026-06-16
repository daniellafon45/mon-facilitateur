"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SessionShell } from "@/components/session/session-shell";
import { useLaunchedSession } from "@/lib/session/use-launched-session";

function TeamSessionInner() {
  const params = useSearchParams();
  const session = useLaunchedSession("equipe");
  const projectFromUrl = params.get("project");

  return (
    <SessionShell
      mode={session.mode === "solo" ? "equipe" : session.mode}
      methodIds={session.methodIds}
      projectId={session.projectId ?? projectFromUrl ?? undefined}
      meetingId={session.meetingId}
      objective={session.objective}
      simulating={session.simulating}
    />
  );
}

export default function TeamSessionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Chargement de la séance…</div>}>
      <TeamSessionInner />
    </Suspense>
  );
}
