import type { WizardConfirmedGroup } from "@/types/facilitation";
import { GROUP_COLORS, GROUP_NAMES, PIZZA_MAX } from "./team-constants";

export interface SubgroupMemberRef {
  id: string;
}

export interface SubgroupDraft {
  id: string;
  name: string;
  color: string;
  memberIds: string[];
}

export function distributeMemberIdsEvenly(
  memberIds: string[],
  groupCount: number,
): string[][] {
  const n = Math.max(1, Math.min(groupCount, GROUP_COLORS.length));
  const buckets: string[][] = Array.from({ length: n }, () => []);
  memberIds.forEach((id, index) => {
    buckets[index % n].push(id);
  });
  return buckets;
}

export function createInitialSubgroupDrafts(
  memberIds: string[],
  groupCount = 2,
): SubgroupDraft[] {
  const buckets = distributeMemberIdsEvenly(memberIds, groupCount);
  return buckets.map((ids, index) => ({
    id: `g${index + 1}`,
    name: GROUP_NAMES[index] ?? `Groupe ${index + 1}`,
    color: GROUP_COLORS[index] ?? GROUP_COLORS[0],
    memberIds: ids,
  }));
}

export function subgroupDraftsToConfirmed(
  drafts: SubgroupDraft[],
): WizardConfirmedGroup[] {
  return drafts
    .filter((g) => g.memberIds.length > 0)
    .map((g) => ({
      id: g.id,
      name: g.name,
      color: g.color,
      memberIds: [...g.memberIds],
    }));
}

export function allMembersAssigned(
  memberIds: string[],
  groups: SubgroupDraft[] | WizardConfirmedGroup[],
  unassignedIds: string[] = [],
) {
  if (unassignedIds.length > 0) return false;
  const assigned = new Set(groups.flatMap((g) => g.memberIds));
  return memberIds.every((id) => assigned.has(id));
}

export function pruneGroupsAfterMemberRemoval(
  groups: WizardConfirmedGroup[] | null,
  removedIds: string[],
): WizardConfirmedGroup[] | null {
  if (!groups) return null;
  const removed = new Set(removedIds);
  return groups.map((g) => ({
    ...g,
    memberIds: g.memberIds.filter((id) => !removed.has(id)),
  }));
}

export function defaultLimitRemovalIds(memberIds: string[], keepMax = PIZZA_MAX) {
  return memberIds.slice(keepMax);
}
