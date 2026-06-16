"use client";

import { X } from "lucide-react";
import {
  RaciTable,
  CharteEditor,
  RegTable,
  COMMS_COLS,
} from "@/components/projets/project-tabs/registry-tables";
import { useWizardRegistry } from "@/lib/hooks/use-wizard-registry";
import { Button } from "@/components/ui/button";

export type RegistryToolId = "raci" | "charte" | "comms";

const TITLES: Record<RegistryToolId, string> = {
  raci: "Matrice RACI",
  charte: "Charte d'équipe",
  comms: "Plan de communication",
};

export function RegistryToolModal({
  tool,
  projectId,
  memberNames,
  onClose,
}: {
  tool: RegistryToolId | null;
  projectId?: string | null;
  memberNames: string[];
  onClose: () => void;
}) {
  const { registry, update } = useWizardRegistry(projectId, memberNames);

  if (!tool) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-[900px] flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-extrabold">{TITLES[tool]}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {tool === "raci" && (
            <RaciTable
              data={registry.raci}
              onChange={(raci) => update((prev) => ({ ...prev, raci }))}
            />
          )}
          {tool === "charte" && (
            <CharteEditor
              charte={registry.charte}
              onChange={(charte) => update((prev) => ({ ...prev, charte }))}
            />
          )}
          {tool === "comms" && (
            <RegTable
              columns={COMMS_COLS}
              rows={registry.comms}
              onChange={(comms) => update((prev) => ({ ...prev, comms }))}
              addLabel="Ajouter un canal"
            />
          )}
        </div>
        <div className="border-t px-5 py-4 text-right">
          <Button type="button" onClick={onClose}>Terminé</Button>
        </div>
      </div>
    </div>
  );
}
