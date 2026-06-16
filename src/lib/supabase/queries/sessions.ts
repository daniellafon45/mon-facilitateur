import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbSessionRun, SessionMode } from "@/types/facilitation";

export async function createSessionRun(
  supabase: SupabaseClient,
  userId: string,
  data: {
    project_id?: string;
    meeting_id?: string;
    mode: SessionMode;
    method_ids: string[];
    state?: Record<string, unknown>;
  },
) {
  const { data: row, error } = await supabase
    .from("session_runs")
    .insert({
      owner_id: userId,
      project_id: data.project_id ?? null,
      meeting_id: data.meeting_id ?? null,
      mode: data.mode,
      method_ids: data.method_ids,
      state: data.state ?? {},
    })
    .select()
    .single();
  if (error) throw error;
  return row as DbSessionRun;
}

export async function updateSessionState(
  supabase: SupabaseClient,
  sessionId: string,
  state: Record<string, unknown>,
  currentIndex?: number,
) {
  const patch: Record<string, unknown> = { state };
  if (currentIndex !== undefined) patch.current_method_index = currentIndex;
  const { error } = await supabase.from("session_runs").update(patch).eq("id", sessionId);
  if (error) throw error;
}

export async function endSession(
  supabase: SupabaseClient,
  sessionId: string,
  report: Record<string, unknown>,
) {
  const { error } = await supabase
    .from("session_runs")
    .update({ report, ended_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function getSessionRun(supabase: SupabaseClient, sessionId: string) {
  const { data, error } = await supabase.from("session_runs").select("*").eq("id", sessionId).single();
  if (error) throw error;
  return data as DbSessionRun;
}
