import { createServiceClient } from "@/lib/supabase/admin";
import type { SyncContext, SyncResult } from "../../types";
import { apiFetch, emptySyncResult } from "../../providers/oauth-helpers";
import { resolveConflict } from "../conflict";

interface CalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  updated?: string;
}

export async function pullCalendarMeetings(
  ctx: SyncContext,
  listUrl: string,
  source: string,
): Promise<SyncResult> {
  if (ctx.accessToken.startsWith("mock_")) return emptySyncResult();
  const supabase = createServiceClient();
  const data = await apiFetch<{ items?: CalendarEvent[] }>(listUrl, ctx.accessToken);
  let pulled = 0;
  const errors: string[] = [];

  for (const ev of data.items ?? []) {
    if (!ev.id) continue;
    try {
      const start = ev.start?.dateTime ?? ev.start?.date;
      const { data: existing } = await supabase
        .from("meetings")
        .select("*")
        .eq("owner_id", ctx.userId)
        .eq("sync_source", source)
        .eq("external_id", ev.id)
        .maybeSingle();

      const meetingDate = start ? start.slice(0, 10) : new Date().toISOString().slice(0, 10);
      const meetingTime = start && start.includes("T") ? start.slice(11, 16) : "10:00";

      if (existing) {
        const winner = resolveConflict(existing.updated_at, ev.updated ?? existing.updated_at);
        if (winner === "external") {
          await supabase
            .from("meetings")
            .update({
              name: ev.summary ?? existing.name,
              subtitle: ev.description ?? existing.subtitle,
              meeting_date: meetingDate,
              meeting_time: meetingTime,
              external_updated_at: ev.updated ?? null,
            })
            .eq("id", existing.id);
          pulled++;
        }
      } else {
        await supabase.from("meetings").insert({
          owner_id: ctx.userId,
          project_id: ctx.projectId ?? null,
          name: ev.summary ?? "Événement calendrier",
          subtitle: ev.description ?? null,
          meeting_date: meetingDate,
          meeting_time: meetingTime,
          external_id: ev.id,
          sync_source: source,
          external_updated_at: ev.updated ?? null,
        });
        pulled++;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur meeting");
    }
  }
  return { pulled, pushed: 0, errors };
}

export async function pushMeetingsToCalendar(
  ctx: SyncContext,
  createUrl: (meetingId: string) => string,
  source: string,
): Promise<SyncResult> {
  if (ctx.accessToken.startsWith("mock_")) return { pulled: 0, pushed: 0, errors: [] };
  const supabase = createServiceClient();
  const { data: meetings } = await supabase
    .from("meetings")
    .select("*")
    .eq("owner_id", ctx.userId)
    .is("external_id", null)
    .limit(20);

  let pushed = 0;
  const errors: string[] = [];

  for (const m of meetings ?? []) {
    try {
      const start = `${m.meeting_date}T${m.meeting_time}:00`;
      const body = {
        summary: m.name,
        description: m.subtitle ?? "",
        start: { dateTime: start, timeZone: "America/Montreal" },
        end: { dateTime: start, timeZone: "America/Montreal" },
      };
      const created = await apiFetch<{ id: string }>(createUrl(m.id), ctx.accessToken, {
        method: "POST",
        body: JSON.stringify(body),
      });
      await supabase
        .from("meetings")
        .update({ external_id: created.id, sync_source: source })
        .eq("id", m.id);
      pushed++;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Erreur push meeting");
    }
  }
  return { pulled: 0, pushed, errors };
}
