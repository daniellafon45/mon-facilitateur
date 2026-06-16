import { createServiceClient } from "@/lib/supabase/admin";
import type { SyncContext, SyncResult } from "../../types";
import { apiFetch, emptySyncResult } from "../../providers/oauth-helpers";
import { resolveConflict } from "../conflict";

interface ExternalTask {
  id: string;
  title?: string;
  name?: string;
  completed?: boolean;
  done?: boolean;
  modified_at?: string;
  updated_at?: string;
}

export async function pullExternalTasks(
  ctx: SyncContext,
  listUrl: string,
  source: string,
  mapItem: (raw: unknown) => ExternalTask,
): Promise<SyncResult> {
  if (ctx.accessToken.startsWith("mock_")) return emptySyncResult();
  const supabase = createServiceClient();
  const raw = await apiFetch<{ data?: unknown[]; tasks?: unknown[] }>(listUrl, ctx.accessToken);
  const items = (raw.data ?? raw.tasks ?? []) as unknown[];
  let pulled = 0;
  const errors: string[] = [];

  for (const item of items) {
    const t = mapItem(item);
    if (!t.id) continue;
    try {
      const title = t.title ?? t.name ?? "Tâche";
      const done = t.completed ?? t.done ?? false;
      const extUpdated = t.modified_at ?? t.updated_at ?? new Date().toISOString();

      const { data: existing } = await supabase
        .from("tasks")
        .select("*")
        .eq("owner_id", ctx.userId)
        .eq("sync_source", source)
        .eq("external_id", t.id)
        .maybeSingle();

      if (existing) {
        if (resolveConflict(existing.updated_at, extUpdated) === "external") {
          await supabase
            .from("tasks")
            .update({ title, done, external_updated_at: extUpdated })
            .eq("id", existing.id);
          pulled++;
        }
      } else {
        await supabase.from("tasks").insert({
          owner_id: ctx.userId,
          project_id: ctx.projectId ?? null,
          title,
          done,
          external_id: t.id,
          sync_source: source,
          external_updated_at: extUpdated,
        });
        pulled++;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur task pull");
    }
  }
  return { pulled, pushed: 0, errors };
}

export async function pushLocalTasks(
  ctx: SyncContext,
  createUrl: string,
  source: string,
  buildBody: (task: { id: string; title: string; done: boolean }) => unknown,
): Promise<SyncResult> {
  if (ctx.accessToken.startsWith("mock_")) return emptySyncResult();
  const supabase = createServiceClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("owner_id", ctx.userId)
    .is("external_id", null)
    .limit(20);

  let pushed = 0;
  const errors: string[] = [];
  for (const task of tasks ?? []) {
    try {
      const created = await apiFetch<{ id?: string; gid?: string }>(createUrl, ctx.accessToken, {
        method: "POST",
        body: JSON.stringify(buildBody(task)),
      });
      const extId = created.id ?? created.gid;
      if (extId) {
        await supabase
          .from("tasks")
          .update({ external_id: extId, sync_source: source })
          .eq("id", task.id);
        pushed++;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur task push");
    }
  }
  return { pulled: 0, pushed, errors };
}
