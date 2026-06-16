import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getProviderAdapter } from "@/lib/integrations/providers/index";
import { verifySlackSignature } from "@/lib/integrations/providers/slack";
import { runSyncForUser } from "@/lib/integrations/sync/engine";
import type { ProviderId } from "@/lib/integrations/types";

async function logWebhook(provider: string, eventId: string, payload: unknown, ownerId?: string) {
  const supabase = createServiceClient();
  await supabase.from("integration_webhook_events").upsert(
    {
      provider_id: provider,
      external_event_id: eventId,
      owner_id: ownerId ?? null,
      payload: payload as Record<string, unknown>,
      processed_at: new Date().toISOString(),
    },
    { onConflict: "provider_id,external_event_id" },
  );
}

export async function POST(request: Request) {
  const bodyText = await request.text();
  const timestamp = request.headers.get("x-slack-request-timestamp") ?? "";
  const signature = request.headers.get("x-slack-signature") ?? "";
  const signingSecret = process.env.SLACK_SIGNING_SECRET ?? "";

  if (signingSecret && signature) {
    if (!verifySlackSignature(signingSecret, timestamp, bodyText, signature)) {
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }
  }

  const payload = JSON.parse(bodyText || "{}") as { type?: string; challenge?: string; event_id?: string; team_id?: string };
  if (payload.type === "url_verification") {
    return NextResponse.json({ challenge: payload.challenge });
  }

  const eventId = payload.event_id ?? `slack-${Date.now()}`;
  await logWebhook("slack", eventId, payload);

  const adapter = getProviderAdapter("slack");
  await adapter.handleWebhook?.(payload);

  return NextResponse.json({ ok: true });
}
