"use client";

import { useMemo, useState } from "react";
import { Plus, Users, Layers } from "lucide-react";
import { PizzaSVG } from "@/components/ui/pizza-svg";
import { PIZZA_STATUS_TONE_CLASS, pizzaSlices, pizzaStatus } from "@/lib/project/pizza";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { useProjectMembers } from "@/lib/hooks/use-project-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SessionMode, WizardConfirmedGroup } from "@/types/facilitation";

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#db2777"];

export function WizardTeamStep({
  projectId,
  mode,
  confirmedGroups,
  onGroupsChange,
}: {
  projectId?: string;
  mode?: SessionMode | null;
  confirmedGroups?: WizardConfirmedGroup[] | null;
  onGroupsChange?: (groups: WizardConfirmedGroup[] | null) => void;
}) {
  const contacts = useFacilitationStore((s) => s.contacts);
  const projects = useFacilitationStore((s) => s.projects);
  const pid = projectId ?? "wizard-draft";
  const { members, addMember, removeMember } = useProjectMembers(pid);
  const [showContacts, setShowContacts] = useState(false);
  const [groupName, setGroupName] = useState("");

  const count = members.length;
  const slices = pizzaSlices(count);
  const status = pizzaStatus(count);
  const toneClass = PIZZA_STATUS_TONE_CLASS[status.tone];
  const isAtelier = mode === "atelier";
  const groups = confirmedGroups ?? [];

  const available = useMemo(
    () => contacts.filter((c) => !members.some((m) => m.contactId === c.id)),
    [contacts, members],
  );

  const addGroup = () => {
    if (!groupName.trim() || !onGroupsChange) return;
    const g: WizardConfirmedGroup = {
      id: `g${Date.now()}`,
      name: groupName.trim(),
      memberIds: [],
    };
    onGroupsChange([...groups, g]);
    setGroupName("");
  };

  return (
    <div className="space-y-5">
      {projects.length > 0 && (
        <div className="rounded-xl border bg-slate-50 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground mb-2">
            Associer à un projet
          </p>
          <p className="text-sm text-muted-foreground">
            {projectId
              ? projects.find((p) => p.id === projectId)?.name ?? "Projet sélectionné"
              : "Un nouveau projet sera créé à l'étape de lancement."}
          </p>
        </div>
      )}

      {isAtelier && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <div className="flex items-center gap-2 font-extrabold text-violet-800">
            <Layers className="h-4 w-4" />
            Mode grand atelier
          </div>
          <p className="mt-1 text-sm text-violet-900/80">
            Organisez des sous-groupes avec un facilitateur et une méthode par salle.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border bg-slate-50 p-4">
        <PizzaSVG used={slices.pizza1} total={5} size={64} />
        <PizzaSVG used={slices.pizza2} total={5} size={64} />
        <div className="min-w-[180px] flex-1">
          <div className="flex items-center gap-2 font-extrabold">
            <Users className="h-4 w-4 text-violet-600" />
            Règle des deux pizzas
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {count} participant{count > 1 ? "s" : ""} — idéal : 3 à 9, max 10.
          </p>
          <div className={cn("mt-2 rounded-lg border px-3 py-2 text-xs", toneClass)}>
            <strong>{status.label}</strong> — {status.advice}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {members.map((m) => (
          <span
            key={m.id}
            className="inline-flex items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-3 text-sm font-semibold"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
              style={{ background: m.color }}
            >
              {m.displayName.slice(0, 2).toUpperCase()}
            </span>
            {m.displayName}
            <button
              type="button"
              className="ml-1 text-slate-400 hover:text-red-500"
              onClick={() => removeMember(m.id)}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowContacts((v) => !v)}>
        <Plus className="mr-1 h-4 w-4" /> Ajouter depuis Dream Team
      </Button>

      {showContacts && (
        <div className="flex flex-wrap gap-2 rounded-xl border p-3">
          {available.length === 0 ? (
            <span className="text-sm text-muted-foreground">Aucun contact disponible.</span>
          ) : (
            available.map((c) => (
              <button
                key={c.id}
                type="button"
                className="rounded-lg border px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
                onClick={() =>
                  void addMember({
                    contactId: c.id,
                    displayName: c.name,
                    email: c.email,
                    color: COLORS[members.length % COLORS.length],
                    accessRole: "Éditeur",
                    meetingRole: "Participante",
                  })
                }
              >
                {c.name}
              </button>
            ))
          )}
        </div>
      )}

      {isAtelier && onGroupsChange && (
        <div className="space-y-3 rounded-xl border p-4">
          <h3 className="font-extrabold">Sous-groupes</h3>
          <div className="flex gap-2">
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nom de la salle / sous-groupe"
              className="max-w-xs"
            />
            <Button type="button" size="sm" onClick={addGroup}>
              Ajouter
            </Button>
          </div>
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ajoutez au moins un sous-groupe pour continuer.</p>
          ) : (
            <ul className="space-y-2">
              {groups.map((g) => (
                <li key={g.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold">
                  {g.name}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={() => onGroupsChange(groups.filter((x) => x.id !== g.id))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
