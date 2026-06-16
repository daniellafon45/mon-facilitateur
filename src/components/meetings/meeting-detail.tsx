"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bolt,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock,
  Eye,
  FileText,
  Grid3X3,
  Lock,
  Pencil,
  Play,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Meeting, MeetingDetailSectionId } from "@/types/facilitation";
import { formatFrDate } from "@/lib/projets/constants";
import { upcomingAgendaItems } from "@/lib/meetings/meeting-detail-defaults";
import {
  MEETING_DETAIL_SECTIONS,
  getMeetingDetailData,
} from "@/lib/meetings/meeting-detail-utils";
import {
  MeetingDetailDocuments,
  MeetingDetailJournal,
  MeetingDetailMethods,
  MeetingDetailMinuterie,
  MeetingDetailNotes,
  MeetingDetailOverview,
  MeetingDetailTasksReport,
  MeetingDetailUpcoming,
  MeetingDetailWhiteboard,
} from "@/components/meetings/meeting-detail-sections";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SECTION_ICONS: Record<string, LucideIcon> = {
  Eye,
  Clock,
  Grid: Grid3X3,
  Sparkles,
  FileText,
  Pencil,
  Bolt,
  Check,
};

function statusBadge(status: string) {
  if (status === "Terminée")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "À venir")
    return "bg-primary/10 text-primary border-primary/20";
  if (status === "Brouillon")
    return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export function MeetingDetail({
  meeting,
  onBack,
  onSimulate,
  onToast,
}: {
  meeting: Meeting;
  onBack: () => void;
  onSimulate?: () => void;
  onToast?: (msg: string) => void;
}) {
  const isDone = meeting.status === "Terminée";
  const isDraft = meeting.status === "Brouillon";
  const isUpcoming = !isDone;

  const { snapshot, counts } = useMemo(() => getMeetingDetailData(meeting), [meeting]);
  const agendaItems = useMemo(() => upcomingAgendaItems(meeting), [meeting]);

  const [activeSection, setActiveSection] = useState<MeetingDetailSectionId>("apercu");
  const [metaOpen, setMetaOpen] = useState(false);

  const toast = (msg: string) => onToast?.(msg);

  if (isUpcoming) {
    return (
      <div className="flex h-full flex-col bg-slate-50">
        <header className="shrink-0 border-b bg-background px-7 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={onBack}
                className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
                title="Retour"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold tracking-tight">{meeting.name}</h1>
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-bold", statusBadge(meeting.status))}>
                    {meeting.status}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatFrDate(meeting.dateISO)}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {meeting.time}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {meeting.participants} participants</span>
                  <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> {meeting.type}</span>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              {isDraft ? (
                <Button className="rounded-xl" size="sm" onClick={onSimulate}>
                  <Pencil className="mr-1.5 h-4 w-4" /> Continuer la préparation
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="rounded-xl" size="sm" onClick={() => toast("Reprogrammation à venir")}>
                    <Calendar className="mr-1.5 h-4 w-4" /> Reprogrammer
                  </Button>
                  <Button className="rounded-xl" size="sm" onClick={onSimulate}>
                    <Play className="mr-1.5 h-4 w-4" /> Simuler la rencontre
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6 pb-12">
          <MeetingDetailUpcoming meeting={meeting} agendaItems={agendaItems} />
          {!isDraft && onSimulate && (
            <div className="mx-auto mt-6 max-w-3xl text-center">
              <Button className="rounded-xl" onClick={onSimulate}>
                <Play className="mr-1.5 h-4 w-4" /> Simuler cette rencontre
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const sections = MEETING_DETAIL_SECTIONS.map((s) => ({
    ...s,
    count: counts[s.id],
  }));

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="shrink-0 border-b bg-background px-7 pt-4 pb-0">
        <div className="mb-3.5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
              title="Retour aux rencontres"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <button type="button" onClick={onBack} className="hover:text-foreground">Mes rencontres</button>
                <span>›</span>
                <span className="text-slate-600">{meeting.name}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight">{meeting.name}</h1>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  Terminée
                </span>
                <button
                  type="button"
                  onClick={() => setMetaOpen((o) => !o)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary"
                >
                  {metaOpen ? "Masquer" : "Détails"}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", metaOpen && "rotate-180")} />
                </button>
              </div>
              {metaOpen && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {snapshot.ref && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums">
                      <Shield className="h-3 w-3" /> {snapshot.ref}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatFrDate(meeting.dateISO)}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {meeting.time}{snapshot.duration ? ` · ${snapshot.duration}` : ""}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {snapshot.participants?.length ?? meeting.participants} participants</span>
                  <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> {meeting.type}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" className="rounded-xl" size="sm" onClick={() => setActiveSection("minuterie")}>
              <Play className="mr-1.5 h-4 w-4" /> Rejouer la séance
            </Button>
            <Button variant="outline" className="rounded-xl" size="sm" onClick={() => toast("Export PDF à venir")}>
              <ArrowUpRight className="mr-1.5 h-4 w-4" /> Exporter PDF
            </Button>
            <Button className="rounded-xl" size="sm" onClick={() => toast("Compte rendu envoyé (simulation)")}>
              <FileText className="mr-1.5 h-4 w-4" /> Envoyer le compte rendu
            </Button>
          </div>
        </div>

        <div className="flex gap-0.5 overflow-x-auto">
          {sections.map((s) => {
            const Icon = SECTION_ICONS[s.icon] ?? Eye;
            const empty = s.count === 0;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                type="button"
                disabled={empty && s.id !== "apercu"}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-bold transition-colors",
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                  empty && s.id !== "apercu" && "cursor-default opacity-40",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
                {s.count != null && s.count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] font-extrabold",
                      active ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {s.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex shrink-0 items-center gap-2 border-b bg-slate-100 px-7 py-2 text-xs font-semibold text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        Archive en lecture seule figée à la fin de la séance. Le contenu ne peut plus être modifié.
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6 pb-12">
        <div className="mx-auto max-w-[980px]">
          {activeSection === "apercu" && <MeetingDetailOverview meeting={meeting} snapshot={snapshot} />}
          {activeSection === "minuterie" && <MeetingDetailMinuterie snapshot={snapshot} />}
          {activeSection === "methodes" && <MeetingDetailMethods snapshot={snapshot} />}
          {activeSection === "tableau" && <MeetingDetailWhiteboard snapshot={snapshot} />}
          {activeSection === "documents" && <MeetingDetailDocuments snapshot={snapshot} />}
          {activeSection === "notes" && <MeetingDetailNotes snapshot={snapshot} />}
          {activeSection === "quicklog" && <MeetingDetailJournal snapshot={snapshot} />}
          {activeSection === "taches" && <MeetingDetailTasksReport snapshot={snapshot} />}
        </div>
      </div>
    </div>
  );
}
