"use client";

import { X } from "lucide-react";
import { METHOD_BY_ID } from "@/lib/methods/catalog";

export function WizardMethodFooterSummary({
  methods,
  targetMin,
  onRemove,
}: {
  methods: string[];
  targetMin: number;
  onRemove: (id: string) => void;
}) {
  const seqTotal = methods.reduce((s, id) => s + (METHOD_BY_ID[id]?.est ?? 0), 0);
  const duration = Math.round(seqTotal / 5) * 5 || targetMin;

  return (
    <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <span className="shrink-0 text-sm font-bold">
        {methods.length} méthode{methods.length > 1 ? "s" : ""}
        <span className="font-normal text-muted-foreground"> · ~ {duration} min</span>
      </span>
      {methods.length > 0 && (
        <div className="flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto sm:flex-wrap sm:overflow-visible">
          {methods.map((id) => (
            <span
              key={id}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary"
            >
              {METHOD_BY_ID[id]?.title ?? id}
              <button
                type="button"
                onClick={() => onRemove(id)}
                aria-label={`Retirer ${METHOD_BY_ID[id]?.title ?? id}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
