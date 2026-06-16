import { createHmac, randomBytes } from "crypto";
import type { IntegrationProviderAdapter, SyncContext } from "../types";
import { callbackUrl, isDevMock } from "../oauth/state";
import { emptySyncResult, mockTokenSet } from "./oauth-helpers";
import { createServiceClient } from "@/lib/supabase/admin";

export const zapierProvider: IntegrationProviderAdapter = {
  id: "zapier",
  getAuthUrl(state: string) {
    if (isDevMock()) {
      return `${callbackUrl("zapier")}?code=mock&state=${encodeURIComponent(state)}`;
    }
    return `${callbackUrl("zapier")}?code=setup&state=${encodeURIComponent(state)}`;
  },
  async exchangeCode(_code: string) {
    return mockTokenSet("zapier");
  },
  async refreshToken() {
    return mockTokenSet("zapier");
  },
  async pullChanges() {
    return emptySyncResult();
  },
  async pushChanges(ctx: SyncContext) {
    const supabase = createServiceClient();
    const { data: zap } = await supabase
      .from("zapier_connections")
      .select("*")
      .eq("owner_id", ctx.userId)
      .maybeSingle();

    if (!zap?.outbound_webhook_url) {
      return { pulled: 0, pushed: 0, errors: ["URL webhook Zapier non configurée"] };
    }

    const payload = ctx.settings ?? {};
    const res = await fetch(zap.outbound_webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return { pulled: 0, pushed: 0, errors: [`Zapier HTTP ${res.status}`] };
    }
    return { pulled: 0, pushed: 1, errors: [] };
  },
  async handleWebhook(payload, ctx) {
    const body = payload as { action?: string; meeting?: Record<string, unknown>; task?: Record<string, unknown> };
    if (!ctx?.userId) return emptySyncResult();
    const supabase = createServiceClient();

    if (body.action === "create_meeting" && body.meeting) {
      await supabase.from("meetings").insert({
        owner_id: ctx.userId,
        name: String(body.meeting.name ?? "Rencontre Zapier"),
        meeting_date: String(body.meeting.date ?? new Date().toISOString().slice(0, 10)),
        sync_source: "zapier",
        external_id: randomBytes(8).toString("hex"),
      });
      return { pulled: 1, pushed: 0, errors: [] };
    }

    if (body.action === "create_task" && body.task) {
      await supabase.from("tasks").insert({
        owner_id: ctx.userId,
        title: String(body.task.title ?? "Tâche Zapier"),
        sync_source: "zapier",
        external_id: randomBytes(8).toString("hex"),
      });
      return { pulled: 1, pushed: 0, errors: [] };
    }

    return emptySyncResult();
  },
};

export function verifyZapierSecret(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return createHmac("sha256", expected).update(provided).digest("hex") === provided || provided === expected;
}
