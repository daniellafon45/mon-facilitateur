import type { Meeting, MeetingDetailSectionId, MeetingDetailSnapshot } from "@/types/facilitation";
import { resolveMeetingSnapshot } from "@/lib/meetings/meeting-detail-defaults";

export const MEETING_DETAIL_SECTIONS: {
  id: MeetingDetailSectionId;
  label: string;
  icon: string;
}[] = [
  { id: "apercu", label: "Aperçu", icon: "Eye" },
  { id: "minuterie", label: "Minuterie", icon: "Clock" },
  { id: "methodes", label: "Méthodes & outils", icon: "Grid" },
  { id: "tableau", label: "Tableau blanc", icon: "Sparkles" },
  { id: "documents", label: "Documents", icon: "FileText" },
  { id: "notes", label: "Notes", icon: "Pencil" },
  { id: "quicklog", label: "Journal de la séance", icon: "Bolt" },
  { id: "taches", label: "Tâches & compte rendu", icon: "Check" },
];

export function sectionCounts(snapshot: MeetingDetailSnapshot, meeting: Meeting) {
  const methods = (snapshot.methods?.length ?? 0) + (snapshot.projTools?.length ?? 0);
  return {
    apercu: null as number | null,
    minuterie: snapshot.agenda?.length ?? 0,
    methodes: methods,
    tableau: snapshot.whiteboard?.length ?? 0,
    documents: snapshot.documents?.length ?? 0,
    notes: snapshot.notes?.length ?? 0,
    quicklog: (snapshot.quickLog?.length ?? 0) + (snapshot.votes?.length ?? 0),
    taches: snapshot.tasks?.length ?? 0,
  } satisfies Record<MeetingDetailSectionId, number | null>;
}

export function getMeetingDetailData(meeting: Meeting) {
  const snapshot = resolveMeetingSnapshot(meeting);
  const counts = sectionCounts(snapshot, meeting);
  return { snapshot, counts };
}
