"use client";

import { useState } from "react";
import {
  Filter,
  LayoutGrid,
  List,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Plus,
  Table2,
} from "lucide-react";
import type { BoardTask, DisplayProject } from "@/types/facilitation";
import { KANBAN_COLUMNS } from "@/lib/projets/constants";
import { useProjectBoardStore } from "@/lib/store/project-board-store";
import { ProjectTaskDetailModal } from "@/components/projets/project-task-detail-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type KanbanViewTab = "kanban" | "table" | "list";

function kanbanColumnForTask(status: BoardTask["kanbanStatus"]): (typeof KANBAN_COLUMNS)[number]["id"] {
  if (status === "done") return "done";
  if (status === "in-progress" || status === "stuck") return "in-progress";
  return "todo";
}

function PersonAvatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-extrabold text-white ring-2 ring-background"
      style={{ background: color }}
    >
      {initials}
    </span>
  );
}

function KanbanCard({
  task,
  onOpen,
  onDragStart,
}: {
  task: BoardTask;
  onOpen: () => void;
  onDragStart: () => void;
}) {
  const subtasks = task.subtasks ?? [];
  const doneCount = subtasks.filter((s) => s.done).length;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      className="group cursor-pointer rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(task.tags ?? []).slice(0, 2).map((tag) => (
            <span
              key={tag.label}
              className="rounded-md px-2 py-0.5 text-[10px] font-bold"
              style={{ background: tag.bg, color: tag.text }}
            >
              {tag.label}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </div>

      <h4 className="mb-1.5 text-sm font-bold leading-snug text-slate-900">{task.title}</h4>
      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{task.description}</p>
      )}

      {subtasks.length > 0 && (
        <ul className="mb-3 space-y-1.5 border-t border-slate-100 pt-2.5">
          {subtasks.slice(0, 3).map((st) => (
            <li key={st.id} className="flex items-center gap-2 text-xs text-slate-600">
              <span
                className={cn(
                  "h-3.5 w-3.5 shrink-0 rounded-full border-2",
                  st.done ? "border-emerald-500 bg-emerald-500" : "border-slate-300",
                )}
              />
              <span className={cn("truncate", st.done && "text-muted-foreground line-through")}>{st.label}</span>
            </li>
          ))}
          {subtasks.length > 3 && (
            <li className="text-[10px] font-semibold text-muted-foreground">+{subtasks.length - 3} sous-tâches</li>
          )}
        </ul>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center -space-x-1.5">
          <PersonAvatar initials={task.ownerInitials} color={task.ownerColor} />
          {task.people.slice(0, 1).map((p) => (
            <PersonAvatar key={p.initials} initials={p.initials} color={p.color} />
          ))}
        </div>
        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-muted-foreground">
          {(task.comments ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" /> {task.comments}
            </span>
          )}
          {(task.attachments ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Paperclip className="h-3 w-3" /> {task.attachments}
            </span>
          )}
          {subtasks.length > 0 && (
            <span>{doneCount}/{subtasks.length}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProjectKanbanView({
  project,
  onSwitchView,
}: {
  project: DisplayProject;
  onSwitchView?: (view: "table" | "list") => void;
}) {
  const ensureProject = useProjectBoardStore((s) => s.ensureProject);
  const tasks = useProjectBoardStore((s) => s.projectTasks(project.id));
  const updateTask = useProjectBoardStore((s) => s.updateTask);
  const addKanbanTask = useProjectBoardStore((s) => s.addKanbanTask);
  const [viewTab, setViewTab] = useState<KanbanViewTab>("kanban");
  const [dragId, setDragId] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<BoardTask | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  ensureProject(project.id);

  const handleDrop = (colId: (typeof KANBAN_COLUMNS)[number]["id"]) => {
    if (!dragId) return;
    const statusMap: Record<string, BoardTask["kanbanStatus"]> = {
      todo: "todo",
      "in-progress": "in-progress",
      done: "done",
    };
    updateTask(dragId, { kanbanStatus: statusMap[colId] });
    setDragId(null);
  };

  const viewTabs = [
    { id: "kanban" as const, label: "Kanban", icon: LayoutGrid },
    { id: "table" as const, label: "Tableau", icon: Table2 },
    { id: "list" as const, label: "Liste", icon: List },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f6f7fb]">
      {/* Sub-view tabs (image 2 style) */}
      <div className="flex items-center justify-between border-b bg-white px-5 py-2">
        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {viewTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setViewTab(t.id);
                if (t.id === "table") onSwitchView?.("table");
                if (t.id === "list") onSwitchView?.("list");
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-bold transition-colors",
                viewTab === t.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 gap-1.5 rounded-lg font-semibold", showFilter && "border-primary text-primary")}
          onClick={() => setShowFilter((v) => !v)}
        >
          <Filter className="h-3.5 w-3.5" /> Filtrer
        </Button>
      </div>

      {showFilter && (
        <div className="border-b bg-white px-5 py-2 text-xs text-muted-foreground">
          Filtres rapides : toutes les tâches · mes tâches · avec échéance
        </div>
      )}

      {/* Board */}
      <div className="flex flex-1 gap-4 overflow-x-auto p-5">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => kanbanColumnForTask(t.kanbanStatus) === col.id);
          return (
            <div
              key={col.id}
              className="flex w-[300px] shrink-0 flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              {/* Column header */}
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className={cn("h-2.5 w-2.5 rounded-full", col.dot)} />
                <span className="text-sm font-extrabold text-slate-800">{col.label}</span>
                <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  {colTasks.length}
                </span>
                <button type="button" className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-white">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Add card button */}
              <button
                type="button"
                className="mb-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-white/60 py-2 text-xs font-bold text-slate-500 transition-colors hover:border-slate-400 hover:bg-white"
                onClick={() => addKanbanTask(project.id, col.id === "done" ? "done" : col.id === "in-progress" ? "in-progress" : "todo")}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
                {colTasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onOpen={() => setDetailTask(task)}
                    onDragStart={() => setDragId(task.id)}
                  />
                ))}
                {colTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white/40 p-8 text-center text-xs text-muted-foreground">
                    Glissez une carte ici
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ProjectTaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />
    </div>
  );
}
