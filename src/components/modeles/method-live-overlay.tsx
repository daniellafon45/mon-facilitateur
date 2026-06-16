"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, Download, Eye, FolderPlus, Save, X } from "lucide-react";
import type { LibMethodItem } from "@/lib/methods/library-data";
import { SPECIAL_TOOL_IDS } from "@/lib/methods/library-data";
import {
  DEFAULT_LIB_MEMBERS,
  DEFAULT_MEETING_ROLES,
  createEmptyRaci,
  type MeetingRole,
} from "@/lib/methods/tool-constants";
import { MethodRenderer, isMethodImplemented } from "@/components/session/methods/registry";
import type { SessionState } from "@/components/session/methods/column-workspace";
import { RaciMatrix } from "@/components/modeles/raci-matrix";
import { ToolRoleMatrix } from "@/components/modeles/tool-role-matrix";
import { ToolTeamCharter } from "@/components/modeles/tool-team-charter";
import { ToolCommPlan } from "@/components/modeles/tool-comm-plan";
import {
  RaciTable,
  CharteEditor,
  RegTable,
  COMMS_COLS,
} from "@/components/projets/project-tabs/registry-tables";
import { useProjectRegistry } from "@/lib/hooks/use-project-registry";
import { SessionQuickTool } from "@/components/modeles/session-quick-tool";
import {
  SaveMethodToProjectDialog,
  type SaveMethodDialogMode,
} from "@/components/modeles/save-method-to-project-dialog";
import { Button } from "@/components/ui/button";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { useDocumentsStore } from "@/lib/store/documents-store";
import { useMethodSavesStore } from "@/lib/store/method-saves-store";
import { cn } from "@/lib/utils";

const WhiteboardBoard = dynamic(
  () => import("@/components/whiteboard/whiteboard-board").then((m) => m.WhiteboardBoard),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-muted-foreground">Chargement du tableau…</div> },
);

interface MethodLiveOverlayProps {
  item: LibMethodItem;
  onClose: () => void;
  onToast?: (msg: string) => void;
  /** En séance live : masque le CTA « Utiliser en séance » et adapte le libellé. */
  context?: "library" | "session";
  projectId?: string | null;
}

export function MethodLiveOverlay({ item, onClose, onToast, context = "library", projectId }: MethodLiveOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [saveDialog, setSaveDialog] = useState<SaveMethodDialogMode | null>(null);
  const [saving, setSaving] = useState(false);
  const [wbSubdialog, setWbSubdialog] = useState(false);

  const allProjects = useFacilitationStore((s) => s.projects);
  const projects = useMemo(
    () => allProjects.filter((p) => !p.archived),
    [allProjects],
  );
  const hydrateProjects = useFacilitationStore((s) => s.hydrateFromSupabase);
  const projectsHydrated = useFacilitationStore((s) => s.hydrated);
  const addProject = useFacilitationStore((s) => s.addProject);
  const addMethodSave = useMethodSavesStore((s) => s.add);
  const addDocument = useDocumentsStore((s) => s.add);

  const members = DEFAULT_LIB_MEMBERS;
  const memberIds = members.map((m) => m.id);

  const [methodState, setMethodState] = useState<SessionState>({});
  const [raci, setRaci] = useState(() => createEmptyRaci(memberIds));
  const [roles, setRoles] = useState<MeetingRole[]>(() => DEFAULT_MEETING_ROLES.map((r) => ({ ...r })));
  const { registry, update: updateRegistry } = useProjectRegistry(projectId ?? "", []);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [item.id, projects.length]);

  useEffect(() => {
    if (!projectsHydrated) void hydrateProjects();
  }, [projectsHydrated, hydrateProjects]);

  const collectSavePayload = useCallback(() => {
    switch (item.id) {
      case "raci":
        return raci;
      case "roles":
        return roles;
      default:
        if (isMethodImplemented(item.id)) return methodState;
        return { methodId: item.id };
    }
  }, [item.id, methodState, raci, roles]);

  const persistToProject = useCallback(
    async (projectId: string, projectName: string) => {
      setSaving(true);
      try {
        addMethodSave({
          projectId,
          methodId: item.id,
          methodTitle: item.title,
          payload: collectSavePayload(),
        });
        addDocument({
          name: `${item.title} — travail enregistré`,
          type: "DOCX",
          projectId,
          source: "méthode",
        });
        onToast?.(`« ${item.title} » enregistré dans « ${projectName} »`);
        setSaveDialog(null);
      } finally {
        setSaving(false);
      }
    },
    [addDocument, addMethodSave, collectSavePayload, item.id, item.title, onToast],
  );

  const handleSaveExisting = useCallback(
    async (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;
      await persistToProject(projectId, project.name);
    },
    [persistToProject, projects],
  );

  const handleSaveNew = useCallback(
    async (projectName: string) => {
      const project = await addProject({ name: projectName, objective: item.title });
      await persistToProject(project.id, project.name);
    },
    [addProject, item.title, persistToProject],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (saveDialog) {
        setSaveDialog(null);
        return;
      }
      if (wbSubdialog) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saveDialog, wbSubdialog]);

  const body = useMemo(() => {
    if (item.qt) return <SessionQuickTool item={item} />;

    switch (item.id) {
      case "raci":
        if (projectId) {
          return (
            <RaciTable
              data={registry.raci}
              onChange={(raci) => updateRegistry((prev) => ({ ...prev, raci }))}
            />
          );
        }
        return <RaciMatrix members={members} raci={raci} setRaci={setRaci} />;
      case "roles":
        return (
          <>
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              Assignez une personne à chaque rôle de la rencontre. Ajoutez des rôles depuis la bibliothèque.
            </p>
            <ToolRoleMatrix members={members} roles={roles} setRoles={setRoles} />
          </>
        );
      case "charter":
        if (projectId) {
          return (
            <CharteEditor
              charte={registry.charte}
              onChange={(charte) => updateRegistry((prev) => ({ ...prev, charte }))}
            />
          );
        }
        return (
          <>
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              Définissez ensemble vos règles de collaboration et vos attentes.
            </p>
            <ToolTeamCharter />
          </>
        );
      case "commplan":
        if (projectId) {
          return (
            <RegTable
              columns={COMMS_COLS}
              rows={registry.comms}
              onChange={(comms) => updateRegistry((prev) => ({ ...prev, comms }))}
              addLabel="Ajouter un canal"
            />
          );
        }
        return (
          <>
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              Planifiez qui reçoit quelle information, à quelle fréquence et par quel canal.
            </p>
            <ToolCommPlan members={members} />
          </>
        );
      case "tableau-blanc":
        return (
          <div className="min-h-0 flex-1">
            <WhiteboardBoard
              className="h-full min-h-[480px]"
              height="100%"
              onSubdialogOpenChange={setWbSubdialog}
            />
          </div>
        );
      default:
        if (isMethodImplemented(item.id)) {
          return (
            <MethodRenderer methodId={item.id} state={methodState} onChange={setMethodState} />
          );
        }
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-extrabold">Outil en cours de développement</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Cet outil sera disponible dans une prochaine mise à jour.
            </p>
          </div>
        );
    }
  }, [item, methodState, raci, roles, members, projectId, registry, updateRegistry]);

  const isFull = item.full || item.id === "tableau-blanc";

  const isSession = context === "session";

  if (!mounted) return null;

  return createPortal(
    <>
    <div
      className="fixed inset-0 z-[2500] flex items-center justify-center p-3 sm:p-5"
      onClick={() => {
        if (saveDialog || wbSubdialog) return;
        onClose();
      }}
      role="presentation"
    >
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="method-live-title"
        className={cn(
          "relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl",
          isFull ? "max-w-[min(96vw,1400px)]" : "max-w-5xl",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <p id="method-live-title" className="truncate font-extrabold">{item.title}</p>
            <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
              <Eye className="h-3 w-3" /> {isSession ? "Outil de séance" : "Test libre — non enregistré"}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!SPECIAL_TOOL_IDS.has(item.id) && !item.qt && (
              <Button variant="secondary" size="sm" className="hidden rounded-xl sm:inline-flex">
                <Download className="mr-1 h-4 w-4" /> Télécharger
              </Button>
            )}
            {!isSession && (
              <Button
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  onClose();
                  onToast?.(`« ${item.title} » s'ouvrira dans votre prochaine séance`);
                }}
              >
                <ArrowRight className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Utiliser en séance</span>
                <span className="sm:hidden">Séance</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onClose} aria-label="Fermer">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            isFull ? "flex flex-col p-3 sm:p-4" : "p-4 sm:p-6",
          )}
        >
          <div className={isFull ? "flex min-h-0 flex-1 flex-col" : "w-full"}>{body}</div>
        </div>

        {!item.qt && (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3 sm:px-5">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fermer
            </Button>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setSaveDialog("new")}
              >
                <FolderPlus className="mr-1 h-4 w-4" />
                Enregistrer dans un nouveau projet
              </Button>
              <Button
                type="button"
                size="sm"
                className="rounded-xl"
                onClick={() => setSaveDialog("existing")}
              >
                <Save className="mr-1 h-4 w-4" />
                Enregistrer dans le projet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>

    <SaveMethodToProjectDialog
      open={saveDialog !== null}
      mode={saveDialog ?? "existing"}
      methodTitle={item.title}
      projects={projects}
      busy={saving}
      onClose={() => setSaveDialog(null)}
      onSaveExisting={handleSaveExisting}
      onSaveNew={handleSaveNew}
    />
    </>,
    document.body,
  );
}
