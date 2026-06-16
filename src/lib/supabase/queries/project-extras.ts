import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  GanttConfig,
  GanttMarker,
  GanttPhase,
  MethodSave,
  ProjectMember,
  ProjectGanttMeta,
  ProjectRegistryPayload,
} from "@/lib/project/registry-types";
import { emptyRegistry } from "@/lib/project/registry-defaults";

function mapMember(row: Record<string, unknown>): ProjectMember {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    contactId: (row.contact_id as string) ?? null,
    userId: (row.user_id as string) ?? null,
    invitedEmail: (row.invited_email as string) ?? null,
    displayName: (row.display_name as string) || (row.invited_email as string) || "Membre",
    email: (row.invited_email as string) ?? undefined,
    color: (row.color as string) || "#2563eb",
    accessRole: (row.role as string) || "viewer",
    meetingRole: (row.meeting_role as string) || "Participante",
  };
}

export async function fetchProjectMembers(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from("project_members")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((r) => mapMember(r as Record<string, unknown>));
}

export async function upsertProjectMember(
  supabase: SupabaseClient,
  projectId: string,
  member: Omit<ProjectMember, "id" | "projectId"> & { id?: string },
) {
  const row = {
    project_id: projectId,
    contact_id: member.contactId ?? null,
    user_id: member.userId ?? null,
    invited_email: member.email ?? member.invitedEmail ?? null,
    display_name: member.displayName,
    color: member.color,
    role: member.accessRole,
    meeting_role: member.meetingRole,
  };
  if (member.id) {
    const { data, error } = await supabase
      .from("project_members")
      .update(row)
      .eq("id", member.id)
      .select()
      .single();
    if (error) throw error;
    return mapMember(data as Record<string, unknown>);
  }
  const { data, error } = await supabase.from("project_members").insert(row).select().single();
  if (error) throw error;
  return mapMember(data as Record<string, unknown>);
}

export async function removeProjectMember(supabase: SupabaseClient, memberId: string) {
  const { error } = await supabase.from("project_members").delete().eq("id", memberId);
  if (error) throw error;
}

export async function fetchProjectRegistry(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from("project_registries")
    .select("payload")
    .eq("project_id", projectId)
    .maybeSingle();
  if (error) throw error;
  return (data?.payload as ProjectRegistryPayload) ?? emptyRegistry();
}

export async function saveProjectRegistry(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  payload: ProjectRegistryPayload,
) {
  const { error } = await supabase.from("project_registries").upsert({
    project_id: projectId,
    owner_id: userId,
    payload,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function fetchGanttPhases(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from("project_gantt_phases")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(
    (r): GanttPhase => ({
      id: r.id,
      projectId: r.project_id,
      name: r.name,
      startWeek: r.start_week,
      durationWeeks: r.duration_weeks,
      color: r.color,
      progress: r.progress,
      milestone: r.milestone,
      dependsOn: r.depends_on,
      sortOrder: r.sort_order,
    }),
  );
}

export async function saveGanttPhase(
  supabase: SupabaseClient,
  userId: string,
  phase: GanttPhase,
) {
  const row = {
    id: phase.id.startsWith("local-") ? undefined : phase.id,
    project_id: phase.projectId,
    owner_id: userId,
    name: phase.name,
    start_week: phase.startWeek,
    duration_weeks: phase.durationWeeks,
    color: phase.color,
    progress: phase.progress,
    milestone: phase.milestone,
    depends_on: phase.dependsOn ?? null,
    sort_order: phase.sortOrder,
  };
  if (row.id) {
    const { data, error } = await supabase
      .from("project_gantt_phases")
      .update(row)
      .eq("id", row.id)
      .select()
      .single();
    if (error) throw error;
    return data.id as string;
  }
  const { data, error } = await supabase
    .from("project_gantt_phases")
    .insert(row)
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteGanttPhase(supabase: SupabaseClient, phaseId: string) {
  const { error } = await supabase.from("project_gantt_phases").delete().eq("id", phaseId);
  if (error) throw error;
}

export async function fetchMethodSaves(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from("method_saves")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(
    (r): MethodSave => ({
      id: r.id,
      projectId: r.project_id,
      methodId: r.method_id,
      title: r.title,
      payload: (r.payload as Record<string, unknown>) ?? {},
      createdAt: r.created_at,
    }),
  );
}

export async function saveMethodToProject(
  supabase: SupabaseClient,
  userId: string,
  data: { projectId: string; methodId: string; title: string; payload: Record<string, unknown> },
) {
  const { data: row, error } = await supabase
    .from("method_saves")
    .insert({
      project_id: data.projectId,
      owner_id: userId,
      method_id: data.methodId,
      title: data.title,
      payload: data.payload,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    methodId: row.method_id as string,
    title: row.title as string,
    payload: row.payload as Record<string, unknown>,
  } satisfies MethodSave;
}

export async function countProjectMembers(supabase: SupabaseClient, projectIds: string[]) {
  if (!projectIds.length) return {} as Record<string, number>;
  const { data, error } = await supabase
    .from("project_members")
    .select("project_id")
    .in("project_id", projectIds);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const pid = row.project_id as string;
    counts[pid] = (counts[pid] ?? 0) + 1;
  }
  return counts;
}

const DEFAULT_GANTT_CONFIG: GanttConfig = { range: "monthly", zoom: 100 };

export async function fetchProjectGanttMeta(
  supabase: SupabaseClient,
  projectId: string,
): Promise<ProjectGanttMeta> {
  const { data, error } = await supabase
    .from("projects")
    .select("start_date, end_date, gantt_config, created_at")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw error;
  const cfg = (data?.gantt_config as GanttConfig | null) ?? DEFAULT_GANTT_CONFIG;
  return {
    startDate: (data?.start_date as string) ?? null,
    endDate: (data?.end_date as string) ?? null,
    ganttConfig: {
      range: cfg.range ?? "monthly",
      zoom: cfg.zoom ?? 100,
    },
    createdAt: data?.created_at as string | undefined,
  };
}

export async function patchProjectGanttConfig(
  supabase: SupabaseClient,
  projectId: string,
  config: Partial<GanttConfig>,
) {
  const current = await fetchProjectGanttMeta(supabase, projectId);
  const next = { ...current.ganttConfig, ...config };
  const { error } = await supabase
    .from("projects")
    .update({ gantt_config: next, updated_at: new Date().toISOString() })
    .eq("id", projectId);
  if (error) throw error;
  return next;
}

export async function patchProjectDates(
  supabase: SupabaseClient,
  projectId: string,
  dates: { startDate?: string | null; endDate?: string | null },
) {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (dates.startDate !== undefined) row.start_date = dates.startDate;
  if (dates.endDate !== undefined) row.end_date = dates.endDate;
  const { error } = await supabase.from("projects").update(row).eq("id", projectId);
  if (error) throw error;
}

export async function fetchGanttMarkers(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from("project_gantt_markers")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(
    (r): GanttMarker => ({
      id: r.id,
      projectId: r.project_id,
      label: r.label,
      markerDate: r.marker_date,
      color: r.color,
      sortOrder: r.sort_order,
    }),
  );
}

export async function saveGanttMarker(
  supabase: SupabaseClient,
  userId: string,
  marker: GanttMarker,
) {
  const row = {
    id: marker.id.startsWith("local-") ? undefined : marker.id,
    project_id: marker.projectId,
    owner_id: userId,
    label: marker.label,
    marker_date: marker.markerDate,
    color: marker.color,
    sort_order: marker.sortOrder,
  };
  if (row.id) {
    const { data, error } = await supabase
      .from("project_gantt_markers")
      .update(row)
      .eq("id", row.id)
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  }
  const { data, error } = await supabase
    .from("project_gantt_markers")
    .insert(row)
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteGanttMarker(supabase: SupabaseClient, markerId: string) {
  const { error } = await supabase.from("project_gantt_markers").delete().eq("id", markerId);
  if (error) throw error;
}
