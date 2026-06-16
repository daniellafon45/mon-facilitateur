"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { MethodWorkspaceConfig } from "./configs";

const COLOR_MAP: Record<string, string> = {
  green: "border-green-200 bg-green-50/80",
  blue: "border-blue-200 bg-blue-50/80",
  violet: "border-violet-200 bg-violet-50/80",
  amber: "border-amber-200 bg-amber-50/80",
  red: "border-red-200 bg-red-50/80",
  teal: "border-teal-200 bg-teal-50/80",
  slate: "border-slate-200 bg-slate-50/80",
};

const STICKY_PAPER: Record<string, string> = {
  green: "#D1FAE5",
  blue: "#DBEAFE",
  violet: "#EDE9FE",
  amber: "#FEF3C7",
  red: "#FFE4E6",
  teal: "#CCFBF1",
  slate: "#EEF2F7",
};

const STICKY_INK: Record<string, string> = {
  green: "#065F46",
  blue: "#1E40AF",
  violet: "#5B21B6",
  amber: "#92400E",
  red: "#9F1239",
  teal: "#115E59",
  slate: "#334155",
};

export type SessionState = Record<string, unknown>;

interface MethodWorkspaceProps {
  config: MethodWorkspaceConfig;
  state: SessionState;
  onChange: (state: SessionState) => void;
}

type CardItem = { id: string; text: string };

function getColumnCards(state: SessionState, colId: string): CardItem[] {
  const cols = (state.columns as Record<string, CardItem[]>) ?? {};
  return cols[colId] ?? [];
}

function setColumnCards(state: SessionState, colId: string, cards: CardItem[]): SessionState {
  const cols = { ...((state.columns as Record<string, CardItem[]>) ?? {}), [colId]: cards };
  return { ...state, columns: cols };
}

export function ColumnMethodWorkspace({ config, state, onChange }: MethodWorkspaceProps) {
  const [draft, setDraft] = useState<Record<string, string>>({});

  function addCard(colId: string) {
    const text = (draft[colId] ?? "").trim();
    if (!text) return;
    const cards = [...getColumnCards(state, colId), { id: `c${Date.now()}`, text }];
    onChange(setColumnCards(state, colId, cards));
    setDraft((d) => ({ ...d, [colId]: "" }));
  }

  function removeCard(colId: string, cardId: string) {
    const cards = getColumnCards(state, colId).filter((c) => c.id !== cardId);
    onChange(setColumnCards(state, colId, cards));
  }

  function editCard(colId: string, cardId: string, text: string) {
    const cards = getColumnCards(state, colId).map((c) =>
      c.id === cardId ? { ...c, text } : c,
    );
    onChange(setColumnCards(state, colId, cards));
  }

  function addEmptyCard(colId: string) {
    const cards = [
      ...getColumnCards(state, colId),
      { id: `c${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, text: "" },
    ];
    onChange(setColumnCards(state, colId, cards));
  }

  if (config.type === "list") {
    const items = (state.items as string[]) ?? ["", "", "", "", ""];
    return (
      <div className="space-y-3 max-w-2xl">
        <p className="text-sm text-muted-foreground">Ajoutez vos éléments un par un.</p>
        {items.map((item, i) => (
          <div
            key={i}
            className="relative rounded-lg px-3 py-2 pr-8 shadow-sm"
            style={{
              background: STICKY_PAPER.amber,
              transform: i % 2 ? "rotate(-0.3deg)" : "rotate(0.3deg)",
            }}
          >
            <textarea
              value={item}
              placeholder={`Élément ${i + 1}`}
              rows={2}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange({ ...state, items: next });
              }}
              className="w-full resize-none border-0 bg-transparent text-sm font-bold outline-none"
              style={{ color: STICKY_INK.amber }}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onChange({ ...state, items: items.filter((_, j) => j !== i) })}
                className="absolute right-2 top-2 opacity-50 hover:opacity-100"
                style={{ color: STICKY_INK.amber }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange({ ...state, items: [...items, ""] })}
          className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed py-2 text-xs font-extrabold text-amber-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter une ligne
        </button>
      </div>
    );
  }

  if (config.type === "bono") {
    const hats = [
      { id: "white", label: "Faits", color: "slate", hint: "Données objectives, faits vérifiables" },
      { id: "red", label: "Émotions", color: "red", hint: "Ressentis, intuitions, réactions" },
      { id: "black", label: "Risques", color: "slate", hint: "Points de vigilance, obstacles" },
      { id: "yellow", label: "Bénéfices", color: "amber", hint: "Opportunités, aspects positifs" },
      { id: "green", label: "Idées", color: "green", hint: "Pistes créatives, alternatives" },
      { id: "blue", label: "Synthèse", color: "blue", hint: "Décision, prochaines étapes" },
    ];
    const notes = (state.bono as Record<string, string>) ?? {};
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hats.map((h) => {
          const paper = STICKY_PAPER[h.color] ?? STICKY_PAPER.slate;
          const ink = STICKY_INK[h.color] ?? STICKY_INK.slate;
          const filled = (notes[h.id] ?? "").trim().length > 0;
          return (
            <div key={h.id} className={cn("rounded-2xl border p-3", COLOR_MAP[h.color])}>
              <div className="mb-2 flex items-center gap-2 border-b border-inherit pb-2">
                <span className="flex-1 text-xs font-extrabold uppercase tracking-wide">{h.label}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold text-white"
                  style={{ background: ink }}
                >
                  {filled ? "1" : "0"}
                </span>
              </div>
              <p className="mb-2 text-[10px] font-semibold text-muted-foreground">{h.hint}</p>
              <div
                className="rounded-md px-2 py-1.5 shadow-sm"
                style={{ background: paper }}
              >
                <textarea
                  value={notes[h.id] ?? ""}
                  rows={4}
                  placeholder="Vos notes…"
                  onChange={(e) =>
                    onChange({ ...state, bono: { ...notes, [h.id]: e.target.value } })
                  }
                  className="w-full resize-none border-0 bg-transparent text-xs font-bold leading-snug outline-none"
                  style={{ color: ink }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (config.type === "blocks") {
    const blocks = config.blocks ?? [
      { id: "vp", title: "Proposition de valeur", color: "amber" },
      { id: "seg", title: "Segments clients", color: "blue" },
      { id: "can", title: "Canaux", color: "red" },
      { id: "rel", title: "Relations", color: "red" },
      { id: "rev", title: "Revenus", color: "green" },
      { id: "res", title: "Ressources", color: "green" },
      { id: "act", title: "Activités", color: "violet" },
      { id: "part", title: "Partenaires", color: "slate" },
      { id: "cost", title: "Coûts", color: "amber" },
    ];
    const data = (state.blocks as Record<string, string>) ?? {};
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {blocks.map((b) => (
          <div key={b.id} className={cn("rounded-2xl border p-3 min-h-[120px]", COLOR_MAP[b.color] ?? COLOR_MAP.blue)}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2">{b.title}</p>
            <Textarea
              value={data[b.id] ?? ""}
              rows={3}
              className="bg-white/60 border-0 resize-none text-sm"
              onChange={(e) => onChange({ ...state, blocks: { ...data, [b.id]: e.target.value } })}
            />
          </div>
        ))}
      </div>
    );
  }

  if (config.type === "kanban") {
    const cols = ["À faire", "En cours", "Terminé"];
    const colColors = ["blue", "amber", "green"];
    const board = (state.kanban as Record<string, string[]>) ?? {
      "À faire": [],
      "En cours": [],
      "Terminé": [],
    };
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {cols.map((col, ci) => {
          const color = colColors[ci] ?? "blue";
          const paper = STICKY_PAPER[color];
          const ink = STICKY_INK[color];
          return (
            <div
              key={col}
              className={cn("rounded-2xl border p-3 min-h-[220px]", COLOR_MAP[color])}
            >
              <div className="mb-3 flex items-center gap-2 border-b border-inherit pb-2">
                <span className="flex-1 text-xs font-extrabold uppercase tracking-wide">{col}</span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold text-white"
                  style={{ background: ink }}
                >
                  {(board[col] ?? []).length}
                </span>
              </div>
              <div className="space-y-2 mb-3">
                {(board[col] ?? []).map((t, i) => (
                  <div
                    key={i}
                    className="relative rounded-md px-2 py-1.5 pr-6 shadow-sm"
                    style={{ background: paper, transform: i % 2 ? "rotate(-0.3deg)" : "rotate(0.3deg)" }}
                  >
                    <span className="text-xs font-bold" style={{ color: ink }}>{t}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...state,
                          kanban: {
                            ...board,
                            [col]: (board[col] ?? []).filter((_, j) => j !== i),
                          },
                        })
                      }
                      className="absolute right-1 top-1 opacity-45 hover:opacity-100"
                      style={{ color: ink }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1 border-t border-inherit pt-2">
                <Input
                  className="h-8 bg-white/80 text-xs"
                  placeholder="Nouvelle carte…"
                  value={draft[col] ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, [col]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && draft[col]?.trim()) {
                      onChange({
                        ...state,
                        kanban: { ...board, [col]: [...(board[col] ?? []), draft[col]!.trim()] },
                      });
                      setDraft((d) => ({ ...d, [col]: "" }));
                    }
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={() => {
                    if (!draft[col]?.trim()) return;
                    onChange({
                      ...state,
                      kanban: { ...board, [col]: [...(board[col] ?? []), draft[col]!.trim()] },
                    });
                    setDraft((d) => ({ ...d, [col]: "" }));
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (config.type === "matrix") {
    const rows = (state.matrix as { label: string; x: number; y: number }[]) ?? [];
    return (
      <div className="space-y-4">
        <div className="relative h-72 rounded-2xl border bg-muted/20 overflow-hidden">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-bold text-muted-foreground">
            Impact ↑
          </span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">
            Effort →
          </span>
          <div className="absolute inset-4 grid grid-cols-2 grid-rows-2 border border-dashed border-muted-foreground/20 rounded-xl">
            <span className="p-2 text-[10px] text-muted-foreground">Quick wins</span>
            <span className="p-2 text-[10px] text-muted-foreground text-right">Priorités</span>
            <span className="p-2 text-[10px] text-muted-foreground self-end">À éviter</span>
            <span className="p-2 text-[10px] text-muted-foreground text-right self-end">À planifier</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={i}
              className="absolute rounded-full px-2 py-1 text-[10px] font-extrabold shadow-md cursor-default"
              style={{
                left: `${Math.min(Math.max(r.x, 5), 90)}%`,
                top: `${Math.min(Math.max(100 - r.y, 5), 90)}%`,
                background: STICKY_PAPER.violet,
                color: STICKY_INK.violet,
                transform: "translate(-50%, -50%)",
              }}
              title={r.label}
            >
              {r.label.length > 18 ? `${r.label.slice(0, 16)}…` : r.label}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Élément à positionner"
            value={draft.matrix ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, matrix: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.matrix?.trim()) {
                onChange({
                  ...state,
                  matrix: [...rows, { label: draft.matrix.trim(), x: 50, y: 50 }],
                });
                setDraft((d) => ({ ...d, matrix: "" }));
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => {
              if (!draft.matrix?.trim()) return;
              onChange({
                ...state,
                matrix: [...rows, { label: draft.matrix.trim(), x: 50, y: 50 }],
              });
              setDraft((d) => ({ ...d, matrix: "" }));
            }}
          >
            Ajouter
          </Button>
        </div>
        <ul className="text-sm space-y-1">
          {rows.map((r, i) => (
            <li key={i} className="flex justify-between items-center border-b py-1.5 gap-2">
              <span className="font-medium">{r.label}</span>
              <button
                type="button"
                onClick={() =>
                  onChange({ ...state, matrix: rows.filter((_, j) => j !== i) })
                }
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (config.type === "gantt") {
    const tasks = (state.gantt as { name: string; start: number; duration: number }[]) ?? [];
    return (
      <div className="space-y-3">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="w-32 truncate">{t.name}</span>
            <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/70 rounded-full"
                style={{ width: `${Math.min(t.duration * 10, 100)}%`, marginLeft: `${t.start}%` }}
              />
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...state,
              gantt: [...tasks, { name: `Tâche ${tasks.length + 1}`, start: 0, duration: 5 }],
            })
          }
        >
          <Plus className="h-4 w-4 mr-1" /> Ajouter une tâche
        </Button>
      </div>
    );
  }

  const columns = config.columns ?? [];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {columns.map((col) => {
        const cards = getColumnCards(state, col.id);
        const paper = STICKY_PAPER[col.color] ?? STICKY_PAPER.blue;
        const ink = STICKY_INK[col.color] ?? STICKY_INK.blue;
        return (
          <div
            key={col.id}
            className={cn(
              "flex min-h-[240px] flex-col rounded-xl border p-2.5",
              COLOR_MAP[col.color] ?? COLOR_MAP.blue,
            )}
          >
            <div className="mb-2 flex items-center gap-2 border-b border-inherit pb-2">
              <span className="flex-1 text-xs font-extrabold uppercase tracking-wide">
                {col.title}
              </span>
              {col.sub && (
                <span className="text-[10px] font-semibold text-muted-foreground hidden sm:inline">
                  {col.sub}
                </span>
              )}
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-extrabold text-white"
                style={{ background: ink }}
              >
                {cards.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto">
              {cards.map((card, ci) => (
                <div
                  key={card.id}
                  className="relative rounded-md px-2 py-1.5 pr-6 shadow-sm"
                  style={{
                    background: paper,
                    transform: ci % 2 ? "rotate(-0.4deg)" : "rotate(0.4deg)",
                  }}
                >
                  <textarea
                    value={card.text}
                    onChange={(e) => editCard(col.id, card.id, e.target.value)}
                    rows={2}
                    placeholder="note…"
                    className="w-full resize-none border-0 bg-transparent text-xs font-bold leading-snug outline-none"
                    style={{ color: ink }}
                  />
                  <button
                    type="button"
                    onClick={() => removeCard(col.id, card.id)}
                    className="absolute right-1 top-1 opacity-45 hover:opacity-100"
                    style={{ color: ink }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addEmptyCard(col.id)}
                className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed py-1.5 text-[11px] font-extrabold"
                style={{ borderColor: ink, color: ink }}
              >
                <Plus className="h-3 w-3" />
                Ajouter une note
              </button>
            </div>
            <div className="mt-2 flex gap-1 border-t border-inherit pt-2">
              <Input
                className="h-8 bg-white/80 text-xs"
                placeholder="Saisie rapide…"
                value={draft[col.id] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [col.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addCard(col.id)}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                onClick={() => addCard(col.id)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
