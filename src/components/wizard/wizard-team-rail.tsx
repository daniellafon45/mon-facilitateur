"use client";

import {
  Check,
  ChevronDown,
  Info,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { PizzaSVG } from "@/components/ui/pizza-svg";
import {
  PIZZA_STATUS_TONE_CLASS,
  pizzaPartsUsed,
  pizzaSlices,
  pizzaStatus,
} from "@/lib/project/pizza";
import { PIZZA_MAX } from "@/lib/project/team-constants";
import type { ProjectRegistryPayload } from "@/lib/project/registry-types";
import type { SessionMode, WizardConfirmedGroup } from "@/types/facilitation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TeamSavedTeamsPanel } from "@/components/wizard/team/team-saved-teams-panel";

export interface PrepItem {
  label: string;
  done: boolean;
  sub?: string;
  onOpen?: () => void;
}

export function WizardTeamRail({
  count,
  mode,
  prepItems,
  showConseils,
  onToggleConseils,
  onAddTeam,
  savedTeamsOpen = false,
}: {
  count: number;
  mode?: SessionMode | null;
  prepItems: PrepItem[];
  showConseils: boolean;
  onToggleConseils: () => void;
  onAddTeam: (teamId: string) => void;
  savedTeamsOpen?: boolean;
}) {
  const slices = pizzaSlices(count);
  const status = pizzaStatus(count);
  const toneClass = PIZZA_STATUS_TONE_CLASS[status.tone];
  const done = prepItems.filter((p) => p.done).length;
  const total = prepItems.length;

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b p-4">
        <div className="mb-1 flex items-center gap-2 font-extrabold">
          <Sparkles className="h-4 w-4 text-violet-600" />
          Préparation
        </div>
        <p
          className={cn(
            "mb-3 text-xs font-semibold",
            done === total ? "text-emerald-700" : "text-muted-foreground",
          )}
        >
          {done === total ? "Tout est prêt — équipe au complet !" : "Votre équipe est en bonne voie !"}
          <span className="text-slate-400"> · {done}/{total}</span>
        </p>

        {prepItems.map((p, i) => {
          const Row = p.onOpen ? "button" : "div";
          return (
            <Row
              key={p.label}
              type={p.onOpen ? "button" : undefined}
              onClick={p.onOpen}
              className={cn(
                "flex w-full items-center gap-2 border-b border-slate-100 py-2 text-left last:border-0",
                p.onOpen && "cursor-pointer hover:bg-slate-50/80",
              )}
            >
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                  p.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300",
                )}
              >
                {p.done && <Check className="h-2.5 w-2.5" />}
              </span>
              <span
                className={cn(
                  "flex-1 text-xs font-semibold",
                  p.done ? "text-slate-900" : "text-muted-foreground",
                )}
              >
                {p.label}
              </span>
              {p.sub && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    p.done
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border bg-slate-100 text-muted-foreground",
                  )}
                >
                  {p.sub}
                </span>
              )}
              {p.onOpen && !p.done && <Plus className="h-3 w-3 text-slate-300" />}
            </Row>
          );
        })}
      </div>

      <div className="border-b p-4">
        <div className="mb-3 flex items-center gap-1.5 font-extrabold text-sm">
          Taille de l&apos;équipe
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="mb-2 flex items-center justify-center gap-2">
          <PizzaSVG used={slices.pizza1} total={5} size={72} />
          <PizzaSVG used={slices.pizza2} total={5} size={72} />
        </div>
        <p className="mb-2 font-extrabold text-sm">
          {pizzaPartsUsed(count)} / {PIZZA_MAX} parts utilisées
        </p>
        <div className={cn("mb-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold", toneClass)}>
          {status.label}
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{status.advice}</p>
        {status.showAdviceButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("w-full", showConseils && "border-violet-400 bg-violet-50 text-violet-800")}
            onClick={onToggleConseils}
          >
            Voir nos conseils
          </Button>
        )}
      </div>

      <TeamSavedTeamsPanel onAddTeam={onAddTeam} defaultOpen={savedTeamsOpen} />
    </div>
  );
}

export function buildPrepItems(opts: {
  count: number;
  mode?: SessionMode | null;
  roleAssign: Record<string, string>;
  confirmedGroups?: WizardConfirmedGroup[] | null;
  groupAssign: Record<string, { facilitatorId?: string; methodId?: string }>;
  registry: ProjectRegistryPayload;
  onOpenRaci?: () => void;
}): PrepItem[] {
  const isAtelier = opts.mode === "atelier";
  const groups = opts.confirmedGroups ?? [];

  if (isAtelier) {
    return [
      { label: "Membres ajoutés", done: opts.count > 0, sub: `${opts.count}/${opts.count}` },
      {
        label: "Sous-groupes formés",
        done: groups.length > 0,
        sub: groups.length ? `${groups.length} salles` : "À faire",
      },
      {
        label: "Facilitateurs par salle",
        done:
          groups.length > 0 &&
          groups.every((g) => Boolean(opts.groupAssign[g.id]?.facilitatorId)),
        sub: groups.length ? "" : "À faire",
      },
      {
        label: "Méthode par sous-groupe",
        done:
          groups.length > 0 &&
          groups.every((g) => Boolean(opts.groupAssign[g.id]?.methodId)),
        sub: groups.length ? "" : "À faire",
      },
      {
        label: "Matrice RACI",
        done: opts.registry.raci.tasks.length > 0,
        sub: opts.registry.raci.tasks.length
          ? `${opts.registry.raci.tasks.length} tâche(s)`
          : "Optionnel",
        onOpen: opts.onOpenRaci,
      },
    ];
  }

  return [
    {
      label: "Membres ajoutés",
      done: opts.count > 0,
      sub: `${opts.count} personne${opts.count > 1 ? "s" : ""}`,
    },
    {
      label: "Facilitateur défini",
      done: Boolean(opts.roleAssign.facilitateur),
      sub: opts.roleAssign.facilitateur ? "" : "À faire",
    },
    {
      label: "Scribe défini",
      done: Boolean(opts.roleAssign.scribe),
      sub: opts.roleAssign.scribe ? "" : "À faire",
    },
    {
      label: "Matrice RACI",
      done: opts.registry.raci.tasks.length > 0,
      sub: opts.registry.raci.tasks.length
        ? `${opts.registry.raci.tasks.length} tâche(s)`
        : "Optionnel",
      onOpen: opts.onOpenRaci,
    },
    {
      label: "Charte d'équipe",
      done: Boolean(
        opts.registry.charte.mission ||
          opts.registry.charte.valeurs.length ||
          opts.registry.charte.regles.length,
      ),
      sub: opts.registry.charte.mission ? "Définie" : "Optionnel",
    },
    {
      label: "Plan de communication",
      done: opts.registry.comms.length > 0,
      sub: opts.registry.comms.length
        ? `${opts.registry.comms.length} canal(x)`
        : "Optionnel",
    },
  ];
}
