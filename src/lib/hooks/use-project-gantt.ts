"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import type { GanttConfig, GanttMarker, GanttPhase } from "@/lib/project/registry-types";
import {
  anchorDate,
  DEFAULT_PHASES,
  featureDatesToPhase,
  overallProgressFromPhases,
  phaseToFeature,
  type GanttRange,
} from "@/lib/project/gantt-adapter";
import type { GanttFeature } from "@/components/ui/gantt";
import {
  deleteGanttMarker,
  deleteGanttPhase,
  fetchGanttMarkers,
  fetchGanttPhases,
  fetchProjectGanttMeta,
  patchProjectDates,
  patchProjectGanttConfig,
  saveGanttMarker,
  saveGanttPhase,
} from "@/lib/supabase/queries/project-extras";

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function useProjectGantt(projectId: string, onProgressChange?: (pct: number) => void) {
  const [phases, setPhases] = useState<GanttPhase[]>(() => DEFAULT_PHASES(projectId));
  const [markers, setMarkers] = useState<GanttMarker[]>([]);
  const [range, setRangeState] = useState<GanttRange>("monthly");
  const [zoom, setZoomState] = useState(100);
  const [meta, setMeta] = useState<{ startDate: string | null; endDate: string | null; anchor: Date }>({
    startDate: null,
    endDate: null,
    anchor: new Date(),
  });
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);
  const phasesRef = useRef(phases);
  phasesRef.current = phases;

  const overallProgress = useMemo(() => overallProgressFromPhases(phases), [phases]);

  useEffect(() => {
    onProgressChange?.(overallProgress);
  }, [overallProgress, onProgressChange]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      setLoading(true);
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;
        userIdRef.current = auth.user.id;
        const [phaseRows, markerRows, ganttMeta] = await Promise.all([
          fetchGanttPhases(supabase, projectId),
          fetchGanttMarkers(supabase, projectId),
          fetchProjectGanttMeta(supabase, projectId),
        ]);
        if (cancelled) return;
        if (phaseRows.length) setPhases(phaseRows);
        setMarkers(markerRows);
        setRangeState(ganttMeta.ganttConfig.range);
        setZoomState(ganttMeta.ganttConfig.zoom);
        setMeta({
          startDate: ganttMeta.startDate ?? null,
          endDate: ganttMeta.endDate ?? null,
          anchor: anchorDate(ganttMeta),
        });
      } catch {
        /* local defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  const persistPhase = useCallback(async (phase: GanttPhase) => {
    const supabase = createClient();
    const uid = userIdRef.current;
    if (!uid) return phase.id;
    try {
      const id = await saveGanttPhase(supabase, uid, phase);
      return id;
    } catch {
      return phase.id;
    }
  }, []);

  const debouncedPersistPhase = useMemo(
    () =>
      debounce((phase: GanttPhase) => {
        void persistPhase(phase);
      }, 500),
    [persistPhase],
  );

  const features: GanttFeature[] = useMemo(
    () => phases.map((p) => phaseToFeature(p, meta.anchor)),
    [phases, meta.anchor],
  );

  const movePhase = useCallback(
    (id: string, startAt: Date, endAt: Date | null) => {
      setPhases((prev) => {
        const next = prev.map((p) => {
          if (p.id !== id) return p;
          const { startWeek, durationWeeks } = featureDatesToPhase(startAt, endAt, meta.anchor);
          const updated = { ...p, startWeek, durationWeeks };
          debouncedPersistPhase(updated);
          return updated;
        });
        return next;
      });
    },
    [meta.anchor, debouncedPersistPhase],
  );

  const addPhase = useCallback(
    async (date?: Date) => {
      const last = phasesRef.current[phasesRef.current.length - 1];
      let startWeek = last ? last.startWeek + last.durationWeeks : 0;
      if (date) {
        const { startWeek: sw } = featureDatesToPhase(date, addDaysSafe(date, 14), meta.anchor);
        startWeek = sw;
      }
      const colors = ["#2563eb", "#7c3aed", "#d97706", "#059669", "#db2777"];
      const phase: GanttPhase = {
        id: `local-${Date.now()}`,
        projectId,
        name: "Nouvelle phase",
        startWeek,
        durationWeeks: 2,
        color: colors[phasesRef.current.length % colors.length],
        progress: 0,
        milestone: false,
        sortOrder: phasesRef.current.length,
      };
      const supabase = createClient();
      const uid = userIdRef.current;
      if (uid) {
        try {
          const id = await saveGanttPhase(supabase, uid, phase);
          phase.id = id;
        } catch {
          /* local */
        }
      }
      setPhases((prev) => [...prev, phase]);
    },
    [projectId, meta.anchor],
  );

  const removePhase = useCallback(async (phaseId: string) => {
    if (!phaseId.startsWith("local-")) {
      const supabase = createClient();
      try {
        await deleteGanttPhase(supabase, phaseId);
      } catch {
        /* */
      }
    }
    setPhases((prev) => prev.filter((p) => p.id !== phaseId));
  }, []);

  const updatePhaseName = useCallback(
    (phaseId: string, name: string) => {
      setPhases((prev) => {
        const next = prev.map((p) => (p.id === phaseId ? { ...p, name } : p));
        const updated = next.find((p) => p.id === phaseId);
        if (updated) debouncedPersistPhase(updated);
        return next;
      });
    },
    [debouncedPersistPhase],
  );

  const addMarker = useCallback(
    async (date: Date) => {
      const marker: GanttMarker = {
        id: `local-${Date.now()}`,
        projectId,
        label: `Jalon · ${format(date, "d MMM")}`,
        markerDate: format(date, "yyyy-MM-dd"),
        color: "#2563eb",
        sortOrder: markers.length,
      };
      const supabase = createClient();
      const uid = userIdRef.current;
      if (uid) {
        try {
          marker.id = await saveGanttMarker(supabase, uid, marker);
        } catch {
          /* */
        }
      }
      setMarkers((prev) => [...prev, marker]);
    },
    [projectId, markers.length],
  );

  const removeMarker = useCallback(async (markerId: string) => {
    if (!markerId.startsWith("local-")) {
      const supabase = createClient();
      try {
        await deleteGanttMarker(supabase, markerId);
      } catch {
        /* */
      }
    }
    setMarkers((prev) => prev.filter((m) => m.id !== markerId));
  }, []);

  const setRange = useCallback(
    async (next: GanttRange) => {
      setRangeState(next);
      const supabase = createClient();
      try {
        await patchProjectGanttConfig(supabase, projectId, { range: next });
      } catch {
        /* */
      }
    },
    [projectId],
  );

  const setZoom = useCallback(
    async (next: number) => {
      const clamped = Math.min(200, Math.max(50, next));
      setZoomState(clamped);
      const supabase = createClient();
      try {
        await patchProjectGanttConfig(supabase, projectId, { zoom: clamped });
      } catch {
        /* */
      }
    },
    [projectId],
  );

  const setProjectDates = useCallback(
    async (startDate: string | null, endDate: string | null) => {
      setMeta((m) => ({
        ...m,
        startDate,
        endDate,
        anchor: startDate ? new Date(`${startDate}T12:00:00`) : m.anchor,
      }));
      const supabase = createClient();
      try {
        await patchProjectDates(supabase, projectId, { startDate, endDate });
      } catch {
        /* */
      }
    },
    [projectId],
  );

  return {
    loading,
    phases,
    markers,
    features,
    range,
    zoom,
    meta,
    overallProgress,
    addPhase,
    movePhase,
    removePhase,
    updatePhaseName,
    addMarker,
    removeMarker,
    setRange,
    setZoom,
    setProjectDates,
  };
}

function addDaysSafe(d: Date, days: number) {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}
