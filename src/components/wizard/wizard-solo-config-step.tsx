"use client";

import { useState } from "react";
import { Link2, Music, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { WizardSoloMusic } from "@/types/facilitation";

const MUSIC_SOURCES = [
  { id: "youtube" as const, label: "YouTube", color: "text-red-600" },
  { id: "spotify" as const, label: "Spotify", color: "text-emerald-600" },
  { id: "other" as const, label: "Autre", icon: Link2 },
  { id: "ambiance" as const, label: "Ambiances", color: "text-violet-600" },
  { id: "none" as const, label: "Aucune", icon: X },
];

const AMBIANCES = [
  { id: "white", label: "Bruit blanc" },
  { id: "rain", label: "Pluie" },
  { id: "waves", label: "Vagues" },
  { id: "wind", label: "Vent" },
  { id: "forest", label: "Forêt" },
];

const EXTERNAL_TOOLS = [
  { id: "chatgpt", label: "ChatGPT", color: "bg-emerald-100 text-emerald-700" },
  { id: "claude", label: "Claude", color: "bg-orange-100 text-orange-700" },
  { id: "canva", label: "Canva", color: "bg-violet-100 text-violet-700" },
  { id: "figma", label: "Figma", color: "bg-rose-100 text-rose-700" },
  { id: "gdocs", label: "Google Docs", color: "bg-blue-100 text-blue-700" },
  { id: "youtube", label: "YouTube", color: "bg-red-100 text-red-700" },
  { id: "miro", label: "Miro", color: "bg-amber-100 text-amber-700" },
];

export function WizardSoloConfigStep({
  music,
  tools,
  onMusicChange,
  onToolsChange,
}: {
  music: WizardSoloMusic | null;
  tools: string[];
  onMusicChange: (m: WizardSoloMusic | null) => void;
  onToolsChange: (tools: string[]) => void;
}) {
  const [link, setLink] = useState(music?.url ?? "");
  const source = music?.source ?? "youtube";

  const toggleTool = (id: string) => {
    onToolsChange(tools.includes(id) ? tools.filter((t) => t !== id) : [...tools, id]);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
          Musique / ambiance
        </h2>
        <p className="text-sm text-muted-foreground">Choisissez votre source et collez le lien de votre playlist.</p>
        <div className="flex flex-wrap gap-2">
          {MUSIC_SOURCES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onMusicChange({ source: s.id, url: link })}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-bold transition-colors",
                source === s.id ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/30",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        {source === "ambiance" ? (
          <div className="flex flex-wrap gap-2">
            {AMBIANCES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onMusicChange({ source: "ambiance", ambianceId: a.id })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-bold",
                  music?.ambianceId === a.id ? "border-primary bg-primary/10" : "",
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        ) : source !== "none" ? (
          <div className="relative">
            <Music className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                onMusicChange({ source, url: e.target.value });
              }}
              placeholder={`Coller le lien de votre playlist ${source === "youtube" ? "YouTube" : source === "spotify" ? "Spotify" : ""}…`}
              className="pl-9"
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
          <Link2 className="h-3.5 w-3.5" />
          Outils externes à ouvrir
        </h2>
        <p className="text-sm text-muted-foreground">Ces outils sont des raccourcis. Amaris ne les remplace pas.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {EXTERNAL_TOOLS.map((t) => {
            const on = tools.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTool(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                  on ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "hover:border-primary/30",
                )}
              >
                <span className={cn("rounded-lg px-2 py-1 text-xs font-extrabold", t.color)}>{t.label[0]}</span>
                <span className="text-sm font-bold">{t.label}</span>
                {on && (
                  <Button type="button" variant="outline" size="sm" className="h-7 rounded-lg text-xs">
                    Ouvrir
                  </Button>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
