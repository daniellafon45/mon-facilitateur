"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { dtAvatarColor, dtInitials } from "@/lib/dreamteam/constants";

interface DreamTeamAvatarProps {
  name: string;
  index?: number;
  size?: number;
  avatarUrl?: string;
  className?: string;
}

export function DreamTeamAvatar({
  name,
  index = 0,
  size = 42,
  avatarUrl,
  className,
}: DreamTeamAvatarProps) {
  const color = dtAvatarColor(name, index);

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        unoptimized
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.36,
      }}
      aria-hidden
    >
      {dtInitials(name)}
    </span>
  );
}
