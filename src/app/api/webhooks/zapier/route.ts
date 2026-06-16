import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getProviderAdapter } from "@/lib/integrations/providers/index";
import { runSyncForUser } from "@/lib/integrations/sync/engine";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const payload = await request.json();
  const supabase = createServiceClient();

  let ownerId: string | undefined;
  if (token) {
    const { data: zap } = await supabase
      .from("zapier_connections")
      .select("owner_id, webhook_secret")
      .eq("inbound_url_token", token)
      .maybeSingle();
    if (!zap) return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    ownerId = zap.owner_id;
    const authHeader = request.headers.get("x-zapier-secret");
    if (authHeader && authHeader !== zap.webhook_secret) {
      return NextResponse.json({ error: "Secret invalide" }, { status: 401 });
    }
  }

  const eventId = `zapier-${Date.now()}`;
  await supabase.from("integration_webhook_events").upsert(
    {
      provider_id: "zapier",
      external_event_id: eventId,
      owner_id: ownerId ?? null,
      payload,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "provider_id,external_event_id" },
  );

  if (ownerId) {
    await getProviderAdapter("zapier").handleWebhook?.(payload, {
      userId: ownerId,
      userIntegrationId: "",
      providerId: "zapier",
      accessToken: "zapier",
      entityType: "meetings",
    });
  }

  return NextResponse.json({ ok: true });
}
