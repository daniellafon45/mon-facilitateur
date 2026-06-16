"use client";

import { DashboardThemePicker } from "@/components/dashboard/dashboard-theme-picker";
import { ChatShaderBackground } from "@/components/dashboard/dashboard-shader-background";
import { SessionPromptChat } from "@/components/ui/session-prompt-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDashboardTheme } from "@/lib/data/dashboard-themes";
import { useDashboardThemeStore } from "@/lib/store/dashboard-theme-store";
import { cn } from "@/lib/utils";

/** Même dégradé que la carte Boutique (Apprendre). */
export const CHAT_AI_GRADIENT = "bg-gradient-to-br from-[#1e3a8a] to-[#0f1f4d]";

interface AssistantIaCardProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  modes: { label: string; mode: "solo" | "equipe" | "atelier" }[];
  onModeSelect: (mode: "solo" | "equipe" | "atelier") => void;
}

export function AssistantIaCard({
  prompt,
  onPromptChange,
  onSubmit,
  modes,
  onModeSelect,
}: AssistantIaCardProps) {
  const dashboardThemeId = useDashboardThemeStore((s) => s.themeId);
  const dashboardTheme = getDashboardTheme(dashboardThemeId);
  const hasShader = dashboardTheme !== null;
  const darkHero = hasShader && dashboardTheme.appearance === "dark";

  return (
    <Card className="overflow-hidden rounded-3xl border-0 shadow-sm">
      <div
        className={cn(
          "relative overflow-hidden p-6 lg:p-8",
          hasShader ? "border-b border-white/20" : cn("text-white", CHAT_AI_GRADIENT),
        )}
      >
        {hasShader && <ChatShaderBackground />}
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge
              variant="secondary"
              className={cn(
                "mb-3",
                hasShader
                  ? darkHero
                    ? "border-white/20 bg-white/15 text-white hover:bg-white/20"
                    : "border-foreground/15 bg-foreground/5 text-foreground hover:bg-foreground/10"
                  : "border-white/20 bg-white/15 text-white hover:bg-white/20",
              )}
            >
              Assistant IA
            </Badge>
            <h2
              className={cn(
                "text-xl font-bold tracking-tight sm:text-2xl",
                hasShader ? (darkHero ? "text-white" : "text-foreground") : "text-white",
              )}
            >
              Décrivez votre session
            </h2>
            <p
              className={cn(
                "mt-2 max-w-lg text-sm leading-relaxed",
                hasShader
                  ? darkHero
                    ? "text-white/75"
                    : "text-foreground/70"
                  : "text-white/75",
              )}
            >
              L&apos;assistant propose en 2 clics le format, le type de projet et les méthodes adaptées.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
            <div className={hasShader ? (darkHero ? "text-white" : "text-foreground") : "text-white"}>
              <DashboardThemePicker />
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {modes.map((m) => (
                <Button
                  key={m.mode}
                  variant="outline"
                  size="sm"
                  onClick={() => onModeSelect(m.mode)}
                  className={cn(
                    hasShader
                      ? darkHero
                        ? "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                        : "border-foreground/20 bg-background/60 text-foreground hover:bg-background"
                      : "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white",
                  )}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200/80 bg-white p-6 lg:p-8">
        <SessionPromptChat
          prompt={prompt}
          onPromptChange={onPromptChange}
          onSubmit={onSubmit}
          submitLabel="Lancer l'assistant"
          inputTestId="assistant-input"
          variant="chat-preview"
        />
      </div>
    </Card>
  );
}
