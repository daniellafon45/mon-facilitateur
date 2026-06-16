"use client";

import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { docTypeColor } from "@/lib/documents/constants";

interface DocBadgeProps {
  type?: string;
  size?: number;
  className?: string;
}

export function DocBadge({ type, size = 34, className }: DocBadgeProps) {
  const c = docTypeColor(type);
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-lg", className)}
      style={{
        width: size,
        height: size,
        background: `${c}1f`,
        color: c,
      }}
    >
      {type ? (
        <span
          className="font-extrabold tracking-wide"
          style={{ fontSize: type.length > 4 ? 8 : 9.5 }}
        >
          {type}
        </span>
      ) : (
        <Folder style={{ width: size * 0.5, height: size * 0.5 }} />
      )}
    </div>
  );
}
