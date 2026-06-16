import type {
  MeetingAgendaBlock,
  MeetingDetailSnapshot,
  MeetingParticipantDetail,
  WizardConfirmedGroup,
  WizardGroupAssign,
  WizardMember,
} from "@/types/facilitation";

export function buildWizardInitialSnapshot({
  objective,
  members,
  agendaPlan,
  confirmedGroups,
  groupAssign,
  facilitatorName,
}: {
  objective: string;
  members: WizardMember[];
  agendaPlan: MeetingAgendaBlock[];
  confirmedGroups?: WizardConfirmedGroup[] | null;
  groupAssign?: Record<string, WizardGroupAssign>;
  facilitatorName?: string;
}): MeetingDetailSnapshot {
  const participants: MeetingParticipantDetail[] = members.map((m) => ({
    init: m.name.slice(0, 2).toUpperCase(),
    name: m.name,
    role: m.meetingRole ?? m.role ?? "Participante",
    color: m.color ?? "#2563eb",
  }));

  const agenda = agendaPlan.map((b, i) => ({
    title: b.title,
    planned: b.min || 10,
    real: 0,
    color: ["slate", "blue", "violet", "amber", "green"][i % 5],
  }));

  const breakoutGroups = confirmedGroups?.map((g) => {
    const assign = groupAssign?.[g.id];
    return {
      id: g.id,
      name: g.name,
      color: g.color,
      memberIds: g.memberIds,
      facilitatorId: assign?.facilitatorId,
      methodId: assign?.methodId,
    };
  });

  return {
    objective,
    facilitator: facilitatorName,
    participants,
    agenda,
    ...(breakoutGroups && breakoutGroups.length > 0 ? { breakoutGroups } : {}),
  };
}

export function memberAccessToDb(access: string): string {
  const map: Record<string, string> = {
    Propriétaire: "owner",
    Éditeur: "editor",
    Commentateur: "commentator",
    Lecteur: "viewer",
    Observateur: "observer",
  };
  return map[access] ?? access.toLowerCase();
}

export function memberAccessFromDb(role: string): string {
  const map: Record<string, string> = {
    owner: "Propriétaire",
    editor: "Éditeur",
    commentator: "Commentateur",
    viewer: "Lecteur",
    observer: "Observateur",
  };
  return map[role] ?? role;
}
