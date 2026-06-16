"use client";

import { useMemo } from "react";
import type { Meeting } from "@/types/facilitation";
import { EventManager } from "@/components/ui/event-manager";
import {
  eventPatchToMeetingData,
  eventToMeetingData,
  MEETING_CATEGORIES,
  MEETING_TAGS,
  meetingToEvent,
} from "@/lib/meetings/event-adapter";

export function ProjectMeetingsCalendar({
  projectId,
  meetings,
  onCreate,
  onUpdate,
  onDelete,
}: {
  projectId: string;
  meetings: Meeting[];
  onCreate: (data: Partial<Meeting>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Meeting>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const events = useMemo(
    () => meetings.filter((m) => !m.archived).map(meetingToEvent),
    [meetings],
  );

  return (
    <EventManager
      events={events}
      defaultView="month"
      categories={[...MEETING_CATEGORIES]}
      availableTags={[...MEETING_TAGS]}
      className="rounded-2xl border"
      onEventCreate={(event) => {
        void onCreate({ ...eventToMeetingData(event), project: projectId });
      }}
      onEventUpdate={(id, patch) => {
        void onUpdate(id, eventPatchToMeetingData(patch));
      }}
      onEventDelete={(id) => {
        void onDelete(id);
      }}
    />
  );
}
