import type { IntegrationProviderAdapter, ProviderId, SyncContext } from "../types";
import { buildOAuth2Provider, apiFetch } from "./oauth-helpers";
import { pullCalendarMeetings, pushMeetingsToCalendar } from "../sync/mappers/meetings";
import { pullDriveFiles, pushDocumentMetadata, postTeamsMessage } from "../sync/mappers/documents";
import { emptySyncResult } from "./oauth-helpers";

const MS_SCOPES = [
  "offline_access",
  "User.Read",
  "Calendars.ReadWrite",
  "ChannelMessage.Send",
  "Files.ReadWrite",
  "OnlineMeetings.ReadWrite",
];

function microsoftProvider(id: ProviderId): IntegrationProviderAdapter {
  const tenant = process.env.MICROSOFT_TENANT_ID ?? "common";
  const base = buildOAuth2Provider({
    id,
    authUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    clientId: () => process.env.MICROSOFT_CLIENT_ID,
    clientSecret: () => process.env.MICROSOFT_CLIENT_SECRET,
    scopes: MS_SCOPES,
    entityHandlers: {
      meetings:
        id === "teams"
          ? {
              pull: (ctx) =>
                pullCalendarMeetings(
                  ctx,
                  "https://graph.microsoft.com/v1.0/me/events?$top=50",
                  "teams",
                ),
              push: (ctx) =>
                pushMeetingsToCalendar(
                  ctx,
                  () => "https://graph.microsoft.com/v1.0/me/events",
                  "teams",
                ),
            }
          : undefined,
      documents:
        id === "onedrive"
          ? {
              pull: (ctx) =>
                pullDriveFiles(
                  ctx,
                  "https://graph.microsoft.com/v1.0/me/drive/root/children",
                  "onedrive",
                ),
              push: (ctx) =>
                pushDocumentMetadata(
                  ctx,
                  "https://graph.microsoft.com/v1.0/me/drive/root/children",
                  "onedrive",
                ),
            }
          : undefined,
    },
  });

  return {
    ...base,
    async pushChanges(ctx) {
      if (ctx.entityType === "projects" && id === "teams") {
        const teamId = ctx.settings?.teamId as string;
        const channelId = ctx.settings?.channelId as string;
        const text = ctx.settings?.message as string;
        if (teamId && channelId && text) {
          await postTeamsMessage(ctx, teamId, channelId, text);
          return { pulled: 0, pushed: 1, errors: [] };
        }
      }
      return base.pushChanges(ctx);
    },
    async handleWebhook(payload) {
      const body = payload as { value?: unknown[] };
      if (!body.value?.length) return emptySyncResult();
      return { pulled: body.value.length, pushed: 0, errors: [] };
    },
    async registerWebhook(ctx) {
      if (ctx.accessToken.startsWith("mock_")) return { id: "mock-sub" };
      const sub = await apiFetch<{ id: string; expirationDateTime: string }>(
        "https://graph.microsoft.com/v1.0/subscriptions",
        ctx.accessToken,
        {
          method: "POST",
          body: JSON.stringify({
            changeType: "created,updated",
            notificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/microsoft`,
            resource: "/me/events",
            expirationDateTime: new Date(Date.now() + 3600_000 * 24).toISOString(),
            clientState: ctx.userId,
          }),
        },
      );
      return { id: sub.id, expiresAt: new Date(sub.expirationDateTime) };
    },
  };
}

export const teamsProvider = microsoftProvider("teams");
export const onedriveProvider = microsoftProvider("onedrive");
