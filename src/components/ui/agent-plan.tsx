"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "motion/react";
import type { FacilitationTask, TaskStatus } from "@/types/facilitation";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<TaskStatus, string> = {
  completed: "terminé",
  "in-progress": "en cours",
  pending: "en attente",
  "need-help": "aide",
  failed: "échec",
};

interface AgentPlanProps {
  tasks: FacilitationTask[];
  readOnly?: boolean;
  className?: string;
}

export default function AgentPlan({ tasks, readOnly = true, className }: AgentPlanProps) {
  const prefersReducedMotion = useReducedMotion();
  const [expandedTasks, setExpandedTasks] = useState<string[]>(
    tasks.length ? [tasks[0].id] : [],
  );
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId],
    );
  };

  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const taskVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: prefersReducedMotion ? ("tween" as const) : ("spring" as const),
        stiffness: 500,
        damping: 30,
        duration: prefersReducedMotion ? 0.2 : undefined,
      },
    },
  };

  const subtaskListVariants = {
    hidden: { opacity: 0, height: 0, overflow: "hidden" as const },
    visible: {
      height: "auto",
      opacity: 1,
      overflow: "visible" as const,
      transition: {
        duration: 0.25,
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        when: "beforeChildren" as const,
      },
    },
  };

  const subtaskVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: prefersReducedMotion ? ("tween" as const) : ("spring" as const),
        stiffness: 500,
        damping: 25,
      },
    },
  };

  function StatusIcon({ status, size = "md" }: { status: TaskStatus; size?: "sm" | "md" }) {
    const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
    if (status === "completed") return <CheckCircle2 className={cn(cls, "text-green-500")} />;
    if (status === "in-progress") return <CircleDotDashed className={cn(cls, "text-blue-500")} />;
    if (status === "need-help") return <CircleAlert className={cn(cls, "text-yellow-500")} />;
    if (status === "failed") return <CircleX className={cn(cls, "text-red-500")} />;
    return <Circle className={cn(cls, "text-muted-foreground")} />;
  }

  return (
    <div className={cn("bg-background text-foreground h-full overflow-auto p-2", className)}>
      <motion.div
        className="bg-card border-border rounded-lg border shadow overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
      >
        <LayoutGroup>
          <div className="p-4 overflow-hidden">
            <ul className="space-y-1 overflow-hidden">
              {tasks.map((task, index) => {
                const isExpanded = expandedTasks.includes(task.id);
                const isCompleted = task.status === "completed";

                return (
                  <motion.li
                    key={task.id}
                    className={index !== 0 ? "mt-1 pt-2" : ""}
                    initial="hidden"
                    animate="visible"
                    variants={taskVariants}
                  >
                    <motion.div className="group flex items-center px-3 py-1.5 rounded-md">
                      <div className="mr-2 flex-shrink-0">
                        <StatusIcon status={task.status} />
                      </div>
                      <motion.div
                        className={cn(
                          "flex min-w-0 flex-grow items-center justify-between",
                          !readOnly && "cursor-pointer",
                        )}
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        <div className="mr-2 flex-1 truncate">
                          <span className={isCompleted ? "text-muted-foreground line-through" : ""}>
                            {task.title}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-xs flex-shrink-0",
                            task.status === "completed" && "bg-green-100 text-green-700",
                            task.status === "in-progress" && "bg-blue-100 text-blue-700",
                            task.status === "need-help" && "bg-yellow-100 text-yellow-700",
                            task.status === "failed" && "bg-red-100 text-red-700",
                            task.status === "pending" && "bg-muted text-muted-foreground",
                          )}
                        >
                          {STATUS_LABELS[task.status]}
                        </span>
                      </motion.div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {isExpanded && task.subtasks.length > 0 && (
                        <motion.div
                          className="relative overflow-hidden"
                          variants={subtaskListVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <div className="absolute top-0 bottom-0 left-[20px] border-l-2 border-dashed border-muted-foreground/30" />
                          <ul className="mt-1 mr-2 mb-1.5 ml-3 space-y-0.5">
                            {task.subtasks.map((subtask) => {
                              const subtaskKey = `${task.id}-${subtask.id}`;
                              const isSubtaskExpanded = expandedSubtasks[subtaskKey];

                              return (
                                <motion.li
                                  key={subtask.id}
                                  className="group flex flex-col py-0.5 pl-6"
                                  onClick={() => toggleSubtaskExpansion(task.id, subtask.id)}
                                  variants={subtaskVariants}
                                >
                                  <div className="flex flex-1 items-center rounded-md p-1">
                                    <div className="mr-2 flex-shrink-0">
                                      <StatusIcon status={subtask.status} size="sm" />
                                    </div>
                                    <span
                                      className={cn(
                                        "text-sm",
                                        subtask.status === "completed" && "text-muted-foreground line-through",
                                      )}
                                    >
                                      {subtask.title}
                                    </span>
                                  </div>
                                  <AnimatePresence mode="wait">
                                    {isSubtaskExpanded && (
                                      <motion.div
                                        className="text-muted-foreground border-foreground/20 mt-1 ml-1.5 border-l border-dashed pl-5 text-xs overflow-hidden"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                      >
                                        <p className="py-1">{subtask.description}</p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}
