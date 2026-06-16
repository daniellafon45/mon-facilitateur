import type { IntegrationProviderAdapter } from "../types";
import { buildOAuth2Provider, emptySyncResult } from "./oauth-helpers";
import { pullExternalTasks, pushLocalTasks } from "../sync/mappers/tasks";
import { createNotionPage } from "../sync/mappers/documents";

const base = buildOAuth2Provider({
  id: "notion",
  authUrl: "https://api.notion.com/v1/oauth/authorize",
  tokenUrl: "https://api.notion.com/v1/oauth/token",
  clientId: () => process.env.NOTION_CLIENT_ID,
  clientSecret: () => process.env.NOTION_CLIENT_SECRET,
  scopes: [],
  extraAuthParams: { owner: "user" },
  entityHandlers: {
    tasks: {
      pull: (ctx) =>
        pullExternalTasks(
          ctx,
          "https://api.notion.com/v1/search",
          "notion",
          (raw) => {
            const r = raw as { id: string; properties?: { Name?: { title?: { plain_text?: string }[] } } };
            return { id: r.id, title: r.properties?.Name?.title?.[0]?.plain_text };
          },
        ),
      push: (ctx) =>
        pushLocalTasks(ctx, "https://api.notion.com/v1/pages", "notion", (t) => ({
          parent: { database_id: ctx.settings?.databaseId },
          properties: { Name: { title: [{ text: { content: t.title } }] } },
        })),
    },
  },
});

export const notionProvider: IntegrationProviderAdapter = {
  ...base,
  async pushChanges(ctx) {
    if (ctx.settings?.title && ctx.settings?.content) {
      await createNotionPage(ctx, String(ctx.settings.title), String(ctx.settings.content));
      return { pulled: 0, pushed: 1, errors: [] };
    }
    return base.pushChanges(ctx);
  },
  async handleWebhook(payload) {
    const body = payload as { type?: string };
    if (body.type) return { pulled: 1, pushed: 0, errors: [] };
    return emptySyncResult();
  },
};
