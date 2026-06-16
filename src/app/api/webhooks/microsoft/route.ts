import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getProviderAdapter } from "@/lib/integrations/providers/index";

export async function POST(request: Request) {
  const validationToken = request.headers.get("clientstate");
  const payload = await request.json();
  const eventId = payload.value?.[0]?.subscriptionId ?? `ms-${Date.now()}`;

  const supabase = createServiceClient();
  await supabase.from("integration_webhook_events").upsert(
    {
      provider_id: "teams",
      external_event_id: eventId,
      owner_id: validationToken ?? null,
      payload,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "provider_id,external_event_id" },
  );

  if (validationToken) {
    const { data: integration } = await supabase
      .from("user_integrations")
      .select("owner_id, provider_id")
      .eq("owner_id", validationToken)
      .eq("provider_id", "teams")
      .maybeSingle();

    if (integration) {
      const { runSyncForUser } = await import("@/lib/integrations/sync/engine");
      await runSyncForUser(integration.owner_id, "teams", "meetings", "pull");
    }
  }

  const adapter = getProviderAdapter("teams");
  await adapter.handleWebhook?.(payload);
  return NextResponse.json({ ok: true }, { status: 202 });
}
