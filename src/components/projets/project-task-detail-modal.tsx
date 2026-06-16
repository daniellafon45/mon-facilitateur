"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { MessageSquare, Paperclip, X } from "lucide-react";
import type { BoardTask } from "@/types/facilitation";
import { useProjectBoardStore } from "@/lib/store/project-board-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function PersonDot({ initials, color, size = "md" }: { initials: string; color: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-extrabold text-white shrink-0",
        size === "sm" ? "h-6 w-6 text-[9px]" : "h-7 w-7 text-[10px]",
      )}
      style={{ background: color }}
    >
      {initials}
    </span>
  );
}

export function ProjectTaskDetailModal({
  task,
  onClose,
}: {
  task: BoardTask | null;
  onClose: () => void;
}) {
  const updateTask = useProjectBoardStore((s) => s.updateTask);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!task || !mounted) return null;

  const subtasks = task.subtasks ?? [];

  return createPortal(
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div className="min-w-0 flex-1">
            {task.tags && task.tags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                    style={{ background: tag.bg, color: tag.text }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
            <Input
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              className="border-0 px-0 text-lg font-extrabold shadow-none focus-visible:ring-0"
            />
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 rounded-xl" onClick={onClose} aria-label="Fermer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="max-h-[min(70vh,520px)] space-y-4 overflow-y-auto px-5 py-4">
          <Textarea
            value={task.description ?? ""}
            placeholder="Ajouter une description…"
            rows={3}
            className="resize-none text-sm"
            onChange={(e) => updateTask(task.id, { description: e.target.value })}
          />

          {subtasks.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Sous-tâches</p>
              <ul className="space-y-2">
                {subtasks.map((st) => (
                  <li key={st.id} className="flex items-center gap-2.5">
                    <button
                      type="button"
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                        st.done ? "border-emerald-500 bg-emerald-500" : "border-slate-300",
                      )}
                      onClick={() =>
                        updateTask(task.id, {
                          subtasks: subtasks.map((s) =>
                            s.id === st.id ? { ...s, done: !s.done } : s,
                          ),
                        })
                      }
                    />
                    <span className={cn("text-sm", st.done && "text-muted-foreground line-through")}>{st.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {task.attachments != null && task.attachments > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: Math.min(task.attachments, 4) }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 w-20 shrink-0 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200"
                />
              ))}
              {task.attachments > 4 && (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                  +{task.attachments - 4}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-5 py-3">
          <div className="flex items-center gap-2">
            <PersonDot initials={task.ownerInitials} color={task.ownerColor} />
            {task.people.slice(0, 2).map((p) => (
              <PersonDot key={p.initials} initials={p.initials} color={p.color} size="sm" />
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
            {(task.comments ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" /> {task.comments}
              </span>
            )}
            {(task.attachments ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5" /> {task.attachments}
              </span>
            )}
            <span>{task.dueDate}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
