"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { emptyRegistry, seedRegistry } from "@/lib/project/registry-defaults";
import type { ProjectRegistryPayload } from "@/lib/project/registry-types";
import {
  fetchProjectRegistry,
  saveProjectRegistry,
} from "@/lib/supabase/queries/project-extras";
import { useWizardStore } from "@/lib/store/wizard-store";

/** Registry for wizard: draft in store until project exists, then Supabase. */
export function useWizardRegistry(projectId: string | null | undefined, memberNames: string[] = []) {
  const registryDraft = useWizardStore((s) => s.registryDraft);
  const setRegistryDraft = useWizardStore((s) => s.setRegistryDraft);
  const [loading, setLoading] = useState(false);

  const seed = seedRegistry(memberNames);

  useEffect(() => {
    if (!projectId) {
      if (!registryDraft) setRegistryDraft(seed);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (cancelled) return;
      try {
        if (!data.user) return;
        const remote = await fetchProjectRegistry(supabase, projectId);
        const hasData =
          remote.raci.tasks.length > 0 ||
          remote.comms.length > 0 ||
          Boolean(remote.charte.mission);
        const payload = hasData ? remote : registryDraft ?? seed;
        setRegistryDraft(payload);
      } catch {
        if (!registryDraft) setRegistryDraft(seed);
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [projectId, memberNames.join("|")]);

  const update = useCallback(
    (updater: (prev: ProjectRegistryPayload) => ProjectRegistryPayload) => {
      const current = registryDraft ?? seed;
      const next = updater(current);
      setRegistryDraft(next);
      if (projectId) {
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
      }
    },
    [projectId, registryDraft, seed, setRegistryDraft],
  );

  return {
    registry: registryDraft ?? seed,
    loading,
    update,
  };
}

export function isRegistryFilled(registry: ProjectRegistryPayload): boolean {
  return (
    registry.raci.tasks.some((t) => t.vals.some((v) => v)) ||
    Boolean(registry.charte.mission.trim()) ||
    registry.comms.length > 0
  );
}
