import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runSyncForUser } from "@/lib/integrations/sync/engine";
import { isValidProviderId } from "@/lib/integrations/providers/index";
import type { EntityType } from "@/lib/integrations/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!isValidProviderId(provider)) {
    return NextResponse.json({ error: "Provider invalide" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const entityType = (body.entityType as EntityType) ?? "meetings";
  const direction = body.direction ?? "bidirectional";

  const result = await runSyncForUser(user.id, provider, entityType, direction);
  return NextResponse.json(result);
}
