"use client";

import { useState, useMemo } from "react";
import { ArrowRight, Calendar, Check, ChevronLeft, Folder, List, Plus } from "lucide-react";
import type { DisplayProject } from "@/types/facilitation";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { ProjectIcon } from "@/components/projets/projets-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ActivityJournal({
  onBack,
  onOpenProject,
  projects,
}: {
  onBack: () => void;
  onOpenProject: (p: DisplayProject) => void;
  projects: DisplayProject[];
}) {
  const rawActivity = useFacilitationStore((s) => s.activity);
  const activity = useMemo(
    () =>
      rawActivity.map((a, i) => ({
        ...a,
        id: a.id || `act-${i}`,
        time: a.time ?? "—",
        bucket: a.bucket ?? "Plus tôt",
      })),
    [rawActivity],
  );
  const buckets = ["Aujourd'hui", "Hier", "Plus tôt"];
  const groups = buckets
    .map((day) => ({ day, items: activity.filter((a) => a.bucket === day) }))
    .filter((g) => g.items.length);

  return (
    <div className="h-full overflow-y-auto px-9 py-7">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-5 flex items-center gap-3">
          <button type="button" onClick={onBack} className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[26px] font-extrabold tracking-tight">Journal d&apos;activité</h1>
        </div>
        {groups.length === 0 && (
          <div className="rounded-[14px] border border-dashed py-12 text-center text-sm text-muted-foreground">
            Aucune activité pour l&apos;instant.
          </div>
        )}
        {groups.map((g) => (
          <div key={g.day} className="mb-6">
            <div className="mb-2.5 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">{g.day}</div>
            <div className="overflow-hidden rounded-[14px] border">
              {g.items.map((a, i) => (
                <button
                  key={a.id || i}
                  type="button"
                  onClick={() => {
                    const p = projects.find((x) => x.id === a.pid);
                    if (p) onOpenProject(p);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 cursor-pointer border-0 bg-background",
                    i < g.items.length - 1 && "border-b border-slate-100",
                  )}
                >
                  <span
                    className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${a.c}18`, color: a.c }}
                  >
                    <List className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold">{a.t}</div>
                    <div className="text-xs text-muted-foreground">{a.d}</div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">{a.time}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TasksScreen({
  onBack,
  onOpenProject,
  projects,
}: {
  onBack: () => void;
  onOpenProject: (p: DisplayProject) => void;
  projects: DisplayProject[];
}) {
  const [filter, setFilter] = useState("all");
  const [newTask, setNewTask] = useState("");
  const rawTasks = useFacilitationStore((s) => s.tasks);
  const storeProjects = useFacilitationStore((s) => s.projects);
  const tasks = useMemo(
    () =>
      rawTasks.map((t) => {
        const proj = storeProjects.find((p) => p.id === t.projectId);
        return {
          ...t,
          proj: proj?.name ?? t.proj ?? "Sans projet",
          who: t.who ?? "Vous",
          wc: t.wc ?? "#2563eb",
          prio: t.prio ?? "Moyenne",
        };
      }),
    [rawTasks, storeProjects],
  );
  const addTask = useFacilitationStore((s) => s.addTask);
  const toggleTask = useFacilitationStore((s) => s.toggleTask);

  const chips = [
    { id: "all", l: "Toutes" },
    { id: "open", l: "Ouvertes" },
    { id: "noecheance", l: "Sans échéance" },
    { id: "late", l: "En retard" },
  ];

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "open") return !t.done;
    if (filter === "noecheance") return !t.due && !t.dueISO;
    if (filter === "late") return !!t.late;
    return !t.done;
  });

  return (
    <div className="h-full overflow-y-auto px-9 py-7">
      <div className="mx-auto max-w-[880px]">
        <div className="mb-4 flex items-center gap-3">
          <button type="button" onClick={onBack} className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[26px] font-extrabold tracking-tight">Tâches</h1>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[13px] font-bold cursor-pointer",
                filter === c.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground",
              )}
            >
              {c.l}
            </button>
          ))}
        </div>
        <div className="mb-3.5 flex items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 py-2.5">
          <Plus className="h-4 w-4 text-primary shrink-0" />
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newTask.trim()) {
                addTask({ title: newTask.trim() });
                setNewTask("");
              }
            }}
            placeholder="Ajouter une tâche… (Entrée pour créer)"
            className="border-0 shadow-none focus-visible:ring-0"
          />
          <Button
            size="sm"
            className="rounded-lg"
            disabled={!newTask.trim()}
            onClick={() => {
              addTask({ title: newTask.trim() });
              setNewTask("");
            }}
          >
            Ajouter
          </Button>
        </div>
        <div className="overflow-hidden rounded-[14px] border">
          {filtered.length === 0 && (
            <div className="py-9 text-center text-sm text-muted-foreground">Aucune tâche.</div>
          )}
          {filtered.map((t, i) => (
            <div key={t.id || i} className={cn("flex items-center gap-3 px-4 py-3", i < filtered.length - 1 && "border-b border-slate-100")}>
              <button
                type="button"
                onClick={() => toggleTask(t.id)}
                className={cn(
                  "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full cursor-pointer",
                  t.done ? "bg-emerald-500 text-white" : "border-2 border-slate-300",
                )}
              >
                {t.done && <Check className="h-3 w-3" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className={cn("text-sm font-bold", t.done && "text-muted-foreground line-through")}>{t.title}</div>
                <button
                  type="button"
                  onClick={() => {
                    const p = projects.find((x) => x.id === t.projectId);
                    if (p) onOpenProject(p);
                  }}
                  className="mt-0.5 flex items-center gap-1 border-0 bg-transparent p-0 text-xs font-semibold text-primary cursor-pointer"
                >
                  <Folder className="h-3 w-3" /> {t.proj}
                </button>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span
                  className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-extrabold text-white"
                  style={{ background: t.wc }}
                >
                  {(t.who ?? "V").split(" ").map((x) => x[0]).join("")}
                </span>
                {t.who}
              </span>
              {t.due ? (
                <span className={cn("min-w-[70px] text-right text-xs font-bold", t.late ? "text-red-600" : "text-muted-foreground")}>
                  <Calendar className="inline h-3 w-3 mr-0.5" />{t.due}
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11.5px] font-bold text-amber-700">Sans échéance</span>
              )}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-extrabold",
                  t.prio === "Haute" ? "bg-red-50 text-red-600" : t.prio === "Moyenne" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500",
                )}
              >
                {t.prio}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProjetsRail({
  reportsToSend,
  noDueTasks,
  toSchedule,
  recentActivity,
  onNavSeances,
  onOpenTasks,
  onSchedule,
  onOpenActivity,
  onOpenProjectFromActivity,
  onNavModeles,
}: {
  reportsToSend: number;
  noDueTasks: number;
  toSchedule: number;
  recentActivity: { id?: string; icon: string; t: string; d: string; c: string; time?: string; pid?: string }[];
  onNavSeances: () => void;
  onOpenTasks: () => void;
  onSchedule: () => void;
  onOpenActivity: () => void;
  onOpenProjectFromActivity: (pid?: string) => void;
  onNavModeles: () => void;
}) {
  const [open, setOpen] = useState(true);
  const items = [
    { icon: ArrowRight, color: "#2563eb", text: `${reportsToSend} compte${reportsToSend > 1 ? "s" : ""} rendu${reportsToSend > 1 ? "s" : ""}`, sub: "À envoyer", act: onNavSeances },
    { icon: Check, color: "#f97316", text: `${noDueTasks} tâche${noDueTasks > 1 ? "s" : ""}`, sub: "Sans échéance", act: onOpenTasks },
    { icon: Calendar, color: "#7c3aed", text: `${toSchedule} rencontre${toSchedule > 1 ? "s" : ""}`, sub: "À programmer", act: onSchedule },
  ];

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-10 shrink-0 border-l hover:bg-muted flex items-center justify-center">
        <ChevronLeft className="h-4 w-4 rotate-180" />
      </button>
    );
  }

  return (
    <aside className="w-[280px] shrink-0 border-l overflow-y-auto p-4 hidden xl:block">
      <button type="button" onClick={() => setOpen(false)} className="mb-2 text-xs text-muted-foreground hover:text-foreground">Réduire</button>
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-[15px] font-extrabold">
          <List className="h-4 w-4" /> À faire
        </div>
        {items.map((t, i) => (
          <button
            key={i}
            type="button"
            onClick={t.act}
            className="mb-1.5 flex w-full items-center gap-2.5 rounded-[10px] bg-slate-50 p-2.5 text-left hover:bg-slate-100 cursor-pointer border-0"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${t.color}18`, color: t.color }}>
              <t.icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold">{t.text}</div>
              <div className="text-xs text-muted-foreground">{t.sub}</div>
            </div>
            <ChevronLeft className="h-3.5 w-3.5 rotate-180 text-slate-300" />
          </button>
        ))}
        <button type="button" onClick={onOpenTasks} className="mt-1.5 flex items-center gap-1 border-0 bg-transparent p-0 text-[13px] font-bold text-primary cursor-pointer">
          <List className="h-3.5 w-3.5" /> Voir toutes les tâches
        </button>
      </div>

      <div className="mb-6 border-t pt-4">
        <div className="mb-3 flex items-center gap-2 text-[15px] font-extrabold">Activité récente</div>
        {recentActivity.map((a, i) => (
          <button
            key={a.id || i}
            type="button"
            onClick={() => onOpenProjectFromActivity(a.pid)}
            className={cn(
              "flex w-full items-start gap-2.5 py-2 text-left border-0 bg-transparent cursor-pointer",
              i < recentActivity.length - 1 && "border-b border-slate-100",
            )}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${a.c}18`, color: a.c }}>
              <List className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold">{a.t}</div>
              <div className="truncate text-xs text-muted-foreground">{a.d} • {a.time}</div>
            </div>
          </button>
        ))}
        <button type="button" onClick={onOpenActivity} className="mt-2 flex items-center gap-1 border-0 bg-transparent p-0 text-[13px] font-bold text-primary cursor-pointer">
          <List className="h-3.5 w-3.5" /> Voir toute l&apos;activité
        </button>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] font-bold">Besoin d&apos;inspiration ?</div>
            <button type="button" onClick={onNavModeles} className="mt-1.5 flex items-center gap-1 border-0 bg-transparent p-0 text-[13px] font-bold text-primary cursor-pointer">
              Explorer <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
