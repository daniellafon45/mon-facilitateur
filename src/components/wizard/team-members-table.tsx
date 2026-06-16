"use client";

import { X } from "lucide-react";
import type { WizardMember } from "@/types/facilitation";
import { memberAccessFromDb, memberAccessToDb } from "@/lib/wizard/build-wizard-initial-snapshot";

const ACCESS_OPTIONS = ["Propriétaire", "Éditeur", "Commentateur", "Lecteur", "Observateur"];
const MEETING_ROLES = [
  "Facilitatrice",
  "Chef de projet",
  "Scribe",
  "Minuteur",
  "Participante",
  "Observateur",
];

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#db2777"];

export function TeamMembersTable({
  members,
  onChange,
}: {
  members: WizardMember[];
  onChange: (members: WizardMember[]) => void;
}) {
  const update = (id: string, patch: Partial<WizardMember>) => {
    onChange(members.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const remove = (id: string) => onChange(members.filter((m) => m.id !== id));

  if (members.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Aucun membre ajouté. Utilisez Dream Team ou invitez quelqu&apos;un par courriel.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-left text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2.5">Membre</th>
            <th className="px-3 py-2.5">Accès au projet</th>
            <th className="px-3 py-2.5">Rôle dans la rencontre</th>
            <th className="w-10 px-2 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b last:border-0">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                    style={{ background: m.color ?? "#2563eb" }}
                  >
                    {m.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{m.name}</div>
                    {m.email && <div className="text-xs text-muted-foreground truncate">{m.email}</div>}
                  </div>
                </div>
              </td>
              <td className="px-3 py-2">
                <select
                  value={m.accessRole ?? m.projectAccess ?? "Éditeur"}
                  onChange={(e) => {
                    const v = e.target.value;
                    update(m.id, { accessRole: v, projectAccess: v });
                  }}
                  className="w-full rounded-lg border bg-white px-2 py-1.5 text-xs font-semibold"
                >
                  {ACCESS_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2">
                <select
                  value={m.meetingRole ?? m.role ?? "Participante"}
                  onChange={(e) => update(m.id, { meetingRole: e.target.value, role: e.target.value })}
                  className="w-full rounded-lg border bg-white px-2 py-1.5 text-xs font-semibold"
                >
                  {MEETING_ROLES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </td>
              <td className="px-2 py-2 text-center">
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function createWizardMember(
  partial: Pick<WizardMember, "name"> & Partial<WizardMember>,
  index: number,
): WizardMember {
  return {
    id: partial.id ?? `wm${Date.now()}-${index}`,
    name: partial.name,
    email: partial.email,
    contactId: partial.contactId,
    color: partial.color ?? COLORS[index % COLORS.length],
    accessRole: partial.accessRole ?? "Éditeur",
    projectAccess: partial.projectAccess ?? "Éditeur",
    meetingRole: partial.meetingRole ?? partial.role ?? "Participante",
    role: partial.meetingRole ?? partial.role ?? "Participante",
  };
}

export { ACCESS_OPTIONS, MEETING_ROLES, memberAccessFromDb, memberAccessToDb };
