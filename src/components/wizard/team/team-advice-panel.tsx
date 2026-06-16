"use client";

import {
  Globe,
  Info,
  Link2,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  getTeamAdvice,
  type TeamAdviceAction,
} from "@/lib/project/team-advice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACTION_ICONS = {
  Users,
  Link: Link2,
  Sparkle: Sparkles,
  Globe,
  Sliders: SlidersHorizontal,
} as const;

export function TeamAdvicePanel({
  count,
  onAction,
  onClose,
}: {
  count: number;
  onAction: (act: TeamAdviceAction) => void;
  onClose: () => void;
}) {
  const adv = getTeamAdvice(count);

  return (
    <div className="mb-4 rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-lg font-extrabold tracking-tight">{adv.title}</h3>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div
          className="rounded-xl border p-4"
          style={{ background: adv.boxBg, borderColor: adv.boxBd }}
        >
          <div className="mb-3 flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: adv.iconBg, color: adv.iconFg }}
            >
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-snug">{adv.headline}</p>
              <p className="mt-1 text-xs text-slate-600">{adv.sub}</p>
            </div>
          </div>
          {adv.reasons.map((reason) => (
            <p
              key={reason}
              className="mb-1.5 flex gap-2 text-xs leading-snug"
              style={{ color: adv.reasonFg }}
            >
              <span>•</span>
              <span>{reason}</span>
            </p>
          ))}
        </div>

        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Info className="h-4 w-4" />
            Que pouvez-vous faire ?
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {adv.actions.map((action) => {
              const Icon = ACTION_ICONS[action.icon];
              const colorRing =
                action.color === "blue"
                  ? "text-blue-600 bg-blue-50"
                  : action.color === "green"
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-violet-600 bg-violet-50";
              return (
                <div
                  key={action.act}
                  className="flex flex-col gap-2 rounded-xl border bg-white p-3.5"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      colorRing,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-extrabold leading-snug">{action.title}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-auto w-full"
                    onClick={() => onAction(action.act)}
                  >
                    {action.btn}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
