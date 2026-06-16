"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PAL, PAL_BG, PROJECT_UNIVERSES, type ProjectTypeId } from "@/lib/wizard/project-types";

interface RecoOption {
  id: string;
  title: string;
  desc?: string;
}

interface WizardRecoModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (id: ProjectTypeId) => void;
  onAccept?: (id: string) => void;
  title?: string;
  description?: string;
  options?: RecoOption[];
}

export function WizardRecoModal({
  open,
  onClose,
  onSelect,
  onAccept,
  title,
  description,
  options,
}: WizardRecoModalProps) {
  const isGeneric = Boolean(options?.length);

  const handlePick = (id: string) => {
    if (onAccept) onAccept(id);
    else if (onSelect) onSelect(id as ProjectTypeId);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title ?? "Quel univers vous correspond ?"}</DialogTitle>
          <DialogDescription>
            {description ??
              "Choisissez le contexte qui décrit le mieux votre projet. Vous pourrez ajuster plus tard."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {isGeneric
            ? options!.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => handlePick(o.id)}
                  className="rounded-xl border p-3 text-left transition-colors hover:border-primary/40"
                >
                  <div className="font-bold text-sm">{o.title}</div>
                  {o.desc && <div className="text-xs text-muted-foreground mt-0.5">{o.desc}</div>}
                </button>
              ))
            : PROJECT_UNIVERSES.map((u) => {
                const Icon = u.icon;
                const fg = PAL[u.color];
                const bg = PAL_BG[u.color];
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handlePick(u.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-primary/40",
                    )}
                    style={{ borderColor: `${fg}40`, background: bg }}
                  >
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: bg, color: fg }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm">{u.title}</div>
                      <div className="text-xs text-muted-foreground">{u.desc}</div>
                    </div>
                  </button>
                );
              })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
