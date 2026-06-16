"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, FileText, MessageSquare, SlidersHorizontal } from "lucide-react";
import type { ProjectRegistryPayload } from "@/lib/project/registry-types";
import { cn } from "@/lib/utils";
import type { RegistryToolId } from "@/components/wizard/registry-tool-modal";

const TOOLS: {
  id: RegistryToolId;
  icon: typeof SlidersHorizontal;
  color: string;
  title: string;
  desc: string;
  isFilled: (r: ProjectRegistryPayload) => boolean;
}[] = [
  {
    id: "raci",
    icon: SlidersHorizontal,
    color: "text-blue-600 bg-blue-50",
    title: "Matrice RACI",
    desc: "Définissez les responsabilités de chacun dans le projet.",
    isFilled: (r) => r.raci.tasks.length > 0,
  },
  {
    id: "charte",
    icon: FileText,
    color: "text-emerald-600 bg-emerald-50",
    title: "Charte d'équipe",
    desc: "Alignez votre équipe sur les règles, valeurs et modes de fonctionnement.",
    isFilled: (r) =>
      Boolean(
        r.charte.mission ||
          r.charte.valeurs.length ||
          r.charte.regles.length,
      ),
  },
  {
    id: "comms",
    icon: MessageSquare,
    color: "text-amber-600 bg-amber-50",
    title: "Plan de communication",
    desc: "Planifiez les échanges, canaux et fréquence de communication.",
    isFilled: (r) => r.comms.length > 0,
  },
];

export function TeamOptionalTools({
  registry,
  onOpenTool,
}: {
  registry: ProjectRegistryPayload;
  onOpenTool: (id: RegistryToolId) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 border-t pt-6">
      <button
        type="button"
        className="flex w-full items-center gap-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <SlidersHorizontal className="h-4 w-4" />
        </span>
        <span className="flex-1">
          <span className="block font-extrabold">Outils d&apos;équipe optionnels</span>
          <span className="text-sm text-muted-foreground">
            Ces outils vous aideront à structurer la collaboration de votre équipe.
          </span>
        </span>
        <ChevronDown
          className={cn("h-5 w-5 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {TOOLS.map((t) => {
            const filled = t.isFilled(registry);
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className="flex items-start gap-3 rounded-xl border bg-white p-4"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    t.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-extrabold text-sm">{t.title}</span>
                    {filled && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Rempli
                      </span>
                    )}
                  </div>
                  <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-sm font-bold text-violet-700"
                    onClick={() => onOpenTool(t.id)}
                  >
                    {filled ? "Modifier" : "Configurer"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
