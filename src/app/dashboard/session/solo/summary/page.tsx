"use client";

import { useSearchParams } from "next/navigation";
import { SoloSummaryView } from "@/components/session/solo-summary-view";
import { useLaunchedSession } from "@/lib/session/use-launched-session";
import { Suspense } from "react";

function SoloSummaryContent() {
  const params = useSearchParams();
  const meetingId = params.get("meeting");
  const session = useLaunchedSession("solo");
  return (
    <SoloSummaryView
      meetingId={meetingId ?? session.meetingId}
      objective={session.objective}
    />
  );
}

export default function SoloSummaryPage() {
  return (
    <Suspense>
      <SoloSummaryContent />
    </Suspense>
  );
}
