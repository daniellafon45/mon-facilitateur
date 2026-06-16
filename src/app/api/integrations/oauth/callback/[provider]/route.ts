import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyOAuthState, COOKIE_NAME } from "@/lib/integrations/oauth/state";
import { upsertConnection } from "@/lib/integrations/db";
import { getProviderAdapter, isValidProviderId } from "@/lib/integrations/providers/index";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const baseRedirect = `/dashboard/integrations`;

  if (error) {
    return NextResponse.redirect(`${baseRedirect}?error=${encodeURIComponent(error)}`);
  }

  if (!isValidProviderId(provider) || !code || !state) {
    return NextResponse.redirect(`${baseRedirect}?error=invalid_callback`);
  }

  try {
    const cookieStore = await cookies();
    const cookieState = cookieStore.get(COOKIE_NAME)?.value;
    if (cookieState && cookieState !== state) {
      throw new Error("State mismatch");
    }
    const payload = verifyOAuthState(state);
    if (payload.provider !== provider) throw new Error("Provider mismatch");

    const adapter = getProviderAdapter(provider);
    const tokens = await adapter.exchangeCode(code);
    const accountId = "accountId" in tokens ? (tokens as { accountId?: string }).accountId : undefined;
    const accountName = "accountName" in tokens ? (tokens as { accountName?: string }).accountName : undefined;

    await upsertConnection(payload.userId, provider, tokens, {
      id: accountId,
      name: accountName,
    });

    const response = NextResponse.redirect(`${baseRedirect}?connected=${provider}`);
    response.cookies.delete(COOKIE_NAME);
    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "oauth_failed";
    return NextResponse.redirect(`${baseRedirect}?error=${encodeURIComponent(msg)}`);
  }
}
