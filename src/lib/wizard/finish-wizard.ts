import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { createClient } from "@/lib/supabase/client";
import { objectiveFromWhiteboard } from "@/lib/whiteboard/objective-from-board";
import { getProjectUniverse } from "@/lib/wizard/project-types";
import { agendaTotalMinutes } from "@/lib/meetings/agenda-generator";
import {
  buildWizardInitialSnapshot,
  memberAccessToDb,
} from "@/lib/wizard/build-wizard-initial-snapshot";
import { seedRegistry } from "@/lib/project/registry-defaults";
import type { ProjectRegistryPayload } from "@/lib/project/registry-types";
import {
  saveProjectRegistry,
  upsertProjectMember,
} from "@/lib/supabase/queries/project-extras";
import { getCachedProjectMembers } from "@/lib/hooks/use-project-members";
import { WIZARD_DRAFT_PROJECT_ID } from "@/lib/project/team-constants";
import type { WizardPayload, WizardLaunchMode, SessionMode } from "@/types/facilitation";
import type { useFacilitationStore } from "@/lib/store/facilitation-store";

type FacilitationStore = ReturnType<typeof useFacilitationStore.getState>;

export type FinishWizardState = WizardPayload & {
  whiteboardElements?: import("@/lib/whiteboard/elements").WbElement[];
  soloMusic?: WizardPayload["soloMusic"];
  soloTools?: string[];
  launchMode?: WizardLaunchMode;
  mode?: SessionMode | null;
  registryDraft?: ProjectRegistryPayload | null;
  inviteMode?: "together" | "separate";
  reset: () => void;
  deleteDraft: () => Promise<void>;
};

const PTYPE_TILE: Record<string, string> = {
  academique: "blue",
  creation: "orange",
  entrepreneurial: "violet",
  pro: "green",
};

const PTYPE_ICON: Record<string, string> = {
  academique: "BookOpen",
  creation: "Pencil",
  entrepreneurial: "Rocket",
  pro: "Briefcase",
};

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#db2777"];

export async function finishWizard({
  wizard,
  facilitation,
  router,
}: {
  wizard: FinishWizardState;
  facilitation: FacilitationStore;
  router: AppRouterInstance;
}) {
  const mode = wizard.mode ?? "solo";
  const launchMode = wizard.launchMode ?? "now";
  const objective =
    (wizard.objective ?? "").trim() ||
    objectiveFromWhiteboard(wizard.whiteboardElements ?? []) ||
    wizard.meetingTitle ||
    "Nouveau projet";
  const methods = wizard.methods && wizard.methods.length > 0 ? [...wizard.methods] : ["brainstorm"];
  const universe = getProjectUniverse(wizard.ptype);
  const agendaPlan = wizard.agendaPlan ?? [];
  const totalMin = agendaTotalMinutes(agendaPlan) || wizard.genreMin || 90;
  const members =
    (wizard.members?.length ?? 0) > 0
      ? wizard.members!
      : getCachedProjectMembers(WIZARD_DRAFT_PROJECT_ID).map((m) => ({
          id: m.id,
          name: m.displayName,
          email: m.email,
          role: m.meetingRole,
          meetingRole: m.meetingRole,
          projectAccess: m.accessRole,
          accessRole: m.accessRole,
          color: m.color,
          contactId: m.contactId ?? undefined,
        }));
  const participantCount = Math.max(members.length, mode === "solo" ? 1 : 2);

  let projectId = wizard.projectId ?? null;
  let project;

  if (projectId) {
    const existing = facilitation.projects.find((p) => p.id === projectId);
    if (existing) {
      project = existing;
    }
  }

  if (!project) {
    project = await facilitation.addProject({
      name: (wizard.meetingTitle || objective).slice(0, 60),
      objective,
      tile: PTYPE_TILE[wizard.ptype ?? ""] ?? "teal",
      icon: PTYPE_ICON[wizard.ptype ?? ""] ?? "Sparkles",
    });
    projectId = project.id;
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user && members.length > 0) {
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      try {
        await upsertProjectMember(supabase, projectId!, {
          contactId: m.contactId ?? null,
          displayName: m.name,
          email: m.email,
          color: m.color ?? COLORS[i % COLORS.length],
          accessRole: memberAccessToDb(m.accessRole ?? m.projectAccess ?? "Éditeur"),
          meetingRole: m.meetingRole ?? m.role ?? "Participante",
        });
      } catch {
        /* continue with other members */
      }
    }
  }

  const memberNames = members.map((m) => m.name);
  const registryPayload =
    wizard.registryDraft &&
    (wizard.registryDraft.raci.tasks.length > 0 || wizard.registryDraft.charte.mission)
      ? wizard.registryDraft
      : seedRegistry(memberNames);

  if (user) {
    try {
      await saveProjectRegistry(supabase, user.id, projectId!, registryPayload);
    } catch {
      /* offline */
    }
  }

  const roleAssign = wizard.roleAssign ?? wizard.essentialRoles ?? {};
  const facilitatorId = roleAssign.facilitateur ?? roleAssign.facilitator;
  const facilitatorName = facilitatorId
    ? members.find((m) => m.id === facilitatorId)?.name
    : members.find((m) => (m.meetingRole ?? m.role)?.toLowerCase().includes("facilit"))?.name;

  const snapshot = buildWizardInitialSnapshot({
    objective,
    members,
    agendaPlan,
    confirmedGroups: wizard.confirmedGroups,
    groupAssign: wizard.groupAssign,
    facilitatorName,
  });

  const wizardMeta = {
    subgroups: wizard.confirmedGroups ?? undefined,
    groupAssign: wizard.groupAssign,
    launchMode,
    inviteMode: wizard.inviteMode,
    essentialRoles: roleAssign,
  };

  const meeting = await facilitation.addMeeting({
    name: wizard.meetingTitle || objective.slice(0, 50) || "Nouvelle rencontre",
    project: projectId!,
    methods,
    status: launchMode === "schedule" ? "À venir" : "En cours",
    agendaPlan: agendaPlan.length > 0 ? agendaPlan : undefined,
    dateISO: wizard.meetingDate,
    time: wizard.meetingStart,
    meetingEnd: wizard.meetingEnd,
    type:
      mode === "solo"
        ? "Session solo"
        : mode === "atelier"
          ? "Grand atelier"
          : "Séance d'équipe",
    sub: universe?.title,
    participants: participantCount,
    meetingPlatform: wizard.meetingPlatform,
    meetingLink: wizard.meetingLink,
    wizardMeta,
    snapshot,
  });

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("mf-wizard-skip-draft", "1");
  }

  if (launchMode === "schedule") {
    router.push("/dashboard/rencontres");
    void wizard.deleteDraft();
    return;
  }

  facilitation.launchSession({
    mode,
    objective,
    methodIds: methods,
    projectId: projectId!,
    meetingId: meeting.id,
    genre: wizard.genre ?? null,
    simulating: launchMode === "simulate",
    soloMusic: wizard.soloMusic ?? undefined,
    soloTools: wizard.soloTools,
    durationMin: totalMin,
    confirmedGroups: wizard.confirmedGroups,
    groupAssign: wizard.groupAssign,
  });

  if (launchMode === "simulate" || mode !== "solo") {
    router.push(`/dashboard/session?project=${projectId}`);
  } else {
    router.push("/dashboard/session/solo");
  }

  void wizard.deleteDraft();
}
