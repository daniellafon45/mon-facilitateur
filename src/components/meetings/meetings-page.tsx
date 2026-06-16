"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  Clock,
  Copy,
  Eye,
  FileText,
  List,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { Meeting } from "@/types/facilitation";
import { formatFrDate } from "@/lib/projets/constants";
import { displayProjects } from "@/lib/projets/display-project";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import { MeetingDetail } from "@/components/meetings/meeting-detail";
import { EventManager } from "@/components/ui/event-manager";
import { GitHubCalendar } from "@/components/ui/git-hub-calendar";
import { meetingsToContributionData } from "@/lib/meetings/contribution-calendar";
import {
  eventPatchToMeetingData,
  eventToMeetingData,
  MEETING_CATEGORIES,
  MEETING_TAGS,
  meetingToEvent,
} from "@/lib/meetings/event-adapter";
import { SendQueueScreen } from "@/components/meetings/send-queue-screen";
import { TasksScreen } from "@/components/projets/projets-extra";
import { ProjetsToast, useProjetsToast } from "@/components/projets/projets-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TABS = ["Toutes les rencontres", "À venir", "Terminées", "Brouillons", "À envoyer", "Archivées"] as const;
const TAB_STATUS: Record<string, string> = {
  "À venir": "À venir",
  Terminées: "Terminée",
  Brouillons: "Brouillon",
};

function methodColor(m: string) {
  if (["BMC", "RACI"].includes(m) || m.toLowerCase().includes("business"))
    return { bg: "bg-blue-100", fg: "text-blue-800" };
  if (["SCAMPER"].includes(m) || m.toLowerCase().includes("scamper"))
    return { bg: "bg-violet-100", fg: "text-violet-800" };
  if (["SWOT"].includes(m) || m.toLowerCase().includes("swot"))
    return { bg: "bg-emerald-100", fg: "text-emerald-800" };
  if (m.includes("Impact") || m.includes("Priorisation"))
    return { bg: "bg-orange-100", fg: "text-orange-800" };
  return { bg: "bg-slate-100", fg: "text-slate-600" };
}

function statusStyle(status: string) {
  if (status === "Terminée")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "À venir")
    return "bg-primary/10 text-primary border-primary/20";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function methodLabel(id: string) {
  return METHOD_BY_ID[id]?.title ?? id;
}

function MeetingsRail({
  reportsToSend,
  noDueTasks,
  upcomingCount,
  upcomingPreview,
  onOpenTasks,
  onShowCalendar,
  onOpenSendQueue,
}: {
  reportsToSend: number;
  noDueTasks: number;
  upcomingCount: number;
  upcomingPreview: { date: string; name: string; sub: string }[];
  onOpenTasks: () => void;
  onShowCalendar: () => void;
  onOpenSendQueue: () => void;
}) {
  const items = [
    { icon: ArrowRight, color: "#2563eb", text: `${reportsToSend} compte${reportsToSend > 1 ? "s" : ""} rendu${reportsToSend > 1 ? "s" : ""} à envoyer`, sub: "En attente d'envoi", act: onOpenSendQueue },
    { icon: Check, color: "#f97316", text: `${noDueTasks} tâche${noDueTasks > 1 ? "s" : ""} sans échéance`, sub: "À assigner ou planifier", act: onOpenTasks },
    { icon: Calendar, color: "#7c3aed", text: `${upcomingCount} prochaine${upcomingCount > 1 ? "s" : ""} rencontre${upcomingCount > 1 ? "s" : ""}`, sub: "À venir", act: onShowCalendar },
  ];

  return (
    <aside className="hidden w-[280px] shrink-0 overflow-y-auto border-l p-4 xl:block">
      <div className="mb-3 flex items-center gap-2 text-[15px] font-extrabold">
        <List className="h-4 w-4" /> À faire après rencontre
      </div>
      {items.map((t, i) => (
        <button
          key={i}
          type="button"
          onClick={t.act}
          className="mb-1.5 flex w-full items-center gap-2.5 rounded-[10px] bg-slate-50 p-2.5 text-left hover:bg-slate-100"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: `${t.color}18`, color: t.color }}>
            <t.icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-bold">{t.text}</div>
            <div className="text-xs text-muted-foreground">{t.sub}</div>
          </div>
          <ChevronLeft className="h-3.5 w-3.5 rotate-180 text-slate-300" />
        </button>
      ))}
      <button type="button" onClick={onOpenTasks} className="mt-1 flex items-center gap-1 text-[13px] font-bold text-primary">
        <List className="h-3.5 w-3.5" /> Voir toutes les tâches
      </button>

      <div className="mt-5 border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-extrabold">Prochaines rencontres</div>
          <button type="button" onClick={onShowCalendar} className="text-xs font-bold text-primary">Calendrier</button>
        </div>
        {upcomingPreview.map((u, i) => (
          <div key={i} className={cn("flex gap-2.5 py-2", i < upcomingPreview.length - 1 && "border-b border-slate-100")}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-primary">{u.date}</div>
              <div className="text-[13px] font-bold">{u.name}</div>
              <div className="text-xs text-muted-foreground">{u.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function MeetingsPage() {
  const router = useRouter();
  const store = useFacilitationStore();
  const { toast, flash } = useProjetsToast();

  const [tab, setTab] = useState<(typeof TABS)[number]>("Toutes les rencontres");
  const [openMeeting, setOpenMeeting] = useState<Meeting | null>(null);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [methodFilter, setMethodFilter] = useState<string | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [sub, setSub] = useState<"tasks" | "sendqueue" | null>(null);
  const [activeKpiTab, setActiveKpiTab] = useState<string | null>(null);

  useEffect(() => {
    if (!store.hydrated) void store.hydrateFromSupabase();
  }, [store.hydrated, store.hydrateFromSupabase]);

  useEffect(() => {
    if (!store.hydrated) return;
    const params = new URLSearchParams(window.location.search);
    const openId = params.get("open");
    if (!openId) return;
    const m = store.meetings.find((x) => x.id === openId);
    if (m) setOpenMeeting(m);
  }, [store.hydrated, store.meetings]);

  const startSimulation = (m: Meeting) => {
    const mode =
      m.type.toLowerCase().includes("solo")
        ? "solo"
        : m.type.toLowerCase().includes("atelier")
          ? "atelier"
          : "equipe";
    store.launchSession({
      mode,
      objective: m.name,
      methodIds: m.methods.length > 0 ? m.methods : ["brainstorm"],
      projectId: m.project ?? null,
      meetingId: m.id,
      genre: null,
      simulating: true,
    });
    router.push("/dashboard/session");
  };

  const allMeetings = store.meetings;
  const liveMeetings = allMeetings.filter((m) => !m.archived);
  const openTasks = store.openTasks();
  const noDue = openTasks.filter((t) => !t.due && !t.dueISO).length;
  const upcoming = store.upcoming();
  const allProjects = displayProjects(store.projects, store.meetings);

  const projectName = (m: Meeting) => {
    if (!m.project) return "—";
    const p = store.projects.find((x) => x.id === m.project);
    return p?.name ?? m.project;
  };

  const stats = [
    { icon: CheckCircle, color: "text-emerald-600", val: liveMeetings.filter((m) => m.status === "Terminée").length, label: "Rencontres terminées", hint: "Historique complet", goTab: "Terminées" },
    { icon: Calendar, color: "text-primary", val: upcoming.length, label: "À venir", hint: "Prochaines rencontres", goTab: "À venir" },
    { icon: FileText, color: "text-violet-600", val: liveMeetings.filter((m) => m.status === "Brouillon").length, label: "Brouillons", hint: "Non lancées", goTab: "Brouillons" },
    { icon: ArrowRight, color: "text-amber-600", val: liveMeetings.filter((m) => m.status === "Terminée" && m.snapshot?.report?.state !== "envoye").length, label: "Comptes rendus à envoyer", hint: "En attente d'envoi", goTab: "sendqueue" },
    { icon: Check, color: "text-amber-600", val: openTasks.length, label: "Tâches ouvertes", hint: `${noDue} sans échéance`, goTab: null },
  ];

  const filtered = allMeetings.filter((m) => {
    if (tab === "Archivées") return !!m.archived;
    if (m.archived) return false;
    if (tab === "À envoyer") return m.status === "Terminée" && m.snapshot?.report?.state !== "envoye";
    const st = TAB_STATUS[tab];
    if (st && m.status !== st) return false;
    if (methodFilter && !m.methods.some((mt) => methodLabel(mt) === methodFilter || mt === methodFilter)) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const blob = `${m.name} ${projectName(m)} ${m.sub ?? ""}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });

  const visible = showAll ? filtered : filtered.slice(0, 6);
  const events = useMemo(() => liveMeetings.map(meetingToEvent), [liveMeetings]);
  const contributionData = useMemo(() => meetingsToContributionData(store.meetings), [store.meetings]);

  const upcomingPreview = upcoming.slice(0, 3).map((m) => ({
    date: `${formatFrDate(m.dateISO)} · ${m.time}`,
    name: m.name,
    sub: projectName(m),
  }));

  const doMeetingAction = (m: Meeting, action: string) => {
    setRowMenu(null);
    if (action === "duplicate") {
      void store.duplicateMeeting(m.id).then(() => flash(`« ${m.name} » dupliquée`));
    }
    if (action === "done") {
      void store.setMeetingStatus(m.id, "Terminée");
      flash(`« ${m.name} » marquée terminée`);
    }
    if (action === "archive") {
      void store.archiveMeetingLocal(m.id, true);
      flash(`« ${m.name} » archivée`);
    }
    if (action === "restore") {
      void store.archiveMeetingLocal(m.id, false);
      flash(`« ${m.name} » restaurée`);
    }
    if (action === "delete") {
      void store.deleteMeeting(m.id);
      flash(`« ${m.name} » supprimée`);
    }
    if (action === "fav") {
      store.toggleMeetingStar(m.id);
      flash(m.star ? `« ${m.name} » retirée des favoris` : `« ${m.name} » ajoutée aux favoris`);
    }
  };

  if (openMeeting) {
    return (
      <MeetingDetail
        meeting={openMeeting}
        onBack={() => {
          setOpenMeeting(null);
          if (window.location.search.includes("open=")) {
            router.replace("/dashboard/rencontres");
          }
        }}
        onSimulate={() => startSimulation(openMeeting)}
        onToast={flash}
      />
    );
  }

  if (sub === "sendqueue") {
    return (
      <SendQueueScreen
        onBack={() => setSub(null)}
        onOpen={(m) => {
          setSub(null);
          setOpenMeeting(m);
        }}
      />
    );
  }

  if (sub === "tasks") {
    return (
      <TasksScreen
        projects={allProjects}
        onBack={() => setSub(null)}
        onOpenProject={() => setSub(null)}
      />
    );
  }

  if (liveMeetings.length === 0 && !query.trim() && tab === "Toutes les rencontres") {
    return (
      <div className="h-full overflow-y-auto px-8 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">Mes rencontres</h1>
          <Button className="rounded-xl" onClick={() => setPlanOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Nouvelle rencontre
          </Button>
        </div>
        <div className="mx-auto max-w-[880px] rounded-[18px] border border-dashed py-14 text-center">
          <div className="mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Calendar className="h-7 w-7" />
          </div>
          <div className="text-lg font-extrabold">Aucune rencontre pour l&apos;instant</div>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Planifiez votre première rencontre ou lancez une séance directement.
          </p>
          <div className="mt-5 inline-flex gap-2.5">
            <Button variant="outline" className="rounded-xl" onClick={() => setPlanOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Planifier une rencontre
            </Button>
            <Button className="rounded-xl" onClick={() => router.push("/dashboard/wizard/project-type")}>
              Lancer une séance
            </Button>
          </div>
        </div>
        {planOpen && (
          <PlannerOverlay
            events={events}
            onClose={() => setPlanOpen(false)}
            onCreate={(e) => {
              void store.addMeeting(eventToMeetingData(e)).then((m) => {
                setPlanOpen(false);
                flash(`Rencontre « ${m.name} » planifiée`);
              });
            }}
          />
        )}
        <ProjetsToast message={toast} />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-y-auto px-8 py-8">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">Mes rencontres</h1>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-[10px] border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une rencontre..."
                className="h-auto w-40 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setMethodFilter(null)}>
              <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filtres {methodFilter ? "(1)" : "(0)"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn("rounded-xl", view === "calendar" && "bg-primary/10 text-primary")}
              onClick={() => setView((v) => (v === "calendar" ? "list" : "calendar"))}
              title={view === "calendar" ? "Vue liste" : "Vue calendrier"}
            >
              {view === "calendar" ? <List className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
            </Button>
            <Button className="rounded-xl" onClick={() => setPlanOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Nouvelle rencontre
            </Button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {stats.map((s, i) => {
            const on = s.goTab && activeKpiTab === s.goTab;
            const zero = s.val === 0;
            return (
              <button
                key={i}
                type="button"
                disabled={!s.goTab || zero}
                onClick={() => {
                  if (!s.goTab || zero) return;
                  if (s.goTab === "sendqueue") {
                    setActiveKpiTab(null);
                    setSub("sendqueue");
                    return;
                  }
                  if (on) {
                    setActiveKpiTab(null);
                    setTab("Toutes les rencontres");
                  } else {
                    setActiveKpiTab(s.goTab);
                    setTab(s.goTab as (typeof TABS)[number]);
                  }
                }}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  on ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-background hover:border-primary/40",
                  (!s.goTab || zero) && "cursor-default opacity-50",
                )}
              >
                <s.icon className={cn("h-5 w-5", s.color)} />
                <div className={cn("mt-2 text-2xl font-extrabold tabular-nums", on && "text-blue-600")}>{s.val}</div>
                <div className="text-xs font-semibold">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.hint}</div>
              </button>
            );
          })}
        </div>

        {view === "calendar" ? (
          <div className="space-y-4">
            <GitHubCalendar data={contributionData} />
            <EventManager
              events={events}
              defaultView="month"
              categories={[...MEETING_CATEGORIES]}
              availableTags={[...MEETING_TAGS]}
              className="rounded-3xl"
              onEventCreate={(event) => void store.addMeeting(eventToMeetingData(event))}
              onEventUpdate={(id, patch) => void store.updateMeeting(id, eventPatchToMeetingData(patch))}
              onEventDelete={(id) => void store.deleteMeeting(id)}
            />
          </div>
        ) : (
          <>
            <div className="mb-3.5 flex gap-0 border-b-2 border-slate-200">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setActiveKpiTab(null); }}
                  className={cn(
                    "whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[13px] font-bold -mb-0.5",
                    tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-[14px] border">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-b bg-slate-50">
                    {["RENCONTRE", "PROJET", "DATE & HEURE", "TYPE", "MÉTHODES", "PARTICIPANTS", "STATUT", "ACTIONS"].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[11px] font-extrabold tracking-wide text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => setOpenMeeting(m)}
                      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="font-bold">{m.name}</div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); doMeetingAction(m, "fav"); }}
                            className={cn("text-slate-300 hover:text-amber-400", m.star && "text-amber-400")}
                          >
                            <Star className="h-3 w-3" fill={m.star ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{projectName(m)}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-semibold"><Calendar className="h-3 w-3" /> {formatFrDate(m.dateISO)}</div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {m.time}</div>
                      </td>
                      <td className="px-3 py-3 font-semibold">{m.type}</td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap gap-1">
                          {m.methods.slice(0, 2).map((mt) => {
                            const label = methodLabel(mt);
                            const c = methodColor(label);
                            const on = methodFilter === label;
                            return (
                              <button
                                key={mt}
                                type="button"
                                onClick={() => setMethodFilter(on ? null : label)}
                                className={cn("rounded px-2 py-0.5 text-[11px] font-bold", c.bg, c.fg, on && "ring-1 ring-current")}
                              >
                                {label}
                              </button>
                            );
                          })}
                          {m.methods.length > 2 && (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-muted-foreground">+{m.methods.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-muted-foreground"><Users className="h-3 w-3" /> {m.participants}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-bold", statusStyle(m.status))}>{m.status}</span>
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative flex gap-1">
                          <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted" title="Ouvrir" onClick={() => setOpenMeeting(m)}>
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {m.status === "À venir" && (
                            <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted" title="Simuler" onClick={() => startSimulation(m)}>
                              <Play className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {m.status === "Brouillon" && (
                            <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted" title="Continuer" onClick={() => router.push("/dashboard/wizard/project-type")}>
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted" onClick={() => setRowMenu(rowMenu === m.id ? null : m.id)}>
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                          {rowMenu === m.id && (
                            <div className="absolute right-0 top-8 z-20 min-w-[180px] rounded-xl border bg-background py-1 shadow-lg">
                              <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => doMeetingAction(m, "duplicate")}>
                                <Copy className="h-3.5 w-3.5" /> Dupliquer
                              </button>
                              {m.status !== "Terminée" && (
                                <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => doMeetingAction(m, "done")}>
                                  <CheckCircle className="h-3.5 w-3.5" /> Marquer terminée
                                </button>
                              )}
                              <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => doMeetingAction(m, m.archived ? "restore" : "archive")}>
                                {m.archived ? "Restaurer" : "Archiver"}
                              </button>
                              <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50" onClick={() => doMeetingAction(m, "delete")}>
                                <Trash2 className="h-3.5 w-3.5" /> Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-10 text-center text-sm text-muted-foreground">
                        Aucune rencontre ne correspond à ce filtre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {filtered.length > 6 && (
                <div className="border-t py-3.5 text-center">
                  <button type="button" onClick={() => setShowAll((s) => !s)} className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                    {showAll ? "Afficher moins" : `Afficher plus de rencontres (${filtered.length - 6})`}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", showAll && "rotate-180")} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <MeetingsRail
        reportsToSend={liveMeetings.filter((m) => m.status === "Terminée" && m.snapshot?.report?.state !== "envoye").length}
        noDueTasks={noDue}
        upcomingCount={upcoming.length}
        upcomingPreview={upcomingPreview}
        onOpenTasks={() => setSub("tasks")}
        onShowCalendar={() => setView("calendar")}
        onOpenSendQueue={() => setSub("sendqueue")}
      />

      {planOpen && (
        <PlannerOverlay
          events={events}
          onClose={() => setPlanOpen(false)}
          onCreate={(e) => {
            void store.addMeeting(eventToMeetingData(e)).then((m) => {
              setPlanOpen(false);
              flash(`Rencontre « ${m.name} » planifiée`);
            });
          }}
        />
      )}
      <ProjetsToast message={toast} />
    </div>
  );
}

function PlannerOverlay({
  events,
  onClose,
  onCreate,
}: {
  events: ReturnType<typeof meetingToEvent>[];
  onClose: () => void;
  onCreate: (event: Parameters<NonNullable<React.ComponentProps<typeof EventManager>["onEventCreate"]>>[0]) => void;
}) {
  return (
    <div className="fixed inset-0 z-[1100] flex flex-col bg-background">
      <div className="flex items-center justify-between border-b px-6 py-3">
        <h2 className="text-lg font-extrabold">Planifier une rencontre</h2>
        <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <EventManager
          events={events}
          defaultView="list"
          categories={[...MEETING_CATEGORIES]}
          availableTags={[...MEETING_TAGS]}
          className="rounded-3xl"
          onEventCreate={onCreate}
        />
      </div>
    </div>
  );
}
