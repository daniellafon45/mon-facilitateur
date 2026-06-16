import type { Meeting } from "@/types/facilitation";

export interface ContributionDay {
  date: string;
  count: number;
}

export function meetingsToContributionData(meetings: Meeting[]): ContributionDay[] {
  const counts = new Map<string, number>();

  for (const meeting of meetings) {
    if (meeting.archived) continue;
    counts.set(meeting.dateISO, (counts.get(meeting.dateISO) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }));
}
