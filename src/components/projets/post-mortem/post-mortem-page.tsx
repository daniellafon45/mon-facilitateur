"use client";

import { useState } from "react";
import { ChevronLeft, Download, Plus, Star } from "lucide-react";
import type { DisplayProject } from "@/types/facilitation";
import { Button } from "@/components/ui/button";
import { buildProjectExportText, downloadTextFile } from "@/lib/project/export-project";

interface PostMortemColumn {
  id: string;
  label: string;
  items: { id: string; text: string; votes: number }[];
}

const DEFAULT_COLS: PostMortemColumn[] = [
  {
    id: "reussites",
    label: "Réussites",
    items: [
      { id: "1", text: "Objectifs atteints dans les délais", votes: 0 },
      { id: "2", text: "Bonne collaboration d'équipe", votes: 0 },
    ],
  },
  {
    id: "difficultes",
    label: "Difficultés",
    items: [
      { id: "3", text: "Périmètre instable", votes: 0 },
      { id: "4", text: "Ressources limitées", votes: 0 },
    ],
  },
  {
    id: "lecons",
    label: "Leçons apprises",
    items: [
      { id: "5", text: "Cadrer plus tôt les parties prenantes", votes: 0 },
      { id: "6", text: "Documenter les décisions en continu", votes: 0 },
    ],
  },
];

export function PostMortemPage({
  project,
  onBack,
}: {
  project: DisplayProject;
  onBack: () => void;
}) {
  const [cols, setCols] = useState<PostMortemColumn[]>(DEFAULT_COLS);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const vote = (colId: string, itemId: string) => {
    setCols((prev) =>
      prev.map((c) =>
        c.id === colId
          ? {
              ...c,
              items: c.items.map((it) =>
                it.id === itemId ? { ...it, votes: it.votes + 1 } : it,
              ),
            }
          : c,
      ),
    );
  };

  const addItem = (colId: string) => {
    const text = (drafts[colId] ?? "").trim();
    if (!text) return;
    setCols((prev) =>
      prev.map((c) =>
        c.id === colId
          ? { ...c, items: [...c.items, { id: `n-${Date.now()}`, text, votes: 0 }] }
          : c,
      ),
    );
    setDrafts((d) => ({ ...d, [colId]: "" }));
  };

  const exportText = () => {
    const lines = [
      `POST-MORTEM — ${project.name}`,
      "",
      ...cols.flatMap((c) => [
        c.label.toUpperCase(),
        ...c.items
          .sort((a, b) => b.votes - a.votes)
          .map((it) => `  - ${it.text} (${it.votes} vote${it.votes > 1 ? "s" : ""})`),
        "",
      ]),
    ];
    downloadTextFile(`${project.name} post-mortem.txt`, lines.join("\n"));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f6f7fb]">
      <div className="shrink-0 border-b bg-white px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Retour au projet
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Post-mortem</h1>
            <p className="text-sm text-muted-foreground">{project.name}</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={exportText}>
            <Download className="mr-1 h-3.5 w-3.5" /> Exporter
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          {cols.map((col) => (
            <div key={col.id} className="rounded-2xl border bg-white p-4">
              <h2 className="mb-3 text-sm font-extrabold">{col.label}</h2>
              <div className="space-y-2">
                {col.items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => vote(col.id, it.id)}
                    className="flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span className="flex-1">{it.text}</span>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {it.votes}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={drafts[col.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [col.id]: e.target.value }))}
                  placeholder="Ajouter une idée…"
                  className="h-8 flex-1 rounded-lg border px-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  onKeyDown={(e) => e.key === "Enter" && addItem(col.id)}
                />
                <Button size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => addItem(col.id)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
