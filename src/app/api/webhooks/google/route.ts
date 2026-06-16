import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { runSyncForUser } from "@/lib/integrations/sync/engine";

export async function POST(request: Request) {
  const channelId = request.headers.get("x-goog-channel-id") ?? `google-${Date.now()}`;
  const payload = { channelId, headers: Object.fromEntries(request.headers.entries()) };

  const supabase = createServiceClient();
  await supabase.from("integration_webhook_events").upsert(
    {
      provider_id: "gcal",
      external_event_id: channelId,
      payload,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "provider_id,external_event_id" },
  );

  const { data: integrations } = await supabase
    .from("user_integrations")
    .select("owner_id")
    .eq("provider_id", "gcal")
    .eq("status", "connected")
    .limit(5);

  for (const row of integrations ?? []) {
    await runSyncForUser(row.owner_id, "gcal", "meetings", "pull");
  }

  return NextResponse.json({ ok: true });
}
