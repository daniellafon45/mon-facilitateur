"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  Download,
  Eye,
  FileText,
  Grid3X3,
  LayoutGrid,
  List,
  MessageSquare,
  Plus,
  Shield,
  Star,
  Table2,
  Target,
  Users,
  Zap,
} from "lucide-react";
import type { DisplayProject } from "@/types/facilitation";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { useProjectBoardStore } from "@/lib/store/project-board-store";
import { formatFrDate } from "@/lib/projets/constants";
import { ProjectMainTable } from "@/components/projets/project-main-table";
import { ProjectKanbanView } from "@/components/projets/project-kanban-view";
import { ScheduleDrawer } from "@/components/projets/projets-modals";
import { ProjetsToast, useProjetsToast } from "@/components/projets/projets-shared";
import { PostMortemPage } from "@/components/projets/post-mortem/post-mortem-page";
import { ProjectGantt } from "@/components/projets/project-tabs/project-gantt";
import { ProjectMeetingsCalendar } from "@/components/projets/project-tabs/project-meetings-calendar";
import { ProjectMetrics } from "@/components/projets/project-tabs/project-metrics";
import { InviteMembersDrawer, ProjectMembersPanel } from "@/components/projets/project-tabs/project-members-panel";
import { ProjectIntegrationsPanel } from "@/components/integrations/project-integrations-panel";
import {
  CharteEditor,
  COMMS_COLS,
  RaciTable,
  RegTable,
  STAKE_COLS,
  SUPPLIER_COLS,
} from "@/components/projets/project-tabs/registry-tables";
import { useProjectRegistry } from "@/lib/hooks/use-project-registry";
import { useProjectMembers } from "@/lib/hooks/use-project-members";
import { buildProjectExportText, downloadTextFile } from "@/lib/project/export-project";
import { useMethodSavesStore } from "@/lib/store/method-saves-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DetailTab =
  | "apercu"
  | "reunions"
  | "gantt"
  | "metriques"
  | "raci"
  | "comm"
  | "fournisseurs"
  | "parties"
  | "charteq"
  | "table"
  | "kanban";

const SECTIONS: { id: DetailTab; label: string; icon: typeof Eye }[] = [
  { id: "apercu", label: "Aperçu", icon: Eye },
  { id: "reunions", label: "Rencontres", icon: Calendar },
  { id: "gantt", label: "Gantt", icon: List },
  { id: "metriques", label: "Métriques", icon: Zap },
  { id: "raci", label: "RACI", icon: Grid3X3 },
  { id: "comm", label: "Plan de comm.", icon: MessageSquare },
  { id: "fournisseurs", label: "Fournisseurs", icon: Briefcase },
  { id: "parties", label: "Parties prenantes", icon: Users },
  { id: "charteq", label: "Charte d'équipe", icon: Shield },
  { id: "table", label: "Tableau", icon: Table2 },
  { id: "kanban", label: "Kanban", icon: LayoutGrid },
];

export function ProjectDetail({
  project,
  onBack,
  onNavRencontres,
}: {
  project: DisplayProject;
  onBack: () => void;
  onNavRencontres?: () => void;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<DetailTab>("apercu");
  const [sched, setSched] = useState(false);
  const [invite, setInvite] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [postMortem, setPostMortem] = useState(false);
  const { toast, flash } = useProjetsToast();

  const toggleStar = useFacilitationStore((s) => s.toggleProjectStar);
  const scheduleMeeting = useFacilitationStore((s) => s.scheduleProjectMeeting);
  const updateProject = useFacilitationStore((s) => s.updateProject);
  const addMeeting = useFacilitationStore((s) => s.addMeeting);
  const updateMeeting = useFacilitationStore((s) => s.updateMeeting);
  const deleteMeeting = useFacilitationStore((s) => s.deleteMeeting);
  const allMeetings = useFacilitationStore((s) => s.meetings);
  const allProjects = useFacilitationStore((s) => s.projects);

  const { members } = useProjectMembers(project.id);
  const memberNames = useMemo(() => members.map((m) => m.displayName), [members]);
  const { registry, update: updateRegistry } = useProjectRegistry(project.id, memberNames);

  const ensureProject = useProjectBoardStore((s) => s.ensureProject);
  const loadFromSupabase = useProjectBoardStore((s) => s.loadFromSupabase);
  const boardTasks = useProjectBoardStore((s) => s.tasks);
  const projectTasks = useMemo(
    () => boardTasks.filter((t) => t.projectId === project.id),
    [boardTasks, project.id],
  );

  useEffect(() => {
    ensureProject(project.id);
    void loadFromSupabase(project.id);
  }, [ensureProject, loadFromSupabase, project.id]);

  const meetings = useMemo(() => {
    const projectName = allProjects.find((p) => p.id === project.id)?.name;
    return allMeetings.filter(
      (m) =>
        !m.archived &&
        (m.project === project.id || (projectName && m.project === projectName)),
    );
  }, [allMeetings, allProjects, project.id]);

  const allMethodSaves = useMethodSavesStore((s) => s.saves);
  const methodSaves = useMemo(
    () => allMethodSaves.filter((m) => m.projectId === project.id),
    [allMethodSaves, project.id],
  );
  const loadMethodSaves = useMethodSavesStore((s) => s.loadForProject);

  useEffect(() => {
    void loadMethodSaves(project.id);
  }, [loadMethodSaves, project.id]);

  const objective = project.objective ?? "";
  const isDone = project.statusId === "termine";

  const handleGanttProgress = useCallback(
    (pct: number) => {
      if (pct !== project.progress) {
        void updateProject(project.id, { progress: pct });
      }
    },
    [project.id, project.progress, updateProject],
  );

  const handleExport = () => {
    const txt = buildProjectExportText({
      project,
      objective,
      members,
      meetings,
      registry,
      taskCount: projectTasks.length,
    });
    downloadTextFile(`${project.name} synthèse.txt`, txt);
    flash("Export téléchargé");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/projets?open=${project.id}`;
    void navigator.clipboard.writeText(url);
    flash("Lien du projet copié");
  };

  if (postMortem) {
    return <PostMortemPage project={project} onBack={() => setPostMortem(false)} />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f6f7fb]">
      <div className="shrink-0 border-b bg-white">
        <div className="px-6 pt-4 pb-1">
          <button
            type="button"
            onClick={onBack}
            className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Projets
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-extrabold tracking-tight">{project.name}</h2>
            <button
              type="button"
              onClick={() => toggleStar(project.id)}
              className="shrink-0 border-0 bg-transparent p-0 cursor-pointer"
              style={{ color: project.star ? "#fbbf24" : "#cbd5e1" }}
            >
              <Star className="h-4 w-4" fill={project.star ? "#fbbf24" : "none"} />
            </button>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={handleShare}>
              Partager
            </Button>
            <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={() => setInvite(true)}>
              Inviter / {members.length || project.members}
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1 rounded-lg" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" /> Exporter
            </Button>
            <Button size="sm" className="h-8 gap-1 rounded-lg bg-[#0073ea] hover:bg-[#0060c2]" onClick={() => setSched(true)}>
              <Plus className="h-3.5 w-3.5" /> Nouvelle rencontre
            </Button>
            {isDone && (
              <Button size="sm" variant="secondary" className="h-8 rounded-lg" onClick={() => setPostMortem(true)}>
                <FileText className="mr-1 h-3.5 w-3.5" /> Post-mortem
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0 overflow-x-auto border-t px-6">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setTab(s.id)}
              className={cn(
                "inline-flex items-center gap-1.5 border-0 bg-transparent px-3 py-2.5 text-[13px] font-bold whitespace-nowrap cursor-pointer -mb-px transition-colors",
                tab === s.id
                  ? "border-b-2 border-[#0073ea] text-[#0073ea]"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <s.icon className="h-3.5 w-3.5" /> {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "table" && <ProjectMainTable project={project} />}
        {tab === "kanban" && (
          <ProjectKanbanView project={project} onSwitchView={(v) => setTab(v === "table" ? "table" : "kanban")} />
        )}

        {!["table", "kanban"].includes(tab) && (
          <div className="h-full overflow-y-auto bg-white p-6">
            <div className="mx-auto max-w-[1000px] space-y-4">
              {tab === "apercu" && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowMeta((v) => !v)}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold text-muted-foreground"
                  >
                    <Eye className="h-3 w-3" /> Détails
                    <ChevronDown className={cn("h-3 w-3 transition-transform", showMeta && "rotate-180")} />
                  </button>
                  {showMeta && (
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {members.length || project.members} membres
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> {project.progress}% complété
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      { icon: Calendar, label: "Rencontres", val: meetings.length },
                      { icon: CheckCircle, label: "Tâches", val: projectTasks.length },
                      { icon: Target, label: "Temps réunion", val: `${meetings.length} h` },
                      { icon: Users, label: "Membres", val: members.length || project.members },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl border p-4">
                        <s.icon className="mb-2 h-5 w-5 text-primary" />
                        <div className="text-2xl font-extrabold">{s.val}</div>
                        <div className="text-xs font-semibold text-muted-foreground">{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border p-5">
                    <div className="mb-3 flex items-center gap-2 font-extrabold">
                      <Target className="h-4 w-4 text-primary" /> Objectif du projet
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                      {objective || "Aucun objectif défini."}
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${project.progress}%` }} />
                    </div>
                    <div className="mt-1.5 text-xs text-muted-foreground">Avancement global : {project.progress}%</div>
                  </div>
                  <ProjectMembersPanel projectId={project.id} />
                  <ProjectIntegrationsPanel projectId={project.id} />
                  <div className="overflow-hidden rounded-2xl border">
                    <div className="flex items-center justify-between px-5 pt-4">
                      <div className="flex items-center gap-2 font-extrabold">
                        <Calendar className="h-4 w-4" /> Rencontres du projet
                      </div>
                      <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={() => setSched(true)}>
                        Planifier
                      </Button>
                    </div>
                    {meetings.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">Aucune rencontre pour ce projet.</div>
                    ) : (
                      meetings.map((m, i) => (
                        <div
                          key={m.id || i}
                          className="flex cursor-pointer items-center gap-3 border-t px-5 py-3 hover:bg-slate-50"
                          onClick={() => router.push(`/dashboard/rencontres?open=${m.id}`)}
                        >
                          <Calendar className="h-4 w-4 shrink-0 text-primary" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold">{m.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatFrDate(m.dateISO)} · {m.type}
                            </div>
                          </div>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-extrabold text-primary">
                            {m.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="rounded-2xl border p-4">
                    <div className="mb-2 flex items-center gap-2 font-extrabold">
                      <FileText className="h-4 w-4" /> Méthodes enregistrées ({methodSaves.length})
                    </div>
                    {methodSaves.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune sauvegarde depuis les séances.</p>
                    ) : (
                      <ul className="space-y-2">
                        {methodSaves.map((m) => (
                          <li key={m.id} className="rounded-lg border px-3 py-2 text-sm font-semibold">
                            {m.methodTitle}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="rounded-2xl border p-4">
                    <div className="mb-2 flex items-center gap-2 font-extrabold">
                      <LayoutGrid className="h-4 w-4" /> Tableau blanc
                    </div>
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                      <Link href="/dashboard/tableau">Ouvrir le tableau blanc</Link>
                    </Button>
                  </div>
                </>
              )}

              {tab === "reunions" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold">Rencontres ({meetings.length})</h3>
                    <Button size="sm" onClick={() => setSched(true)}>
                      <Plus className="mr-1 h-4 w-4" /> Planifier
                    </Button>
                  </div>
                  <ProjectMeetingsCalendar
                    projectId={project.id}
                    meetings={meetings}
                    onCreate={async (data) => { await addMeeting(data); }}
                    onUpdate={async (id, data) => { await updateMeeting(id, data); }}
                    onDelete={async (id) => { await deleteMeeting(id); }}
                  />
                </div>
              )}

              {tab === "gantt" && (
                <ProjectGantt projectId={project.id} onProgressChange={handleGanttProgress} />
              )}

              {tab === "metriques" && (
                <ProjectMetrics tasks={projectTasks} members={members} meetings={meetings} />
              )}

              {tab === "raci" && (
                <RaciTable
                  data={registry.raci}
                  onChange={(raci) => updateRegistry((prev) => ({ ...prev, raci }))}
                />
              )}

              {tab === "comm" && (
                <RegTable
                  rows={registry.comms}
                  columns={COMMS_COLS}
                  addLabel="Ligne de communication"
                  onChange={(comms) => updateRegistry((prev) => ({ ...prev, comms }))}
                />
              )}

              {tab === "fournisseurs" && (
                <RegTable
                  rows={registry.suppliers}
                  columns={SUPPLIER_COLS}
                  addLabel="Fournisseur"
                  onChange={(suppliers) => updateRegistry((prev) => ({ ...prev, suppliers }))}
                />
              )}

              {tab === "parties" && (
                <RegTable
                  rows={registry.stakeholders}
                  columns={STAKE_COLS}
                  addLabel="Partie prenante"
                  onChange={(stakeholders) => updateRegistry((prev) => ({ ...prev, stakeholders }))}
                />
              )}

              {tab === "charteq" && (
                <CharteEditor
                  charte={registry.charte}
                  onChange={(charte) => updateRegistry((prev) => ({ ...prev, charte }))}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {sched && (
        <ScheduleDrawer
          project={project}
          onClose={() => setSched(false)}
          onConfirm={(date, time) => {
            void scheduleMeeting(project.id, date, time);
            setSched(false);
            flash(`Rencontre programmée pour « ${project.name} »`);
          }}
        />
      )}
      <InviteMembersDrawer projectId={project.id} open={invite} onClose={() => setInvite(false)} />
      <ProjetsToast message={toast} />
    </div>
  );
}
