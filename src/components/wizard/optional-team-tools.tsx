"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, MessageSquare, SlidersHorizontal } from "lucide-react";
import type { RegistryToolId } from "@/components/wizard/registry-tool-modal";
import { isRegistryFilled, useWizardRegistry } from "@/lib/hooks/use-wizard-registry";
import { cn } from "@/lib/utils";

const TOOLS: {
  id: RegistryToolId;
  title: string;
  desc: string;
  icon: typeof SlidersHorizontal;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: "raci",
    title: "Matrice RACI",
    desc: "Définissez les responsabilités de chacun dans le projet.",
    icon: SlidersHorizontal,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "charte",
    title: "Charte d'équipe",
    desc: "Alignez votre équipe sur les règles, valeurs et modes de fonctionnement.",
    icon: FileText,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: "comms",
    title: "Plan de communication",
    desc: "Planifiez les échanges, canaux et fréquence de communication.",
    icon: MessageSquare,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
];

export function OptionalTeamTools({
  projectId,
  memberNames,
  onOpenTool,
}: {
  projectId?: string | null;
  memberNames: string[];
  onOpenTool: (tool: RegistryToolId) => void;
}) {
  const [open, setOpen] = useState(true);
  const { registry } = useWizardRegistry(projectId, memberNames);
  const filled = isRegistryFilled(registry);

  return (
    <div className="rounded-2xl border bg-slate-50/80">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-extrabold">Outils d&apos;équipe optionnels</div>
            <div className="text-xs text-muted-foreground">
              Ces outils vous aideront à structurer la collaboration de votre équipe.
            </div>
          </div>
        </div>
        {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {open && (
        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-3">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            const isFilled =
              (t.id === "raci" && registry.raci.tasks.some((x) => x.vals.some((v) => v))) ||
              (t.id === "charte" && Boolean(registry.charte.mission.trim())) ||
              (t.id === "comms" && registry.comms.length > 0);
            return (
              <div key={t.id} className="rounded-xl border bg-white p-4 flex flex-col">
                <div className={cn("mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl", t.iconBg)}>
                  <Icon className={cn("h-5 w-5", t.iconColor)} />
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm">{t.title}</h4>
                  {isFilled && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Rempli
                    </span>
                  )}
                </div>
                <p className="mt-1 flex-1 text-xs text-muted-foreground">{t.desc}</p>
                <button
                  type="button"
                  onClick={() => onOpenTool(t.id)}
                  className="mt-3 text-left text-xs font-bold text-primary hover:underline"
                >
                  {isFilled ? "Modifier →" : "Configurer →"}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {filled && !open && (
        <p className="px-4 pb-3 text-xs text-emerald-600 font-semibold">Outils configurés</p>
      )}
    </div>
  );
}
