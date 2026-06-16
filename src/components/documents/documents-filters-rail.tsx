"use client";

import { FolderTree, SlidersHorizontal } from "lucide-react";
import type { FilesystemNode } from "@/components/ui/filesystem-item";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentsTreeView } from "@/components/documents/documents-tree-view";
import { DOC_FILE_TYPES, DOC_OWNERS } from "@/lib/documents/constants";
import type { DocFilters } from "@/lib/documents/types";

interface ProjectRef {
  id: string;
  name: string;
}

interface DocumentsFiltersRailProps {
  filters: DocFilters;
  onChange: (patch: Partial<DocFilters>) => void;
  onReset: () => void;
  activeCount: number;
  projects: ProjectRef[];
  treeNodes: FilesystemNode[];
  selectedDocId?: string | null;
  onFileClick: (docId: string) => void;
  onViewTrash: () => void;
  flash: (msg: string) => void;
}

function RailToggle({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between text-sm font-semibold">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onClick}
        className="relative h-5 w-9 shrink-0 rounded-full border-0 transition-colors"
        style={{ background: on ? "hsl(var(--foreground))" : "hsl(var(--muted))" }}
      >
        <span
          className="absolute top-0.5 block h-4 w-4 rounded-full bg-background shadow transition-transform"
          style={{ left: on ? "1.125rem" : "0.125rem" }}
        />
      </button>
    </div>
  );
}

export function DocumentsFiltersRail({
  filters,
  onChange,
  onReset,
  activeCount,
  projects,
  treeNodes,
  selectedDocId,
  onFileClick,
  onViewTrash,
  flash,
}: DocumentsFiltersRailProps) {
  return (
    <aside className="hidden w-[280px] shrink-0 border-l bg-card/30 xl:block">
      <div className="sticky top-0 max-h-[calc(100dvh-8rem)] overflow-y-auto p-5">
        <p className="mb-4 flex items-center gap-2 text-sm font-extrabold">
          <SlidersHorizontal className="h-4 w-4" /> Filtres rapides
        </p>

        <div className="mb-4">
          <Label className="text-xs text-muted-foreground">Période</Label>
          <Select value={filters.period || "_all"} onValueChange={(v) => onChange({ period: v === "_all" ? "" : v })}>
            <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tous les temps</SelectItem>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <Label className="text-xs text-muted-foreground">Type de fichier</Label>
          <Select value={filters.type || "_all"} onValueChange={(v) => onChange({ type: v === "_all" ? "" : v })}>
            <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tous les types</SelectItem>
              {DOC_FILE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <Label className="text-xs text-muted-foreground">Propriétaire</Label>
          <Select value={filters.owner || "_all"} onValueChange={(v) => onChange({ owner: v === "_all" ? "" : v })}>
            <SelectTrigger className="mt-1.5 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tous</SelectItem>
              {Object.entries(DOC_OWNERS).map(([k, o]) => (
                <SelectItem key={k} value={k}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <RailToggle
          label="Afficher seulement mes documents"
          on={filters.mine}
          onClick={() => onChange({ mine: !filters.mine })}
        />
        <RailToggle
          label="Afficher les favoris"
          on={filters.favOnly}
          onClick={() => onChange({ favOnly: !filters.favOnly })}
        />

        {activeCount > 0 && (
          <button
            type="button"
            className="mt-2 text-sm font-bold text-foreground hover:underline"
            onClick={onReset}
          >
            Réinitialiser les filtres
          </button>
        )}

        <div className="mt-6 border-t pt-5">
          <p className="mb-3 text-sm font-extrabold">Espace de stockage</p>
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[42%] rounded-full bg-foreground" />
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            8.4 Go utilisés sur 20 Go <strong>42%</strong>
          </p>
          <Button variant="secondary" size="sm" className="w-full rounded-xl" onClick={() => flash("Gestion du stockage bientôt disponible")}>
            Gérer mon stockage
          </Button>
        </div>

        <div className="mt-6 border-t pt-5">
          <p className="mb-3 flex items-center gap-2 text-sm font-extrabold">
            <FolderTree className="h-4 w-4" /> Arborescence
          </p>
          <div className="mb-4 max-h-52 overflow-y-auto rounded-xl border bg-muted/20 p-2">
            <DocumentsTreeView
              nodes={treeNodes}
              compact
              animated
              selectedId={selectedDocId}
              onFileClick={onFileClick}
            />
          </div>

          <p className="mb-3 text-sm font-extrabold">Accès rapide</p>
          {[
            { l: "Modèles de documents", action: () => flash("Modèles de documents bientôt disponible") },
            { l: "Corbeille", action: onViewTrash },
            { l: "Documents importés", action: () => flash("Documents importés bientôt disponible") },
            { l: "Exportations", action: () => flash("Exportations bientôt disponible") },
          ].map((it) => (
            <button
              key={it.l}
              type="button"
              onClick={it.action}
              className="block w-full border-b border-border/60 py-2 text-left text-sm font-semibold text-foreground/80 hover:text-foreground"
            >
              {it.l}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
