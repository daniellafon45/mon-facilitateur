"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ProjectRowActionsMenu({
  actions,
  onAction,
}: {
  actions: readonly { id: string; icon: string; label: string; danger?: boolean }[];
  onAction: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center justify-center rounded-lg px-2 text-sm font-medium text-slate-600 hover:bg-muted"
          title="Plus d'actions"
        >
          Plus
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="min-w-[178px] rounded-[11px] p-1">
        {actions.map((a) => (
          <DropdownMenuItem
            key={a.id}
            className={cn(
              "cursor-pointer rounded-lg px-2.5 py-2 text-[13px] font-semibold",
              a.danger && "text-red-600 focus:bg-red-50 focus:text-red-600",
            )}
            onClick={() => onAction(a.id)}
          >
            {a.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
