"use client";

import { useState } from "react";
import { Calendar, Clock, Layers, Save, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWizardStore } from "@/lib/store/wizard-store";
import { getWizardIllustration, getWizardIllustrationFallback } from "@/lib/wizard/wizard-images";
import { WizardImageSelectCard } from "@/components/wizard/wizard-image-select-card";
import { TeamMembersTable } from "@/components/wizard/team-members-table";
import type { SessionMode, WizardLaunchMode, WizardMember, WizardConfirmedGroup } from "@/types/facilitation";
import { agendaTotalMinutes, fmtAgendaDuration } from "@/lib/meetings/agenda-generator";
import type { MeetingAgendaBlock } from "@/types/facilitation";
import { formatFrDate } from "@/lib/projets/constants";

const PLATFORMS: Record<string, string> = {
  meet: "Google Meet",
  teams: "Microsoft Teams",
  zoom: "Zoom",
  presentiel: "Présentiel",
  hybride: "Hybride",
};

const PLATFORMS_LIST = [
  { id: "meet", label: "Google Meet" },
  { id: "teams", label: "Microsoft Teams" },
  { id: "zoom", label: "Zoom" },
  { id: "presentiel", label: "Présentiel" },
  { id: "hybride", label: "Hybride" },
];

const LAUNCH_OPTIONS: {
  id: WizardLaunchMode;
  imageId: string;
  title: string;
  desc: string;
  soloOnly?: boolean;
  teamOnly?: boolean;
}[] = [
  {
    id: "now",
    imageId: "launch_now",
    title: "Lancer maintenant",
    desc: "Ouvre la séance immédiatement après confirmation.",
  },
  {
    id: "schedule",
    imageId: "launch_schedule",
    title: "Programmer pour plus tard",
    desc: "La séance est planifiée avec rappel avant la date.",
  },
  {
    id: "simulate",
    imageId: "launch_simulate",
    title: "Simuler la rencontre",
    desc: "Parcourez la séance seul — aucun participant n'est notifié.",
    teamOnly: true,
  },
];

const PERMISSION_OPTIONS = ["Peut modifier", "Peut commenter", "Lecture seule"];

export function WizardInviteStep({
  mode,
  title,
  date,
  start,
  end,
  platform,
  link,
  agendaPlan,
  members,
  confirmedGroups,
  inviteMode,
  onInviteModeChange,
  onMembersChange,
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
  agendaPlan: MeetingAgendaBlock[];
  members: WizardMember[];
  confirmedGroups?: WizardConfirmedGroup[] | null;
  inviteMode: "together" | "separate";
  onInviteModeChange: (mode: "together" | "separate") => void;
  onMembersChange: (members: WizardMember[]) => void;
  onChange: (patch: {
    meetingTitle?: string;
    meetingDate?: string;
    meetingStart?: string;
    meetingEnd?: string;
    meetingPlatform?: string;
    meetingLink?: string;
  }) => void;
  onSaveDraft: () => void;
}) {
  const launchMode = useWizardStore((s) => s.launchMode);
  const setLaunchMode = useWizardStore((s) => s.setLaunchMode);
  const [participantsOpen, setParticipantsOpen] = useState(true);
  const isSolo = mode === "solo";
  const total = agendaTotalMinutes(agendaPlan);
  const groups = confirmedGroups ?? [];
  const isAtelier = mode === "atelier" && groups.length > 0;

  const visibleLaunchOptions = LAUNCH_OPTIONS.filter((opt) => {
    if (isSolo && opt.teamOnly) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
          {isSolo ? "Lancer ma session" : "Préparer et inviter"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirmez les détails, puis lancez ou programmez votre rencontre.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border bg-background p-5">
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
                {PLATFORMS_LIST.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onChange({ meetingPlatform: p.id })}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-bold transition-colors",
                      platform === p.id ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/40",
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

      {!isSolo && (
        <div className="rounded-2xl border bg-background">
          <button
            type="button"
            className="flex w-full items-center justify-between p-5 text-left"
            onClick={() => setParticipantsOpen((v) => !v)}
          >
            <div className="flex items-center gap-2 font-extrabold">
              <Users className="h-4 w-4" />
              Participants ({members.length})
            </div>
            <span className="text-xs text-muted-foreground">{participantsOpen ? "Réduire" : "Afficher"}</span>
          </button>
          {participantsOpen && (
            <div className="border-t px-5 pb-5">
              <TeamMembersTable members={members} onChange={onMembersChange} />
            </div>
          )}
        </div>
      )}

      {isAtelier && (
        <div className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
          <div className="flex items-center gap-2 font-extrabold text-violet-800">
            <Layers className="h-4 w-4" />
            {groups.length} sous-groupes détectés
          </div>
          <p className="text-sm text-violet-900/80">Comment souhaitez-vous inviter les participants ?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onInviteModeChange("together")}
              className={cn(
                "rounded-xl border p-3 text-left text-sm font-semibold",
                inviteMode === "together" ? "border-violet-500 bg-white" : "hover:border-violet-300",
              )}
            >
              Tous les groupes ensemble
            </button>
            <button
              type="button"
              onClick={() => onInviteModeChange("separate")}
              className={cn(
                "rounded-xl border p-3 text-left text-sm font-semibold",
                inviteMode === "separate" ? "border-violet-500 bg-white" : "hover:border-violet-300",
              )}
            >
              Invitations séparées par groupe
            </button>
          </div>
          {inviteMode === "separate" && (
            <div className="space-y-2">
              {groups.map((g) => {
                const gm = members.filter((m) => g.memberIds.includes(m.id));
                return (
                  <div key={g.id} className="rounded-lg border bg-white p-3 text-sm">
                    <div className="font-bold">{g.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {gm.map((m) => m.name).join(", ") || "Aucun membre"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 rounded-2xl border bg-background p-5">
        <div>
          <h2 className="font-extrabold">Comment souhaitez-vous lancer la séance ?</h2>
          <p className="text-sm text-muted-foreground">Choisissez l&apos;option qui correspond à votre besoin.</p>
        </div>
        <div className={cn("grid gap-3", isSolo ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
          {visibleLaunchOptions.map((opt) => (
            <WizardImageSelectCard
              key={opt.id}
              testId={`launch-${opt.id}`}
              imageSrc={getWizardIllustration(opt.imageId)}
              imageFallbackSrc={getWizardIllustrationFallback(opt.imageId)}
              title={opt.title}
              tag="Lancement"
              metaLabel={opt.id === "now" ? "Immédiat" : opt.id === "schedule" ? "Planifié" : "Simulation"}
              description={opt.desc}
              selected={launchMode === opt.id}
              onClick={() => setLaunchMode(opt.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4" />
        {launchMode === "schedule"
          ? "La rencontre sera enregistrée et visible dans vos rencontres planifiées."
          : launchMode === "simulate"
            ? "Mode simulation : vous seul parcourez la séance, sans notification."
            : "Votre plan de travail est prêt à démarrer."}
      </div>

      <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={onSaveDraft}>
        <Save className="h-4 w-4" />
        Enregistrer le brouillon
      </Button>
    </div>
  );
}

export function InvitePreviewPanel({
  title,
  date,
  start,
  end,
  platform,
  agendaPlan,
  members,
  confirmedGroups,
  launchMode,
}: {
  title: string;
  date?: string;
  start?: string;
  end?: string;
  platform?: string;
  agendaPlan: MeetingAgendaBlock[];
  members?: WizardMember[];
  confirmedGroups?: WizardConfirmedGroup[] | null;
  launchMode?: WizardLaunchMode;
}) {
  const [editingAgenda, setEditingAgenda] = useState(false);
  const groups = confirmedGroups ?? [];

  return (
    <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
        Aperçu de l&apos;invitation
      </h3>
      <div>
        <p className="text-base font-extrabold">{title || "Sans titre"}</p>
        {date && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatFrDate(date)} · {start} — {end}
          </p>
        )}
        {platform && (
          <p className="text-xs font-semibold text-primary">{PLATFORMS[platform] ?? platform}</p>
        )}
      </div>
      {launchMode === "simulate" && (
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
          Mode simulation
        </div>
      )}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold uppercase tracking-wide">Ordre du jour</p>
          <button
            type="button"
            className="text-[10px] font-bold text-primary"
            onClick={() => setEditingAgenda((v) => !v)}
          >
            {editingAgenda ? "Terminer" : "Modifier"}
          </button>
        </div>
        <ol className="mt-2 space-y-1.5">
          {agendaPlan.map((b, i) => (
            <li key={b.id} className="flex gap-2 text-xs">
              <span className="font-bold text-muted-foreground w-4">{i + 1}.</span>
              <span className="font-semibold">
                {b.title}
                {b.min ? <span className="text-muted-foreground"> · {b.min} min</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </div>
      {members && members.length > 0 && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide">Participants</p>
          <ul className="mt-1 space-y-1">
            {members.map((m) => (
              <li key={m.id} className="text-xs font-semibold">
                {m.name}
                <span className="text-muted-foreground"> · {m.meetingRole ?? m.role ?? "Participante"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {groups.length > 0 && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide">Sous-groupes</p>
          <ul className="mt-1 space-y-1">
            {groups.map((g) => (
              <li key={g.id} className="text-xs font-semibold">{g.name} ({g.memberIds.length})</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground border-t pt-3">
        Préparée avec My Facilitator
      </p>
    </div>
  );
}
