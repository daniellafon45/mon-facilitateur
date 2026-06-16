import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listUserIntegrations } from "@/lib/integrations/db";
import { PROVIDER_CATALOG } from "@/lib/integrations/providers/registry";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const connected = await listUserIntegrations(user.id);
  const connectedMap = new Map(connected.map((c) => [c.provider_id, c]));

  const integrations = PROVIDER_CATALOG.map((p) => ({
    ...p,
    status: connectedMap.get(p.id)?.status ?? "disconnected",
    connectedAt: connectedMap.get(p.id)?.connected_at ?? null,
    accountName: connectedMap.get(p.id)?.external_account_name ?? null,
  }));

  return NextResponse.json({ integrations, connectedCount: connected.filter((c) => c.status === "connected").length });
}
