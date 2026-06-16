import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbMeeting, DbProject, DbTask, DbContact, DbTeam, DbActivity, WizardPayload } from "@/types/facilitation";
import { countProjectMembers } from "@/lib/supabase/queries/project-extras";

export function mapProject(row: DbProject, members = 0) {
  return {
    id: row.id,
    name: row.name,
    status: row.status === "active" ? "En cours" : row.status,
    progress: row.progress,
    tile: row.tile,
    icon: row.icon,
    members,
    modified: new Date(row.updated_at).getTime(),
    archived: row.archived,
    star: row.starred,
    objective: row.objective ?? undefined,
  };
}

export function mapMeeting(row: DbMeeting) {
  const statusMap: Record<string, string> = {
    scheduled: "À venir",
    in_progress: "En cours",
    completed: "Terminée",
    cancelled: "Annulée",
  };
  return {
    id: row.id,
    name: row.name,
    dateISO: row.meeting_date,
    time: row.meeting_time.slice(0, 5),
    type: row.meeting_type,
    status: statusMap[row.status] ?? row.status,
    participants: row.participants_count,
    methods: row.methods,
    project: row.project_id ?? undefined,
    sub: row.subtitle ?? undefined,
    archived: row.archived,
  };
}

export async function fetchWorkspace(supabase: SupabaseClient, userId: string) {
  const [projectsRes, meetingsRes, tasksRes, contactsRes, teamsRes, activityRes] = await Promise.all([
    supabase.from("projects").select("*").eq("owner_id", userId).eq("archived", false).order("updated_at", { ascending: false }),
    supabase.from("meetings").select("*").eq("owner_id", userId).eq("archived", false).order("meeting_date", { ascending: true }),
    supabase.from("tasks").select("*").eq("owner_id", userId).order("created_at", { ascending: false }),
    supabase.from("contacts").select("*").eq("owner_id", userId).order("name"),
    supabase.from("teams").select("*").eq("owner_id", userId).order("name"),
    supabase.from("activity_events").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
  ]);

  const projectIds = (projectsRes.data ?? []).map((p) => (p as DbProject).id);
  const memberCounts = await countProjectMembers(supabase, projectIds);

  return {
    projects: (projectsRes.data ?? []).map((p) =>
      mapProject(p as DbProject, memberCounts[(p as DbProject).id] ?? 0),
    ),
    meetings: (meetingsRes.data ?? []).map((m) => mapMeeting(m as DbMeeting)),
    tasks: (tasksRes.data ?? []).map((t: DbTask) => ({
      id: t.id,
      title: t.title,
      done: t.done,
      projectId: t.project_id ?? undefined,
    })),
    contacts: (contactsRes.data ?? []).map((c: DbContact) => ({
      id: c.id,
      name: c.name,
      role: c.role_label,
      email: c.email ?? undefined,
      status: c.status ?? "todo",
      avatarUrl: c.avatar_url ?? undefined,
    })),
    teams: (teamsRes.data ?? []).map((t: DbTeam) => ({
      id: t.id,
      name: t.name,
      memberIds: t.member_ids ?? [],
    })),
    activity: (activityRes.data ?? []).map((a: DbActivity) => ({
      id: a.id,
      icon: a.icon,
      t: a.title,
      d: a.detail ?? "",
      c: a.color,
    })),
  };
}

export async function upsertProject(
  supabase: SupabaseClient,
  userId: string,
  data: { name: string; objective?: string; tile?: string; icon?: string },
) {
  const { data: row, error } = await supabase
    .from("projects")
    .insert({
      owner_id: userId,
      name: data.name,
      objective: data.objective ?? null,
      tile: data.tile ?? "teal",
      icon: data.icon ?? "Folder",
    })
    .select()
    .single();
  if (error) throw error;
  return mapProject(row as DbProject);
}

export async function patchProject(
  supabase: SupabaseClient,
  projectId: string,
  data: { name?: string; objective?: string },
) {
  const { data: row, error } = await supabase
    .from("projects")
    .update({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.objective !== undefined ? { objective: data.objective } : {}),
    })
    .eq("id", projectId)
    .select()
    .single();
  if (error) throw error;
  return mapProject(row as DbProject);
}

export async function archiveProject(supabase: SupabaseClient, projectId: string) {
  const { error } = await supabase.from("projects").update({ archived: true }).eq("id", projectId);
  if (error) throw error;
}

export async function archiveMeeting(supabase: SupabaseClient, meetingId: string) {
  const { error } = await supabase.from("meetings").update({ archived: true }).eq("id", meetingId);
  if (error) throw error;
}

export async function patchMeeting(
  supabase: SupabaseClient,
  meetingId: string,
  data: {
    name?: string;
    project_id?: string | null;
    meeting_date?: string;
    meeting_time?: string;
    meeting_type?: string;
    methods?: string[];
    status?: string;
    participants_count?: number;
    subtitle?: string | null;
  },
) {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.project_id !== undefined) payload.project_id = data.project_id;
  if (data.meeting_date !== undefined) payload.meeting_date = data.meeting_date;
  if (data.meeting_time !== undefined) payload.meeting_time = data.meeting_time;
  if (data.meeting_type !== undefined) payload.meeting_type = data.meeting_type;
  if (data.methods !== undefined) payload.methods = data.methods;
  if (data.participants_count !== undefined) payload.participants_count = data.participants_count;
  if (data.subtitle !== undefined) payload.subtitle = data.subtitle;
  if (data.status !== undefined) {
    payload.status =
      data.status === "Terminée"
        ? "completed"
        : data.status === "En cours"
          ? "in_progress"
          : data.status === "Annulée"
            ? "cancelled"
            : "scheduled";
  }

  const { data: row, error } = await supabase
    .from("meetings")
    .update(payload)
    .eq("id", meetingId)
    .select()
    .single();
  if (error) throw error;
  return mapMeeting(row as DbMeeting);
}

export async function upsertMeeting(
  supabase: SupabaseClient,
  userId: string,
  data: {
    name: string;
    project_id?: string;
    meeting_date?: string;
    meeting_time?: string;
    meeting_type?: string;
    methods?: string[];
    status?: string;
    participants_count?: number;
  },
) {
  const statusDb = data.status === "Terminée" ? "completed" : data.status === "En cours" ? "in_progress" : "scheduled";
  const { data: row, error } = await supabase
    .from("meetings")
    .insert({
      owner_id: userId,
      name: data.name,
      project_id: data.project_id ?? null,
      meeting_date: data.meeting_date,
      meeting_time: data.meeting_time ?? "10:00",
      meeting_type: data.meeting_type ?? "Réunion",
      methods: data.methods ?? [],
      status: statusDb,
      participants_count: data.participants_count ?? 2,
    })
    .select()
    .single();
  if (error) throw error;
  return mapMeeting(row as DbMeeting);
}

export async function saveWizardDraft(supabase: SupabaseClient, userId: string, payload: WizardPayload) {
  const { error } = await supabase.from("wizard_drafts").upsert(
    { user_id: userId, payload, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function loadWizardDraft(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("wizard_drafts")
    .select("payload, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    payload: data.payload as WizardPayload,
    updatedAt: data.updated_at as string,
  };
}

export async function deleteWizardDraft(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase.from("wizard_drafts").delete().eq("user_id", userId);
  if (error) throw error;
}

export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  event: { title: string; detail?: string; icon?: string; color?: string; project_id?: string },
) {
  await supabase.from("activity_events").insert({
    user_id: userId,
    project_id: event.project_id ?? null,
    title: event.title,
    detail: event.detail ?? null,
    icon: event.icon ?? "Sparkles",
    color: event.color ?? "primary",
  });
}
