"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  Folder,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { DisplayProject } from "@/types/facilitation";
import { PRJ_SORTS, PRJ_TABS, ROW_ACTIONS } from "@/lib/projets/constants";
import { displayProjects } from "@/lib/projets/display-project";
import { preloadProjectMembers } from "@/lib/hooks/use-project-members";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { ActivityJournal, ProjetsRail, TasksScreen } from "@/components/projets/projets-extra";
import {
  ConfirmModal,
  FilterDrawer,
  NewProjectDrawer,
  RenameModal,
  ScheduleDrawer,
} from "@/components/projets/projets-modals";
import { ProjectGridCard, ProjectListHeader, ProjectRow, ProjectTableColGroup } from "@/components/projets/projets-rows";
import { ProjectDetail } from "@/components/projets/project-detail";
import { ProjectIcon } from "@/components/projets/projets-icon";
import { ProjetsToast, useProjetsToast } from "@/components/projets/projets-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SubView = null | "activity" | "tasks";

export function ProjetsPage() {
  const router = useRouter();
  const store = useFacilitationStore();
  const { toast, flash } = useProjetsToast();

  const [tab, setTab] = useState<(typeof PRJ_TABS)[number]>("Tous les projets");
  const [view, setView] = useState<"list" | "grid">("list");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState("modified");
  const [sortOpen, setSortOpen] = useState(false);
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ project: DisplayProject; action: "delete" | "archive" } | null>(null);
  const [sched, setSched] = useState<DisplayProject | null>(null);
  const [renaming, setRenaming] = useState<DisplayProject | null>(null);
  const [newProj, setNewProj] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [kpi, setKpi] = useState<string | null>(null);
  const [memberFilter, setMemberFilter] = useState<"1-4" | "5-8" | "9+" | null>(null);
  const [sub, setSub] = useState<SubView>(null);
  const [openProject, setOpenProject] = useState<DisplayProject | null>(null);
  const [membersRefreshKey, setMembersRefreshKey] = useState(0);

  useEffect(() => {
    if (!store.hydrated) void store.hydrateFromSupabase();
  }, [store.hydrated, store.hydrateFromSupabase]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openId = params.get("open");
    if (!openId || !store.hydrated) return;
    const p = displayProjects(store.projects, store.meetings).find((x) => x.id === openId);
    if (p) setOpenProject(p);
  }, [store.hydrated, store.projects, store.meetings]);

  const allDisplay = useMemo(
    () => displayProjects(store.projects, store.meetings),
    [store.projects, store.meetings],
  );

  const live = allDisplay.filter((p) => !p.archived);

  const stats = [
    { key: "actif", icon: "Folder", val: live.filter((p) => p.statusId === "actif").length, label: "Actifs" },
    { key: "avenir", icon: "Calendar", val: live.filter((p) => p.next).length, label: "À venir" },
    { key: "attente", icon: "Clock", val: live.filter((p) => p.statusId === "attente").length, label: "En attente" },
    { key: "termine", icon: "CheckCircle", val: live.filter((p) => p.statusId === "termine").length, label: "Terminés" },
    { key: "members", icon: "Users", val: live.reduce((s, p) => s + p.members, 0), label: "Participants" },
  ];

  let list = live;
  if (tab === "Archivés") list = allDisplay.filter((p) => p.archived || p.statusId === "termine");
  else if (tab === "Mes projets favoris") list = list.filter((p) => p.star);
  else if (tab === "Partagés avec moi") list = list.filter((p) => p.shared);
  if (kpi === "actif") list = list.filter((p) => p.statusId === "actif");
  if (kpi === "avenir") list = list.filter((p) => p.next);
  if (kpi === "attente") list = list.filter((p) => p.statusId === "attente");
  if (kpi === "termine") list = list.filter((p) => p.statusId === "termine");
  if (memberFilter === "1-4") list = list.filter((p) => p.members >= 1 && p.members <= 4);
  if (memberFilter === "5-8") list = list.filter((p) => p.members >= 5 && p.members <= 8);
  if (memberFilter === "9+") list = list.filter((p) => p.members >= 9);
  if (query.trim()) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  list = [...list].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "progress") return b.progress - a.progress;
    if (sortBy === "members") return b.members - a.members;
    return a.modified - b.modified;
  });

  const visible = showAll ? list : list.slice(0, 5);
  const visibleProjectIdsKey = visible.map((p) => p.id).join("|");
  const sortLabel = PRJ_SORTS.find((s) => s.id === sortBy)?.label ?? "Trier";

  useEffect(() => {
    const ids = visibleProjectIdsKey ? visibleProjectIdsKey.split("|") : [];
    void Promise.all(ids.map((id) => preloadProjectMembers(id))).then(() => {
      setMembersRefreshKey((k) => k + 1);
    });
  }, [visibleProjectIdsKey]);

  const recentActivity = store.activityView().slice(0, 3);
  const reportsToSend = store.meetingsView().filter((m) => m.status === "Terminée" && !m.archived).length;
  const noDueTasks = store.openTasks().filter((t) => !t.due && !t.dueISO).length;
  const toSchedule = live.filter((p) => p.statusId !== "termine" && !p.next);

  const toggleFav = (id: string) => store.toggleProjectStar(id);

  const doRowAction = (p: DisplayProject, a: string) => {
    setRowMenu(null);
    if (a === "fav") {
      toggleFav(p.id);
      flash(p.star ? `« ${p.name} » retiré des favoris` : `« ${p.name} » ajouté aux favoris`);
      return;
    }
    if (a === "delete" || a === "archive") {
      setConfirm({ project: p, action: a });
      return;
    }
    if (a === "rename") setRenaming(p);
    if (a === "duplicate") {
      void store.duplicateProject(p.id).then(() => flash(`« ${p.name} » dupliqué`));
    }
    if (a === "share") {
      const url = `${window.location.origin}/dashboard/projets?open=${p.id}`;
      void navigator.clipboard.writeText(url);
      flash("Lien de partage copié");
    }
  };

  const confirmAction = () => {
    if (!confirm) return;
    const { project, action } = confirm;
    if (action === "archive") {
      store.archiveProjectLocal(project.id);
      flash(`« ${project.name} » archivé`);
    }
    if (action === "delete") {
      void store.deleteProject(project.id);
      flash(`« ${project.name} » supprimé`);
    }
    setConfirm(null);
  };

  const onKpi = (key: string) => {
    if (key === "members") {
      setMemberFilter((f) => (f === "1-4" ? null : "1-4"));
      setKpi(null);
      setTab("Tous les projets");
      return;
    }
    setMemberFilter(null);
    setKpi((f) => (f === key ? null : key));
    setTab("Tous les projets");
  };

  const handleCreate = async (data: { name: string; members: number; status: string; icon: string }) => {
    const created = await store.addProject(data);
    return displayProjects([created], store.meetings)[0];
  };

  if (openProject) {
    return (
      <ProjectDetail
        project={openProject}
        onBack={() => setOpenProject(null)}
        onNavRencontres={() => router.push("/dashboard/rencontres")}
      />
    );
  }

  if (sub === "activity") {
    return (
      <ActivityJournal
        projects={allDisplay}
        onBack={() => setSub(null)}
        onOpenProject={(p) => { setSub(null); setOpenProject(p); }}
      />
    );
  }

  if (sub === "tasks") {
    return (
      <TasksScreen
        projects={allDisplay}
        onBack={() => setSub(null)}
        onOpenProject={(p) => { setSub(null); setOpenProject(p); }}
      />
    );
  }

  const rowProps = (p: DisplayProject, last?: boolean) => ({
    p,
    last,
    membersRefreshKey,
    fav: !!p.star,
    onOpen: () => setOpenProject(p),
    onFav: () => toggleFav(p.id),
    onMeetings: () => router.push("/dashboard/rencontres"),
    onMenu: () => setRowMenu(rowMenu === p.id ? null : p.id),
    menuOpen: rowMenu === p.id,
    onPostMortem: () => setOpenProject(p),
    actions: [
      { id: "fav", icon: "Star", label: p.star ? "Retirer des favoris" : "Ajouter aux favoris" },
      ...ROW_ACTIONS,
    ],
    onAction: (a: string) => doRowAction(p, a),
    onSched: () => setSched(p),
    closeMenu: () => setRowMenu(null),
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0">
      <div className="flex-1 min-w-0 overflow-y-auto px-8 py-8 pb-12">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-[30px] font-extrabold tracking-tight">Mes projets</h1>
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-[10px] border bg-background px-3.5 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-[150px] border-0 bg-transparent text-[13.5px] outline-none"
                placeholder="Rechercher..."
              />
            </div>
            <Button variant="outline" size="sm" className="rounded-lg gap-1" onClick={() => setFilterOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" /> Filtres
            </Button>
            <Button size="sm" className="rounded-lg gap-1" onClick={() => setNewProj(true)}>
              <Plus className="h-4 w-4" /> Nouveau projet
            </Button>
          </div>
        </div>

        {/* KPI */}
        <div className="mb-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map((s) => {
            const on = kpi === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onKpi(s.key)}
                className={cn(
                  "relative rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                  on ? "border-blue-500 bg-blue-50" : "border-border bg-background hover:border-blue-200 hover:shadow-sm",
                )}
              >
                <ProjectIcon name={s.icon} size={20} className="text-foreground" />
                <div className={cn("mt-2 text-[26px] font-extrabold tracking-tight", on ? "text-blue-600" : "text-slate-900")}>{s.val}</div>
                <div className="text-xs font-semibold text-slate-700">{s.label}</div>
                {on && <Check className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-blue-600" />}
              </button>
            );
          })}
        </div>

        {memberFilter && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Participants :</span>
            {(["1-4", "5-8", "9+"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setMemberFilter(memberFilter === f ? null : f)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-bold",
                  memberFilter === f ? "border-blue-500 bg-blue-50 text-blue-700" : "hover:bg-slate-50",
                )}
              >
                {f === "9+" ? "9+" : f}
              </button>
            ))}
          </div>
        )}

        {/* Tabs + sort + view toggle */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-200">
          <div className="flex flex-wrap">
            {PRJ_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setKpi(null); }}
                className={cn(
                  "border-0 bg-transparent px-4 py-2.5 text-[13.5px] font-bold whitespace-nowrap cursor-pointer -mb-0.5",
                  tab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground border-b-2 border-transparent",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pb-2">
            <div className="flex rounded-lg border p-0.5">
              <button type="button" onClick={() => setView("list")} className={cn("rounded-md p-1.5", view === "list" ? "bg-muted" : "")} title="Liste">
                <List className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setView("grid")} className={cn("rounded-md p-1.5", view === "grid" ? "bg-muted" : "")} title="Grille">
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[13px] font-semibold cursor-pointer bg-background"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> {sortLabel} <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                  <div className="absolute top-[calc(100%+4px)] right-0 z-50 min-w-[200px] rounded-[11px] border bg-background p-1 shadow-lg">
                    {PRJ_SORTS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSortBy(s.id); setSortOpen(false); }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] font-bold cursor-pointer",
                          sortBy === s.id ? "bg-primary/10 text-primary" : "text-slate-700 hover:bg-muted",
                        )}
                      >
                        <span className="flex-1">{s.label}</span>
                        {sortBy === s.id && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* List / Grid */}
        {visible.length === 0 ? (
          <div className="rounded-[14px] border border-dashed py-14 text-center">
            <div className="mx-auto mb-3.5 flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-slate-100 text-slate-400">
              <Folder className="h-6 w-6" />
            </div>
            <div className="text-base font-extrabold text-slate-700">Aucun projet</div>
            <div className="mt-1 text-sm text-muted-foreground">Ajustez vos filtres ou créez un projet.</div>
            <Button size="sm" className="mt-4 rounded-lg gap-1" onClick={() => setNewProj(true)}>
              <Plus className="h-4 w-4" /> Nouveau projet
            </Button>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((p) => (
              <ProjectGridCard key={p.id} {...rowProps(p)} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[14px] border bg-white">
            <table className="w-full min-w-[1020px] table-fixed border-collapse">
              <ProjectTableColGroup />
              <ProjectListHeader />
              <tbody>
                {visible.map((p, i) => (
                  <ProjectRow key={p.id} {...rowProps(p, i === visible.length - 1)} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {list.length > 5 && (
          <div className="py-4 text-center">
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="inline-flex items-center gap-1.5 border-0 bg-transparent text-sm font-bold text-primary cursor-pointer"
            >
              {showAll ? "Afficher moins" : `Afficher plus (${list.length - 5})`}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAll && "rotate-180")} />
            </button>
          </div>
        )}
      </div>

      <ProjetsRail
        reportsToSend={reportsToSend}
        noDueTasks={noDueTasks}
        toSchedule={toSchedule.length}
        recentActivity={recentActivity}
        onNavSeances={() => router.push("/dashboard/rencontres")}
        onOpenTasks={() => setSub("tasks")}
        onSchedule={() => {
          if (toSchedule.length) setSched(toSchedule[0]);
          else flash("Tous vos projets ont une prochaine rencontre");
        }}
        onOpenActivity={() => setSub("activity")}
        onOpenProjectFromActivity={(pid) => {
          const p = allDisplay.find((x) => x.id === pid);
          if (p) setOpenProject(p);
          else setSub("activity");
        }}
        onNavModeles={() => router.push("/dashboard/modeles")}
      />

      {filterOpen && (
        <FilterDrawer
          onClose={() => setFilterOpen(false)}
          onApply={(f) => {
            if (f.status) setKpi(f.status);
            setFilterOpen(false);
            flash("Filtres appliqués");
          }}
          onReset={() => { setKpi(null); setQuery(""); setTab("Tous les projets"); }}
        />
      )}
      {sched && (
        <ScheduleDrawer
          project={sched}
          onClose={() => setSched(null)}
          onConfirm={(date, time) => {
            void store.scheduleProjectMeeting(sched.id, date, time);
            setSched(null);
            flash(`Rencontre programmée pour « ${sched.name} » visible dans Mes rencontres`);
          }}
        />
      )}
      {renaming && (
        <RenameModal
          project={renaming}
          onClose={() => setRenaming(null)}
          onConfirm={(name) => {
            void store.renameProject(renaming.id, name);
            setRenaming(null);
            flash("Projet renommé");
          }}
        />
      )}
      {newProj && (
        <NewProjectDrawer
          onClose={() => setNewProj(false)}
          onWizard={() => { setNewProj(false); router.push("/dashboard/wizard"); }}
          onCreate={handleCreate}
          onCreated={(p) => { setNewProj(false); flash(`Projet « ${p.name} » créé`); }}
        />
      )}
      {confirm && (
        <ConfirmModal confirm={confirm} onCancel={() => setConfirm(null)} onConfirm={confirmAction} />
      )}
      <ProjetsToast message={toast} />
    </div>
  );
}
