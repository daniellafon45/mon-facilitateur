import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOAuthState } from "@/lib/integrations/oauth/state";
import { getProviderAdapter, isValidProviderId } from "@/lib/integrations/providers/index";
import { ensureZapierConnection } from "@/lib/integrations/db";

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

  if (provider === "zapier") {
    const zap = await ensureZapierConnection(user.id);
    const tokens = await getProviderAdapter("zapier").exchangeCode("setup");
    const { upsertConnection } = await import("@/lib/integrations/db");
    await upsertConnection(user.id, "zapier", tokens);
    return NextResponse.json({
      redirectUrl: null,
      zapier: {
        inboundUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/webhooks/zapier?token=${zap.inbound_url_token}`,
        secret: zap.webhook_secret,
      },
    });
  }

  const state = createOAuthState(provider, user.id);
  const adapter = getProviderAdapter(provider);
  const authUrl = adapter.getAuthUrl(state);

  const response = NextResponse.json({ redirectUrl: authUrl });
  response.cookies.set("mf_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
