"use client";

import { useMemo } from "react";
import { Minus, Plus, Target, Trash2 } from "lucide-react";
import {
  GanttCreateMarkerTrigger,
  GanttFeatureItem,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttHeader,
  GanttMarker,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttToday,
} from "@/components/ui/gantt";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useProjectGantt } from "@/lib/hooks/use-project-gantt";
import type { GanttRange } from "@/lib/project/gantt-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const RANGES: { id: GanttRange; label: string }[] = [
  { id: "daily", label: "Jour" },
  { id: "monthly", label: "Mois" },
  { id: "quarterly", label: "Trimestre" },
];

export function ProjectGantt({
  projectId,
  onProgressChange,
}: {
  projectId: string;
  onProgressChange?: (pct: number) => void;
}) {
  const gantt = useProjectGantt(projectId, onProgressChange);

  const grouped = useMemo(() => ({ Phases: gantt.features }), [gantt.features]);

  if (gantt.loading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Chargement du Gantt…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-3">
          <div className="max-w-[280px] flex-1">
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-primary">
              Avancement · estimé d&apos;après le Gantt
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${gantt.overallProgress}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-extrabold tabular-nums text-primary">{gantt.overallProgress}%</span>
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => void gantt.setRange(r.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11.5px] font-bold",
                gantt.range === r.id ? "bg-white text-primary shadow-sm" : "text-slate-500",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
          <button type="button" onClick={() => void gantt.setZoom(gantt.zoom - 10)} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="px-1 text-[11.5px] font-bold text-slate-500">Zoom</span>
          <button type="button" onClick={() => void gantt.setZoom(gantt.zoom + 10)} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <label className="font-semibold text-muted-foreground">Début</label>
          <Input
            type="date"
            className="h-8 w-[140px]"
            value={gantt.meta.startDate ?? ""}
            onChange={(e) => void gantt.setProjectDates(e.target.value || null, gantt.meta.endDate)}
          />
          <label className="font-semibold text-muted-foreground">Fin</label>
          <Input
            type="date"
            className="h-8 w-[140px]"
            value={gantt.meta.endDate ?? ""}
            onChange={(e) => void gantt.setProjectDates(gantt.meta.startDate, e.target.value || null)}
          />
        </div>

        <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1" onClick={() => void gantt.addPhase()}>
          <Plus className="h-3.5 w-3.5" /> Phase
        </Button>
      </div>

      <div className="min-h-[480px] overflow-hidden rounded-xl border">
        <GanttProvider range={gantt.range} zoom={gantt.zoom} onAddItem={(date) => void gantt.addPhase(date)} className="h-[480px]">
          <GanttSidebar>
            <GanttSidebarGroup name="Phases">
              {gantt.phases.map((phase) => {
                const feature = gantt.features.find((f) => f.id === phase.id);
                if (!feature) return null;
                return (
                  <div key={phase.id} className="group flex items-center gap-1 pr-1">
                    <div className="min-w-0 flex-1">
                      <GanttSidebarItem feature={feature} />
                    </div>
                    <Input
                      value={phase.name}
                      onChange={(e) => gantt.updatePhaseName(phase.id, e.target.value)}
                      className="mr-1 hidden h-7 w-24 text-xs group-hover:flex"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      type="button"
                      onClick={() => void gantt.removePhase(phase.id)}
                      className="shrink-0 p-1 text-slate-300 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </GanttSidebarGroup>
          </GanttSidebar>

          <GanttTimeline>
            <GanttHeader />
            <GanttFeatureList>
              {Object.entries(grouped).map(([group, feats]) => (
                <GanttFeatureListGroup key={group}>
                  {feats.map((feature) => (
                    <ContextMenu key={feature.id}>
                      <ContextMenuTrigger>
                        <GanttFeatureItem
                          {...feature}
                          onMove={gantt.movePhase}
                        >
                          <p className="truncate px-2 text-xs font-semibold text-white">{feature.name}</p>
                        </GanttFeatureItem>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => void gantt.removePhase(feature.id)}>
                          Supprimer la phase
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </GanttFeatureListGroup>
              ))}
            </GanttFeatureList>

            {gantt.markers.map((m) => (
              <GanttMarker
                key={m.id}
                id={m.id}
                date={new Date(`${m.markerDate}T12:00:00`)}
                label={m.label}
                className="bg-primary/10 text-primary"
                onRemove={gantt.removeMarker}
              />
            ))}

            <GanttCreateMarkerTrigger onCreateMarker={(date) => void gantt.addMarker(date)} />
            <GanttToday />
          </GanttTimeline>
        </GanttProvider>
      </div>

      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Target className="h-3.5 w-3.5" />
        Glisser pour déplacer · poignées pour redimensionner · survol de la timeline pour ajouter un jalon
      </p>
    </div>
  );
}
