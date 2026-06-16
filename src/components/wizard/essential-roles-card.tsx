"use client";

import { useState } from "react";
import { CheckCircle, Plus, X } from "lucide-react";
import type { WizardMember } from "@/types/facilitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DEFAULT_ROLES = [
  { key: "facilitateur", label: "Facilitateur" },
  { key: "scribe", label: "Scribe" },
  { key: "minuteur", label: "Minuteur" },
  { key: "chef", label: "Chef de projet" },
];

export function EssentialRolesCard({
  members,
  roleAssign,
  onChange,
}: {
  members: WizardMember[];
  roleAssign: Record<string, string>;
  onChange: (assign: Record<string, string>) => void;
}) {
  const [customRoles, setCustomRoles] = useState<{ key: string; label: string }[]>([]);
  const [newRoleName, setNewRoleName] = useState("");

  const allRoles = [...DEFAULT_ROLES, ...customRoles];

  const addCustomRole = () => {
    const label = newRoleName.trim();
    if (!label) return;
    const key = `custom_${Date.now()}`;
    setCustomRoles((r) => [...r, { key, label }]);
    setNewRoleName("");
  };

  const removeCustom = (key: string) => {
    setCustomRoles((r) => r.filter((x) => x.key !== key));
    const next = { ...roleAssign };
    delete next[key];
    onChange(next);
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <h3 className="font-extrabold">Rôles essentiels</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Assignez les rôles clés pour une rencontre efficace.
      </p>
      <div className="mt-4 space-y-3">
        {allRoles.map((role) => {
          const assigned = roleAssign[role.key];
          const member = members.find((m) => m.id === assigned);
          return (
            <div key={role.key} className="flex flex-wrap items-center gap-2">
              <span className="min-w-[120px] text-sm font-bold">{role.label}</span>
              <select
                value={assigned ?? ""}
                onChange={(e) => onChange({ ...roleAssign, [role.key]: e.target.value })}
                className="flex-1 min-w-[160px] rounded-lg border px-3 py-2 text-sm font-semibold"
              >
                <option value="">Non assigné</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {member && (
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
              {role.key.startsWith("custom_") && (
                <button
                  type="button"
                  onClick={() => removeCustom(role.key)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="Nouveau rôle…"
          className="max-w-xs text-sm"
          onKeyDown={(e) => e.key === "Enter" && addCustomRole()}
        />
        <Button type="button" variant="outline" size="sm" onClick={addCustomRole}>
          <Plus className="mr-1 h-4 w-4" /> Ajouter un rôle
        </Button>
      </div>
    </div>
  );
}

export function isFacilitatorAssigned(roleAssign: Record<string, string>): boolean {
  return Boolean(roleAssign.facilitateur);
}

export function isScribeAssigned(roleAssign: Record<string, string>): boolean {
  return Boolean(roleAssign.scribe);
}
