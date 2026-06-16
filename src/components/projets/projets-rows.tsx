"use client";

import type { DisplayProject } from "@/types/facilitation";
import { formatShortDate, priorityMeta, statusMeta } from "@/lib/projets/constants";
import { getCachedProjectMembers } from "@/lib/hooks/use-project-members";
import { RowMenu } from "@/components/projets/projets-modals";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TH = "px-5 py-3 text-left text-xs font-medium text-slate-400 align-middle";
const TD = "px-5 py-4 align-middle";

const FALLBACK_COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6"];

function memberInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fallbackAssignees(count: number, projectId: string) {
  const n = Math.min(Math.max(count, 1), 3);
  return Array.from({ length: n }, (_, i) => ({
    initials: ["A", "B", "C"][i] ?? "M",
    color: FALLBACK_COLORS[(projectId.charCodeAt(0) + i) % FALLBACK_COLORS.length],
  }));
}

function AssigneeStack({
  projectId,
  memberCount,
  refreshKey = 0,
}: {
  projectId: string;
  memberCount: number;
  refreshKey?: number;
}) {
  void refreshKey;
  const cached = getCachedProjectMembers(projectId);
  const assignees =
    cached.length > 0
      ? cached.slice(0, 3).map((m) => ({
          initials: memberInitials(m.displayName),
          color: m.color,
        }))
      : fallbackAssignees(memberCount, projectId);

  return (
    <div className="flex -space-x-2">
      {assignees.map((a, i) => (
        <span
          key={i}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white"
          style={{ background: a.color }}
          title={cached[i]?.displayName}
        >
          {a.initials}
        </span>
      ))}
    </div>
  );
}

function PriorityBadge({ statusId }: { statusId: DisplayProject["statusId"] }) {
  const pm = priorityMeta(statusId);
  return (
    <span className={cn("inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold", pm.bg, pm.c)}>
      {pm.label}
    </span>
  );
}

function ProgressBar({ project }: { project: DisplayProject }) {
  const progress = project.progress;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, background: project.pc }}
        />
      </div>
      <span className="text-[13px] font-bold text-slate-700 whitespace-nowrap">{progress}%</span>
    </div>
  );
}

function DueDateCell({
  p,
  onSched,
}: {
  p: DisplayProject;
  onSched: () => void;
}) {
  if (p.nextISO) {
    return (
      <span className="whitespace-nowrap text-sm font-bold text-slate-900">
        {formatShortDate(p.nextISO)}
      </span>
    );
  }
  if (p.nextT === "Aucune") {
    return <span className="text-sm text-slate-400">Aucune</span>;
  }
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onSched(); }}
      className="border-0 bg-transparent p-0 text-sm font-semibold text-primary cursor-pointer whitespace-nowrap"
    >
      À définir
    </button>
  );
}

interface RowProps {
  p: DisplayProject;
  last?: boolean;
  fav: boolean;
  membersRefreshKey?: number;
  onOpen: () => void;
  onFav: () => void;
  onMeetings: () => void;
  onMenu: () => void;
  menuOpen: boolean;
  actions: readonly { id: string; icon: string; label: string; danger?: boolean }[];
  onAction: (id: string) => void;
  onSched: () => void;
  closeMenu: () => void;
  onPostMortem: () => void;
}

export function ProjectTableColGroup() {
  return (
    <colgroup>
      <col className="w-[26%]" />
      <col className="w-[9%]" />
      <col className="w-[10%]" />
      <col className="w-[10%]" />
      <col className="w-[14%]" />
      <col className="w-[13%]" />
      <col className="w-[18%]" />
    </colgroup>
  );
}

export function ProjectListHeader() {
  return (
    <thead>
      <tr className="border-b border-slate-100">
        <th className={TH}>Titre</th>
        <th className={TH}>Statut</th>
        <th className={TH}>Assigné</th>
        <th className={TH}>Échéance</th>
        <th className={TH}>Priorité</th>
        <th className={cn(TH, "pr-10")}>Avancement</th>
        <th className={cn(TH, "sr-only")}>Actions</th>
      </tr>
    </thead>
  );
}

export function ProjectRow({
  p, last, membersRefreshKey, onOpen, onMeetings, onMenu, menuOpen, actions, onAction, onSched, closeMenu, onPostMortem,
}: RowProps) {
  const sm = statusMeta(p.statusId);
  return (
    <tr
      onClick={onOpen}
      className={cn(
        "cursor-pointer hover:bg-slate-50/80",
        !last && "border-b border-slate-100",
      )}
    >
      <td className={cn(TD, "max-w-0")}>
        <span className="block truncate text-sm font-semibold text-slate-900">{p.name}</span>
      </td>
      <td className={TD}>
        <span className="inline-block whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {sm.label}
        </span>
      </td>
      <td className={TD}>
        <AssigneeStack projectId={p.id} memberCount={p.members} refreshKey={membersRefreshKey} />
      </td>
      <td className={TD} onClick={(e) => e.stopPropagation()}>
        <DueDateCell p={p} onSched={onSched} />
      </td>
      <td className={TD}>
        <PriorityBadge statusId={p.statusId} />
      </td>
      <td className={cn(TD, "max-w-0 pr-10")}>
        <ProgressBar project={p} />
      </td>
      <td className={cn(TD, "pl-4")} onClick={(e) => e.stopPropagation()}>
        <div className="relative flex items-center justify-end gap-2 whitespace-nowrap">
          {p.statusId === "termine" ? (
            <>
              <Button variant="outline" size="sm" className="rounded-lg h-8" onClick={onOpen}>Ouvrir</Button>
              <Button size="sm" className="rounded-lg h-8" onClick={onPostMortem}>Post-mortem</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="rounded-lg h-8" onClick={onMeetings}>Réunions</Button>
              <Button size="sm" className="rounded-lg h-8" onClick={onOpen}>Ouvrir</Button>
            </>
          )}
          <button
            type="button"
            onClick={onMenu}
            className="inline-flex h-8 items-center justify-center rounded-lg px-2 text-sm font-medium text-slate-600 hover:bg-muted"
            title="Plus d'actions"
          >
            Plus
          </button>
          {menuOpen && <RowMenu actions={actions} onAction={onAction} onClose={closeMenu} />}
        </div>
      </td>
    </tr>
  );
}

export function ProjectGridCard(props: RowProps) {
  const { p, membersRefreshKey, onOpen, onMeetings, onMenu, menuOpen, actions, onAction, closeMenu, onPostMortem } = props;
  const sm = statusMeta(p.statusId);
  return (
    <div
      onClick={onOpen}
      className="relative cursor-pointer rounded-[14px] border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15.5px] font-extrabold leading-tight text-slate-900">{p.name}</div>
        </div>
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onMenu}
            className="inline-flex h-8 items-center justify-center rounded-lg px-2 text-sm font-medium text-slate-600 hover:bg-muted"
          >
            Plus
          </button>
          {menuOpen && <RowMenu actions={actions} onAction={onAction} onClose={closeMenu} />}
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {sm.label}
        </span>
        <PriorityBadge statusId={p.statusId} />
      </div>
      <div className="mb-3">
        <AssigneeStack projectId={p.id} memberCount={p.members} refreshKey={membersRefreshKey} />
      </div>
      <div className="mb-1 text-xs text-slate-400">Échéance</div>
      <div className="mb-3.5" onClick={(e) => e.stopPropagation()}>
        <DueDateCell p={p} onSched={props.onSched} />
      </div>
      <ProgressBar project={p} />
      <div className="mt-3.5 flex gap-1.5 border-t pt-3" onClick={(e) => e.stopPropagation()}>
        <Button variant="outline" size="sm" className="flex-1 rounded-lg h-8" onClick={onMeetings}>Réunions</Button>
        <Button size="sm" className="flex-1 rounded-lg h-8" onClick={onOpen}>Ouvrir</Button>
      </div>
      {p.statusId === "termine" && (
        <Button size="sm" className="mt-1.5 w-full rounded-lg h-8" onClick={(e) => { e.stopPropagation(); onPostMortem(); }}>
          Ouvrir le post-mortem
        </Button>
      )}
    </div>
  );
}
