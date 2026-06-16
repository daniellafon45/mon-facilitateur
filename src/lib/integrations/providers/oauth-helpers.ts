import type { IntegrationProviderAdapter, ProviderId, SyncContext, SyncResult, TokenSet } from "../types";
import { callbackUrl, isDevMock } from "../oauth/state";

export function emptySyncResult(): SyncResult {
  return { pulled: 0, pushed: 0, errors: [] };
}

export function mockTokenSet(provider: string): TokenSet & { accountId: string; accountName: string } {
  return {
    accessToken: `mock_${provider}_${Date.now()}`,
    refreshToken: `mock_refresh_${provider}`,
    expiresAt: new Date(Date.now() + 3600_000),
    tokenType: "Bearer",
    scopes: [],
    accountId: `mock-${provider}-account`,
    accountName: `Compte ${provider} (dev)`,
  };
}

export async function oauthTokenRequest(
  url: string,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(String(data.error_description ?? data.error ?? "Échec OAuth"));
  }
  return data;
}

export function tokenFromOAuthResponse(data: Record<string, unknown>): TokenSet {
  return {
    accessToken: String(data.access_token),
    refreshToken: data.refresh_token ? String(data.refresh_token) : undefined,
    expiresAt: data.expires_in
      ? new Date(Date.now() + Number(data.expires_in) * 1000)
      : undefined,
    tokenType: data.token_type ? String(data.token_type) : "Bearer",
    scopes: data.scope ? String(data.scope).split(/[\s,]+/) : [],
  };
}

export type ProviderFactory = (id: ProviderId) => IntegrationProviderAdapter;

export function buildOAuth2Provider(opts: {
  id: ProviderId;
  authUrl: string;
  tokenUrl: string;
  clientId: () => string | undefined;
  clientSecret: () => string | undefined;
  scopes: string[];
  extraAuthParams?: Record<string, string>;
  entityHandlers?: Partial<
    Record<
      SyncContext["entityType"],
      { pull: (ctx: SyncContext) => Promise<SyncResult>; push: (ctx: SyncContext) => Promise<SyncResult> }
    >
  >;
}): IntegrationProviderAdapter {
  return {
    id: opts.id,
    getAuthUrl(state: string) {
      const clientId = opts.clientId();
      if (!clientId && isDevMock()) {
        return `${callbackUrl(opts.id)}?code=mock&state=${encodeURIComponent(state)}`;
      }
      if (!clientId) throw new Error(`Credentials manquants pour ${opts.id}`);
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl(opts.id),
        response_type: "code",
        scope: opts.scopes.join(" "),
        state,
        ...opts.extraAuthParams,
      });
      return `${opts.authUrl}?${params}`;
    },
    async exchangeCode(code: string) {
      if (isDevMock() && code === "mock") return mockTokenSet(opts.id);
      const clientId = opts.clientId();
      const clientSecret = opts.clientSecret();
      if (!clientId || !clientSecret) throw new Error(`Credentials manquants pour ${opts.id}`);
      const data = await oauthTokenRequest(opts.tokenUrl, {
        grant_type: "authorization_code",
        code,
        redirect_uri: callbackUrl(opts.id),
        client_id: clientId,
        client_secret: clientSecret,
      });
      return tokenFromOAuthResponse(data);
    },
    async refreshToken(refresh: string) {
      if (isDevMock()) return mockTokenSet(opts.id);
      const clientId = opts.clientId();
      const clientSecret = opts.clientSecret();
      if (!clientId || !clientSecret) throw new Error(`Credentials manquants pour ${opts.id}`);
      const data = await oauthTokenRequest(opts.tokenUrl, {
        grant_type: "refresh_token",
        refresh_token: refresh,
        client_id: clientId,
        client_secret: clientSecret,
      });
      return tokenFromOAuthResponse(data);
    },
    async pullChanges(ctx) {
      const handler = opts.entityHandlers?.[ctx.entityType]?.pull;
      return handler ? handler(ctx) : emptySyncResult();
    },
    async pushChanges(ctx) {
      const handler = opts.entityHandlers?.[ctx.entityType]?.push;
      return handler ? handler(ctx) : emptySyncResult();
    },
  };
}

export async function apiFetch<T>(
  url: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err.slice(0, 200)}`);
  }
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}
