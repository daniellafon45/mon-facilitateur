"use client";

import { Calendar, Clock, Eye, Play, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SessionMode, WizardLaunchMode } from "@/types/facilitation";
import { agendaTotalMinutes, fmtAgendaDuration } from "@/lib/meetings/agenda-generator";
import type { MeetingAgendaBlock } from "@/types/facilitation";

const PLATFORMS = [
  { id: "meet", label: "Google Meet" },
  { id: "teams", label: "Microsoft Teams" },
  { id: "zoom", label: "Zoom" },
  { id: "presentiel", label: "Présentiel" },
  { id: "hybride", label: "Hybride" },
];

export function WizardInviteStep({
  mode,
  title,
  date,
  start,
  end,
  platform,
  link,
  launchMode,
  agendaPlan,
  onChange,
  onSaveDraft,
}: {
  mode: SessionMode | null;
  title: string;
  date: string;
  start: string;
  end: string;
  platform: string;
  link: string;
  launchMode: WizardLaunchMode;
  agendaPlan: MeetingAgendaBlock[];
  onChange: (patch: {
    meetingTitle?: string;
    meetingDate?: string;
    meetingStart?: string;
    meetingEnd?: string;
    meetingPlatform?: string;
    meetingLink?: string;
    launchMode?: WizardLaunchMode;
  }) => void;
  onSaveDraft: () => void;
}) {
  const isSolo = mode === "solo";
  const total = agendaTotalMinutes(agendaPlan);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Lancer ma session</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirmez le titre, puis lancez maintenant ou programmez votre session pour plus tard.
        </p>
      </div>

      <div className="rounded-2xl border bg-background p-5 space-y-4">
        <h2 className="font-extrabold">Détails de la rencontre</h2>
        <div>
          <label className="text-xs font-bold text-muted-foreground">Titre de la rencontre</label>
          <Input
            value={title}
            onChange={(e) => onChange({ meetingTitle: e.target.value })}
            className="mt-1"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="text-xs font-bold text-muted-foreground">Date</label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={date}
                onChange={(e) => onChange({ meetingDate: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">Heure de début</label>
            <div className="relative mt-1">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="time"
                value={start}
                onChange={(e) => onChange({ meetingStart: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground">Heure de fin</label>
            <div className="relative mt-1">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="time"
                value={end}
                onChange={(e) => onChange({ meetingEnd: e.target.value })}
                className="pl-9"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{fmtAgendaDuration(total)}</p>
          </div>
        </div>
        {!isSolo && (
          <>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Plateforme</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange({ meetingPlatform: p.id })}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-bold",
                      platform === p.id ? "border-primary bg-primary/10 text-primary" : "",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground">Lien de la réunion</label>
              <Input
                value={link}
                onChange={(e) => onChange({ meetingLink: e.target.value })}
                placeholder="https://…"
                className="mt-1"
              />
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border bg-background p-5 space-y-4">
        <h2 className="font-extrabold">Comment souhaitez-vous lancer la séance ?</h2>
        <p className="text-sm text-muted-foreground">Choisissez l&apos;option qui correspond à votre besoin.</p>
        <div className={cn("grid gap-3", isSolo ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
          <LaunchCard
            icon={Play}
            title="Lancer maintenant"
            desc="Ouvre la séance immédiatement après confirmation."
            on={launchMode === "now"}
            onClick={() => onChange({ launchMode: "now" })}
          />
          <LaunchCard
            icon={Calendar}
            title="Programmer pour plus tard"
            desc="La séance est planifiée avec rappel avant la date."
            on={launchMode === "schedule"}
            onClick={() => onChange({ launchMode: "schedule" })}
          />
          {!isSolo && (
            <LaunchCard
              icon={Eye}
              title="Simuler la rencontre"
              desc="Parcourez la séance seul — aucun participant n'est notifié."
              on={launchMode === "simulate"}
              onClick={() => onChange({ launchMode: "simulate" })}
              violet
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4" />
        Votre plan de travail est prêt à démarrer.
      </div>

      <Button type="button" variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={onSaveDraft}>
        <Save className="h-4 w-4" />
        Enregistrer le brouillon
      </Button>
    </div>
  );
}

function LaunchCard({
  icon: Icon,
  title,
  desc,
  on,
  onClick,
  violet,
}: {
  icon: typeof Play;
  title: string;
  desc: string;
  on: boolean;
  onClick: () => void;
  violet?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border p-4 text-left transition-colors",
        on && (violet ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" : "border-primary bg-primary/5 ring-2 ring-primary/20"),
      )}
    >
      <Icon className={cn("h-8 w-8", violet ? "text-violet-600" : "text-primary")} />
      <p className="mt-3 font-extrabold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </button>
  );
}

export function InvitePreviewPanel({
  title,
  agendaPlan,
}: {
  title: string;
  agendaPlan: MeetingAgendaBlock[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-extrabold">Aperçu de l&apos;invitation</h3>
      <p className="text-xs font-bold text-muted-foreground">{title}</p>
      <ol className="space-y-2">
        {agendaPlan.map((b, i) => (
          <li key={b.id} className="flex gap-2 text-xs">
            <span className="font-bold text-muted-foreground">{i + 1}.</span>
            <span>
              {b.title}
              {b.min ? ` · ${b.min} min` : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
