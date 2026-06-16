import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { disconnectIntegration } from "@/lib/integrations/db";
import { isValidProviderId } from "@/lib/integrations/providers/index";

export async function POST(
  _request: Request,
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

  await disconnectIntegration(user.id, provider);
  return NextResponse.json({ ok: true });
}
