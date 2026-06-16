"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Folder,
  FolderTree,
  Info,
  LayoutList,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocumentsStore } from "@/lib/store/documents-store";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import {
  CURRENT_USER_OWNER,
  DOC_FILE_TYPES,
  DOC_OWNERS,
  DOC_SORTS,
  DOC_VIEWS,
  docMatchesView,
  docTypeColor,
  fmtDate,
  fmtSize,
  fmtTime,
  sourceLabel,
} from "@/lib/documents/constants";
import { DocBadge } from "@/components/documents/doc-badge";
import { OwnerDot } from "@/components/documents/owner-dot";
import { DocumentsFiltersRail } from "@/components/documents/documents-filters-rail";
import { DocumentsTreeView } from "@/components/documents/documents-tree-view";
import { buildDocumentsTree } from "@/lib/documents/build-tree";
import {
  ConfirmDialog,
  mapMeetings,
  mapProjects,
  MoveDialog,
  PreviewDrawer,
  RenameDialog,
  ShareModal,
  UploadModal,
} from "@/components/documents/documents-modals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DocFilters, DocItem, DocModalState, DocSort, DocView } from "@/lib/documents/types";

const KPI_CONFIG = [
  { key: "tous" as const, icon: FileText, color: "text-blue-600 bg-blue-500/10", label: "Tous les documents" },
  { key: "projets" as const, icon: Folder, color: "text-blue-600 bg-blue-500/10", label: "Par projets" },
  { key: "reunions" as const, icon: Calendar, color: "text-violet-600 bg-violet-500/10", label: "Par réunions" },
  { key: "partages" as const, icon: Users, color: "text-emerald-600 bg-emerald-500/10", label: "Partagés avec moi" },
  { key: "recents" as const, icon: Clock, color: "text-sky-600 bg-sky-500/10", label: "Récents" },
  { key: "favoris" as const, icon: Star, color: "text-amber-600 bg-amber-500/10", label: "Favoris" },
];

const EMPTY_FILTERS: DocFilters = {
  type: "",
  owner: "",
  project: "",
  mine: false,
  favOnly: false,
  period: "",
};

function useDocsReady(ms = 360) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const t = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(t);
  }, []);
  return ready;
}

export function DocumentsPage() {
  const router = useRouter();
  const ready = useDocsReady();
  const list = useDocumentsStore((s) => s.list);
  const isRecent = useDocumentsStore((s) => s.isRecent);
  const toggleFav = useDocumentsStore((s) => s.toggleFav);
  const duplicate = useDocumentsStore((s) => s.duplicate);
  const trash = useDocumentsStore((s) => s.trash);
  const trashMany = useDocumentsStore((s) => s.trashMany);
  const restore = useDocumentsStore((s) => s.restore);
  const purge = useDocumentsStore((s) => s.purge);
  const purgeAll = useDocumentsStore((s) => s.purgeAll);

  const projects = useFacilitationStore((s) => s.projects);
  const meetings = useFacilitationStore((s) => s.meetings);
  const projectRefs = useMemo(() => mapProjects(projects), [projects]);
  const meetingRefs = useMemo(() => mapMeetings(meetings, projects), [meetings, projects]);

  const [view, setView] = useState<DocView>("tous");
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState<DocSort>("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<DocItem | null>(null);
  const [modal, setModal] = useState<DocModalState>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [filters, setFilters] = useState<DocFilters>(EMPTY_FILTERS);
  const [layout, setLayout] = useState<"list" | "tree">("list");

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  const setF = (patch: Partial<DocFilters>) => setFilters((f) => ({ ...f, ...patch }));
  const resetFilters = () => setFilters(EMPTY_FILTERS);
  const activeFilterCount =
    ["type", "owner", "project"].filter((k) => filters[k as keyof DocFilters]).length +
    (filters.mine ? 1 : 0) +
    (filters.favOnly ? 1 : 0) +
    (filters.period ? 1 : 0);

  const all = list();
  const trashCount = list(true).filter((d) => d.trashed).length;

  const kpis = KPI_CONFIG.map((s) => ({
    ...s,
    val:
      s.key === "tous"
        ? all.length
        : s.key === "projets"
          ? all.filter((d) => d.projectId).length
          : s.key === "reunions"
            ? all.filter((d) => d.meetingId).length
            : s.key === "partages"
              ? all.filter((d) => d.owner !== CURRENT_USER_OWNER).length
              : s.key === "recents"
                ? all.filter((d) => isRecent(d)).length
                : all.filter((d) => d.fav).length,
  }));

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let items = list(true).filter((d) => docMatchesView(d, view));

    if (ql) {
      items = items.filter((d) => {
        const proj = projectRefs.find((p) => p.id === d.projectId)?.name || "";
        const meet = meetingRefs.find((m) => m.id === d.meetingId)?.name || "";
        return `${d.name} ${proj} ${meet}`.toLowerCase().includes(ql);
      });
    }
    if (filters.type) items = items.filter((d) => (d.type || "Dossier") === filters.type);
    if (filters.owner) items = items.filter((d) => d.owner === filters.owner);
    if (filters.project) items = items.filter((d) => d.projectId === filters.project);
    if (filters.mine) items = items.filter((d) => d.owner === CURRENT_USER_OWNER);
    if (filters.favOnly) items = items.filter((d) => d.fav);
    if (filters.period) {
      const days = Number(filters.period);
      items = items.filter((d) => Date.now() - d.ts <= days * 86400000);
    }

    return [...items].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name, "fr");
      if (sortBy === "size") return (b.size || 0) - (a.size || 0);
      if (sortBy === "type") return (a.type || "Dossier").localeCompare(b.type || "Dossier");
      if (sortBy === "old") return a.ts - b.ts;
      return b.ts - a.ts;
    });
  }, [list, view, q, filters, sortBy, projectRefs, meetingRefs]);

  const treeNodes = useMemo(
    () => buildDocumentsTree(rows, view, projectRefs, meetingRefs),
    [rows, view, projectRefs, meetingRefs],
  );

  useEffect(() => setSel(new Set()), [view]);

  const visibleIds = rows.map((d) => d.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => sel.has(id));
  const toggleAll = () => setSel(allSelected ? new Set() : new Set(visibleIds));
  const toggleOne = (id: string) => {
    const n = new Set(sel);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSel(n);
  };
  const selDocs = () => rows.filter((d) => sel.has(d.id));
  const isTrash = view === "corbeille";

  return (
    <div className="flex min-h-0">
      <div className="min-w-0 flex-1">
        {/* En-tête */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Documents</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Bibliothèque documentaire liée à vos projets et sessions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un document…"
                className="h-8 w-40 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 sm:w-48"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <Button variant="secondary" size="sm" className="gap-1.5 rounded-xl" onClick={() => setFilterOpen((o) => !o)}>
                <SlidersHorizontal className="h-4 w-4" />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-foreground px-1.5 text-[10px] font-bold text-background">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              {filterOpen && (
                <>
                  <button type="button" className="fixed inset-0 z-40" aria-label="Fermer" onClick={() => setFilterOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border bg-popover p-4 shadow-xl">
                    <p className="mb-3 text-sm font-extrabold">Filtrer les documents</p>
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1 text-xs font-bold text-muted-foreground">Type</p>
                        <Select value={filters.type || "_all"} onValueChange={(v) => setF({ type: v === "_all" ? "" : v })}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_all">Tous les types</SelectItem>
                            {DOC_FILE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-bold text-muted-foreground">Propriétaire</p>
                        <Select value={filters.owner || "_all"} onValueChange={(v) => setF({ owner: v === "_all" ? "" : v })}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_all">Tous</SelectItem>
                            {Object.entries(DOC_OWNERS).map(([k, o]) => (
                              <SelectItem key={k} value={k}>{o.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-bold text-muted-foreground">Projet</p>
                        <Select value={filters.project || "_all"} onValueChange={(v) => setF({ project: v === "_all" ? "" : v })}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_all">Tous les projets</SelectItem>
                            {projectRefs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="ghost" size="sm" className="px-0" onClick={resetFilters}>
                        Réinitialiser
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button className="gap-1.5 rounded-xl" onClick={() => setModal({ type: "upload" })}>
              <Plus className="h-4 w-4" /> Nouveau document
            </Button>
          </div>
        </div>

        {/* KPI */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {kpis.map((s) => {
            const active = view === s.key;
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setView(s.key)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all",
                  active ? "border-foreground bg-foreground/5 shadow-sm" : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <span className={cn("mb-2 inline-flex rounded-lg p-1.5", s.color)}>
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-xl font-extrabold tracking-tight">{s.val}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </button>
            );
          })}
        </div>

        {/* Onglets + tri */}
        <div className="mb-5 flex flex-wrap items-end gap-1">
          {DOC_VIEWS.map((t) => {
            const active = view === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setView(t.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-bold transition-colors",
                  active
                    ? "bg-muted/50 text-foreground"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                )}
              >
                {t.label}
                {t.key === "corbeille" && trashCount > 0 && (
                  <span className={cn(
                    "rounded-full px-1.5 text-[10px] font-extrabold",
                    active ? "bg-foreground text-background" : "bg-muted text-muted-foreground",
                  )}>
                    {trashCount}
                  </span>
                )}
              </button>
            );
          })}
          <div className="ml-auto flex flex-wrap items-center gap-2 pb-1">
            <div className="flex items-center rounded-xl border bg-background p-0.5">
              <button
                type="button"
                onClick={() => setLayout("list")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors",
                  layout === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutList className="h-3.5 w-3.5" />
                Liste
              </button>
              <button
                type="button"
                onClick={() => setLayout("tree")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors",
                  layout === "tree" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <FolderTree className="h-3.5 w-3.5" />
                Arbre
              </button>
            </div>
            <span className="text-xs text-muted-foreground">Trier par :</span>
            <DropdownMenu open={sortOpen} onOpenChange={setSortOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-1 rounded-xl">
                  {DOC_SORTS.find((s) => s.key === sortBy)?.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {DOC_SORTS.map((s) => (
                  <DropdownMenuItem key={s.key} onClick={() => setSortBy(s.key)}>
                    {sortBy === s.key && <Check className="mr-2 h-4 w-4" />}
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Actions groupées */}
        {sel.size > 0 && !isTrash && (
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-foreground/20 bg-foreground/5 px-4 py-2.5">
            <span className="text-sm font-bold text-foreground">{sel.size} sélectionné{sel.size > 1 ? "s" : ""}</span>
            <div className="flex-1" />
            <Button variant="secondary" size="sm" className="rounded-lg" onClick={() => flash(`${sel.size} document(s) téléchargé(s)`)}>
              <Download className="mr-1 h-3.5 w-3.5" /> Télécharger
            </Button>
            <Button variant="secondary" size="sm" className="rounded-lg" onClick={() => setModal({ type: "move", docs: selDocs() })}>
              <Folder className="mr-1 h-3.5 w-3.5" /> Déplacer
            </Button>
            <Button variant="secondary" size="sm" className="rounded-lg" onClick={() => { const d = selDocs()[0]; if (d) setModal({ type: "share", doc: d }); }}>
              <Users className="mr-1 h-3.5 w-3.5" /> Partager
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-lg text-destructive hover:text-destructive"
              onClick={() =>
                setModal({
                  type: "confirm",
                  title: "Mettre à la corbeille",
                  body: `${sel.size} document(s) seront déplacés vers la corbeille.`,
                  confirmLabel: "Déplacer",
                  danger: true,
                  onConfirm: () => {
                    trashMany([...sel]);
                    setSel(new Set());
                    flash(`${sel.size} document(s) déplacé(s)`);
                  },
                })
              }
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Supprimer
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSel(new Set())}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Bandeau corbeille */}
        {isTrash && trashCount > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
            <Info className="h-4 w-4 text-amber-600" />
            <span className="flex-1 text-sm text-amber-900">
              Les éléments de la corbeille sont définitivement supprimés après 30 jours.
            </span>
            <Button
              variant="secondary"
              size="sm"
              className="rounded-lg"
              onClick={() =>
                setModal({
                  type: "confirm",
                  title: "Vider la corbeille",
                  body: "Tous les éléments seront définitivement supprimés. Cette action est irréversible.",
                  confirmLabel: "Vider",
                  danger: true,
                  onConfirm: () => { purgeAll(); flash("Corbeille vidée"); },
                })
              }
            >
              Vider la corbeille
            </Button>
          </div>
        )}

        {/* Contenu */}
        <div className="mt-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
          {!ready ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FileText className="mx-auto mb-4 h-14 w-14 text-muted-foreground/40" />
              <p className="text-lg font-extrabold">
                {isTrash ? "La corbeille est vide" : q || activeFilterCount ? "Aucun document ne correspond" : "Aucun document ici"}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                {isTrash
                  ? "Les documents supprimés apparaîtront ici."
                  : q || activeFilterCount
                    ? "Essayez d'élargir votre recherche ou de réinitialiser les filtres."
                    : "Ajoutez un document ou produisez-en un depuis une séance."}
              </p>
              {!isTrash && !q && activeFilterCount === 0 && (
                <Button className="mt-4 rounded-xl" size="sm" onClick={() => setModal({ type: "upload" })}>
                  <Plus className="mr-1 h-4 w-4" /> Nouveau document
                </Button>
              )}
              {(q || activeFilterCount > 0) && !isTrash && (
                <Button variant="secondary" className="mt-4 rounded-xl" size="sm" onClick={() => { setQ(""); resetFilters(); }}>
                  Réinitialiser
                </Button>
              )}
            </div>
          ) : layout === "tree" ? (
            <DocumentsTreeView
              nodes={treeNodes}
              selectedId={preview?.id}
              onFileClick={(docId) => {
                const doc = rows.find((d) => d.id === docId);
                if (doc) setPreview(doc);
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {!isTrash && (
                      <th className="w-10 px-4 py-3">
                        <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                      </th>
                    )}
                    {(isTrash
                      ? ["NOM", "PROJET / RÉUNION", "TYPE", "SUPPRIMÉ LE", "ACTIONS"]
                      : ["NOM", "PROJET / RÉUNION", "TYPE", "PROPRIÉTAIRE", "MODIFIÉ LE", "TAILLE", "ACTIONS"]
                    ).map((h) => (
                      <th
                        key={h}
                        className={cn(
                          "px-3 py-3 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground",
                          h === "ACTIONS" && "text-right",
                        )}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => {
                    const proj = projectRefs.find((p) => p.id === d.projectId);
                    const meet = meetingRefs.find((m) => m.id === d.meetingId);
                    const selected = sel.has(d.id);
                    const tc = docTypeColor(d.type);

                    return (
                      <tr
                        key={d.id}
                        className={cn(
                          "border-b border-border/50 transition-colors",
                          selected ? "bg-foreground/5" : "hover:bg-muted/30",
                          !isTrash && "cursor-pointer",
                        )}
                        onClick={() => !isTrash && setPreview(d)}
                      >
                        {!isTrash && (
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <Checkbox checked={selected} onCheckedChange={() => toggleOne(d.id)} />
                          </td>
                        )}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <DocBadge type={d.type} size={32} />
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 font-bold">
                                <span className="truncate">{d.name}</span>
                                {d.fav && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {meet ? `Réunion du ${meet.date}` : proj ? "Document de projet" : sourceLabel(d.source)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          {proj ? (
                            <button
                              type="button"
                              className="block text-left text-xs font-bold text-foreground hover:underline"
                              onClick={() => { setPreview(null); router.push("/dashboard/projets"); }}
                            >
                              {proj.name}
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                          {meet ? (
                            <button
                              type="button"
                              className="mt-0.5 block text-left text-[11px] font-semibold text-muted-foreground hover:underline"
                              onClick={() => { setPreview(null); router.push("/dashboard/rencontres"); }}
                            >
                              ↳ {meet.name}
                            </button>
                          ) : null}
                        </td>
                        <td className="px-3 py-3">
                          {d.type ? (
                            <span
                              className="rounded px-2 py-0.5 text-[10px] font-extrabold"
                              style={{
                                background: `${tc}20`,
                                color: tc,
                                border: `1px solid ${tc}40`,
                              }}
                            >
                              {d.type}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Dossier</span>
                          )}
                        </td>
                        {!isTrash && (
                          <td className="px-3 py-3">
                            <OwnerDot owner={d.owner} size={24} />
                          </td>
                        )}
                        <td className="px-3 py-3">
                          <p className="text-sm font-semibold">{fmtDate(isTrash ? (d.deletedTs || d.ts) : d.ts)}</p>
                          <p className="text-xs text-muted-foreground">{fmtTime(isTrash ? (d.deletedTs || d.ts) : d.ts)}</p>
                        </td>
                        {!isTrash && (
                          <td className="px-3 py-3 text-muted-foreground">{fmtSize(d.size)}</td>
                        )}
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          {isTrash ? (
                            <div className="flex justify-end gap-1">
                              <Button variant="secondary" size="sm" className="h-8 rounded-lg" onClick={() => { restore(d.id); flash(`« ${d.name} » restauré`); }}>
                                Restaurer
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() =>
                                  setModal({
                                    type: "confirm",
                                    title: "Supprimer définitivement",
                                    body: `« ${d.name} » sera supprimé pour toujours.`,
                                    confirmLabel: "Supprimer",
                                    danger: true,
                                    onConfirm: () => { purge(d.id); flash("Document supprimé définitivement"); },
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-0.5">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreview(d)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setModal({ type: "share", doc: d })}>
                                <Users className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                  <DropdownMenuItem onClick={() => setPreview(d)}>
                                    <Eye className="mr-2 h-4 w-4" /> Aperçu
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => flash(`Téléchargement de « ${d.name} »`)}>
                                    <Download className="mr-2 h-4 w-4" /> Télécharger
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setModal({ type: "rename", doc: d })}>
                                    <Pencil className="mr-2 h-4 w-4" /> Renommer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setModal({ type: "move", docs: [d] })}>
                                    <Folder className="mr-2 h-4 w-4" /> Déplacer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { duplicate(d.id); flash("Document dupliqué"); }}>
                                    <Copy className="mr-2 h-4 w-4" /> Dupliquer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleFav(d.id)}>
                                    <Star className="mr-2 h-4 w-4" />
                                    {d.fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => { trash(d.id); flash("Déplacé vers la corbeille"); }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Mettre à la corbeille
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {ready && rows.length > 0 && (
            <p className="border-t py-3 text-center text-xs text-muted-foreground">
              {rows.length} document{rows.length > 1 ? "s" : ""} affiché{rows.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <DocumentsFiltersRail
        filters={filters}
        onChange={setF}
        onReset={resetFilters}
        activeCount={activeFilterCount}
        projects={projectRefs}
        treeNodes={treeNodes}
        selectedDocId={preview?.id}
        onFileClick={(docId) => {
          const doc = rows.find((d) => d.id === docId) ?? list().find((d) => d.id === docId);
          if (doc) setPreview(doc);
        }}
        onViewTrash={() => setView("corbeille")}
        flash={flash}
      />

      <PreviewDrawer
        doc={preview}
        open={!!preview}
        onClose={() => setPreview(null)}
        onShare={(d) => setModal({ type: "share", doc: d })}
        flash={flash}
        projects={projectRefs}
        meetings={meetingRefs}
        onOpenProject={() => router.push("/dashboard/projets")}
        onOpenMeeting={() => router.push("/dashboard/rencontres")}
      />

      <UploadModal
        open={modal?.type === "upload"}
        onClose={() => setModal(null)}
        flash={flash}
        projects={projectRefs}
        meetings={meetingRefs}
      />

      <ShareModal
        doc={modal?.type === "share" ? modal.doc : null}
        open={modal?.type === "share"}
        onClose={() => setModal(null)}
        flash={flash}
      />

      <RenameDialog
        doc={modal?.type === "rename" ? modal.doc : null}
        open={modal?.type === "rename"}
        onClose={() => setModal(null)}
        flash={flash}
      />

      <MoveDialog
        docs={modal?.type === "move" ? modal.docs : []}
        open={modal?.type === "move"}
        onClose={() => { setModal(null); setSel(new Set()); }}
        flash={flash}
        projects={projectRefs}
        meetings={meetingRefs}
      />

      {modal?.type === "confirm" && (
        <ConfirmDialog
          open
          title={modal.title}
          body={modal.body}
          confirmLabel={modal.confirmLabel}
          danger={modal.danger}
          onConfirm={modal.onConfirm}
          onClose={() => setModal(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-7 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-xl">
          <Check className="h-4 w-4" />
          {toast}
        </div>
      )}
    </div>
  );
}
