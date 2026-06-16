import type { IntegrationProviderAdapter } from "../types";
import { buildOAuth2Provider, emptySyncResult } from "./oauth-helpers";
import { createServiceClient } from "@/lib/supabase/admin";

export const dropboxProvider: IntegrationProviderAdapter = {
  ...buildOAuth2Provider({
    id: "dropbox",
    authUrl: "https://www.dropbox.com/oauth2/authorize",
    tokenUrl: "https://api.dropboxapi.com/oauth2/token",
    clientId: () => process.env.DROPBOX_CLIENT_ID,
    clientSecret: () => process.env.DROPBOX_CLIENT_SECRET,
    scopes: ["files.content.read", "files.content.write"],
  }),
  async pullChanges(ctx) {
    if (ctx.entityType !== "documents" || ctx.accessToken.startsWith("mock_")) {
      return emptySyncResult();
    }
    const res = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ctx.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: "" }),
    });
    if (!res.ok) return { pulled: 0, pushed: 0, errors: [`Dropbox ${res.status}`] };
    const data = (await res.json()) as { entries?: { id: string; name: string; ".tag": string }[] };
    const supabase = createServiceClient();
    let pulled = 0;
    for (const entry of data.entries ?? []) {
      if (entry[".tag"] !== "file") continue;
      const { data: existing } = await supabase
        .from("documents")
        .select("id")
        .eq("owner_id", ctx.userId)
        .eq("sync_source", "dropbox")
        .eq("external_id", entry.id)
        .maybeSingle();
      if (existing) continue;
      await supabase.from("documents").insert({
        owner_id: ctx.userId,
        name: entry.name,
        external_id: entry.id,
        sync_source: "dropbox",
      });
      pulled++;
    }
    return { pulled, pushed: 0, errors: [] };
  },
};
