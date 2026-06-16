import type { ProviderId } from "./types";
import { getValidAccessToken } from "./db";
import { getProviderAdapter } from "./providers/index";
import { createNotionPage, postSlackMessage, postTeamsMessage } from "./sync/mappers/documents";
import { runSyncForUser } from "./sync/engine";

export interface SendReportOptions {
  userId: string;
  channel: ProviderId | "email";
  title: string;
  content: string;
  settings?: Record<string, unknown>;
}

export async function sendSessionReport(opts: SendReportOptions): Promise<{ ok: boolean; error?: string }> {
  if (opts.channel === "email") {
    return { ok: true };
  }

  const tokenInfo = await getValidAccessToken(opts.userId, opts.channel);
  if (!tokenInfo) return { ok: false, error: "Intégration non connectée" };

  const ctx = {
    userId: opts.userId,
    userIntegrationId: tokenInfo.userIntegrationId,
    providerId: opts.channel,
    accessToken: tokenInfo.accessToken,
    entityType: "projects" as const,
    settings: { ...opts.settings, message: `${opts.title}\n\n${opts.content}`, title: opts.title, content: opts.content },
  };

  try {
    if (opts.channel === "slack") {
      const channel = opts.settings?.channel as string;
      if (!channel) return { ok: false, error: "Canal Slack requis" };
      await postSlackMessage(ctx, channel, ctx.settings.message as string);
      return { ok: true };
    }
    if (opts.channel === "teams") {
      const teamId = opts.settings?.teamId as string;
      const channelId = opts.settings?.channelId as string;
      if (!teamId || !channelId) return { ok: false, error: "Équipe/canal Teams requis" };
      await postTeamsMessage(ctx, teamId, channelId, ctx.settings.message as string);
      return { ok: true };
    }
    if (opts.channel === "notion") {
      await createNotionPage(ctx, opts.title, opts.content);
      return { ok: true };
    }

    const adapter = getProviderAdapter(opts.channel);
    await adapter.pushChanges(ctx);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur envoi" };
  }
}

export async function createCalendarEventFromMeeting(
  userId: string,
  provider: "gcal" | "teams",
  meeting: { name: string; date: string; time: string; subtitle?: string },
) {
  await runSyncForUser(userId, provider, "meetings", "push");
  const tokenInfo = await getValidAccessToken(userId, provider);
  if (!tokenInfo) throw new Error("Calendrier non connecté");

  const adapter = getProviderAdapter(provider);
  await adapter.pushChanges({
    userId,
    userIntegrationId: tokenInfo.userIntegrationId,
    providerId: provider,
    accessToken: tokenInfo.accessToken,
    entityType: "meetings",
    settings: { meeting },
  });
}
