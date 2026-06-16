import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { objectiveFromWhiteboard } from "@/lib/whiteboard/objective-from-board";
import { getProjectUniverse } from "@/lib/wizard/project-types";
import { agendaTotalMinutes } from "@/lib/meetings/agenda-generator";
import type { WizardPayload, WizardLaunchMode, SessionMode } from "@/types/facilitation";
import type { useFacilitationStore } from "@/lib/store/facilitation-store";

type FacilitationStore = ReturnType<typeof useFacilitationStore.getState>;

export type FinishWizardState = WizardPayload & {
  whiteboardElements?: import("@/lib/whiteboard/elements").WbElement[];
  soloMusic?: WizardPayload["soloMusic"];
  soloTools?: string[];
  launchMode?: WizardLaunchMode;
  mode?: SessionMode | null;
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

  const project = await facilitation.addProject({
    name: (wizard.meetingTitle || objective).slice(0, 60),
    objective,
    tile: PTYPE_TILE[wizard.ptype ?? ""] ?? "teal",
    icon: PTYPE_ICON[wizard.ptype ?? ""] ?? "Sparkles",
  });

  const meeting = await facilitation.addMeeting({
    name: wizard.meetingTitle || objective.slice(0, 50) || "Nouvelle rencontre",
    project: project.id,
    methods,
    status: launchMode === "schedule" ? "À venir" : "En cours",
    agendaPlan: agendaPlan.length > 0 ? agendaPlan : undefined,
    dateISO: wizard.meetingDate,
    time: wizard.meetingStart,
    type:
      mode === "solo"
        ? "Session solo"
        : mode === "atelier"
          ? "Grand atelier"
          : "Séance d'équipe",
    sub: universe?.title,
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
    projectId: project.id,
    meetingId: meeting.id,
    genre: wizard.genre ?? null,
    simulating: launchMode === "simulate",
    soloMusic: wizard.soloMusic ?? undefined,
    soloTools: wizard.soloTools,
    durationMin: totalMin,
  });

  if (launchMode === "simulate" || mode !== "solo") {
    router.push(`/dashboard/session?project=${project.id}`);
  } else {
    router.push("/dashboard/session/solo");
  }

  void wizard.deleteDraft();
}
