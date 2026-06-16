"use client";

import { useMemo } from "react";
import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
  subDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface ContributionDay {
  date: string;
  count: number;
}

interface GitHubCalendarProps {
  data: ContributionDay[];
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = ["#ebedf0", "#bae6fd", "#38bdf8", "#0284c7", "#0c4a6e"];
const WEEKS = 53;

function monthLabelForWeek(weekDays: Date[], weekIndex: number, startDate: Date): string | null {
  if (weekIndex === 0) {
    return format(startDate, "MMM", { locale: fr });
  }
  for (const day of weekDays) {
    if (day.getDate() === 1) {
      return format(day, "MMM", { locale: fr });
    }
  }
  return null;
}

export function GitHubCalendar({
  data,
  colors = DEFAULT_COLORS,
  className,
}: GitHubCalendarProps) {
  const today = new Date();
  const startDate = subDays(today, 364);

  const countByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of data) {
      map.set(item.date, item.count);
    }
    return map;
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return colors[0];
    if (count === 1) return colors[1];
    if (count === 2) return colors[2];
    if (count === 3) return colors[3];
    return colors[4] ?? colors[colors.length - 1];
  };

  const weeksData = useMemo(() => {
    const result: { days: Date[]; label: string | null }[] = [];
    let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 0 });

    for (let i = 0; i < WEEKS; i++) {
      const days = eachDayOfInterval({
        start: currentWeekStart,
        end: endOfWeek(currentWeekStart, { weekStartsOn: 0 }),
      });
      result.push({
        days,
        label: monthLabelForWeek(days, i, startDate),
      });
      currentWeekStart = addDays(currentWeekStart, 7);
    }

    return result;
  }, [startDate]);

  const dayLabels = ["dim.", "", "mar.", "", "jeu.", "", "sam."];

  const totalMeetings = useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
    [data],
  );

  return (
    <div className={cn("w-full rounded-3xl border bg-card p-4 shadow-sm sm:p-5", className)}>
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalMeetings}</span> rencontre
          {totalMeetings > 1 ? "s" : ""} sur les 12 derniers mois
        </p>
      </div>

      <div className="flex w-full gap-2 sm:gap-3">
        <div className="flex w-8 shrink-0 flex-col justify-between pt-5 sm:w-9">
          {dayLabels.map((day, index) => (
            <span
              key={index}
              className="flex h-full min-h-[10px] flex-1 items-center text-[10px] text-muted-foreground sm:text-xs"
            >
              {day}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex h-4 w-full gap-[3px] sm:gap-1">
            {weeksData.map((week, i) => (
              <div key={i} className="flex min-w-0 flex-1 items-end overflow-hidden">
                {week.label && (
                  <span className="w-full truncate text-[9px] capitalize text-muted-foreground sm:text-[10px]">
                    {week.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex w-full gap-[3px] sm:gap-1">
            {weeksData.map((week, i) => (
              <div key={i} className="flex min-w-0 flex-1 flex-col gap-[3px] sm:gap-1">
                {week.days.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const count = countByDate.get(key) ?? 0;

                  return (
                    <div
                      key={key}
                      className="aspect-square w-full min-h-[8px] rounded-[3px] sm:rounded-[4px]"
                      style={{ backgroundColor: getColor(count) }}
                      title={`${format(day, "PPP", { locale: fr })} : ${count} rencontre${count > 1 ? "s" : ""}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Moins</span>
        {colors.map((color, index) => (
          <div key={index} className="h-3 w-3 rounded-[4px]" style={{ backgroundColor: color }} />
        ))}
        <span>Plus</span>
      </div>
    </div>
  );
}
