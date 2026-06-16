import type { IntegrationProviderAdapter, ProviderId, SyncContext } from "../types";
import { buildOAuth2Provider } from "./oauth-helpers";
import { pullCalendarMeetings, pushMeetingsToCalendar } from "../sync/mappers/meetings";
import { pullDriveFiles, pushDocumentMetadata } from "../sync/mappers/documents";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/calendar.events",
  "openid",
  "email",
  "profile",
];

function googleProvider(id: ProviderId): IntegrationProviderAdapter {
  return buildOAuth2Provider({
    id,
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    scopes: GOOGLE_SCOPES,
    extraAuthParams: { access_type: "offline", prompt: "consent" },
    entityHandlers: {
      meetings:
        id === "gcal"
          ? {
              pull: (ctx) =>
                pullCalendarMeetings(
                  ctx,
                  "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50",
                  "gcal",
                ),
              push: (ctx) =>
                pushMeetingsToCalendar(
                  ctx,
                  () => "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                  "gcal",
                ),
            }
          : undefined,
      documents:
        id === "gdrive"
          ? {
              pull: (ctx) =>
                pullDriveFiles(
                  ctx,
                  "https://www.googleapis.com/drive/v3/files?pageSize=30&fields=files(id,name,mimeType)",
                  "gdrive",
                ),
              push: (ctx) =>
                pushDocumentMetadata(
                  ctx,
                  "https://www.googleapis.com/drive/v3/files",
                  "gdrive",
                ),
            }
          : undefined,
    },
  });
}

export const gdriveProvider = googleProvider("gdrive");
export const gcalProvider = googleProvider("gcal");

export async function registerGoogleWebhook(ctx: SyncContext) {
  if (ctx.accessToken.startsWith("mock_")) return { id: "mock-watch" };
  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events/watch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ctx.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: crypto.randomUUID(),
      type: "web_hook",
      address: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/google`,
    }),
  });
  const data = (await res.json()) as { id?: string; expiration?: string };
  return { id: data.id ?? "watch", expiresAt: data.expiration ? new Date(Number(data.expiration)) : undefined };
}
