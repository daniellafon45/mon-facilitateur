"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  EyeOff,
  Filter,
  Layers,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react";
import type { BoardTask, DisplayProject } from "@/types/facilitation";
import { BOARD_COLUMNS } from "@/lib/projets/constants";
import { useProjectBoardStore } from "@/lib/store/project-board-store";
import { ProjectTaskDetailModal } from "@/components/projets/project-task-detail-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function PersonDot({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-extrabold text-white shrink-0 ring-2 ring-background"
      style={{ background: color }}
    >
      {initials}
    </span>
  );
}

function StatusDots({ colors }: { colors: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {colors.map((c, i) => (
        <span key={i} className="inline-block h-3 w-3 rounded-full" style={{ background: c }} />
      ))}
    </div>
  );
}

const COL_W = "w-[108px]";

function Cell({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("shrink-0 hidden lg:flex items-center", COL_W, className)}>
      {children}
    </div>
  );
}

export function ProjectMainTable({ project }: { project: DisplayProject }) {
  const ensureProject = useProjectBoardStore((s) => s.ensureProject);
  const groups = useProjectBoardStore((s) => s.projectGroups(project.id));
  const tasks = useProjectBoardStore((s) => s.projectTasks(project.id));
  const toggleGroup = useProjectBoardStore((s) => s.toggleGroup);
  const addGroup = useProjectBoardStore((s) => s.addGroup);
  const addTask = useProjectBoardStore((s) => s.addTask);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<BoardTask | null>(null);

  ensureProject(project.id);

  const filteredTasks = query.trim()
    ? tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    : tasks;

  const openNewTask = () => {
    if (!groups[0]) return;
    addTask(project.id, groups[0].id, "Nouvelle tâche");
  };

  const renderTaskRow = (task: BoardTask, groupColor: string, isGroupRow = false) => {
    const dots = task.statusDots ?? [task.statusColor];
    const selected = selectedId === task.id;

    return (
      <div
        key={task.id}
        role="button"
        tabIndex={0}
        onClick={() => {
          setSelectedId(task.id);
          if (!isGroupRow) setDetailTask(task);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setSelectedId(task.id);
            if (!isGroupRow) setDetailTask(task);
          }
        }}
        className={cn(
          "group flex cursor-pointer items-center gap-3 border-t border-slate-100 px-4 py-2.5 transition-colors hover:bg-slate-50/80",
          selected && "border border-dashed border-slate-300 bg-slate-50/90 rounded-lg mx-2 my-0.5",
          !selected && "border-l-[4px]",
        )}
        style={selected ? undefined : { borderLeftColor: groupColor }}
      >
        <span className="w-5 shrink-0" />
        <div className="min-w-[220px] flex-1">
          <div className="text-sm font-semibold text-slate-800">{task.title}</div>
        </div>
        <Cell>
          <div className="flex -space-x-1.5">
            <PersonDot initials={task.ownerInitials} color={task.ownerColor} />
          </div>
        </Cell>
        <Cell><StatusDots colors={dots} /></Cell>
        <Cell>
          <div>
            <div className="text-xs font-semibold text-slate-700">{task.dueDate}</div>
            <div className="text-[10px] text-muted-foreground">(plus tôt)</div>
          </div>
        </Cell>
        <Cell>
          <div>
            <div className="text-xs font-bold text-slate-700">{task.numbers || "—"}</div>
            {task.numbers > 0 && <div className="text-[10px] text-muted-foreground">(somme)</div>}
          </div>
        </Cell>
        <Cell>
          <div className="flex flex-wrap gap-1">
            {(task.tags ?? []).slice(0, 2).map((tag) => (
              <span
                key={tag.label}
                className="rounded px-1.5 py-0.5 text-[9px] font-bold"
                style={{ background: tag.bg, color: tag.text }}
              >
                {tag.label}
              </span>
            ))}
          </div>
        </Cell>
        <Cell>
          <span className="text-xs font-semibold text-slate-600">{task.timeTracking ?? "—"}</span>
        </Cell>
        <Cell>
          {task.timeline && task.timeline !== "—" && (
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-700 whitespace-nowrap">
              {task.timeline}
            </span>
          )}
        </Cell>
        <Cell>
          <div className="flex items-center -space-x-1.5">
            {task.people.slice(0, 3).map((p) => (
              <PersonDot key={p.initials} initials={p.initials} color={p.color} />
            ))}
            {task.people.length > 3 && (
              <span className="ml-2 text-[10px] font-bold text-muted-foreground">+{task.people.length - 3}</span>
            )}
          </div>
        </Cell>
        <button
          type="button"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted"
          onClick={(e) => {
            e.stopPropagation();
            addTask(project.id, task.groupId, "Sous-élément");
          }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f6f7fb]">
      {/* Toolbar Monday-style */}
      <div className="flex flex-wrap items-center gap-2 border-b bg-background px-5 py-3">
        <Button size="sm" className="h-9 gap-1.5 rounded-lg bg-[#0073ea] px-4 font-bold hover:bg-[#0060c2]" onClick={openNewTask}>
          <Plus className="h-4 w-4" /> Nouvelle tâche
        </Button>
        <div className="flex items-center gap-0.5 text-[13px] font-semibold text-slate-500">
          {[
            { icon: Search, label: "Rechercher" },
            { icon: User, label: "Personne" },
            { icon: Filter, label: "Filtrer" },
            { icon: SlidersHorizontal, label: "Trier" },
            { icon: EyeOff, label: "Masquer" },
            { icon: Layers, label: "Grouper par" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 hover:bg-slate-100"
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans le tableau…"
            className="h-7 w-44 border-0 p-0 text-xs shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        <span className="w-5 shrink-0" />
        <span className="min-w-[220px] flex-1">Tâche</span>
        {BOARD_COLUMNS.map((col) => (
          <span key={col} className={cn(COL_W, "shrink-0 hidden lg:block")}>{col}</span>
        ))}
        <span className="w-7 shrink-0" />
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto bg-white">
        {groups.map((group) => {
          const groupTasks = filteredTasks.filter((t) => t.groupId === group.id);
          const sum = groupTasks.reduce((a, t) => a + t.numbers, 0);
          const earliest = groupTasks[0]?.dueDate;
          const allDots = groupTasks.flatMap((t) => t.statusDots ?? [t.statusColor]).slice(0, 4);

          return (
            <div key={group.id} className="border-b border-slate-100">
              {/* Group summary row */}
              <div
                className="group flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-50/60"
                style={{ borderLeft: `4px solid ${group.color}` }}
                onClick={() => toggleGroup(group.id)}
              >
                <button type="button" className="shrink-0 text-slate-400">
                  {group.collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <div className="min-w-[220px] flex-1">
                  <div className="text-[15px] font-extrabold" style={{ color: group.color }}>{group.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {groupTasks.length} tâche{groupTasks.length > 1 ? "s" : ""} / {groupTasks.length} sous-élément{groupTasks.length > 1 ? "s" : ""}
                  </div>
                </div>
                <Cell>
                  {groupTasks[0] && <PersonDot initials={groupTasks[0].ownerInitials} color={groupTasks[0].ownerColor} />}
                </Cell>
                <Cell><StatusDots colors={allDots.length ? allDots : [group.color]} /></Cell>
                <Cell>
                  <div>
                    <div className="text-xs font-semibold">{earliest ?? "—"}</div>
                    {earliest && <div className="text-[10px] text-muted-foreground">(plus tôt)</div>}
                  </div>
                </Cell>
                <Cell>
                  <div>
                    <div className="text-xs font-bold">{sum > 0 ? sum : "—"}</div>
                    {sum > 0 && <div className="text-[10px] text-muted-foreground">(somme)</div>}
                  </div>
                </Cell>
                <Cell />
                <Cell />
                <Cell>
                  {groupTasks[0]?.timeline && groupTasks[0].timeline !== "—" && (
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-700 whitespace-nowrap">
                      {groupTasks[0].timeline}
                    </span>
                  )}
                </Cell>
                <Cell>
                  <div className="flex items-center -space-x-1.5">
                    {(groupTasks[0]?.people ?? []).slice(0, 2).map((p) => (
                      <PersonDot key={p.initials} initials={p.initials} color={p.color} />
                    ))}
                    {(groupTasks[0]?.people.length ?? 0) > 2 && (
                      <span className="ml-2 text-[10px] font-bold text-muted-foreground">
                        +{(groupTasks[0]?.people.length ?? 0) - 2}
                      </span>
                    )}
                  </div>
                </Cell>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    addTask(project.id, group.id, "Nouvelle tâche");
                  }}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {!group.collapsed && groupTasks.map((task) => renderTaskRow(task, group.color))}
            </div>
          );
        })}

        <div className="p-5">
          <Button
            variant="outline"
            className="w-full max-w-xs rounded-xl border-dashed border-slate-300 bg-transparent font-bold text-slate-500 hover:bg-slate-50"
            onClick={() => addGroup(project.id)}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Ajouter un groupe
          </Button>
        </div>
      </div>

      <ProjectTaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />
    </div>
  );
}
