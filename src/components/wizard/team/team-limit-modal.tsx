"use client";

import { useEffect, useState } from "react";
import { Check, Sliders } from "lucide-react";
import type { ProjectMember } from "@/lib/project/registry-types";
import { PIZZA_MAX } from "@/lib/project/team-constants";
import { defaultLimitRemovalIds } from "@/lib/project/subgroups";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function TeamLimitModal({
  open,
  members,
  onClose,
  onConfirm,
}: {
  open: boolean;
  members: ProjectMember[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}) {
  const [toRemove, setToRemove] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setToRemove(defaultLimitRemovalIds(members.map((m) => m.id)));
    }
  }, [open, members]);

  const keptCount = members.length - toRemove.length;
  const over = keptCount > PIZZA_MAX;

  const toggle = (id: string) => {
    setToRemove((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Limiter les participants actifs</DialogTitle>
              <DialogDescription className="mt-1">
                Sélectionnez les personnes à <strong>retirer</strong>. La règle des deux pizzas
                recommande au plus {PIZZA_MAX} participants actifs.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[50vh] overflow-y-auto px-4 py-3">
          {members.map((m, i) => {
            const rm = toRemove.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                className={cn(
                  "mb-2 flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                  rm ? "border-red-200 bg-red-50" : "border-slate-200 bg-white hover:bg-slate-50",
                )}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                  style={{ background: m.color }}
                >
                  {m.displayName.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "flex items-center gap-2 text-sm font-bold",
                      rm && "text-slate-500 line-through",
                    )}
                  >
                    {m.displayName}
                    {i < PIZZA_MAX && !rm && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Actif
                      </span>
                    )}
                  </div>
                  {m.email && (
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  )}
                </div>
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs font-bold",
                    rm ? "text-red-600" : "text-slate-400",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border",
                      rm && "border-red-600 bg-red-600 text-white",
                    )}
                  >
                    {rm && <Check className="h-3 w-3" />}
                  </span>
                  Retirer
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter className="border-t bg-slate-50 px-5 py-3 sm:justify-between">
          <span
            className={cn(
              "text-sm font-bold",
              over ? "text-orange-700" : "text-emerald-700",
            )}
          >
            {keptCount} participant{keptCount > 1 ? "s" : ""} conservé
            {keptCount > 1 ? "s" : ""}
            {over ? ` · encore au-dessus de ${PIZZA_MAX}` : " ✓"}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={toRemove.length === 0}
              onClick={() => onConfirm(toRemove)}
            >
              <Check className="mr-1 h-4 w-4" />
              Retirer {toRemove.length || ""}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
