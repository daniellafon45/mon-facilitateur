"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, Check, Plus, Users, X } from "lucide-react";
import type { ProjectMember } from "@/lib/project/registry-types";
import type { WizardConfirmedGroup } from "@/types/facilitation";
import {
  GROUP_COLORS,
  GROUP_NAMES,
} from "@/lib/project/team-constants";
import {
  allMembersAssigned,
  createInitialSubgroupDrafts,
  distributeMemberIdsEvenly,
  subgroupDraftsToConfirmed,
  type SubgroupDraft,
} from "@/lib/project/subgroups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function draftsFromConfirmed(
  groups: WizardConfirmedGroup[] | null | undefined,
  memberIds: string[],
): SubgroupDraft[] {
  if (groups?.length) {
    const assigned = new Set(groups.flatMap((g) => g.memberIds));
    const unassigned = memberIds.filter((id) => !assigned.has(id));
    const drafts = groups.map((g, i) => ({
      id: g.id,
      name: g.name,
      color: g.color ?? GROUP_COLORS[i % GROUP_COLORS.length],
      memberIds: [...g.memberIds],
    }));
    if (unassigned.length) {
      drafts.push({
        id: "pool",
        name: "Non assignés",
        color: "#94a3b8",
        memberIds: unassigned,
      });
    }
    return drafts.filter((g) => g.id !== "pool" || g.memberIds.length > 0);
  }
  return createInitialSubgroupDrafts(memberIds, 2);
}

export function TeamSubgroupsModal({
  open,
  members,
  initialGroups,
  onClose,
  onConfirm,
}: {
  open: boolean;
  members: ProjectMember[];
  initialGroups?: WizardConfirmedGroup[] | null;
  onClose: () => void;
  onConfirm: (groups: WizardConfirmedGroup[]) => void;
}) {
  const memberIds = useMemo(() => members.map((m) => m.id), [members]);
  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members],
  );

  const [groups, setGroups] = useState<SubgroupDraft[]>([]);
  const [unassigned, setUnassigned] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragging = useRef<string | null>(null);

  const resetState = useCallback(() => {
    const drafts = draftsFromConfirmed(initialGroups, memberIds);
    const pool = drafts.find((g) => g.id === "pool");
    const real = drafts.filter((g) => g.id !== "pool");
    setGroups(real.length ? real : createInitialSubgroupDrafts(memberIds, 2));
    setUnassigned(pool?.memberIds ?? []);
  }, [initialGroups, memberIds]);

  const handleOpenChange = (v: boolean) => {
    if (v) resetState();
    else onClose();
  };

  const findSource = (mid: string): string | "pool" | null => {
    for (const g of groups) {
      if (g.memberIds.includes(mid)) return g.id;
    }
    if (unassigned.includes(mid)) return "pool";
    return null;
  };

  const moveTo = (mid: string, toZone: string) => {
    const src = findSource(mid);
    if (!src || src === toZone) return;

    if (src === "pool") {
      setUnassigned((u) => u.filter((id) => id !== mid));
    } else {
      setGroups((gs) =>
        gs.map((g) =>
          g.id === src ? { ...g, memberIds: g.memberIds.filter((id) => id !== mid) } : g,
        ),
      );
    }

    if (toZone === "pool") {
      setUnassigned((u) => [...u, mid]);
    } else {
      setGroups((gs) =>
        gs.map((g) =>
          g.id === toZone ? { ...g, memberIds: [...g.memberIds, mid] } : g,
        ),
      );
    }
  };

  const redistribute = () => {
    const all = [...groups.flatMap((g) => g.memberIds), ...unassigned];
    const buckets = distributeMemberIdsEvenly(all, groups.length);
    setGroups((gs) => gs.map((g, i) => ({ ...g, memberIds: buckets[i] ?? [] })));
    setUnassigned([]);
  };

  const addGroup = () => {
    if (groups.length >= GROUP_COLORS.length) return;
    const idx = groups.length;
    setGroups((gs) => [
      ...gs,
      {
        id: `g${idx + 1}_${Date.now()}`,
        name: GROUP_NAMES[idx] ?? `Groupe ${idx + 1}`,
        color: GROUP_COLORS[idx],
        memberIds: [],
      },
    ]);
  };

  const removeGroup = (gid: string) => {
    const g = groups.find((x) => x.id === gid);
    if (!g || groups.length <= 2) return;
    setUnassigned((u) => [...u, ...g.memberIds]);
    setGroups((gs) => gs.filter((x) => x.id !== gid));
  };

  const totalAssigned = groups.reduce((s, g) => s + g.memberIds.length, 0);
  const canConfirm = allMembersAssigned(memberIds, groups, unassigned) && groups.length > 0;

  const cols =
    groups.length <= 2
      ? "grid-cols-1 sm:grid-cols-2"
      : groups.length === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[92vh] max-w-5xl flex-col gap-0 overflow-hidden p-0"
        showCloseButton
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Créer des sous-groupes
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                  {groups.length} groupe{groups.length > 1 ? "s" : ""}
                </span>
              </DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Glissez les membres d&apos;un groupe à l&apos;autre ou redistribuez automatiquement.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={redistribute}>
                <ArrowLeftRight className="mr-1 h-3.5 w-3.5" />
                Redistribuer équitablement
              </Button>
              {groups.length < GROUP_COLORS.length && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-emerald-700"
                  onClick={addGroup}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Ajouter un groupe
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {unassigned.length > 0 && (
            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Non assignés ({unassigned.length})
                </span>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={redistribute}>
                  Redistribuer
                </Button>
              </div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver("pool");
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragging.current) moveTo(dragging.current, "pool");
                  setDragOver(null);
                }}
                className={cn(
                  "flex min-h-[46px] flex-wrap gap-2 rounded-xl border-2 border-dashed p-2",
                  dragOver === "pool" ? "border-violet-500 bg-violet-50" : "border-slate-300 bg-slate-50",
                )}
              >
                {unassigned.map((mid) => {
                  const m = memberById.get(mid);
                  if (!m) return null;
                  return (
                    <div
                      key={mid}
                      draggable
                      onDragStart={() => {
                        dragging.current = mid;
                      }}
                      onDragEnd={() => {
                        dragging.current = null;
                        setDragOver(null);
                      }}
                      className="flex cursor-grab items-center gap-2 rounded-lg border bg-white px-2 py-1 shadow-sm"
                    >
                      <MemberChip member={m} size="sm" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={cn("grid gap-3", cols)}>
            {groups.map((g) => (
              <div
                key={g.id}
                className="flex min-w-0 flex-col overflow-hidden rounded-xl border"
                style={{ borderColor: `${g.color}66` }}
              >
                <div
                  className="flex items-center gap-2 border-b px-3 py-2"
                  style={{ background: `${g.color}14`, borderColor: `${g.color}33` }}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: g.color }} />
                  <Input
                    value={g.name}
                    onChange={(e) =>
                      setGroups((gs) =>
                        gs.map((gg) => (gg.id === g.id ? { ...gg, name: e.target.value } : gg)),
                      )
                    }
                    className="h-8 flex-1 border-transparent bg-transparent px-1 font-extrabold shadow-none focus-visible:border-slate-200"
                  />
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{ background: `${g.color}22`, color: g.color }}
                  >
                    {g.memberIds.length} membre{g.memberIds.length !== 1 ? "s" : ""}
                  </span>
                  {groups.length > 2 && (
                    <button
                      type="button"
                      className="text-slate-300 hover:text-red-500"
                      onClick={() => removeGroup(g.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(g.id);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragging.current) moveTo(dragging.current, g.id);
                    setDragOver(null);
                  }}
                  className={cn(
                    "min-h-[110px] flex-1 p-2",
                    dragOver === g.id && "bg-violet-50 outline outline-2 outline-dashed outline-violet-400",
                  )}
                >
                  {g.memberIds.length === 0 ? (
                    <div className="flex h-24 flex-col items-center justify-center gap-1 text-xs font-semibold text-slate-300">
                      <Users className="h-5 w-5" />
                      Glissez ici
                    </div>
                  ) : (
                    g.memberIds.map((mid) => {
                      const m = memberById.get(mid);
                      if (!m) return null;
                      return (
                        <div
                          key={mid}
                          draggable
                          onDragStart={() => {
                            dragging.current = mid;
                          }}
                          onDragEnd={() => {
                            dragging.current = null;
                            setDragOver(null);
                          }}
                          className="mb-1.5 flex cursor-grab items-center gap-2 rounded-lg border bg-white px-2 py-1.5 shadow-sm"
                        >
                          <MemberChip member={m} />
                          <button
                            type="button"
                            className="ml-auto text-slate-300 hover:text-red-500"
                            onClick={() => moveTo(mid, "pool")}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t bg-slate-50 px-6 py-3 sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              <strong className="text-foreground">{totalAssigned}</strong> membres répartis
            </span>
            {unassigned.length > 0 && (
              <span className="font-semibold text-orange-600">
                {unassigned.length} non assigné{unassigned.length > 1 ? "s" : ""}
              </span>
            )}
            <span>
              {groups.length} groupe{groups.length > 1 ? "s" : ""} · moy.{" "}
              {(totalAssigned / Math.max(1, groups.length)).toFixed(1)} membres
            </span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="button"
              disabled={!canConfirm}
              onClick={() => onConfirm(subgroupDraftsToConfirmed(groups))}
            >
              <Check className="mr-1 h-4 w-4" />
              Confirmer les sous-groupes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberChip({
  member,
  size = "md",
}: {
  member: ProjectMember;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-6 w-6 text-[9px]" : "h-7 w-7 text-[10px]";
  return (
    <>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-extrabold text-white",
          dim,
        )}
        style={{ background: member.color }}
      >
        {member.displayName.slice(0, 2).toUpperCase()}
      </span>
      <span className="truncate text-xs font-semibold">{member.displayName}</span>
    </>
  );
}
