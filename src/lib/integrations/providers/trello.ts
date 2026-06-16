import type { IntegrationProviderAdapter } from "../types";
import { callbackUrl, isDevMock } from "../oauth/state";
import { emptySyncResult, mockTokenSet } from "./oauth-helpers";
import { pullExternalTasks, pushLocalTasks } from "../sync/mappers/tasks";

export const trelloProvider: IntegrationProviderAdapter = {
  id: "trello",
  getAuthUrl(state: string) {
    const key = process.env.TRELLO_API_KEY;
    if (!key && isDevMock()) {
      return `${callbackUrl("trello")}?code=mock&state=${encodeURIComponent(state)}`;
    }
    if (!key) throw new Error("TRELLO_API_KEY manquant");
    return `https://trello.com/1/authorize?expiration=never&name=MonFacilitateur&scope=read,write&response_type=token&key=${key}&return_url=${encodeURIComponent(callbackUrl("trello"))}&state=${encodeURIComponent(state)}`;
  },
  async exchangeCode(code) {
    if (isDevMock() && code === "mock") return mockTokenSet("trello");
    return mockTokenSet("trello");
  },
  async refreshToken() {
    return mockTokenSet("trello");
  },
  async pullChanges(ctx) {
    if (ctx.entityType !== "tasks") return emptySyncResult();
    const key = process.env.TRELLO_API_KEY;
    if (!key || ctx.accessToken.startsWith("mock_")) return emptySyncResult();
    return pullExternalTasks(
      ctx,
      `https://api.trello.com/1/members/me/boards?key=${key}&token=${ctx.accessToken}`,
      "trello",
      (raw) => {
        const b = raw as { id: string; name: string };
        return { id: b.id, title: b.name };
      },
    );
  },
  async pushChanges(ctx) {
    if (ctx.entityType !== "tasks") return emptySyncResult();
    const listId = ctx.settings?.listId as string;
    const key = process.env.TRELLO_API_KEY;
    if (!listId || !key) return emptySyncResult();
    return pushLocalTasks(
      ctx,
      `https://api.trello.com/1/cards?key=${key}&token=${ctx.accessToken}&idList=${listId}`,
      "trello",
      (t) => ({ name: t.title }),
    );
  },
};
