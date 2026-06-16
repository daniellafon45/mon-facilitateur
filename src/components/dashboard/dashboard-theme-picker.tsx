"use client";

import { Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_THEMES, type DashboardThemeId } from "@/lib/data/dashboard-themes";
import { useDashboardThemeStore } from "@/lib/store/dashboard-theme-store";

interface DashboardThemePickerProps {
  className?: string;
  compact?: boolean;
}

export function DashboardThemePicker({ className, compact }: DashboardThemePickerProps) {
  const themeId = useDashboardThemeStore((s) => s.themeId);
  const setThemeId = useDashboardThemeStore((s) => s.setThemeId);
  const toggleThemeId = useDashboardThemeStore((s) => s.toggleThemeId);
  const noneActive = themeId === null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {!compact && (
        <p className="text-xs font-medium text-inherit opacity-70">Fond</p>
      )}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir un fond">
        <button
          type="button"
          title="Aucun fond"
          aria-label="Aucun fond"
          aria-pressed={noneActive}
          onClick={() => setThemeId(null)}
          className={cn(
            "relative grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            noneActive
              ? "border-foreground bg-muted shadow-md scale-105"
              : "border-border bg-background shadow-sm",
          )}
        >
          <Ban className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        {DASHBOARD_THEMES.map((theme) => {
          const active = themeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              title={theme.label}
              aria-label={theme.label}
              aria-pressed={active}
              onClick={() => toggleThemeId(theme.id as DashboardThemeId)}
              className={cn(
                "relative h-8 w-8 shrink-0 rounded-full border-2 transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active
                  ? "border-foreground shadow-md scale-105"
                  : "border-white/70 shadow-sm",
              )}
              style={{
                background: `linear-gradient(135deg, ${theme.preview[0]}, ${theme.preview[1]}, ${theme.preview[2]})`,
              }}
            >
              {active && (
                <span className="absolute inset-[3px] rounded-full border border-white/80" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
