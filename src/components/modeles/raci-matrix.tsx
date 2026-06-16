"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RACI_CYCLE,
  RACI_LEGEND,
  RACI_TASKS,
  type LibMember,
} from "@/lib/methods/tool-constants";
import { MemberAvatar } from "@/components/modeles/method-icon";
import { Button } from "@/components/ui/button";

function raciStyle(k: string) {
  const m = RACI_LEGEND.find((l) => l.k === k);
  return m
    ? { color: m.c, background: m.bg, border: `1px solid ${m.c}22` }
    : { color: "#94a3b8", background: "transparent", border: "1px dashed #cbd5e1" };
}

interface RaciMatrixProps {
  members: LibMember[];
  raci: Record<string, Record<string, string>>;
  setRaci: (r: Record<string, Record<string, string>>) => void;
}

export function RaciMatrix({ members, raci, setRaci }: RaciMatrixProps) {
  const cycle = (taskId: string, memberId: string) => {
    const cur = raci[taskId]?.[memberId] || "";
    const nextK = RACI_CYCLE[(RACI_CYCLE.indexOf(cur) + 1) % RACI_CYCLE.length];
    const nextRow = { ...raci[taskId] };
    if (nextK) nextRow[memberId] = nextK;
    else delete nextRow[memberId];
    setRaci({ ...raci, [taskId]: nextRow });
  };

  const accountableCount = (taskId: string) =>
    Object.values(raci[taskId] || {}).filter((v) => v === "A").length;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="font-extrabold">Matrice RACI — qui fait quoi</p>
          <p className="text-xs text-muted-foreground">
            Cliquez une cellule : Réalise → Approuve → Consulté → Informé → vide. Chaque tâche doit avoir un « A ».
          </p>
        </div>
        <Button variant="secondary" size="sm" className="rounded-xl">
          <Download className="mr-1 h-4 w-4" /> Télécharger
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Tâche / livrable
              </th>
              {members.map((m) => (
                <th key={m.id} className="px-3 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <MemberAvatar member={m} size={30} />
                    <span className="text-xs font-bold">{m.you ? "Vous" : m.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RACI_TASKS.map((t) => {
              const ac = accountableCount(t.id);
              return (
                <tr key={t.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 font-semibold">
                    <span className="flex items-center gap-2">
                      {t.label}
                      {ac !== 1 && (
                        <span className="text-amber-600" title="Chaque tâche doit avoir exactement un Approuve">!</span>
                      )}
                    </span>
                  </td>
                  {members.map((m) => {
                    const k = raci[t.id]?.[m.id] || "";
                    return (
                      <td key={m.id} className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => cycle(t.id, m.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold transition-transform hover:scale-105"
                          style={raciStyle(k)}
                        >
                          {k || "+"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 border-t bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {RACI_LEGEND.map((l) => (
          <div key={l.k} className="flex items-start gap-2">
            <span
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-extrabold"
              style={{ color: l.c, background: l.bg, border: `1px solid ${l.c}22` }}
            >
              {l.k}
            </span>
            <div>
              <p className="text-sm font-bold">{l.label}</p>
              <p className="text-xs text-muted-foreground">{l.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
