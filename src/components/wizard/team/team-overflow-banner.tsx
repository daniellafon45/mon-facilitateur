"use client";

import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TeamOverflowBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
      <Info className="h-5 w-5 shrink-0 text-orange-500" />
      <p className="flex-1 text-sm font-semibold text-orange-900">
        Votre équipe dépasse la règle des deux pizzas. Amaris recommande de créer des sous-groupes
        ou de passer en Grand atelier.
      </p>
      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onDismiss}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
