import { createServiceClient } from "@/lib/supabase/admin";
import type { EntityType, ProviderId, SyncContext, SyncResult } from "../types";
import { getValidAccessToken } from "../db";
import { getProviderAdapter } from "../providers/index";

export async function runSyncForUser(
  userId: string,
  providerId: ProviderId,
  entityType: EntityType,
  direction: "pull" | "push" | "bidirectional" = "bidirectional",
): Promise<SyncResult> {
  const tokenInfo = await getValidAccessToken(userId, providerId);
  if (!tokenInfo) {
    return { pulled: 0, pushed: 0, errors: ["Intégration non connectée"] };
  }

  const ctx: SyncContext = {
    userId,
    userIntegrationId: tokenInfo.userIntegrationId,
    providerId,
    accessToken: tokenInfo.accessToken,
    entityType,
  };

  const adapter = getProviderAdapter(providerId);
  const errors: string[] = [];
  let pulled = 0;
  let pushed = 0;
  let cursor: string | undefined;

  if (direction === "pull" || direction === "bidirectional") {
    try {
      const r = await adapter.pullChanges(ctx);
      pulled += r.pulled;
      errors.push(...r.errors);
      cursor = r.cursor ?? cursor;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur pull");
    }
  }

  if (direction === "push" || direction === "bidirectional") {
    try {
      const r = await adapter.pushChanges(ctx);
      pushed += r.pushed;
      errors.push(...r.errors);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur push");
    }
  }

  const supabase = createServiceClient();
  await supabase.from("integration_sync_state").upsert(
    {
      user_integration_id: tokenInfo.userIntegrationId,
      entity_type: entityType,
      direction,
      last_synced_at: new Date().toISOString(),
      external_cursor: cursor ?? null,
    },
    { onConflict: "user_integration_id,entity_type,direction" },
  );

  return { pulled, pushed, errors, cursor };
}

export async function processPendingSyncJobs(limit = 10) {
  const supabase = createServiceClient();
  const { data: jobs } = await supabase
    .from("sync_jobs")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at")
    .limit(limit);

  if (!jobs?.length) return [];

  const results = [];
  for (const job of jobs) {
    await supabase
      .from("sync_jobs")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", job.id);

    try {
      const result = await runSyncForUser(
        job.owner_id,
        job.provider_id as ProviderId,
        job.entity_type as EntityType,
        job.direction as "pull" | "push" | "bidirectional",
      );
      await supabase
        .from("sync_jobs")
        .update({
          status: result.errors.length ? "failed" : "done",
          completed_at: new Date().toISOString(),
          result,
          error: result.errors.length ? result.errors.join("; ") : null,
        })
        .eq("id", job.id);
      results.push({ jobId: job.id, result });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur sync";
      const retry = (job.retry_count ?? 0) + 1;
      await supabase
        .from("sync_jobs")
        .update({
          status: retry >= (job.max_retries ?? 3) ? "failed" : "pending",
          retry_count: retry,
          error: msg,
          scheduled_at: new Date(Date.now() + retry * 60_000).toISOString(),
        })
        .eq("id", job.id);
      results.push({ jobId: job.id, error: msg });
    }
  }
  return results;
}

export async function refreshExpiringTokens() {
  const supabase = createServiceClient();
  const threshold = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const { data: tokens } = await supabase
    .from("integration_tokens")
    .select("*, user_integrations!inner(owner_id, provider_id, status)")
    .lte("expires_at", threshold)
    .not("refresh_token_enc", "is", null);

  if (!tokens?.length) return 0;

  let refreshed = 0;
  for (const row of tokens) {
    const ui = row.user_integrations as { owner_id: string; provider_id: ProviderId; status: string };
    if (ui.status !== "connected") continue;
    try {
      await getValidAccessToken(ui.owner_id, ui.provider_id);
      refreshed++;
    } catch {
      /* logged via integration status */
    }
  }
  return refreshed;
}

export { resolveConflict } from "./conflict";
