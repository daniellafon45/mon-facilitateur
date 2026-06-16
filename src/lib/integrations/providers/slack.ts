import { createHmac } from "crypto";
import type { IntegrationProviderAdapter, SyncContext } from "../types";
import { buildOAuth2Provider, apiFetch, emptySyncResult } from "./oauth-helpers";
import { postSlackMessage } from "../sync/mappers/documents";

const adapter = buildOAuth2Provider({
  id: "slack",
  authUrl: "https://slack.com/oauth/v2/authorize",
  tokenUrl: "https://slack.com/api/oauth.v2.access",
  clientId: () => process.env.SLACK_CLIENT_ID,
  clientSecret: () => process.env.SLACK_CLIENT_SECRET,
  scopes: ["channels:read", "chat:write", "users:read"],
});

export const slackProvider: IntegrationProviderAdapter = {
  ...adapter,
  async exchangeCode(code) {
    const result = await adapter.exchangeCode(code);
    return result;
  },
  async pushChanges(ctx) {
    if (ctx.entityType === "projects" || ctx.entityType === "tasks") {
      const channel = ctx.settings?.channel as string;
      const text = ctx.settings?.message as string;
      if (channel && text) {
        await postSlackMessage(ctx, channel, text);
        return { pulled: 0, pushed: 1, errors: [] };
      }
    }
    return emptySyncResult();
  },
  async handleWebhook(payload) {
    const body = payload as { event_id?: string; event?: { type?: string } };
    if (body.event?.type) return { pulled: 1, pushed: 0, errors: [] };
    return emptySyncResult();
  },
  async registerWebhook(ctx: SyncContext) {
    if (ctx.accessToken.startsWith("mock_")) return { id: "mock-slack" };
    return { id: `slack-events-${ctx.userId}` };
  },
};

export function verifySlackSignature(
  signingSecret: string,
  timestamp: string,
  body: string,
  signature: string,
): boolean {
  const base = `v0:${timestamp}:${body}`;
  const hmac = createHmac("sha256", signingSecret).update(base).digest("hex");
  return `v0=${hmac}` === signature;
}

export async function listSlackChannels(accessToken: string) {
  if (accessToken.startsWith("mock_")) {
    return [{ id: "C123", name: "general" }];
  }
  const data = await apiFetch<{ channels?: { id: string; name: string }[] }>(
    "https://slack.com/api/conversations.list?types=public_channel&limit=50",
    accessToken,
  );
  return data.channels ?? [];
}
