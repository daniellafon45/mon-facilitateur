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

  // #region agent log
  fetch("http://127.0.0.1:7832/ingest/7be77228-998b-4d1e-b4e0-c2eb9fd16e21", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae2140" },
    body: JSON.stringify({
      sessionId: "ae2140",
      runId: "post-fix",
      hypothesisId: "A",
      location: "integrations/page.tsx:entry",
      message: "IntegrationsPage server render started",
      data: { hasUser: !!user },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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

  // #region agent log
  fetch("http://127.0.0.1:7832/ingest/7be77228-998b-4d1e-b4e0-c2eb9fd16e21", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae2140" },
    body: JSON.stringify({
      sessionId: "ae2140",
      runId: "post-fix",
      hypothesisId: "A",
      location: "integrations/page.tsx:return",
      message: "IntegrationsPage server render completed",
      data: { itemCount: initialItems.length, connectedCount },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return <IntegrationsPageClient initialItems={initialItems} connectedCount={connectedCount} />;
}
