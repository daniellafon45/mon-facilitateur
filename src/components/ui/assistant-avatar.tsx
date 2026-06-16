"use client";

import { cn } from "@/lib/utils";

interface AssistantAvatarProps {
  /** Animation plus rapide quand l’assistant réfléchit */
  active?: boolean;
  className?: string;
  sizeClassName?: string;
}

export function AssistantAvatar({
  active = false,
  className,
  sizeClassName = "h-7 w-7 sm:h-8 sm:w-8",
}: AssistantAvatarProps) {
  return (
    <div
      className={cn("relative shrink-0", sizeClassName, className)}
      aria-hidden
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full bg-orange-400/35",
          active ? "animate-assistant-avatar-glow-fast" : "animate-assistant-avatar-glow",
        )}
      />
      <span
        className={cn(
          "absolute inset-0 rounded-full bg-orange-400/25",
          active ? "animate-assistant-avatar-ring-fast" : "animate-assistant-avatar-ring",
        )}
      />
      <div
        className={cn(
          "relative h-full w-full rounded-full",
          "bg-gradient-to-br from-orange-200 via-orange-400 to-amber-500",
          "shadow-[inset_0_-2px_6px_rgba(255,255,255,0.45),inset_0_2px_4px_rgba(234,88,12,0.25)]",
          active ? "animate-assistant-avatar-breathe-fast" : "animate-assistant-avatar-breathe",
        )}
      >
        <div className="absolute inset-[22%] rounded-full bg-white/25 blur-[1px]" />
      </div>
    </div>
  );
}
