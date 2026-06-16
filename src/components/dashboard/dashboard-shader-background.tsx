"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { getDashboardTheme } from "@/lib/data/dashboard-themes";
import { useDashboardThemeStore } from "@/lib/store/dashboard-theme-store";

const ShaderGradientCanvas = dynamic(
  () => import("@shadergradient/react").then((mod) => mod.ShaderGradientCanvas),
  { ssr: false },
);

const ShaderGradient = dynamic(
  () => import("@shadergradient/react").then((mod) => mod.ShaderGradient),
  { ssr: false },
);

interface ChatShaderBackgroundProps {
  className?: string;
}

export function ChatShaderBackground({ className }: ChatShaderBackgroundProps) {
  const themeId = useDashboardThemeStore((s) => s.themeId);
  const theme = getDashboardTheme(themeId);

  if (!theme) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <ShaderGradientCanvas
        style={{ width: "100%", height: "100%" }}
        pixelDensity={1}
        fov={45}
        pointerEvents="none"
      >
        <ShaderGradient key={themeId ?? "default"} control="props" {...theme.shader} />
      </ShaderGradientCanvas>
      <div
        className={cn(
          "absolute inset-0",
          theme.appearance === "light" ? "bg-white/25" : "bg-black/15",
        )}
      />
    </div>
  );
}
