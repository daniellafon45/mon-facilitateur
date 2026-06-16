import type { Event } from "@/components/ui/event-manager";
import type { Meeting } from "@/types/facilitation";

const TYPE_COLORS: Record<string, string> = {
  Réunion: "blue",
  "Séance d'équipe": "green",
  "Session solo": "purple",
  "Grand atelier": "orange",
  Rappel: "pink",
};

function parseMeetingDateTime(dateISO: string, time: string): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh ?? 10, mm ?? 0, 0, 0);
}

function formatDateISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function meetingToEvent(meeting: Meeting): Event {
  const startTime = parseMeetingDateTime(meeting.dateISO, meeting.time);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  const tags = [meeting.status, ...(meeting.methods?.length ? ["Travail"] : [])].filter(Boolean);

  return {
    id: meeting.id,
    title: meeting.name,
    description: meeting.sub,
    startTime,
    endTime,
    color: TYPE_COLORS[meeting.type] ?? "blue",
    category: meeting.type,
    tags,
  };
}

export function eventToMeetingData(event: Omit<Event, "id">): Partial<Meeting> {
  const statusTag = event.tags?.find((t) => ["À venir", "En cours", "Terminée", "Annulée"].includes(t));

  return {
    name: event.title,
    dateISO: formatDateISO(event.startTime),
    time: formatTime(event.startTime),
    type: event.category ?? "Réunion",
    status: statusTag ?? "À venir",
    sub: event.description,
    methods: event.tags?.filter((t) => !["À venir", "En cours", "Terminée", "Annulée", "Travail", "Important", "Urgent", "Personnel", "Équipe", "Client"].includes(t)) ?? [],
  };
}

export function eventPatchToMeetingData(patch: Partial<Event>): Partial<Meeting> {
  const data: Partial<Meeting> = {};
  if (patch.title !== undefined) data.name = patch.title;
  if (patch.description !== undefined) data.sub = patch.description;
  if (patch.category !== undefined) data.type = patch.category;
  if (patch.startTime) {
    data.dateISO = formatDateISO(patch.startTime);
    data.time = formatTime(patch.startTime);
  }
  if (patch.tags) {
    const statusTag = patch.tags.find((t) => ["À venir", "En cours", "Terminée", "Annulée"].includes(t));
    if (statusTag) data.status = statusTag;
  }
  return data;
}

export const MEETING_CATEGORIES = ["Réunion", "Séance d'équipe", "Session solo", "Grand atelier", "Rappel"] as const;
export const MEETING_TAGS = ["À venir", "En cours", "Terminée", "Important", "Urgent", "Travail", "Équipe", "Client"] as const;
