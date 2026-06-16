import { createClient } from "@/lib/supabase/server";
import { listUserIntegrations } from "@/lib/integrations/db";
import { buildFallbackIntegrations, type IntegrationItem } from "@/lib/integrations/catalog-items";
import { PROVIDER_CATALOG } from "@/lib/integrations/providers/registry";
import IntegrationsPageClient from "./integrations-client";

export default async function IntegrationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialItems: IntegrationItem[] = buildFallbackIntegrations();
  let connectedCount = 0;

  if (user) {
    try {
      const connected = await listUserIntegrations(user.id);
      const connectedMap = new Map(connected.map((c) => [c.provider_id, c]));
      initialItems = PROVIDER_CATALOG.map((p) => ({
        ...p,
        status: connectedMap.get(p.id)?.status ?? "disconnected",
        connectedAt: connectedMap.get(p.id)?.connected_at ?? null,
        accountName: connectedMap.get(p.id)?.external_account_name ?? null,
      }));
      connectedCount = connected.filter((c) => c.status === "connected").length;
    } catch {
      /* DB migration may not be applied yet */
    }
  }

  return <IntegrationsPageClient initialItems={initialItems} connectedCount={connectedCount} />;
}
