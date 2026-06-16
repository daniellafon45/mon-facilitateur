"use client";

import { Suspense } from "react";
import { IntegrationsView } from "@/components/integrations/integrations-view";
import type { IntegrationItem } from "@/lib/integrations/catalog-items";

export default function IntegrationsPageClient({
  initialItems,
  connectedCount,
}: {
  initialItems: IntegrationItem[];
  connectedCount: number;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Chargement…</div>}>
      <IntegrationsView initialItems={initialItems} connectedCount={connectedCount} />
    </Suspense>
  );
}
