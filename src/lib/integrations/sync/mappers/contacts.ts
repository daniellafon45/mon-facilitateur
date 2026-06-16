import { createServiceClient } from "@/lib/supabase/admin";
import type { SyncContext, SyncResult } from "../../types";
import { apiFetch, emptySyncResult } from "../../providers/oauth-helpers";
import { resolveConflict } from "../conflict";

interface ExternalContact {
  id: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  properties?: { email?: string; firstname?: string; lastname?: string };
  updatedAt?: string;
}

export async function pullHubSpotContacts(ctx: SyncContext): Promise<SyncResult> {
  if (ctx.accessToken.startsWith("mock_")) return emptySyncResult();
  const supabase = createServiceClient();
  const data = await apiFetch<{ results?: ExternalContact[] }>(
    "https://api.hubapi.com/crm/v3/objects/contacts?limit=50",
    ctx.accessToken,
  );
  let pulled = 0;
  const errors: string[] = [];

  for (const c of data.results ?? []) {
    try {
      const props = c.properties ?? {};
      const name = [props.firstname, props.lastname].filter(Boolean).join(" ") || "Contact";
      const email = props.email ?? c.email ?? null;
      const extUpdated = c.updatedAt ?? new Date().toISOString();

      const { data: existing } = await supabase
        .from("contacts")
        .select("*")
        .eq("owner_id", ctx.userId)
        .eq("sync_source", "hubspot")
        .eq("external_id", c.id)
        .maybeSingle();

      if (existing) {
        if (resolveConflict(existing.created_at, extUpdated) === "external") {
          await supabase
            .from("contacts")
            .update({ name, email, external_updated_at: extUpdated })
            .eq("id", existing.id);
          pulled++;
        }
      } else {
        await supabase.from("contacts").insert({
          owner_id: ctx.userId,
          name,
          email,
          role_label: "CRM HubSpot",
          external_id: c.id,
          sync_source: "hubspot",
          external_updated_at: extUpdated,
        });
        pulled++;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur contact");
    }
  }
  return { pulled, pushed: 0, errors };
}

export async function pushContactsToHubSpot(ctx: SyncContext): Promise<SyncResult> {
  if (ctx.accessToken.startsWith("mock_")) return emptySyncResult();
  const supabase = createServiceClient();
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("owner_id", ctx.userId)
    .is("external_id", null)
    .limit(20);

  let pushed = 0;
  const errors: string[] = [];
  for (const c of contacts ?? []) {
    try {
      const parts = c.name.split(" ");
      const created = await apiFetch<{ id: string }>(
        "https://api.hubapi.com/crm/v3/objects/contacts",
        ctx.accessToken,
        {
          method: "POST",
          body: JSON.stringify({
            properties: {
              firstname: parts[0] ?? c.name,
              lastname: parts.slice(1).join(" ") || "",
              email: c.email ?? undefined,
            },
          }),
        },
      );
      await supabase
        .from("contacts")
        .update({ external_id: created.id, sync_source: "hubspot" })
        .eq("id", c.id);
      pushed++;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur push contact");
    }
  }
  return { pulled: 0, pushed, errors };
}
