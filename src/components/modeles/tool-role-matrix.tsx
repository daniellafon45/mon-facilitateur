"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LIB_MEMBERS,
  ROLE_LIBRARY,
  type LibMember,
  type MeetingRole,
} from "@/lib/methods/tool-constants";
import { METHOD_OVERLAY_POPOVER_Z } from "@/lib/methods/overlay-layer";
import { MemberAvatar, MethodIcon } from "@/components/modeles/method-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_IC: Record<string, { bg: string; c: string }> = {
  facilitateur: { bg: "#EFF6FF", c: "#2563EB" },
  scribe: { bg: "#F0FDF4", c: "#059669" },
  minuteur: { bg: "#FEF2F2", c: "#DC2626" },
  participant: { bg: "#EFF6FF", c: "#2563EB" },
};

interface ToolRoleMatrixProps {
  members?: LibMember[];
  roles: MeetingRole[];
  setRoles: (r: MeetingRole[]) => void;
}

function RoleCard({
  role,
  members,
  onAssign,
  onRemove,
}: {
  role: MeetingRole;
  members: LibMember[];
  onAssign: (mid: string | null) => void;
  onRemove?: () => void;
}) {
  const ic = ROLE_IC[role.baseId || ""] || { bg: "#EFF6FF", c: "#2563EB" };
  const m = role.member ? members.find((x) => x.id === role.member) : null;

  return (
    <div className="relative rounded-2xl border bg-card p-4 shadow-sm">
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: ic.bg, color: ic.c }}
      >
        <MethodIcon name={role.icon} className="h-6 w-6" />
      </div>
      <p className="mb-3 font-bold">{role.title}</p>
      {members.length > 1 ? (
        <div className="flex items-center gap-2">
          {m ? <MemberAvatar member={m} size={22} /> : <UserPlaceholder />}
          <Select
            value={role.member || "_none"}
            onValueChange={(v) => onAssign(v === "_none" ? null : v)}
          >
            <SelectTrigger className="h-8 flex-1 rounded-lg text-xs">
              <SelectValue placeholder="Non attribué" />
            </SelectTrigger>
            <SelectContent className={METHOD_OVERLAY_POPOVER_Z}>
              <SelectItem value="_none">Non attribué</SelectItem>
              {members.map((x) => (
                <SelectItem key={x.id} value={x.id}>{x.you ? "Vous" : x.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <MemberAvatar member={members[0]} size={22} />
          <span className="text-xs font-bold text-foreground">Vous</span>
        </div>
      )}
    </div>
  );
}

function UserPlaceholder() {
  return <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-muted text-muted-foreground"><MethodIcon name="User" className="h-3 w-3" /></span>;
}

export function ToolRoleMatrix({ members = DEFAULT_LIB_MEMBERS, roles, setRoles }: ToolRoleMatrixProps) {
  const [showMenu, setShowMenu] = useState(false);
  const usedBase = roles.map((r) => r.baseId).filter(Boolean) as string[];
  const choices = ROLE_LIBRARY.filter((l) => !usedBase.includes(l.id));

  const assign = (id: string, mid: string | null) =>
    setRoles(roles.map((r) => (r.id === id ? { ...r, member: mid } : r)));
  const remove = (id: string) => setRoles(roles.filter((r) => r.id !== id));
  const addRole = (lib: (typeof ROLE_LIBRARY)[0]) => {
    setRoles([
      ...roles,
      { id: `r${Date.now()}`, baseId: lib.id, title: lib.title, icon: lib.icon, member: null },
    ]);
    setShowMenu(false);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {roles.map((r) => (
        <RoleCard
          key={r.id}
          role={r}
          members={members}
          onAssign={(mid) => assign(r.id, mid)}
          onRemove={() => remove(r.id)}
        />
      ))}
      <div className="relative rounded-2xl border border-dashed bg-muted/20 p-4">
        <button
          type="button"
          onClick={() => setShowMenu((o) => !o)}
          className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 text-primary"
        >
          <Plus className="h-6 w-6" />
          <span className="font-bold">Ajouter un rôle</span>
          <span className="text-xs text-muted-foreground">Depuis la bibliothèque</span>
        </button>
        {showMenu && (
          <>
            <button type="button" className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border bg-popover p-2 shadow-xl">
              {choices.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => addRole(l)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-muted"
                >
                  <MethodIcon name={l.icon} className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{l.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{l.desc}</p>
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setRoles([...roles, { id: `r${Date.now()}`, title: "Nouveau rôle", icon: "Star", member: null }]);
                  setShowMenu(false);
                }}
                className="mt-1 w-full rounded-lg border-t px-2 py-2 text-left text-sm font-bold hover:bg-muted"
              >
                Rôle personnalisé…
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
