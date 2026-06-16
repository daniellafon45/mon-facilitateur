import type { SupabaseClient } from "@supabase/supabase-js";
import type { BoardTask } from "@/types/facilitation";

export async function fetchBoardTasks(supabase: SupabaseClient, userId: string, projectId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("owner_id", userId)
    .eq("project_id", projectId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map(mapDbTaskToBoard);
}

function mapDbTaskToBoard(row: Record<string, unknown>): BoardTask {
  const meta = (row.board_meta as Record<string, unknown>) ?? {};
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    groupId: (row.group_id as string) || "in-progress-1",
    title: row.title as string,
    description: (row.description as string) ?? "",
    ownerInitials: (meta.ownerInitials as string) ?? "??",
    ownerColor: (meta.ownerColor as string) ?? "#2563eb",
    statusColor: (meta.statusColor as string) ?? "#fb923c",
    statusDots: (meta.statusDots as string[]) ?? [],
    dueDate: row.due_date ? String(row.due_date).slice(5) : "",
    numbers: (meta.numbers as number) ?? 0,
    timeline: (meta.timeline as string) ?? "",
    tags: (meta.tags as BoardTask["tags"]) ?? [],
    timeTracking: (meta.timeTracking as string) ?? "",
    comments: (meta.comments as number) ?? 0,
    attachments: (meta.attachments as number) ?? 0,
    subtasks: (row.subtasks as BoardTask["subtasks"]) ?? [],
    people: (meta.people as BoardTask["people"]) ?? [],
    kanbanStatus: (row.kanban_status as BoardTask["kanbanStatus"]) ?? "todo",
  };
}

export async function upsertBoardTask(
  supabase: SupabaseClient,
  userId: string,
  task: BoardTask,
) {
  const row = {
    id: task.id.startsWith(`${task.projectId}-t`) ? undefined : task.id,
    owner_id: userId,
    project_id: task.projectId,
    title: task.title,
    done: task.kanbanStatus === "done",
    description: task.description ?? null,
    group_id: task.groupId,
    kanban_status: task.kanbanStatus,
    priority: "Moyenne",
    due_date: null,
    subtasks: task.subtasks ?? [],
    board_meta: {
      ownerInitials: task.ownerInitials,
      ownerColor: task.ownerColor,
      statusColor: task.statusColor,
      statusDots: task.statusDots,
      numbers: task.numbers,
      timeline: task.timeline,
      tags: task.tags,
      timeTracking: task.timeTracking,
      comments: task.comments,
      attachments: task.attachments,
      people: task.people,
    },
  };
  if (row.id) {
    const { error } = await supabase.from("tasks").update(row).eq("id", row.id);
    if (error) throw error;
    return task.id;
  }
  const { data, error } = await supabase.from("tasks").insert(row).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteBoardTask(supabase: SupabaseClient, taskId: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}
