"use client";

import { useMemo, useState } from "react";
import { Plus, Shuffle, X } from "lucide-react";
import type { WizardConfirmedGroup, WizardMember } from "@/types/facilitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const GROUP_COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#db2777", "#0891b2"];

const ROLE_OPTIONS = ["Participante", "Facilitatrice", "Scribe", "Minuteur", "Observateur"];

type DraftGroup = WizardConfirmedGroup & { color: string };

function redistribute(members: WizardMember[], groupCount: number): DraftGroup[] {
  const shuffled = [...members].sort(() => Math.random() - 0.5);
  const groups: DraftGroup[] = Array.from({ length: groupCount }, (_, i) => ({
    id: `g${i + 1}`,
    name: `Groupe ${i + 1}`,
    memberIds: [],
    color: GROUP_COLORS[i % GROUP_COLORS.length],
  }));
  shuffled.forEach((m, i) => {
    groups[i % groupCount].memberIds.push(m.id);
  });
  return groups;
}

export function SubgroupsModal({
  open,
  members,
  initialGroups,
  onClose,
  onConfirm,
}: {
  open: boolean;
  members: WizardMember[];
  initialGroups: WizardConfirmedGroup[];
  onClose: () => void;
  onConfirm: (groups: WizardConfirmedGroup[]) => void;
}) {
  const [groups, setGroups] = useState<DraftGroup[]>(() =>
    initialGroups.length > 0
      ? initialGroups.map((g, i) => ({ ...g, color: GROUP_COLORS[i % GROUP_COLORS.length] }))
      : redistribute(members, Math.min(3, Math.max(2, Math.ceil(members.length / 3)))),
  );
  const [dragMemberId, setDragMemberId] = useState<string | null>(null);
  const [addName, setAddName] = useState<Record<string, string>>({});

  const assignedIds = useMemo(
    () => new Set(groups.flatMap((g) => g.memberIds)),
    [groups],
  );
  const unassigned = members.filter((m) => !assignedIds.has(m.id));

  if (!open) return null;

  const moveMember = (memberId: string, toGroupId: string) => {
    setGroups((gs) =>
      gs.map((g) => ({
        ...g,
        memberIds:
          g.id === toGroupId
            ? [...g.memberIds.filter((id) => id !== memberId), memberId]
            : g.memberIds.filter((id) => id !== memberId),
      })),
    );
  };

  const addGroup = () => {
    if (groups.length >= GROUP_COLORS.length) return;
    setGroups((gs) => [
      ...gs,
      {
        id: `g${Date.now()}`,
        name: `Groupe ${gs.length + 1}`,
        memberIds: [],
        color: GROUP_COLORS[gs.length % GROUP_COLORS.length],
      },
    ]);
  };

  const removeGroup = (id: string) => {
    if (groups.length <= 2) return;
    setGroups((gs) => gs.filter((g) => g.id !== id));
  };

  const addMemberToGroup = (groupId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = members.find((m) => m.name.toLowerCase() === trimmed.toLowerCase());
    const memberId = existing?.id ?? `tmp${Date.now()}`;
    if (!existing) {
      /* only assign existing members in modal */
      return;
    }
    moveMember(memberId, groupId);
    setAddName((a) => ({ ...a, [groupId]: "" }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold">Créer des sous-groupes</h2>
            <span className="text-xs font-bold text-muted-foreground">
              {groups.length} groupe{groups.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGroups(redistribute(members, groups.length))}
            >
              <Shuffle className="mr-1 h-4 w-4" /> Redistribuer équitablement
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={addGroup}>
              <Plus className="mr-1 h-4 w-4" /> Ajouter un groupe
            </Button>
            <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {unassigned.length > 0 && (
          <div className="border-b bg-amber-50 px-5 py-3">
            <p className="mb-2 text-xs font-bold text-amber-800">Non assignés ({unassigned.length})</p>
            <div className="flex flex-wrap gap-2">
              {unassigned.map((m) => (
                <span
                  key={m.id}
                  draggable
                  onDragStart={() => setDragMemberId(m.id)}
                  className="cursor-grab rounded-full border bg-white px-3 py-1 text-xs font-semibold"
                >
                  {m.name}
                </span>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setGroups(redistribute(members, groups.length))}
              >
                Redistribuer
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          <div className={cn("grid gap-4", groups.length <= 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
            {groups.map((g) => (
              <div
                key={g.id}
                className="rounded-xl border-2 border-dashed p-3"
                style={{ borderColor: `${g.color}55` }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dragMemberId && moveMember(dragMemberId, g.id)}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Input
                    value={g.name}
                    onChange={(e) =>
                      setGroups((gs) =>
                        gs.map((x) => (x.id === g.id ? { ...x, name: e.target.value } : x)),
                      )
                    }
                    className="h-8 text-sm font-bold"
                  />
                  <span className="text-xs text-muted-foreground">{g.memberIds.length}</span>
                  {groups.length > 2 && (
                    <button type="button" onClick={() => removeGroup(g.id)} className="text-slate-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="min-h-[80px] space-y-1">
                  {g.memberIds.map((mid) => {
                    const m = members.find((x) => x.id === mid);
                    if (!m) return null;
                    return (
                      <div
                        key={mid}
                        draggable
                        onDragStart={() => setDragMemberId(mid)}
                        className="flex items-center justify-between rounded-lg border bg-white px-2 py-1.5 text-xs"
                      >
                        <span className="font-semibold">{m.name}</span>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-red-500"
                          onClick={() => moveMember(mid, "")}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex gap-1">
                  <Input
                    value={addName[g.id] ?? ""}
                    onChange={(e) => setAddName((a) => ({ ...a, [g.id]: e.target.value }))}
                    placeholder="Ajouter un membre…"
                    className="h-7 text-xs"
                    list={`members-${g.id}`}
                  />
                  <datalist id={`members-${g.id}`}>
                    {unassigned.map((m) => (
                      <option key={m.id} value={m.name} />
                    ))}
                  </datalist>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => addMemberToGroup(g.id, addName[g.id] ?? "")}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-5 py-4">
          <p className="text-xs text-muted-foreground">
            {assignedIds.size} / {members.length} membres répartis
            {unassigned.length > 0 && ` · ${unassigned.length} non assignés`}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button
              type="button"
              onClick={() => {
                onConfirm(groups.map(({ id, name, memberIds }) => ({ id, name, memberIds })));
                onClose();
              }}
            >
              Confirmer les sous-groupes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ROLE_OPTIONS };
