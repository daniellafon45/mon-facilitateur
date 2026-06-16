import { createServiceClient } from "@/lib/supabase/admin";
import {
  deserializeTokens,
  isTokenExpired,
  serializeTokens,
  type StoredTokens,
} from "./token-vault";
import type { ProviderId, TokenSet, UserIntegrationRow } from "./types";
import { getProviderAdapter } from "./providers/index";

export async function listUserIntegrations(userId: string): Promise<UserIntegrationRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("owner_id", userId)
    .order("connected_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as UserIntegrationRow[];
}

export async function getUserIntegration(userId: string, providerId: ProviderId) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("owner_id", userId)
    .eq("provider_id", providerId)
    .maybeSingle();
  return data as UserIntegrationRow | null;
}

export async function upsertConnection(
  userId: string,
  providerId: ProviderId,
  tokens: TokenSet,
  account?: { id?: string; name?: string },
) {
  const supabase = createServiceClient();
  const { data: integration, error: intErr } = await supabase
    .from("user_integrations")
    .upsert(
      {
        owner_id: userId,
        provider_id: providerId,
        status: "connected",
        external_account_id: account?.id ?? null,
        external_account_name: account?.name ?? null,
        connected_at: new Date().toISOString(),
        disconnected_at: null,
      },
      { onConflict: "owner_id,provider_id" },
    )
    .select("*")
    .single();
  if (intErr) throw intErr;

  const stored = serializeTokens(tokens);
  const { error: tokErr } = await supabase.from("integration_tokens").upsert(
    {
      user_integration_id: integration.id,
      ...stored,
      scopes: stored.scopes,
    },
    { onConflict: "user_integration_id" },
  );
  if (tokErr) throw tokErr;

  await supabase.from("sync_jobs").insert({
    owner_id: userId,
    user_integration_id: integration.id,
    provider_id: providerId,
    entity_type: "meetings",
    direction: "bidirectional",
    status: "pending",
  });

  return integration as UserIntegrationRow;
}

export async function disconnectIntegration(userId: string, providerId: ProviderId) {
  const supabase = createServiceClient();
  const integration = await getUserIntegration(userId, providerId);
  if (!integration) return;

  const { data: tokenRow } = await supabase
    .from("integration_tokens")
    .select("*")
    .eq("user_integration_id", integration.id)
    .maybeSingle();

  if (tokenRow) {
    try {
      const tokens = deserializeTokens(tokenRow as StoredTokens);
      const adapter = getProviderAdapter(providerId);
      await adapter.revoke?.(tokens.accessToken);
    } catch {
      /* best effort */
    }
    await supabase.from("integration_tokens").delete().eq("user_integration_id", integration.id);
  }

  await supabase
    .from("user_integrations")
    .update({
      status: "disconnected",
      disconnected_at: new Date().toISOString(),
    })
    .eq("id", integration.id);
}

export async function getValidAccessToken(
  userId: string,
  providerId: ProviderId,
): Promise<{ accessToken: string; userIntegrationId: string } | null> {
  const supabase = createServiceClient();
  const integration = await getUserIntegration(userId, providerId);
  if (!integration || integration.status !== "connected") return null;

  const { data: tokenRow } = await supabase
    .from("integration_tokens")
    .select("*")
    .eq("user_integration_id", integration.id)
    .maybeSingle();
  if (!tokenRow) return null;

  let tokens = deserializeTokens(tokenRow as StoredTokens);

  if (isTokenExpired(tokenRow.expires_at) && tokens.refreshToken) {
    const adapter = getProviderAdapter(providerId);
    tokens = await adapter.refreshToken(tokens.refreshToken);
    const stored = serializeTokens(tokens);
    await supabase
      .from("integration_tokens")
      .update({ ...stored, scopes: stored.scopes })
      .eq("user_integration_id", integration.id);
  }

  return { accessToken: tokens.accessToken, userIntegrationId: integration.id };
}

export async function enqueueSyncJob(
  userId: string,
  providerId: ProviderId,
  entityType: string,
  direction: "pull" | "push" | "bidirectional" = "bidirectional",
) {
  const supabase = createServiceClient();
  const integration = await getUserIntegration(userId, providerId);
  await supabase.from("sync_jobs").insert({
    owner_id: userId,
    user_integration_id: integration?.id ?? null,
    provider_id: providerId,
    entity_type: entityType,
    direction,
    status: "pending",
  });
}

export async function getProjectIntegrationSettings(projectId: string, ownerId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("project_integration_settings")
    .select("*")
    .eq("project_id", projectId)
    .eq("owner_id", ownerId);
  return data ?? [];
}

export async function upsertProjectIntegrationSettings(
  projectId: string,
  ownerId: string,
  providerId: ProviderId,
  settings: Record<string, unknown>,
) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("project_integration_settings")
    .upsert(
      {
        project_id: projectId,
        owner_id: ownerId,
        provider_id: providerId,
        settings,
        enabled: true,
      },
      { onConflict: "project_id,provider_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function ensureZapierConnection(userId: string) {
  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("zapier_connections")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle();
  if (existing) return existing;

  const secret = crypto.randomUUID();
  const { data, error } = await supabase
    .from("zapier_connections")
    .insert({ owner_id: userId, webhook_secret: secret })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
