"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Folder, Plus, X } from "lucide-react";
import type { Project } from "@/types/facilitation";
import { METHOD_OVERLAY_POPOVER_Z } from "@/lib/methods/overlay-layer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type SaveMethodDialogMode = "existing" | "new";

interface SaveMethodToProjectDialogProps {
  open: boolean;
  mode: SaveMethodDialogMode;
  methodTitle: string;
  projects: Project[];
  busy?: boolean;
  onClose: () => void;
  onSaveExisting: (projectId: string) => void | Promise<void>;
  onSaveNew: (projectName: string) => void | Promise<void>;
}

export function SaveMethodToProjectDialog({
  open,
  mode,
  methodTitle,
  projects,
  busy = false,
  onClose,
  onSaveExisting,
  onSaveNew,
}: SaveMethodToProjectDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setSelectedProjectId(projects[0]?.id ?? "");
    setNewProjectName(`${methodTitle} — projet`);
  }, [open, methodTitle, projects]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const canConfirm =
    mode === "existing"
      ? Boolean(selectedProjectId)
      : Boolean(newProjectName.trim());

  if (!open || !mounted) return null;

  return createPortal(
    <div className={cn("fixed inset-0 flex items-center justify-center p-4", METHOD_OVERLAY_POPOVER_Z)}>
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm text-muted-foreground hover:text-foreground"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 pr-8">
          <h2 className="text-lg font-semibold">
            {mode === "existing" ? "Enregistrer dans un projet" : "Nouveau projet"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "existing"
              ? `Choisissez le projet qui recevra le travail sur « ${methodTitle} ».`
              : `Créez un projet et enregistrez-y le travail sur « ${methodTitle} ».`}
          </p>
        </div>

        {mode === "existing" ? (
          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {projects.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                Aucun projet disponible. Créez-en un avec « Enregistrer dans un nouveau projet ».
              </p>
            ) : (
              projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProjectId(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                    selectedProjectId === p.id
                      ? "border-primary bg-primary/5 font-semibold text-primary"
                      : "hover:bg-muted/50",
                  )}
                >
                  <Folder className="h-4 w-4 shrink-0" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="new-project-name">Nom du projet</Label>
            <Input
              id="new-project-name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Ex. : Atelier stratégie Q3"
              className="rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canConfirm && !busy) {
                  void onSaveNew(newProjectName.trim());
                }
              }}
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Annuler
          </Button>
          <Button
            type="button"
            disabled={!canConfirm || busy}
            onClick={() => {
              if (mode === "existing") {
                void onSaveExisting(selectedProjectId);
              } else {
                void onSaveNew(newProjectName.trim());
              }
            }}
          >
            {mode === "existing" ? (
              "Enregistrer"
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Créer et enregistrer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
