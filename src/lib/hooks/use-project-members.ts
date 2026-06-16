"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectMember } from "@/lib/project/registry-types";
import {
  fetchProjectMembers,
  removeProjectMember,
  upsertProjectMember,
} from "@/lib/supabase/queries/project-extras";

const localMembers = new Map<string, ProjectMember[]>();

export function getCachedProjectMembers(projectId: string): ProjectMember[] {
  return localMembers.get(projectId) ?? [];
}

export async function preloadProjectMembers(projectId: string) {
  if (localMembers.has(projectId)) return;
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const rows = await fetchProjectMembers(supabase, projectId);
    localMembers.set(projectId, rows);
  } catch {
    /* ignore */
  }
}

export function useProjectMembers(projectId: string) {
  const [members, setMembers] = useState<ProjectMember[]>(
    () => localMembers.get(projectId) ?? [],
  );
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setMembers(localMembers.get(projectId) ?? []);
        return;
      }
      const rows = await fetchProjectMembers(supabase, projectId);
      localMembers.set(projectId, rows);
      setMembers(rows);
    } catch {
      setMembers(localMembers.get(projectId) ?? []);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addMember = useCallback(
    async (member: Omit<ProjectMember, "id" | "projectId">) => {
      const supabase = createClient();
      try {
        const row = await upsertProjectMember(supabase, projectId, member);
        setMembers((prev) => {
          const next = [...prev.filter((m) => m.id !== row.id), row];
          localMembers.set(projectId, next);
          return next;
        });
        return row;
      } catch {
        const local: ProjectMember = {
          id: `local-${Date.now()}`,
          projectId,
          ...member,
        };
        setMembers((prev) => {
          const next = [...prev, local];
          localMembers.set(projectId, next);
          return next;
        });
        return local;
      }
    },
    [projectId],
  );

  const updateMember = useCallback(
    async (member: ProjectMember) => {
      const supabase = createClient();
      try {
        const row = await upsertProjectMember(supabase, projectId, member);
        setMembers((prev) => {
          const next = prev.map((m) => (m.id === row.id ? row : m));
          localMembers.set(projectId, next);
          return next;
        });
      } catch {
        setMembers((prev) => {
          const next = prev.map((m) => (m.id === member.id ? member : m));
          localMembers.set(projectId, next);
          return next;
        });
      }
    },
    [projectId],
  );

  const removeMember = useCallback(
    async (memberId: string) => {
      if (!memberId.startsWith("local-")) {
        const supabase = createClient();
        try {
          await removeProjectMember(supabase, memberId);
        } catch {
          /* local only */
        }
      }
      setMembers((prev) => {
        const next = prev.filter((m) => m.id !== memberId);
        localMembers.set(projectId, next);
        return next;
      });
    },
    [projectId],
  );

  return { members, loading, reload, addMember, updateMember, removeMember };
}
