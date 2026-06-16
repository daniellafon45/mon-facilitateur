import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getProviderAdapter } from "@/lib/integrations/providers/index";

export async function POST(request: Request) {
  const payload = await request.json();
  const eventId = (payload as { id?: string }).id ?? `notion-${Date.now()}`;

  const supabase = createServiceClient();
  await supabase.from("integration_webhook_events").upsert(
    {
      provider_id: "notion",
      external_event_id: eventId,
      payload,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "provider_id,external_event_id" },
  );

  await getProviderAdapter("notion").handleWebhook?.(payload);
  return NextResponse.json({ ok: true });
}
