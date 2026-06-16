"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Folder,
  FolderOpen,
  LayoutGrid,
  Pencil,
  Trash2,
  Unlink,
} from "lucide-react";
import type { WhiteboardRecord } from "@/lib/supabase/queries/whiteboards";
import type { Project } from "@/types/facilitation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface WhiteboardSavedPanelProps {
  boards: WhiteboardRecord[];
  projects: Project[];
  onOpen: (board: WhiteboardRecord) => void;
  onDelete: (id: string) => Promise<void>;
  onAssignProject: (boardId: string, projectId: string | null) => Promise<void>;
  onNewBoard: () => void;
}

export function WhiteboardSavedPanel({
  boards,
  projects,
  onOpen,
  onDelete,
  onAssignProject,
  onNewBoard,
}: WhiteboardSavedPanelProps) {
  const [deleteTarget, setDeleteTarget] = useState<WhiteboardRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [contextBoard, setContextBoard] = useState<WhiteboardRecord | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  const closeContext = useCallback(() => {
    setContextBoard(null);
    setMenuPos(null);
  }, []);

  useEffect(() => {
    if (!menuPos) return;
    const onClick = () => closeContext();
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [menuPos, closeContext]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  if (boards.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center">
        <LayoutGrid className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-base font-bold">Aucun tableau enregistré</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Dessinez dans l&apos;éditeur puis cliquez sur « Enregistrer » pour sauvegarder votre premier tableau.
        </p>
        <Button className="mt-4 rounded-xl gap-1.5" onClick={onNewBoard}>
          <Pencil className="h-4 w-4" /> Nouveau tableau
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {boards.length} tableau{boards.length > 1 ? "x" : ""} enregistré{boards.length > 1 ? "s" : ""}
          <span className="hidden sm:inline"> · clic droit pour assigner à un projet</span>
        </p>
        <Button size="sm" variant="outline" className="rounded-lg gap-1" onClick={onNewBoard}>
          <Pencil className="h-3.5 w-3.5" /> Nouveau
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <div
            key={board.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(board)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onOpen(board);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextBoard(board);
              setMenuPos({ x: e.clientX, y: e.clientY });
            }}
            className="group relative cursor-pointer rounded-2xl border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="mb-3 flex h-24 items-center justify-center rounded-xl border bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] bg-[length:16px_16px]">
              <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
              <span className="absolute bottom-16 right-6 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {board.elements.length} élément{board.elements.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="font-extrabold leading-snug">{board.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Modifié {formatDate(board.updatedAt)}
            </div>
            {board.projectName ? (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                <Folder className="h-3 w-3" /> {board.projectName}
              </div>
            ) : (
              <div className="mt-2 text-[11px] font-semibold text-muted-foreground">Sans projet</div>
            )}
            <button
              type="button"
              title="Supprimer"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(board);
              }}
              className={cn(
                "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg",
                "text-destructive opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10",
              )}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {contextBoard && menuPos && (
        <div
          className="fixed z-[200] min-w-[220px] rounded-xl border bg-popover p-1 shadow-lg"
          style={{ left: menuPos.x, top: menuPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground truncate max-w-[200px]">
            {contextBoard.name}
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"
            onClick={() => {
              onOpen(contextBoard);
              closeContext();
            }}
          >
            <FolderOpen className="h-4 w-4" /> Ouvrir
          </button>
          <div className="my-1 h-px bg-border" />
          <div className="px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
            Assigner à un projet
          </div>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted"
            onClick={() => {
              void onAssignProject(contextBoard.id, null);
              closeContext();
            }}
          >
            <Unlink className="h-4 w-4" /> Aucun projet
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted",
                contextBoard.projectId === p.id && "bg-primary/10 text-primary font-semibold",
              )}
              onClick={() => {
                void onAssignProject(contextBoard.id, p.id);
                closeContext();
              }}
            >
              <Folder className="h-4 w-4 shrink-0" />
              <span className="truncate">{p.name}</span>
            </button>
          ))}
          {projects.length === 0 && (
            <div className="px-2 py-2 text-xs text-muted-foreground">Aucun projet disponible</div>
          )}
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
            onClick={() => {
              setDeleteTarget(contextBoard);
              closeContext();
            }}
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </button>
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer ce tableau ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            « {deleteTarget?.name} » sera définitivement supprimé. Cette action est irréversible.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
