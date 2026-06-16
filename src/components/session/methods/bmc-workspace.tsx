"use client";

import { useMemo, useState } from "react";
import { Grid3X3, Plus, Sparkles, X } from "lucide-react";
import {
  BMC_BLOCK_DEFS,
  BMC_GUIDED_QUESTIONS,
  BMC_PALETTE_FG,
  BMC_STICKY,
  bmcChipId,
  buildBmcExportText,
  type BmcChip,
  type BmcDesignMode,
  type BmcThemeId,
} from "@/lib/methods/bmc-blocks";
import { MethodWorkspaceShell } from "@/components/session/method-workspace-shell";
import { GuidedNotesPanel } from "@/components/session/guided-notes-panel";
import { MethodAiModal } from "@/components/session/method-ai-modal";
import type { SessionState } from "@/components/session/methods/column-workspace";
import { cn } from "@/lib/utils";

function migrateBmcState(state: SessionState): Record<string, BmcChip[]> {
  const existing = state.bmc as Record<string, BmcChip[]> | undefined;
  if (existing && typeof existing === "object") return existing;

  const legacy = (state.blocks as Record<string, string>) ?? {};
  const out: Record<string, BmcChip[]> = {};
  for (const b of BMC_BLOCK_DEFS) {
    const raw = legacy[b.id];
    if (typeof raw === "string" && raw.trim()) {
      out[b.id] = raw
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((text) => ({ id: bmcChipId(), text }));
    } else {
      out[b.id] = [];
    }
  }
  return out;
}

interface BmcWorkspaceProps {
  state: SessionState;
  onChange: (state: SessionState) => void;
  embedded?: boolean;
}

export function BmcWorkspace({ state, onChange, embedded }: BmcWorkspaceProps) {
  const [designMode, setDesignMode] = useState<BmcDesignMode>("couleur");
  const [themeId, setThemeId] = useState<BmcThemeId>("classic");
  const [aiOpen, setAiOpen] = useState(false);

  const blocks = useMemo(() => migrateBmcState(state), [state]);

  function setBlocks(next: Record<string, BmcChip[]>) {
    onChange({ ...state, bmc: next });
  }

  function addChip(blockId: string) {
    setBlocks({
      ...blocks,
      [blockId]: [...(blocks[blockId] ?? []), { id: bmcChipId(), text: "" }],
    });
  }

  function editChip(blockId: string, chipId: string, text: string) {
    setBlocks({
      ...blocks,
      [blockId]: (blocks[blockId] ?? []).map((c) =>
        c.id === chipId ? { ...c, text } : c,
      ),
    });
  }

  function delChip(blockId: string, chipId: string) {
    setBlocks({
      ...blocks,
      [blockId]: (blocks[blockId] ?? []).filter((c) => c.id !== chipId),
    });
  }

  function aiInsert(items: { label?: string; text: string }[]) {
    const byTitle: Record<string, string> = {};
    BMC_BLOCK_DEFS.forEach((b) => {
      byTitle[b.title.toLowerCase()] = b.id;
    });
    let next = { ...blocks };
    for (const it of items) {
      const id =
        (it.label && byTitle[it.label.toLowerCase()]) || "vp";
      next = {
        ...next,
        [id]: [...(next[id] ?? []), { id: bmcChipId(), text: it.text }],
      };
    }
    setBlocks(next);
  }

  const filled = BMC_BLOCK_DEFS.filter((b) => (blocks[b.id]?.length ?? 0) > 0).length;
  const noteCount = BMC_BLOCK_DEFS.reduce(
    (a, b) => a + (blocks[b.id]?.length ?? 0),
    0,
  );

  const themeCanvasClass = {
    classic: "bg-slate-50",
    mono: "bg-slate-100",
    dark: "bg-slate-900",
    minimal: "bg-white",
  }[themeId];

  const themeTextMuted = themeId === "dark" ? "text-slate-400" : "text-muted-foreground";

  return (
    <MethodWorkspaceShell
      embedded={embedded}
      meta={{
        title: "Business Model Canvas",
        icon: <Grid3X3 className="h-6 w-6" />,
        colorClass: "bg-blue-100 text-blue-700",
      }}
      stats={
        <>
          <span>{filled}/9 blocs remplis</span>
          <span className="text-slate-300">·</span>
          <span>{noteCount} notes</span>
        </>
      }
      exportName="bmc"
      getExportText={() => buildBmcExportText(blocks)}
      designMode={designMode}
      onDesignModeChange={setDesignMode}
      themeId={themeId}
      onThemeChange={setThemeId}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.round((filled / 9) * 100)}%` }}
          />
        </div>
        <span className={cn("text-xs font-semibold", themeTextMuted)}>
          <b className="text-foreground">{filled}</b>/9 · <b className="text-foreground">{noteCount}</b> notes
        </span>
      </div>

      <div
        className={cn(
          "rounded-2xl border p-3 sm:p-4",
          themeCanvasClass,
          themeId === "dark" && "border-slate-700",
          themeId === "minimal" && "border-dashed",
        )}
        style={{
          backgroundImage:
            themeId !== "minimal"
              ? "radial-gradient(circle, rgb(203 213 225) 1px, transparent 1px)"
              : undefined,
          backgroundSize: "20px 20px",
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <BmcBlockCell id="part" blocks={blocks} themeId={themeId} onAdd={addChip} onEdit={editChip} onDel={delChip} className="sm:row-span-2" />
          <BmcBlockCell id="act" blocks={blocks} themeId={themeId} onAdd={addChip} onEdit={editChip} onDel={delChip} />
          <BmcBlockCell id="vp" blocks={blocks} themeId={themeId} onAdd={addChip} onEdit={editChip} onDel={delChip} className="sm:row-span-2" />
          <BmcBlockCell id="rel" blocks={blocks} themeId={themeId} onAdd={addChip} onEdit={editChip} onDel={delChip} />
          <BmcBlockCell id="seg" blocks={blocks} themeId={themeId} onAdd={addChip} onEdit={editChip} onDel={delChip} className="sm:row-span-2" />
          <BmcBlockCell id="res" blocks={blocks} themeId={themeId} onAdd={addChip} onEdit={editChip} onDel={delChip} className="sm:col-start-2" />
          <BmcBlockCell id="can" blocks={blocks} themeId={themeId} onAdd={addChip} onEdit={editChip} onDel={delChip} className="sm:col-start-4" />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <BmcBlockCell id="cost" blocks={blocks} themeId={themeId} onAdd={addChip} onEdit={editChip} onDel={delChip} />
          <BmcBlockCell id="rev" blocks={blocks} themeId={themeId} onAdd={addChip} onEdit={editChip} onDel={delChip} />
        </div>
      </div>

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

      <GuidedNotesPanel
        title="Besoin d'aide pour avancer ?"
        questions={BMC_GUIDED_QUESTIONS}
        notesKey="bmc_guided_notes"
        state={state}
        onChange={onChange}
      />

      <MethodAiModal
        open={aiOpen}
        title="Business Model Canvas"
        labels={BMC_BLOCK_DEFS.map((b) => b.title)}
        onInsert={aiInsert}
        onClose={() => setAiOpen(false)}
      />
    </MethodWorkspaceShell>
  );
}

function BmcBlockCell({
  id,
  blocks,
  themeId,
  onAdd,
  onEdit,
  onDel,
  className,
}: {
  id: string;
  blocks: Record<string, BmcChip[]>;
  themeId: BmcThemeId;
  onAdd: (id: string) => void;
  onEdit: (blockId: string, chipId: string, text: string) => void;
  onDel: (blockId: string, chipId: string) => void;
  className?: string;
}) {
  const def = BMC_BLOCK_DEFS.find((b) => b.id === id);
  if (!def) return null;

  const chips = blocks[id] ?? [];
  const sticky = BMC_STICKY[def.color];
  const fg = BMC_PALETTE_FG[def.color];
  const Icon = def.icon;
  const isDark = themeId === "dark";
  const isMinimal = themeId === "minimal";

  return (
    <div
      className={cn("flex min-h-[120px] flex-col rounded-xl border p-2.5 sm:p-3", className)}
      style={{
        background: isDark
          ? "rgba(30,41,59,0.85)"
          : isMinimal
            ? "var(--background)"
            : `color-mix(in srgb, ${sticky.paper} 26%, white)`,
        borderColor: isDark ? "#334155" : `${sticky.tab}99`,
      }}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <span
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
          style={{ background: `${sticky.tab}55`, color: fg }}
        >
          <Icon className="h-3 w-3" />
        </span>
        <span
          className={cn(
            "flex-1 text-[10px] font-extrabold uppercase leading-tight tracking-wide",
            isDark ? "text-slate-200" : "text-slate-700",
          )}
        >
          {def.title}
        </span>
        <span
          className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-extrabold text-white"
          style={{ background: fg }}
        >
          {chips.length}
        </span>
      </div>
      <p className={cn("mb-2 text-[10px] font-semibold leading-snug", isDark ? "text-slate-400" : "text-slate-400")}>
        {def.hint}
      </p>
      <div className="flex flex-col gap-1.5">
        {chips.map((c, ci) => (
          <div
            key={c.id}
            className="relative rounded-md px-2 py-1.5 pr-6 shadow-sm"
            style={{
              background: sticky.paper,
              transform: ci % 2 ? "rotate(-0.5deg)" : "rotate(0.5deg)",
            }}
          >
            <textarea
              value={c.text}
              onChange={(e) => onEdit(id, c.id, e.target.value)}
              rows={1}
              placeholder="note…"
              className="w-full resize-none border-0 bg-transparent text-xs font-bold leading-snug outline-none"
              style={{ color: sticky.ink }}
            />
            <button
              type="button"
              onClick={() => onDel(id, c.id)}
              className="absolute right-1 top-1 inline-flex opacity-45 hover:opacity-100"
              style={{ color: sticky.ink }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onAdd(id)}
          className="flex items-center justify-center gap-1 rounded-lg border border-dashed py-1.5 text-[11px] font-extrabold"
          style={{ borderColor: sticky.tab, color: fg }}
        >
          <Plus className="h-3 w-3" />
          Ajouter une note
        </button>
      </div>
    </div>
  );
}
