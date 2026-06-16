import type { SupabaseClient } from "@supabase/supabase-js";
import type { WbElement } from "@/lib/whiteboard/elements";

export interface DbWhiteboard {
  id: string;
  owner_id: string;
  project_id: string | null;
  name: string;
  elements: WbElement[];
  view_state: { tx: number; ty: number; k: number };
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhiteboardRecord {
  id: string;
  name: string;
  projectId: string | null;
  projectName?: string;
  elements: WbElement[];
  viewState: { tx: number; ty: number; k: number };
  updatedAt: string;
  createdAt: string;
}

function mapWhiteboard(
  row: DbWhiteboard,
  projectName?: string,
): WhiteboardRecord {
  return {
    id: row.id,
    name: row.name,
    projectId: row.project_id,
    projectName,
    elements: (row.elements ?? []) as WbElement[],
    viewState: (row.view_state ?? { tx: 0, ty: 0, k: 1 }) as {
      tx: number;
      ty: number;
      k: number;
    },
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

export async function fetchWhiteboards(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("whiteboards")
    .select("*, projects(name)")
    .eq("owner_id", userId)
    .eq("archived", false)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const projects = row.projects as { name: string } | { name: string }[] | null;
    const projectName = Array.isArray(projects)
      ? projects[0]?.name
      : projects?.name;
    return mapWhiteboard(row as DbWhiteboard, projectName);
  });
}

export async function upsertWhiteboard(
  supabase: SupabaseClient,
  userId: string,
  payload: {
    id?: string;
    name: string;
    elements: WbElement[];
    projectId?: string | null;
    viewState?: { tx: number; ty: number; k: number };
  },
) {
  const row = {
    owner_id: userId,
    name: payload.name,
    elements: payload.elements,
    project_id: payload.projectId ?? null,
    view_state: payload.viewState ?? { tx: 0, ty: 0, k: 1 },
    archived: false,
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from("whiteboards")
      .update(row)
      .eq("id", payload.id)
      .eq("owner_id", userId)
      .select("*, projects(name)")
      .single();
    if (error) throw error;
    const projects = data.projects as { name: string } | null;
    return mapWhiteboard(data as DbWhiteboard, projects?.name);
  }

  const { data, error } = await supabase
    .from("whiteboards")
    .insert(row)
    .select("*, projects(name)")
    .single();
  if (error) throw error;
  const projects = data.projects as { name: string } | null;
  return mapWhiteboard(data as DbWhiteboard, projects?.name);
}

export async function assignWhiteboardProject(
  supabase: SupabaseClient,
  userId: string,
  whiteboardId: string,
  projectId: string | null,
) {
  const { data, error } = await supabase
    .from("whiteboards")
    .update({ project_id: projectId })
    .eq("id", whiteboardId)
    .eq("owner_id", userId)
    .select("*, projects(name)")
    .single();
  if (error) throw error;
  const projects = data.projects as { name: string } | null;
  return mapWhiteboard(data as DbWhiteboard, projects?.name);
}

export async function deleteWhiteboard(
  supabase: SupabaseClient,
  userId: string,
  whiteboardId: string,
) {
  const { error } = await supabase
    .from("whiteboards")
    .update({ archived: true })
    .eq("id", whiteboardId)
    .eq("owner_id", userId);
  if (error) throw error;
}
