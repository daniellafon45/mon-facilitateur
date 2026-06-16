"use client";

import { CheckCircle, Circle } from "lucide-react";
import type { RegistryToolId } from "@/components/wizard/registry-tool-modal";
import type { SessionMode, WizardConfirmedGroup, WizardMember } from "@/types/facilitation";
import { isRegistryFilled, useWizardRegistry } from "@/lib/hooks/use-wizard-registry";
import { cn } from "@/lib/utils";

type CheckItem = {
  id: string;
  label: string;
  done: boolean;
  tool?: RegistryToolId;
};

export function TeamPreparationPanel({
  mode,
  members,
  roleAssign,
  confirmedGroups,
  projectId,
  onOpenTool,
}: {
  mode?: SessionMode | null;
  members: WizardMember[];
  roleAssign: Record<string, string>;
  confirmedGroups?: WizardConfirmedGroup[] | null;
  projectId?: string | null;
  onOpenTool: (tool: RegistryToolId) => void;
}) {
  const memberNames = members.map((m) => m.name);
  const { registry } = useWizardRegistry(projectId, memberNames);
  const registryOk = isRegistryFilled(registry);
  const isAtelier = mode === "atelier";

  const items: CheckItem[] = isAtelier
    ? [
        { id: "members", label: "Membres ajoutés", done: members.length > 0 },
        { id: "groups", label: "Sous-groupes formés", done: Boolean(confirmedGroups?.length) },
        { id: "facils", label: "Facilitateurs par salle", done: false },
        { id: "raci", label: "Matrice RACI", done: registry.raci.tasks.some((t) => t.vals.some((v) => v)), tool: "raci" },
      ]
    : [
        { id: "members", label: "Membres ajoutés", done: members.length > 0 },
        { id: "facil", label: "Facilitateur défini", done: Boolean(roleAssign.facilitateur) },
        { id: "scribe", label: "Scribe défini", done: Boolean(roleAssign.scribe) },
        { id: "raci", label: "Matrice RACI", done: registry.raci.tasks.some((t) => t.vals.some((v) => v)), tool: "raci" },
        { id: "charte", label: "Charte d'équipe", done: Boolean(registry.charte.mission.trim()), tool: "charte" },
        { id: "comms", label: "Plan de communication", done: registry.comms.length > 0, tool: "comms" },
      ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-extrabold">Préparation</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              disabled={!item.tool}
              onClick={() => item.tool && onOpenTool(item.tool)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition-colors",
                item.tool && "hover:bg-slate-100 cursor-pointer",
                !item.tool && "cursor-default",
              )}
            >
              {item.done ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-slate-300" />
              )}
              <span className={item.done ? "text-slate-700" : "text-muted-foreground"}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {registryOk && (
        <p className="text-[10px] text-emerald-600 font-bold">Registres projet à jour</p>
      )}
    </div>
  );
}
