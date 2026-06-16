"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Pencil, Plus, Users, X, Zap } from "lucide-react";
import type { ProjectMember } from "@/lib/project/registry-types";
import { ESSENTIAL_ROLES } from "@/lib/project/team-constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ICONS = {
  Users,
  Pencil,
  Clock,
  Zap,
} as const;

export function TeamRolesPanel({
  members,
  roleAssign,
  onRoleAssignChange,
}: {
  members: ProjectMember[];
  roleAssign: Record<string, string>;
  onRoleAssignChange: (next: Record<string, string>) => void;
}) {
  const [customRoles, setCustomRoles] = useState<
    { id: string; label: string; color: string }[]
  >([]);

  const allRoles = [
    ...ESSENTIAL_ROLES,
    ...customRoles.map((r) => ({
      id: r.id,
      icon: "Zap" as const,
      color: r.color,
      label: r.label,
      custom: true,
    })),
  ];

  const setRole = (roleId: string, memberId: string) => {
    onRoleAssignChange({ ...roleAssign, [roleId]: memberId });
  };

  const addRole = () => {
    const id = `role${Date.now()}`;
    setCustomRoles((rs) => [
      ...rs,
      { id, label: "Nouveau rôle", color: "#7c3aed" },
    ]);
    if (members[0]) setRole(id, members[0].id);
  };

  const removeRole = (id: string) => {
    setCustomRoles((rs) => rs.filter((r) => r.id !== id));
    const next = { ...roleAssign };
    delete next[id];
    onRoleAssignChange(next);
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="border-b px-4 py-3.5">
        <h3 className="font-extrabold">Rôles essentiels</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Assignez les rôles clés de la rencontre.
        </p>
      </div>

      <div className="space-y-2 p-4">
        {allRoles.map((r) => {
          const Icon = ICONS[r.icon];
          const isCustom = "custom" in r && r.custom;
          return (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-xl border bg-slate-50 px-3 py-2.5"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${r.color}22`, color: r.color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              {isCustom ? (
                <Input
                  value={r.label}
                  onChange={(e) =>
                    setCustomRoles((roles) =>
                      roles.map((cr) =>
                        cr.id === r.id ? { ...cr, label: e.target.value } : cr,
                      ),
                    )
                  }
                  className="h-8 flex-1 border-transparent bg-transparent font-bold shadow-none"
                />
              ) : (
                <span className="flex-1 text-sm font-bold">{r.label}</span>
              )}
              <Select
                value={roleAssign[r.id] ?? "_none"}
                onValueChange={(v) => setRole(r.id, v === "_none" ? "" : v)}
              >
                <SelectTrigger className="h-8 w-[130px] text-xs font-semibold">
                  <SelectValue placeholder="Non assigné" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Non assigné</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isCustom ? (
                <button
                  type="button"
                  className="text-slate-400 hover:text-red-500"
                  onClick={() => removeRole(r.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <CheckCircle2
                  className={
                    roleAssign[r.id] && roleAssign[r.id] !== "_none"
                      ? "h-5 w-5 text-emerald-500"
                      : "h-5 w-5 text-slate-300"
                  }
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 pb-4">
        <Button type="button" variant="ghost" size="sm" className="w-full" onClick={addRole}>
          <Plus className="mr-1 h-4 w-4" />
          Ajouter un rôle
        </Button>
      </div>
    </div>
  );
}

export function inferRoleAssignFromMembers(
  members: ProjectMember[],
  existing: Record<string, string> = {},
): Record<string, string> {
  const next = { ...existing };
  for (const role of ESSENTIAL_ROLES) {
    if (next[role.id]) continue;
    const match = members.find(
      (m) =>
        m.meetingRole === role.meetingRoleMatch ||
        m.meetingRole === role.label ||
        m.meetingRole === `${role.label}e`,
    );
    if (match) next[role.id] = match.id;
  }
  return next;
}
