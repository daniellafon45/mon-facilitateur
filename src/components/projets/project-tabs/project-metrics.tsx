"use client";

import type { BoardTask } from "@/types/facilitation";
import type { ProjectMember } from "@/lib/project/registry-types";
import type { Meeting } from "@/types/facilitation";

export function ProjectMetrics({
  tasks,
  members,
  meetings,
}: {
  tasks: BoardTask[];
  members: ProjectMember[];
  meetings: Meeting[];
}) {
  const byAssignee = members.map((m) => {
    const initials = m.displayName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const mine = tasks.filter(
      (t) =>
        t.ownerInitials === initials ||
        t.people?.some((p) => p.initials === initials),
    );
    const done = mine.filter((t) => t.kanbanStatus === "done").length;
    return { who: m.displayName, c: m.color, done, total: mine.length || 1 };
  });

  const statusCounts = {
    done: tasks.filter((t) => t.kanbanStatus === "done").length,
    progress: tasks.filter((t) => t.kanbanStatus === "in-progress").length,
    todo: tasks.filter((t) => t.kanbanStatus === "todo" || t.kanbanStatus === "stuck").length,
  };

  const meetingMinutes = meetings.length * 60;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <h3 className="mb-4 text-sm font-extrabold">Répartition des tâches par membre</h3>
          {byAssignee.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun membre assigné.</p>
          ) : (
            <div className="space-y-3">
              {byAssignee.map((row) => (
                <div key={row.who}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                        style={{ background: row.c }}
                      >
                        {row.who.slice(0, 2).toUpperCase()}
                      </span>
                      {row.who}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {row.done}/{row.total}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.total ? (row.done / row.total) * 100 : 0}%`,
                        background: row.c,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border p-5">
          <h3 className="mb-4 text-sm font-extrabold">Statut des tâches</h3>
          <div className="space-y-2">
            {[
              { label: "Terminées", val: statusCounts.done, color: "#059669" },
              { label: "En cours", val: statusCounts.progress, color: "#2563eb" },
              { label: "À faire / bloquées", val: statusCounts.todo, color: "#64748b" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-28 text-sm text-muted-foreground">{s.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${tasks.length ? (s.val / tasks.length) * 100 : 0}%`,
                      background: s.color,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-sm font-bold">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-5">
        <h3 className="mb-2 text-sm font-extrabold">Temps en réunion (estimé)</h3>
        <p className="text-3xl font-extrabold text-primary">
          {Math.floor(meetingMinutes / 60)} h {meetingMinutes % 60} min
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Basé sur {meetings.length} rencontre{meetings.length > 1 ? "s" : ""} planifiée
          {meetings.length > 1 ? "s" : ""} (~1 h chacune)
        </p>
      </div>
    </div>
  );
}
