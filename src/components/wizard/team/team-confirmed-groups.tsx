"use client";

import { Pencil, Users } from "lucide-react";
import type { ProjectMember } from "@/lib/project/registry-types";
import type { WizardConfirmedGroup, WizardGroupAssign } from "@/types/facilitation";
import { METHOD_BY_ID, METHODS_V4 } from "@/lib/methods/catalog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TeamConfirmedGroups({
  groups,
  members,
  isAtelier,
  methodIds,
  groupAssign,
  onEdit,
  onGroupAssignChange,
}: {
  groups: WizardConfirmedGroup[];
  members: ProjectMember[];
  isAtelier: boolean;
  methodIds: string[];
  groupAssign: Record<string, WizardGroupAssign>;
  onEdit: () => void;
  onGroupAssignChange: (next: Record<string, WizardGroupAssign>) => void;
}) {
  const memberById = new Map(members.map((m) => [m.id, m]));
  const methods = methodIds
    .map((id) => METHOD_BY_ID[id])
    .filter(Boolean);

  const setGA = (groupId: string, patch: Partial<WizardGroupAssign>) => {
    const prev = groupAssign[groupId] ?? { groupId };
    onGroupAssignChange({
      ...groupAssign,
      [groupId]: { ...prev, ...patch, groupId },
    });
  };

  return (
    <div className="mb-4 rounded-2xl border-2 border-violet-300 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-violet-700" />
          <h3 className="font-extrabold">Sous-groupes créés</h3>
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
            ✓ Confirmés
          </span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="mr-1 h-3.5 w-3.5" />
          Modifier
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((g) => (
          <div
            key={g.id}
            className="overflow-hidden rounded-xl border"
            style={{ borderColor: `${g.color ?? "#2563eb"}55` }}
          >
            <div
              className="flex items-center gap-2 border-b px-3 py-2"
              style={{ background: `${g.color ?? "#2563eb"}12` }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: g.color ?? "#2563eb" }}
              />
              <span className="flex-1 font-extrabold text-sm">{g.name}</span>
              <span
                className="text-xs font-bold"
                style={{ color: g.color ?? "#2563eb" }}
              >
                {g.memberIds.length} membres
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2.5">
              {g.memberIds.map((mid) => {
                const m = memberById.get(mid);
                if (!m) return null;
                return (
                  <span
                    key={mid}
                    className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-2 py-1 text-xs font-semibold"
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-extrabold text-white"
                      style={{ background: m.color }}
                    >
                      {m.displayName.slice(0, 2).toUpperCase()}
                    </span>
                    {m.displayName}
                  </span>
                );
              })}
            </div>
            {isAtelier && (
              <div className="grid gap-2 border-t px-2.5 py-2 sm:grid-cols-2">
                <label className="min-w-0">
                  <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                    Facilitateur de salle
                  </span>
                  <Select
                    value={groupAssign[g.id]?.facilitatorId ?? ""}
                    onValueChange={(v) =>
                      setGA(g.id, { facilitatorId: v === "_none" ? undefined : v })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">—</SelectItem>
                      {g.memberIds.map((mid) => {
                        const m = memberById.get(mid);
                        if (!m) return null;
                        return (
                          <SelectItem key={mid} value={mid}>
                            {m.displayName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </label>
                <label className="min-w-0">
                  <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                    Méthode
                  </span>
                  <Select
                    value={groupAssign[g.id]?.methodId ?? ""}
                    onValueChange={(v) =>
                      setGA(g.id, { methodId: v === "_none" ? undefined : v })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">—</SelectItem>
                      {(methods.length ? methods : METHODS_V4.slice(0, 8)).map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
