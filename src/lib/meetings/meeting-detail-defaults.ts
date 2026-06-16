import type { Meeting, MeetingDetailSnapshot } from "@/types/facilitation";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import { upcomingAgendaFromPlan } from "@/lib/meetings/agenda-generator";

export function demoSnapshotForMeeting(meeting: Meeting): MeetingDetailSnapshot {
  const methodTitle = meeting.methods[0] ?? "Business Model Canvas";
  const methodId = meeting.methods[0]?.toLowerCase() ?? "bmc";
  return {
    ref: `MF-${meeting.dateISO.replace(/-/g, "")}-${meeting.id.slice(-4)}`,
    duration: "2 h 00",
    facilitator: "Facilitateur",
    participants: [
      { init: "FL", name: "Facilitateur", role: "Facilitatrice", color: "#2563eb" },
      { init: "SC", name: "Scribe", role: "Scribe", color: "#7c3aed" },
      { init: "P1", name: "Participant 1", role: "Participante", color: "#059669" },
    ],
    journal: [
      { t: meeting.time, phase: "Ouverture", label: "Accueil & objectifs", who: "Facilitateur", dur: "10 min", color: "slate", desc: "Tour de table et rappel de l'objectif." },
      { t: meeting.time, phase: "Méthode", label: methodTitle, who: "Équipe", dur: "45 min", color: "blue", desc: "Travail collaboratif sur la méthode choisie." },
      { t: meeting.time, phase: "Clôture", label: "Synthèse & prochaines étapes", who: "Facilitateur", dur: "5 min", color: "slate", desc: "Récapitulatif et plan d'action." },
    ],
    methods: [
      {
        id: methodId,
        title: METHOD_BY_ID[methodId]?.title ?? methodTitle,
        icon: "FileText",
        color: "blue",
        filled: "Complété",
        notes: 12,
        highlights: ["Proposition de valeur clarifiée", "Actions priorisées", "Prochaines étapes définies"],
      },
    ],
    projTools: [],
    notes: [
      { author: "Scribe", time: "14:08", vis: "public", text: "Points clés consignés pendant la séance." },
      { author: "Vous", time: "14:20", vis: "prive", text: "Note privée de suivi." },
    ],
    votes: [
      {
        kind: "Vote pondéré",
        q: "Quelles idées prioriser ?",
        time: "14:25",
        total: meeting.participants,
        options: [
          { label: "Option A", pct: 72 },
          { label: "Option B", pct: 58 },
        ],
      },
    ],
    quickLog: [
      { kind: "Vote", icon: "Vote", color: "violet", time: "14:25", q: "Priorisation", result: "Option A retenue" },
      { kind: "Minuteur", icon: "Clock", color: "blue", time: "14:40", q: "Bloc méthode", result: "Terminé à l'heure" },
    ],
    tasks: [
      { title: "Formaliser les décisions", who: "Scribe", wc: "#7c3aed", due: "10/06/26", prio: "Haute", done: false },
      { title: "Préparer le pilote", who: "Équipe", wc: "#059669", due: "15/06/26", prio: "Moyenne", done: false },
    ],
    whiteboard: [
      { text: "Idée clé 1", x: 8, y: 12, c: "amber" },
      { text: "Idée clé 2", x: 35, y: 28, c: "blue" },
      { text: "Décision", x: 62, y: 18, c: "green" },
    ],
    agenda: (meeting.agendaPlan ?? []).length > 0
      ? meeting.agendaPlan!.map((b, i) => ({
          title: b.title,
          planned: b.min || 10,
          real: b.min ? b.min + (i === 1 ? 2 : 0) : 10,
          color: ["slate", "blue", "violet", "amber", "green"][i % 5],
        }))
      : [
          { title: "Accueil & objectifs", planned: 10, real: 10, color: "slate" },
          { title: methodTitle, planned: 45, real: 47, color: "blue" },
          { title: "Synthèse", planned: 10, real: 5, color: "slate" },
        ],
    documents: [
      { name: "Compte_rendu.pdf", type: "PDF", size: "210 Ko", by: "Scribe" },
    ],
    report: {
      scribe: "Scribe",
      scribeRole: "Scribe",
      state: "redige",
      channels: ["My Facilitator"],
      recipients: `${meeting.participants} participants`,
      summary: meeting.sub ?? `La rencontre « ${meeting.name} » a permis d'avancer sur les objectifs fixés avec ${methodTitle}.`,
      decisions: ["Lancer le pilote sur 2 semaines", "Valider le compte rendu avant envoi"],
    },
  };
}

export function resolveMeetingSnapshot(meeting: Meeting): MeetingDetailSnapshot {
  if (meeting.snapshot && Object.keys(meeting.snapshot).length > 0) return meeting.snapshot;
  if (meeting.agendaPlan?.length || meeting.wizardMeta?.subgroups?.length) {
    return {
      objective: meeting.sub,
      participants: [],
      agenda: (meeting.agendaPlan ?? []).map((b, i) => ({
        title: b.title,
        planned: b.min || 10,
        real: 0,
        color: ["slate", "blue", "violet", "amber", "green"][i % 5],
      })),
      breakoutGroups: meeting.wizardMeta?.subgroups?.map((g) => ({
        id: g.id,
        name: g.name,
        color: g.color,
        memberIds: g.memberIds,
        facilitatorId: meeting.wizardMeta?.groupAssign?.[g.id]?.facilitatorId,
        methodId: meeting.wizardMeta?.groupAssign?.[g.id]?.methodId,
      })),
    };
  }
  if (meeting.status === "Terminée") return demoSnapshotForMeeting(meeting);
  return {};
}

export function upcomingAgendaItems(meeting: Meeting) {
  return upcomingAgendaFromPlan(meeting.agendaPlan);
}

export { upcomingAgendaFromPlan };
