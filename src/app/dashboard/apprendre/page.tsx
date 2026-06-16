"use client";

import { useEffect } from "react";
import { ApprendrePage } from "@/components/apprendre/apprendre-page";
import { useFacilitationStore } from "@/lib/store/facilitation-store";

export default function Page() {
  const store = useFacilitationStore();

  useEffect(() => {
    if (!store.hydrated) void store.hydrateFromSupabase();
  }, [store.hydrated, store.hydrateFromSupabase]);

  return <ApprendrePage />;
}
