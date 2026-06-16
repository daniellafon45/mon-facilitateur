"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Folder, Globe, Info, Layers, Users } from "lucide-react";
import type { SessionMode, WizardConfirmedGroup, WizardGroupAssign, WizardMember } from "@/types/facilitation";
import type { ProjectMember } from "@/lib/project/registry-types";
import { shouldShowOverflowBanner } from "@/lib/project/team-advice";
import type { TeamAdviceAction } from "@/lib/project/team-advice";
import { pruneGroupsAfterMemberRemoval } from "@/lib/project/subgroups";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { preloadProjectMembers } from "@/lib/hooks/use-project-members";
import { useWizardRegistry } from "@/lib/hooks/use-wizard-registry";
import { useWizardStore } from "@/lib/store/wizard-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeamAdvicePanel } from "@/components/wizard/team/team-advice-panel";
import { TeamAtelierConfirmModal } from "@/components/wizard/team/team-atelier-confirm-modal";
import { TeamConfirmedGroups } from "@/components/wizard/team/team-confirmed-groups";
import { TeamLimitModal } from "@/components/wizard/team/team-limit-modal";
import { TeamMembersPanel } from "@/components/wizard/team/team-members-panel";
import { TeamOptionalTools } from "@/components/wizard/team/team-optional-tools";
import { TeamOverflowBanner } from "@/components/wizard/team/team-overflow-banner";
import {
  TeamRolesPanel,
  inferRoleAssignFromMembers,
} from "@/components/wizard/team/team-roles-panel";
import { TeamSubgroupsModal } from "@/components/wizard/team/team-subgroups-modal";
import type { RegistryToolId } from "@/components/wizard/registry-tool-modal";

export function WizardTeamStep({
  projectId,
  mode,
  methodIds = [],
  projectMembers,
  membersLoading = false,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onReloadMembers,
  onMembersChange,
  confirmedGroups,
  groupAssign = {},
  roleAssign = {},
  onGroupsChange,
  onGroupAssignChange,
  onRoleAssignChange,
  onModeChange,
  showConseils,
  onToggleConseils,
  onScrollToTeams,
  onOpenRegistryTool,
}: {
  projectId?: string | null;
  mode?: SessionMode | null;
  methodIds?: string[];
  projectMembers: ProjectMember[];
  membersLoading?: boolean;
  onAddMember: (member: Omit<ProjectMember, "id" | "projectId">) => Promise<ProjectMember>;
  onUpdateMember: (member: ProjectMember) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onReloadMembers?: () => Promise<void>;
  onMembersChange?: (members: WizardMember[]) => void;
  confirmedGroups?: WizardConfirmedGroup[] | null;
  groupAssign?: Record<string, WizardGroupAssign>;
  roleAssign?: Record<string, string>;
  onGroupsChange?: (groups: WizardConfirmedGroup[] | null) => void;
  onGroupAssignChange?: (assign: Record<string, WizardGroupAssign>) => void;
  onRoleAssignChange?: (assign: Record<string, string>) => void;
  onModeChange?: (mode: SessionMode) => void;
  showConseils?: boolean;
  onToggleConseils?: () => void;
  onScrollToTeams?: () => void;
  onOpenRegistryTool?: (tool: RegistryToolId) => void;
}) {
  const projects = useFacilitationStore((s) => s.projects);
  const setWizardProjectId = useWizardStore((s) => s.setProjectId);

  const members = projectMembers;
  const loading = membersLoading;
  const memberNames = members.map((m) => m.displayName);
  const { registry } = useWizardRegistry(projectId, memberNames);

  const [overflowDismissed, setOverflowDismissed] = useState(false);
  const [subgroupsOpen, setSubgroupsOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [atelierOpen, setAtelierOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [assocPending, setAssocPending] = useState<string | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const count = members.length;
  const isAtelier = mode === "atelier";
  const groups = confirmedGroups ?? [];
  const showOverflow = shouldShowOverflowBanner(count, overflowDismissed);
  const conseils = showConseils ?? false;

  useEffect(() => {
    onMembersChange?.(
      members.map((m) => ({
        id: m.id,
        name: m.displayName,
        email: m.email,
        role: m.meetingRole,
        projectAccess: m.accessRole,
        color: m.color,
      })),
    );
  }, [members, onMembersChange]);

  const projectName =
    projectId && projects.find((p) => p.id === projectId)?.name
      ? projects.find((p) => p.id === projectId)!.name
      : "Nouveau projet";

  useEffect(() => {
    if (members.length === 0 && !loading && onRoleAssignChange) {
      onRoleAssignChange(inferRoleAssignFromMembers(members, roleAssign));
    }
  }, [members.length, loading]);

  useEffect(() => {
    if (members.length > 0 && onRoleAssignChange) {
      const inferred = inferRoleAssignFromMembers(members, roleAssign);
      if (JSON.stringify(inferred) !== JSON.stringify(roleAssign)) {
        onRoleAssignChange(inferred);
      }
    }
  }, [members.map((m) => `${m.id}:${m.meetingRole}`).join("|")]);

  const triggerOverflow = () => {
    if (count >= 10) setOverflowDismissed(false);
  };

  const handleAdviceAction = (act: TeamAdviceAction) => {
    onToggleConseils?.();
    if (act === "subgroups") setSubgroupsOpen(true);
    else if (act === "atelier") setAtelierOpen(true);
    else if (act === "limit") setLimitOpen(true);
    else if (act === "invite") addInputRef.current?.focus();
    else if (act === "teams") onScrollToTeams?.();
  };

  const handleLimitConfirm = async (ids: string[]) => {
    for (const id of ids) await onRemoveMember(id);
    if (onGroupsChange) {
      onGroupsChange(pruneGroupsAfterMemberRemoval(confirmedGroups ?? null, ids));
    }
    setLimitOpen(false);
  };

  const handleAtelierConfirm = () => {
    onModeChange?.("atelier");
    setAtelierOpen(false);
    setTimeout(() => setSubgroupsOpen(true), 200);
  };

  const assignProject = async (targetId: string | null) => {
    setWizardProjectId(targetId);
    setAssocPending(null);
    setProjectOpen(false);
    if (targetId) {
      await preloadProjectMembers(targetId);
      await onReloadMembers?.();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Équipe &amp; rôles</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Folder className="h-3.5 w-3.5" />
            <span>
              Projet associé : <strong className="text-foreground">{projectName}</strong>
            </span>
            {projects.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-bold text-violet-700"
                  onClick={() => setProjectOpen((v) => !v)}
                >
                  Associer à un projet existant
                  <ChevronDown className="h-3 w-3" />
                </button>
                {projectOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProjectOpen(false)} />
                    <div className="absolute left-0 top-full z-50 mt-1 min-w-[240px] rounded-xl border bg-white p-1.5 shadow-lg">
                      <button
                        type="button"
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50"
                        onClick={() => void assignProject(null)}
                      >
                        Nouveau projet
                      </button>
                      {projects.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50"
                          onClick={() => {
                            setProjectOpen(false);
                            setAssocPending(p.id);
                          }}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Button
            type="button"
            size="sm"
            variant={isAtelier ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => setSubgroupsOpen(true)}
          >
            <Users className="mr-1 h-4 w-4" />
            {groups.length
              ? "Modifier les sous-groupes"
              : isAtelier
                ? "Créer les sous-groupes"
                : "Créer des sous-groupes"}
          </Button>
          <div className="flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2 text-sm font-bold">
            <Users className="h-4 w-4" />
            {count} participants
          </div>
        </div>
      </div>

      {isAtelier && (
        <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50/70 px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
          <p className="text-sm leading-relaxed text-violet-950/90">
            En grand atelier, les <strong>sous-groupes sont au cœur</strong> de la rencontre.
            Créez vos salles, répartissez les membres, puis désignez un{" "}
            <strong>facilitateur</strong> et une <strong>méthode</strong> par salle.
          </p>
        </div>
      )}

      {showOverflow && <TeamOverflowBanner onDismiss={() => setOverflowDismissed(true)} />}

      {conseils && (
        <TeamAdvicePanel count={count} onAction={handleAdviceAction} onClose={() => onToggleConseils?.()} />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <TeamMembersPanel
          members={members}
          loading={loading}
          addInputRef={addInputRef}
          onAddMember={async (m) => {
            await onAddMember(m);
            triggerOverflow();
          }}
          onUpdateMember={onUpdateMember}
          onRemoveMember={onRemoveMember}
          onOverflow={triggerOverflow}
        />
        <TeamRolesPanel
          members={members}
          roleAssign={roleAssign}
          onRoleAssignChange={(next) => onRoleAssignChange?.(next)}
        />
      </div>

      {groups.length > 0 && onGroupsChange && (
        <TeamConfirmedGroups
          groups={groups}
          members={members}
          isAtelier={isAtelier}
          methodIds={methodIds}
          groupAssign={groupAssign}
          onEdit={() => setSubgroupsOpen(true)}
          onGroupAssignChange={(next) => onGroupAssignChange?.(next)}
        />
      )}

      <TeamOptionalTools registry={registry} onOpenTool={(id) => onOpenRegistryTool?.(id)} />

      <TeamSubgroupsModal
        open={subgroupsOpen}
        members={members}
        initialGroups={confirmedGroups}
        onClose={() => setSubgroupsOpen(false)}
        onConfirm={(next) => {
          onGroupsChange?.(next);
          setSubgroupsOpen(false);
        }}
      />

      <TeamLimitModal
        open={limitOpen}
        members={members}
        onClose={() => setLimitOpen(false)}
        onConfirm={handleLimitConfirm}
      />

      <TeamAtelierConfirmModal
        open={atelierOpen}
        onClose={() => setAtelierOpen(false)}
        onConfirm={handleAtelierConfirm}
      />

      <Dialog open={Boolean(assocPending)} onOpenChange={(v) => !v && setAssocPending(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Associer à « {projects.find((p) => p.id === assocPending)?.name ?? "ce projet"} »
            </DialogTitle>
            <DialogDescription>
              Voulez-vous garder l&apos;équipe et les outils déjà configurés pour ce projet ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              className="w-full"
              onClick={() => void assignProject(assocPending)}
            >
              <Globe className="mr-1 h-4 w-4" />
              Conserver l&apos;équipe du projet
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setWizardProjectId(assocPending);
                setAssocPending(null);
              }}
            >
              <Layers className="mr-1 h-4 w-4" />
              Repartir à zéro pour cette rencontre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
