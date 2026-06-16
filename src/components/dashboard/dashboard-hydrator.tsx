"use client";

import { useEffect } from "react";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { useWizardStore } from "@/lib/store/wizard-store";

export function DashboardHydrator() {
  const hydrate = useFacilitationStore((s) => s.hydrateFromSupabase);
  const hydrateDraft = useWizardStore((s) => s.hydrateDraftFromServer);

  useEffect(() => {
    hydrate();
    void hydrateDraft();
  }, [hydrate, hydrateDraft]);

  return null;
}
