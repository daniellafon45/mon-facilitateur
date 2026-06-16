import { addDays, addWeeks } from "date-fns";
import type { GanttFeature, GanttStatus, Range } from "@/components/ui/gantt";
import type { GanttPhase, ProjectGanttMeta } from "@/lib/project/registry-types";

export function anchorDate(meta: ProjectGanttMeta): Date {
  if (meta.startDate) {
    return new Date(`${meta.startDate}T12:00:00`);
  }
  if (meta.createdAt) {
    return new Date(meta.createdAt);
  }
  return new Date();
}

export function progressToStatus(progress: number, color: string): GanttStatus {
  let name = "Planifié";
  if (progress >= 100) name = "Terminé";
  else if (progress > 0) name = "En cours";
  return { id: name.toLowerCase(), name, color };
}

export function phaseToFeature(phase: GanttPhase, anchor: Date): GanttFeature {
  const startAt = addWeeks(anchor, phase.startWeek);
  const endAt = addDays(addWeeks(anchor, phase.startWeek + phase.durationWeeks), -1);
  return {
    id: phase.id,
    name: phase.name,
    startAt,
    endAt: endAt < startAt ? startAt : endAt,
    status: progressToStatus(phase.progress, phase.color),
    lane: "Phases",
  };
}

export function featureDatesToPhase(
  startAt: Date,
  endAt: Date | null,
  anchor: Date,
): { startWeek: number; durationWeeks: number } {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const startWeek = Math.max(0, Math.round((startAt.getTime() - anchor.getTime()) / msPerWeek));
  const end = endAt ?? addDays(startAt, 14);
  const durationWeeks = Math.max(0.5, Math.round((end.getTime() - startAt.getTime()) / msPerWeek) || 1);
  return { startWeek, durationWeeks };
}

export function overallProgressFromPhases(phases: GanttPhase[]) {
  if (!phases.length) return 0;
  const total = phases.reduce((s, p) => s + p.durationWeeks, 0);
  if (!total) return 0;
  return Math.round(phases.reduce((s, p) => s + p.progress * p.durationWeeks, 0) / total);
}

export const DEFAULT_PHASES = (projectId: string): GanttPhase[] => {
  const colors = ["#2563eb", "#7c3aed", "#d97706", "#059669", "#db2777"];
  return [
    { id: "local-1", projectId, name: "Cadrage", startWeek: 0, durationWeeks: 2, color: colors[0], progress: 100, milestone: false, sortOrder: 0 },
    { id: "local-2", projectId, name: "Réalisation", startWeek: 2, durationWeeks: 4, color: colors[1], progress: 40, milestone: false, sortOrder: 1 },
    { id: "local-3", projectId, name: "Livraison", startWeek: 6, durationWeeks: 2, color: colors[2], progress: 0, milestone: true, sortOrder: 2 },
  ];
};

export type GanttRange = Range;
