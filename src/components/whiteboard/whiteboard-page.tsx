"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LayoutGrid, Pencil } from "lucide-react";
import { WhiteboardBoard } from "@/components/whiteboard/whiteboard-board";
import { WhiteboardSavedPanel } from "@/components/whiteboard/whiteboard-saved-panel";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { useWhiteboardStore } from "@/lib/store/whiteboard-store";
import type { WhiteboardRecord } from "@/lib/supabase/queries/whiteboards";
import { cn } from "@/lib/utils";

type PageMode = "editor" | "library";

export function WhiteboardPage() {
  const [mode, setMode] = useState<PageMode>("editor");
  const [toast, setToast] = useState("");

  const boards = useWhiteboardStore((s) => s.boards);
  const currentId = useWhiteboardStore((s) => s.currentId);
  const hydrated = useWhiteboardStore((s) => s.hydrated);
  const hydrate = useWhiteboardStore((s) => s.hydrate);
  const setCurrent = useWhiteboardStore((s) => s.setCurrent);
  const saveBoard = useWhiteboardStore((s) => s.saveBoard);
  const removeBoard = useWhiteboardStore((s) => s.removeBoard);
  const assignProject = useWhiteboardStore((s) => s.assignProject);

  const allProjects = useFacilitationStore((s) => s.projects);
  const projects = useMemo(
    () => allProjects.filter((p) => !p.archived),
    [allProjects],
  );
  const hydrateProjects = useFacilitationStore((s) => s.hydrateFromSupabase);
  const projectsHydrated = useFacilitationStore((s) => s.hydrated);

  const current = useWhiteboardStore((s) =>
    s.currentId ? s.boards.find((b) => b.id === s.currentId) ?? null : null,
  );

  useEffect(() => {
    if (!hydrated) void hydrate();
    if (!projectsHydrated) void hydrateProjects();
  }, [hydrated, hydrate, projectsHydrated, hydrateProjects]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2400);
  }, []);

  const openBoard = (board: WhiteboardRecord) => {
    setCurrent(board.id);
    setMode("editor");
  };

  const startNewBoard = () => {
    setCurrent(null);
    setMode("editor");
  };

  const handleSave = async (payload: {
    name: string;
    elements: import("@/lib/whiteboard/elements").WbElement[];
    view: { tx: number; ty: number; k: number };
  }) => {
    const saved = await saveBoard({
      id: currentId,
      name: payload.name,
      elements: payload.elements,
      viewState: payload.view,
      projectId: current?.projectId ?? null,
    });
    flash(`« ${saved.name} » enregistré`);
  };

  const handleDelete = async (id: string) => {
    await removeBoard(id);
    flash("Tableau supprimé");
  };

  const handleAssign = async (boardId: string, projectId: string | null) => {
    await assignProject(boardId, projectId);
    const proj = projects.find((p) => p.id === projectId);
    flash(
      projectId
        ? `Assigné au projet « ${proj?.name ?? ""} »`
        : "Projet retiré du tableau",
    );
  };

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-[540px] flex-col">
      <div className="mb-4 shrink-0 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau blanc</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Canvas type Miro : dessin, formes, notes, texte, flèches, modèles et zoom infini.
          </p>
        </div>

        <div className="flex rounded-xl border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setMode("editor")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors cursor-pointer",
              mode === "editor" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
            )}
          >
            <Pencil className="h-4 w-4" /> Éditeur
          </button>
          <button
            type="button"
            onClick={() => setMode("library")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-colors cursor-pointer",
              mode === "library" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
            )}
          >
            <LayoutGrid className="h-4 w-4" /> Mes tableaux
            {boards.length > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-extrabold text-primary">
                {boards.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {mode === "library" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <WhiteboardSavedPanel
            boards={boards}
            projects={projects}
            onOpen={openBoard}
            onDelete={handleDelete}
            onAssignProject={handleAssign}
            onNewBoard={startNewBoard}
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 flex flex-col gap-2">
          {current && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold">{current.name}</span>
              {current.projectName && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  {current.projectName}
                </span>
              )}
              <button
                type="button"
                onClick={startNewBoard}
                className="text-xs font-semibold text-primary cursor-pointer border-0 bg-transparent"
              >
                + Nouveau tableau vierge
              </button>
            </div>
          )}
          <WhiteboardBoard
            key={currentId ?? "new"}
            className="h-full flex-1"
            height="100%"
            boardId={currentId}
            boardName={current?.name}
            initialElements={current?.elements ?? []}
            initialView={current?.viewState}
            onSave={handleSave}
          />
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
