"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { emptyRegistry, seedRegistry } from "@/lib/project/registry-defaults";
import type { ProjectRegistryPayload } from "@/lib/project/registry-types";
import {
  fetchProjectRegistry,
  saveProjectRegistry,
} from "@/lib/supabase/queries/project-extras";

const localCache = new Map<string, ProjectRegistryPayload>();

export function useProjectRegistry(projectId: string, memberNames: string[] = []) {
  const [registry, setRegistry] = useState<ProjectRegistryPayload>(
    () => localCache.get(projectId) ?? emptyRegistry(),
  );
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (cancelled) return;
      try {
        if (!data.user) {
          const cached = localCache.get(projectId);
          setRegistry(cached ?? seedRegistry(memberNames));
          return;
        }
        const remote = await fetchProjectRegistry(supabase, projectId);
        const hasData =
          remote.raci.tasks.length > 0 ||
          remote.comms.length > 0 ||
          remote.charte.mission;
        const payload = hasData ? remote : seedRegistry(memberNames);
        localCache.set(projectId, payload);
        setRegistry(payload);
      } catch {
        setRegistry(localCache.get(projectId) ?? seedRegistry(memberNames));
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, memberNames.join("|")]);

  const persist = useCallback(
    (next: ProjectRegistryPayload) => {
      localCache.set(projectId, next);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void (async () => {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          if (!data.user) return;
          try {
            await saveProjectRegistry(supabase, data.user.id, projectId, next);
          } catch {
            /* offline */
          }
        })();
      }, 600);
    },
    [projectId],
  );

  const update = useCallback(
    (updater: (prev: ProjectRegistryPayload) => ProjectRegistryPayload) => {
      setRegistry((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  return { registry, loading, update, setRegistry: update };
}
