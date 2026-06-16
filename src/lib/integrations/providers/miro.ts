import type { IntegrationProviderAdapter } from "../types";
import { buildOAuth2Provider, emptySyncResult } from "./oauth-helpers";

export const miroProvider = buildOAuth2Provider({
  id: "miro",
  authUrl: "https://miro.com/oauth/authorize",
  tokenUrl: "https://api.miro.com/v1/oauth/token",
  clientId: () => process.env.MIRO_CLIENT_ID,
  clientSecret: () => process.env.MIRO_CLIENT_SECRET,
  scopes: ["boards:read", "boards:write"],
  entityHandlers: {
    projects: {
      pull: async (ctx) => {
        if (ctx.accessToken.startsWith("mock_")) return emptySyncResult();
        const res = await fetch("https://api.miro.com/v2/boards?limit=20", {
          headers: { Authorization: `Bearer ${ctx.accessToken}` },
        });
        const data = (await res.json()) as { data?: unknown[] };
        return { pulled: data.data?.length ?? 0, pushed: 0, errors: [] };
      },
      push: async () => emptySyncResult(),
    },
  },
});
