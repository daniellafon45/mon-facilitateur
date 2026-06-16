import { createServiceClient } from "@/lib/supabase/admin";
import type { SyncContext, SyncResult } from "../../types";
import { apiFetch, emptySyncResult } from "../../providers/oauth-helpers";

export async function pullDriveFiles(ctx: SyncContext, listUrl: string, source: string): Promise<SyncResult> {
  if (ctx.accessToken.startsWith("mock_")) return emptySyncResult();
  const supabase = createServiceClient();
  const data = await apiFetch<{ files?: { id: string; name: string; mimeType?: string }[] }>(
    listUrl,
    ctx.accessToken,
  );
  let pulled = 0;
  const errors: string[] = [];

  for (const f of data.files ?? []) {
    try {
      const { data: existing } = await supabase
        .from("documents")
        .select("id")
        .eq("owner_id", ctx.userId)
        .eq("sync_source", source)
        .eq("external_id", f.id)
        .maybeSingle();
      if (existing) continue;

      await supabase.from("documents").insert({
        owner_id: ctx.userId,
        project_id: ctx.projectId ?? null,
        name: f.name,
        mime: f.mimeType ?? null,
        external_id: f.id,
        sync_source: source,
      });
      pulled++;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur document pull");
    }
  }
  return { pulled, pushed: 0, errors };
}

export async function pushDocumentMetadata(
  ctx: SyncContext,
  createUrl: string,
  source: string,
): Promise<SyncResult> {
  if (ctx.accessToken.startsWith("mock_")) return emptySyncResult();
  const supabase = createServiceClient();
  const { data: docs } = await supabase
    .from("documents")
    .select("*")
    .eq("owner_id", ctx.userId)
    .is("external_id", null)
    .limit(10);

  let pushed = 0;
  const errors: string[] = [];
  for (const doc of docs ?? []) {
    try {
      const created = await apiFetch<{ id: string }>(createUrl, ctx.accessToken, {
        method: "POST",
        body: JSON.stringify({ name: doc.name, mimeType: doc.mime ?? "text/plain" }),
      });
      await supabase
        .from("documents")
        .update({ external_id: created.id, sync_source: source })
        .eq("id", doc.id);
      pushed++;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur document push");
    }
  }
  return { pulled: 0, pushed, errors };
}

export async function createNotionPage(ctx: SyncContext, title: string, content: string): Promise<string | null> {
  if (ctx.accessToken.startsWith("mock_")) return `mock-notion-${Date.now()}`;
  const databaseId = ctx.settings?.databaseId as string | undefined;
  if (!databaseId) throw new Error("databaseId Notion requis dans les paramètres projet");

  const page = await apiFetch<{ id: string }>("https://api.notion.com/v1/pages", ctx.accessToken, {
    method: "POST",
    headers: { "Notion-Version": "2022-06-28" },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: title } }] },
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: content.slice(0, 2000) } }] },
        },
      ],
    }),
  });
  return page.id;
}

export async function postSlackMessage(ctx: SyncContext, channel: string, text: string): Promise<void> {
  if (ctx.accessToken.startsWith("mock_")) return;
  await apiFetch("https://slack.com/api/chat.postMessage", ctx.accessToken, {
    method: "POST",
    body: JSON.stringify({ channel, text }),
  });
}

export async function postTeamsMessage(ctx: SyncContext, teamId: string, channelId: string, text: string): Promise<void> {
  if (ctx.accessToken.startsWith("mock_")) return;
  await apiFetch(
    `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`,
    ctx.accessToken,
    { method: "POST", body: JSON.stringify({ body: { content: text } }) },
  );
}
