"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { METHOD_BY_ID } from "@/lib/methods/catalog";
import {
  buildMethodExportText,
  computeMethodStats,
  getGuidedQuestions,
  METHOD_COLOR_CLASS,
} from "@/lib/methods/method-workspace-helpers";
import type { BmcDesignMode, BmcThemeId } from "@/lib/methods/bmc-blocks";
import { MethodWorkspaceShell } from "@/components/session/method-workspace-shell";
import { GuidedNotesPanel } from "@/components/session/guided-notes-panel";
import { MethodAiModal } from "@/components/session/method-ai-modal";
import { ColumnMethodWorkspace } from "@/components/session/methods/column-workspace";
import { BmcWorkspace } from "@/components/session/methods/bmc-workspace";
import { resolveMethodIcon } from "@/components/session/methods/method-icon";
import type { MethodWorkspaceConfig } from "@/components/session/methods/configs";
import type { SessionState } from "@/components/session/methods/column-workspace";

interface MethodWorkspaceProps {
  methodId: string;
  config: MethodWorkspaceConfig;
  state: SessionState;
  onChange: (state: SessionState) => void;
  embedded?: boolean;
}

export function MethodWorkspace({
  methodId,
  config,
  state,
  onChange,
  embedded,
}: MethodWorkspaceProps) {
  if (config.type === "bmc") {
    return <BmcWorkspace state={state} onChange={onChange} embedded={embedded} />;
  }

  const meta = METHOD_BY_ID[methodId];
  const Icon = resolveMethodIcon(meta?.icon);
  const colorKey = meta?.color ?? "blue";
  const [designMode, setDesignMode] = useState<BmcDesignMode>("couleur");
  const [themeId, setThemeId] = useState<BmcThemeId>("classic");
  const [aiOpen, setAiOpen] = useState(false);

  const stats = useMemo(() => computeMethodStats(config, state), [config, state]);
  const guided = useMemo(
    () => getGuidedQuestions(methodId, config),
    [methodId, config],
  );
  const labels = useMemo(() => {
    if (config.columns?.length) return config.columns.map((c) => c.title);
    if (config.blocks?.length) return config.blocks.map((b) => b.title);
    if (config.type === "bono") {
      return ["Faits", "Émotions", "Risques", "Bénéfices", "Idées", "Synthèse"];
    }
    if (config.type === "kanban") return ["À faire", "En cours", "Terminé"];
    if (config.type === "list") return ["Élément"];
    if (config.type === "matrix") {
      return ["Quick win", "Priorité", "À planifier", "À éviter"];
    }
    return [];
  }, [config]);

  function aiInsert(items: { label?: string; text: string }[]) {
    if (config.columns?.length) {
      const byTitle: Record<string, string> = {};
      config.columns.forEach((c) => {
        byTitle[c.title.toLowerCase()] = c.id;
      });
      const cols = { ...((state.columns as Record<string, { id: string; text: string }[]>) ?? {}) };
      for (const it of items) {
        const colId =
          (it.label && byTitle[it.label.toLowerCase()]) ?? config.columns[0].id;
        cols[colId] = [
          ...(cols[colId] ?? []),
          { id: `k${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, text: it.text },
        ];
      }
      onChange({ ...state, columns: cols });
      return;
    }

    if (config.type === "blocks") {
      const blockDefs = config.blocks ?? [];
      const byTitle: Record<string, string> = {};
      blockDefs.forEach((b) => {
        byTitle[b.title.toLowerCase()] = b.id;
      });
      const data = { ...((state.blocks as Record<string, string>) ?? {}) };
      for (const it of items) {
        const blockId =
          (it.label && byTitle[it.label.toLowerCase()]) ?? blockDefs[0]?.id ?? "vp";
        const prev = data[blockId] ?? "";
        data[blockId] = prev ? `${prev}\n• ${it.text}` : it.text;
      }
      onChange({ ...state, blocks: data });
      return;
    }

    if (config.type === "bono") {
      const byLabel: Record<string, string> = {
        faits: "white",
        émotions: "red",
        emotions: "red",
        risques: "black",
        bénéfices: "yellow",
        benefices: "yellow",
        idées: "green",
        idees: "green",
        synthèse: "blue",
        synthese: "blue",
      };
      const notes = { ...((state.bono as Record<string, string>) ?? {}) };
      for (const it of items) {
        const key =
          (it.label && byLabel[it.label.toLowerCase()]) ?? "green";
        const prev = notes[key] ?? "";
        notes[key] = prev ? `${prev}\n• ${it.text}` : it.text;
      }
      onChange({ ...state, bono: notes });
      return;
    }

    if (config.type === "list") {
      const itemsArr = [...((state.items as string[]) ?? [])];
      for (const it of items) {
        itemsArr.push(it.text);
      }
      onChange({ ...state, items: itemsArr });
      return;
    }

    if (config.type === "kanban") {
      const board = { ...((state.kanban as Record<string, string[]>) ?? { "À faire": [], "En cours": [], "Terminé": [] }) };
      const byCol: Record<string, string> = {
        "à faire": "À faire",
        "en cours": "En cours",
        terminé: "Terminé",
        termine: "Terminé",
      };
      for (const it of items) {
        const col = (it.label && byCol[it.label.toLowerCase()]) ?? "À faire";
        board[col] = [...(board[col] ?? []), it.text];
      }
      onChange({ ...state, kanban: board });
      return;
    }

    if (config.type === "matrix") {
      const quadrant: Record<string, { x: number; y: number }> = {
        "quick win": { x: 25, y: 75 },
        "quick wins": { x: 25, y: 75 },
        priorité: { x: 75, y: 75 },
        priorite: { x: 75, y: 75 },
        "à planifier": { x: 75, y: 25 },
        "a planifier": { x: 75, y: 25 },
        "à éviter": { x: 25, y: 25 },
        "a eviter": { x: 25, y: 25 },
      };
      const rows = [...((state.matrix as { label: string; x: number; y: number }[]) ?? [])];
      for (const it of items) {
        const pos =
          (it.label && quadrant[it.label.toLowerCase()]) || { x: 50, y: 50 };
        rows.push({ label: it.text, x: pos.x, y: pos.y });
      }
      onChange({ ...state, matrix: rows });
    }
  }

  return (
    <MethodWorkspaceShell
      embedded={embedded}
      meta={{
        title: meta?.title ?? config.title,
        icon: <Icon className="h-6 w-6" />,
        colorClass: METHOD_COLOR_CLASS[colorKey] ?? METHOD_COLOR_CLASS.blue,
      }}
      stats={<span>{stats.label}</span>}
      exportName={methodId}
      getExportText={() => buildMethodExportText(methodId, config, state)}
      designMode={designMode}
      onDesignModeChange={setDesignMode}
      themeId={themeId}
      onThemeChange={setThemeId}
    >
      {stats.progress !== undefined && (
        <div className="mb-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{stats.label}</span>
        </div>
      )}

      <div
        className="rounded-2xl border bg-slate-50 p-3 sm:p-4"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(203 213 225) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <ColumnMethodWorkspace config={config} state={state} onChange={onChange} />
      </div>

      {(labels.length > 0 || config.type === "list" || config.type === "matrix") && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10"
          >
            <Sparkles className="h-4 w-4" />
            Suggestions Amaris
          </button>
        </div>
      )}

      <GuidedNotesPanel
        title="Besoin d'aide pour avancer ?"
        questions={guided}
        notesKey={`${methodId}_guided_notes`}
        state={state}
        onChange={onChange}
      />

      {(labels.length > 0 || config.type === "list" || config.type === "matrix") && (
        <MethodAiModal
          open={aiOpen}
          title={meta?.title ?? config.title}
          labels={labels}
          onInsert={aiInsert}
          onClose={() => setAiOpen(false)}
        />
      )}
    </MethodWorkspaceShell>
  );
}
