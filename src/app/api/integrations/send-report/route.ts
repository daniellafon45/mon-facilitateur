import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendSessionReport } from "@/lib/integrations/actions";
import type { ProviderId } from "@/lib/integrations/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const result = await sendSessionReport({
    userId: user.id,
    channel: body.channel as ProviderId | "email",
    title: body.title ?? "Compte rendu de session",
    content: body.content ?? "",
    settings: body.settings,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
