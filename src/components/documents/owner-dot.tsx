"use client";

import { DOC_OWNERS } from "@/lib/documents/constants";

interface OwnerDotProps {
  owner: string;
  size?: number;
  showName?: boolean;
}

export function OwnerDot({ owner, size = 26, showName = true }: OwnerDotProps) {
  const o = DOC_OWNERS[owner] || { name: owner, color: "#94a3b8" };
  const dot = (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{
        width: size,
        height: size,
        background: o.color,
        fontSize: size * 0.38,
      }}
    >
      {owner.slice(0, 2)}
    </span>
  );
  if (!showName) return dot;
  return (
    <span className="inline-flex items-center gap-2">
      {dot}
      <span className="font-semibold text-foreground/80">{o.name}</span>
    </span>
  );
}
