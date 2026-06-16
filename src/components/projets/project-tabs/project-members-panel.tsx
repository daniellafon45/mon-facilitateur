"use client";

import { useMemo, useState } from "react";
import { Plus, UserMinus, Users } from "lucide-react";
import { PizzaSVG } from "@/components/ui/pizza-svg";
import { PIZZA_STATUS_TONE_CLASS, pizzaSlices, pizzaStatus } from "@/lib/project/pizza";
import type { ProjectMember } from "@/lib/project/registry-types";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { useProjectMembers } from "@/lib/hooks/use-project-members";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MEETING_ROLES = ["Facilitatrice", "Facilitateur", "Scribe", "Minuteur", "Chef de projet", "Participante", "Observateur"];
const ACCESS_ROLES = ["Propriétaire", "Éditeur", "Commentateur", "Lecteur"];
const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#db2777", "#0f766e", "#f59e0b", "#8b5cf6"];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ProjectMembersPanel({ projectId }: { projectId: string }) {
  const contacts = useFacilitationStore((s) => s.contacts);
  const { members, addMember, updateMember, removeMember } = useProjectMembers(projectId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const count = members.length;
  const slices = pizzaSlices(count);
  const status = pizzaStatus(count);

  const toneClass = PIZZA_STATUS_TONE_CLASS[status.tone];

  const availableContacts = useMemo(
    () => contacts.filter((c) => !members.some((m) => m.contactId === c.id)),
    [contacts, members],
  );

  const addFromContact = (contactId: string) => {
    const c = contacts.find((x) => x.id === contactId);
    if (!c) return;
    void addMember({
      contactId: c.id,
      displayName: c.name,
      email: c.email,
      color: COLORS[members.length % COLORS.length],
      accessRole: "Éditeur",
      meetingRole: "Participante",
    });
    setPickerOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start gap-6 rounded-2xl border p-5">
        <div className="flex items-center gap-3">
          <PizzaSVG used={slices.pizza1} total={5} size={72} />
          <PizzaSVG used={slices.pizza2} total={5} size={72} />
        </div>
        <div className="min-w-[200px] flex-1">
          <div className="text-lg font-extrabold">{count} participant{count > 1 ? "s" : ""}</div>
          <div className={cn("mt-2 rounded-xl border px-3 py-2 text-sm", toneClass)}>
            <span className="font-bold">{status.label}</span> — {status.advice}
          </div>
        </div>
        <Button size="sm" className="h-8 rounded-lg" onClick={() => setPickerOpen((v) => !v)}>
          <Plus className="mr-1 h-3.5 w-3.5" /> Dream Team
        </Button>
      </div>

      {pickerOpen && (
        <div className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="mb-2 text-xs font-extrabold uppercase text-muted-foreground">Contacts Dream Team</div>
          {availableContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tous vos contacts sont déjà dans le projet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableContacts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => addFromContact(c.id)}
                  className="rounded-lg border px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border">
        <div className="flex items-center gap-2 border-b px-4 py-3 font-extrabold">
          <Users className="h-4 w-4 text-violet-600" /> Membres ({count})
        </div>
        {members.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Aucun membre — ajoutez depuis Dream Team.
          </div>
        ) : (
          members.map((m) => (
            <MemberRow key={m.id} member={m} onUpdate={updateMember} onRemove={() => removeMember(m.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function MemberRow({
  member,
  onUpdate,
  onRemove,
}: {
  member: ProjectMember;
  onUpdate: (m: ProjectMember) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t px-4 py-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
        style={{ background: member.color }}
      >
        {initials(member.displayName)}
      </span>
      <div className="min-w-[120px] flex-1">
        <div className="text-sm font-bold">{member.displayName}</div>
        <div className="text-xs text-muted-foreground">{member.email || "—"}</div>
      </div>
      <select
        value={member.meetingRole}
        onChange={(e) => onUpdate({ ...member, meetingRole: e.target.value })}
        className="h-8 rounded-lg border bg-white px-2 text-xs font-semibold"
      >
        {MEETING_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <select
        value={member.accessRole}
        onChange={(e) => onUpdate({ ...member, accessRole: e.target.value })}
        className="h-8 rounded-lg border bg-white px-2 text-xs font-semibold"
      >
        {ACCESS_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button type="button" onClick={onRemove} className="text-slate-400 hover:text-red-500" title="Retirer">
        <UserMinus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function InviteMembersDrawer({
  projectId,
  open,
  onClose,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-extrabold">Inviter des membres</h2>
        <ProjectMembersPanel projectId={projectId} />
        <Button variant="outline" className="mt-4 w-full rounded-xl" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
}
