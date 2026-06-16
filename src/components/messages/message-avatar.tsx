"use client";

import { Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { msgInitials } from "@/lib/messages/constants";
import type { ConvoKind } from "@/lib/messages/types";

interface MessageAvatarProps {
  kind: ConvoKind;
  name: string;
  color: string;
  size?: number;
  className?: string;
}

export function MessageAvatar({ kind, name, color, size = 42, className }: MessageAvatarProps) {
  const rounded = kind === "dm" ? "rounded-full" : "rounded-xl";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-extrabold text-white shadow-sm",
        rounded,
        className,
      )}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: kind === "dm" ? size * 0.36 : undefined,
      }}
      aria-hidden
    >
      {kind === "dm" ? (
        msgInitials(name)
      ) : kind === "atelier" ? (
        <Sparkles style={{ width: size * 0.45, height: size * 0.45 }} />
      ) : (
        <Users style={{ width: size * 0.45, height: size * 0.45 }} />
      )}
    </span>
  );
}
