"use client";

import { useEffect } from "react";
import { ProjetsPage } from "@/components/projets/projets-page";
import { useFacilitationStore } from "@/lib/store/facilitation-store";

export default function ProjetsDashboardPage() {
  const store = useFacilitationStore();

  useEffect(() => {
    if (!store.hydrated) void store.hydrateFromSupabase();
  }, [store.hydrated, store.hydrateFromSupabase]);

  return <ProjetsPage />;
}
