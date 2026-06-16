"use client";

import { AssistantAvatar } from "@/components/ui/assistant-avatar";
import { cn } from "@/lib/utils";

interface AssistantIaHeaderButtonProps {
  onClick: () => void;
  className?: string;
}

export function AssistantIaHeaderButton({ onClick, className }: AssistantIaHeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Assistant IA"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full border-0 bg-transparent p-0.5",
        "cursor-pointer transition-opacity hover:opacity-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 focus-visible:ring-offset-2",
        className,
      )}
    >
      <AssistantAvatar className="h-9 w-9 sm:h-10 sm:w-10" sizeClassName="h-full w-full" />
      <span className="hidden pr-0.5 text-sm font-semibold text-foreground sm:inline">
        Assistant IA
      </span>
    </button>
  );
}
