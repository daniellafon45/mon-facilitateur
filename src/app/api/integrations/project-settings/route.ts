import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertProjectIntegrationSettings } from "@/lib/integrations/db";
import { isValidProviderId } from "@/lib/integrations/providers/index";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const projectId = new URL(request.url).searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId requis" }, { status: 400 });

  const { data } = await supabase
    .from("project_integration_settings")
    .select("*")
    .eq("project_id", projectId)
    .eq("owner_id", user.id);

  return NextResponse.json({ settings: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { projectId, providerId, settings } = body;
  if (!projectId || !providerId || !isValidProviderId(providerId)) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  const row = await upsertProjectIntegrationSettings(projectId, user.id, providerId, settings ?? {});
  return NextResponse.json({ settings: row });
}
