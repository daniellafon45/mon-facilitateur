"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useFacilitationStore } from "@/lib/store/facilitation-store";

export function TeamSavedTeamsPanel({
  onAddTeam,
  defaultOpen = false,
}: {
  onAddTeam: (teamId: string) => void;
  defaultOpen?: boolean;
}) {
  const teams = useFacilitationStore((s) => s.teams);
  const contacts = useFacilitationStore((s) => s.contacts);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  if (teams.length === 0) return null;

  return (
    <div className="border-t px-4 py-3">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <p className="font-extrabold text-sm">Équipes enregistrées</p>
          <p className="text-xs text-muted-foreground">Ajoutez un groupe en un clic.</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {teams.map((t) => {
            const count = t.memberIds.filter((id) => contacts.some((c) => c.id === id)).length;
            return (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{count} membres</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-violet-700"
                  onClick={() => onAddTeam(t.id)}
                >
                  Ajouter
                </button>
              </div>
            );
          })}
          <Link
            href="/dashboard/dreamteam"
            className="inline-flex items-center gap-1 text-xs font-bold text-violet-700"
          >
            Voir toutes les équipes <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
