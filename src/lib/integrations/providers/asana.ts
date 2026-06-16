import type { IntegrationProviderAdapter } from "../types";
import { buildOAuth2Provider } from "./oauth-helpers";
import { pullExternalTasks, pushLocalTasks } from "../sync/mappers/tasks";

export const asanaProvider = buildOAuth2Provider({
  id: "asana",
  authUrl: "https://app.asana.com/-/oauth_authorize",
  tokenUrl: "https://app.asana.com/-/oauth_token",
  clientId: () => process.env.ASANA_CLIENT_ID,
  clientSecret: () => process.env.ASANA_CLIENT_SECRET,
  scopes: ["tasks:read", "tasks:write"],
  entityHandlers: {
    tasks: {
      pull: (ctx) =>
        pullExternalTasks(ctx, "https://app.asana.com/api/1.0/tasks?assignee=me", "asana", (raw) => {
          const t = raw as { gid: string; name: string; completed: boolean; modified_at: string };
          return { id: t.gid, title: t.name, completed: t.completed, modified_at: t.modified_at };
        }),
      push: (ctx) =>
        pushLocalTasks(ctx, "https://app.asana.com/api/1.0/tasks", "asana", (t) => ({
          data: { name: t.title, completed: t.done, workspace: ctx.settings?.workspaceId },
        })),
    },
  },
});
