"use client";

import { Plus, X } from "lucide-react";
import type { RaciData } from "@/lib/project/registry-types";
import { Button } from "@/components/ui/button";

const RACI_OPTS = ["", "R", "A", "C", "I"] as const;
const RACI_MAP: Record<string, { label: string; color: string }> = {
  R: { label: "Responsable", color: "#2563eb" },
  A: { label: "Approbateur", color: "#7c3aed" },
  C: { label: "Consulté", color: "#d97706" },
  I: { label: "Informé", color: "#64748b" },
};

function RaciChip({ v }: { v: string }) {
  const m = RACI_MAP[v];
  if (!m) return null;
  return (
    <span
      className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-md text-[11.5px] font-extrabold"
      style={{ color: m.color, background: `${m.color}1a` }}
    >
      {v}
    </span>
  );
}

export function RaciTable({
  data,
  onChange,
  readOnly = false,
}: {
  data: RaciData;
  onChange: (next: RaciData) => void;
  readOnly?: boolean;
}) {
  const setCell = (ti: number, ci: number, val: string) => {
    const tasks = data.tasks.map((t, i) =>
      i === ti ? { ...t, vals: t.vals.map((v, j) => (j === ci ? val : v)) } : t,
    );
    onChange({ ...data, tasks });
  };

  const setTaskName = (ti: number, name: string) => {
    onChange({
      ...data,
      tasks: data.tasks.map((t, i) => (i === ti ? { ...t, task: name } : t)),
    });
  };

  const setRoleName = (ci: number, name: string) => {
    onChange({
      ...data,
      roles: data.roles.map((r, i) => (i === ci ? name : r)),
    });
  };

  const addTask = () => {
    onChange({
      ...data,
      tasks: [...data.tasks, { task: "Nouvelle tâche", vals: data.roles.map(() => "") }],
    });
  };

  const addRole = () => {
    onChange({
      roles: [...data.roles, "Rôle"],
      tasks: data.tasks.map((t) => ({ ...t, vals: [...t.vals, ""] })),
    });
  };

  const delTask = (ti: number) => {
    onChange({ ...data, tasks: data.tasks.filter((_, i) => i !== ti) });
  };

  const delRole = (ci: number) => {
    onChange({
      roles: data.roles.filter((_, i) => i !== ci),
      tasks: data.tasks.map((t) => ({ ...t, vals: t.vals.filter((_, i) => i !== ci) })),
    });
  };

  return (
    <div>
      <div className="overflow-auto rounded-xl border">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="min-w-[160px] px-2.5 py-2.5 text-left text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400">
                Tâche
              </th>
              {data.roles.map((role, ci) => (
                <th key={ci} className="min-w-[78px] px-2 py-2.5 text-center text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400">
                  {readOnly ? (
                    role
                  ) : (
                    <>
                      <input
                        value={role}
                        onChange={(e) => setRoleName(ci, e.target.value)}
                        className="w-[70px] border-0 bg-transparent text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-500 outline-none"
                      />
                      {data.roles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => delRole(ci)}
                          className="mx-auto mt-0.5 block border-0 bg-transparent text-[10px] text-slate-300 hover:text-red-500"
                        >
                          ✕
                        </button>
                      )}
                    </>
                  )}
                </th>
              ))}
              {!readOnly && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {data.tasks.map((t, ti) => (
              <tr key={ti} className="border-t border-slate-100">
                <td className="px-2.5 py-2">
                  {readOnly ? (
                    <span className="text-sm font-semibold text-slate-800">{t.task}</span>
                  ) : (
                    <input
                      value={t.task}
                      onChange={(e) => setTaskName(ti, e.target.value)}
                      className="w-full border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none"
                    />
                  )}
                </td>
                {data.roles.map((_, ci) => {
                  const v = t.vals[ci] ?? "";
                  const m = RACI_MAP[v];
                  return (
                    <td key={ci} className="p-1 text-center">
                      {readOnly ? (
                        v ? <RaciChip v={v} /> : <span className="text-slate-300">·</span>
                      ) : (
                        <select
                          value={v}
                          onChange={(e) => setCell(ti, ci, e.target.value)}
                          className="w-[54px] cursor-pointer rounded-md border px-1 py-1 text-center text-xs font-extrabold outline-none"
                          style={{
                            borderColor: m ? m.color : "#e2e8f0",
                            color: m ? m.color : "#94a3b8",
                            background: m ? `${m.color}14` : "white",
                          }}
                        >
                          {RACI_OPTS.map((o) => (
                            <option key={o} value={o}>
                              {o || "—"}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  );
                })}
                {!readOnly && (
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => delTask(ti)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-300 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={addTask}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Tâche
          </Button>
          <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={addRole}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Rôle
          </Button>
          <div className="ml-auto flex flex-wrap gap-2.5">
            {Object.entries(RACI_MAP).map(([k, m]) => (
              <span key={k} className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-500">
                <RaciChip v={k} /> {m.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export interface RegColumn {
  key: string;
  label: string;
  placeholder?: string;
  options?: string[];
  badge?: Record<string, string>;
}

const BADGE_COLORS: Record<string, string> = {
  green: "#059669",
  amber: "#d97706",
  rose: "#db2777",
  slate: "#64748b",
};

function RegBadge({ val, map }: { val: string; map?: Record<string, string> }) {
  const tone = (map && map[val]) || "slate";
  const color = BADGE_COLORS[tone] ?? BADGE_COLORS.slate;
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11.5px] font-bold"
      style={{ color, background: `${color}1a` }}
    >
      {val}
    </span>
  );
}

export function RegTable({
  rows,
  columns,
  onChange,
  addLabel,
  emptyLabel = "Aucune entrée",
  readOnly = false,
}: {
  rows: Record<string, string>[];
  columns: RegColumn[];
  onChange: (rows: Record<string, string>[]) => void;
  addLabel: string;
  emptyLabel?: string;
  readOnly?: boolean;
}) {
  const blank = () => {
    const o: Record<string, string> = {};
    columns.forEach((c) => {
      o[c.key] = c.options ? c.options[0] : "";
    });
    return o;
  };

  const upd = (i: number, patch: Record<string, string>) => {
    onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  };

  const del = (i: number) => onChange(rows.filter((_, j) => j !== i));

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((c) => (
                <th key={c.key} className="px-2.5 py-2.5 text-left text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400">
                  {c.label}
                </th>
              ))}
              {!readOnly && <th className="w-10" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (readOnly ? 0 : 1)} className="py-5 text-center text-sm text-slate-400">
                  {emptyLabel}
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-slate-100">
                {columns.map((c) => (
                  <td key={c.key} className="align-middle">
                    {c.options ? (
                      readOnly ? (
                        <span className="inline-block px-2.5 py-2 text-sm">
                          <RegBadge val={row[c.key] ?? ""} map={c.badge} />
                        </span>
                      ) : (
                        <select
                          value={row[c.key] ?? ""}
                          onChange={(e) => upd(i, { [c.key]: e.target.value })}
                          className="w-full cursor-pointer border-0 bg-transparent px-2.5 py-2 text-sm font-bold outline-none"
                        >
                          {c.options.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      )
                    ) : readOnly ? (
                      <span className="inline-block px-2.5 py-2 text-sm text-slate-700">{row[c.key] || "—"}</span>
                    ) : (
                      <input
                        value={row[c.key] ?? ""}
                        placeholder={c.placeholder}
                        onChange={(e) => upd(i, { [c.key]: e.target.value })}
                        className="w-full border-0 bg-transparent px-2.5 py-2 text-sm outline-none"
                      />
                    )}
                  </td>
                ))}
                {!readOnly && (
                  <td className="text-center">
                    <button
                      type="button"
                      onClick={() => del(i)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-300 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2.5 h-8 rounded-lg"
          onClick={() => onChange([...rows, blank()])}
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> {addLabel}
        </Button>
      )}
    </div>
  );
}

export const COMMS_COLS: RegColumn[] = [
  { key: "canal", label: "Canal", placeholder: "Ex. Réunion hebdo" },
  { key: "public", label: "Public", placeholder: "Qui" },
  { key: "freq", label: "Fréquence", placeholder: "Ex. Hebdomadaire" },
  { key: "but", label: "Objectif", placeholder: "Pourquoi" },
];

export const SUPPLIER_COLS: RegColumn[] = [
  { key: "nom", label: "Fournisseur", placeholder: "Nom" },
  { key: "service", label: "Service", placeholder: "Prestation" },
  { key: "contact", label: "Contact", placeholder: "Courriel / tél." },
  {
    key: "statut",
    label: "Statut",
    options: ["Pressenti", "Confirmé", "Écarté"],
    badge: { Confirmé: "green", Pressenti: "amber", Écarté: "slate" },
  },
  { key: "note", label: "Note", placeholder: "(optionnel)" },
];

export const STAKE_COLS: RegColumn[] = [
  { key: "nom", label: "Partie prenante", placeholder: "Nom / organisation" },
  { key: "role", label: "Rôle", placeholder: "Relation au projet" },
  {
    key: "interet",
    label: "Intérêt",
    options: ["Faible", "Moyen", "Élevé"],
    badge: { Élevé: "green", Moyen: "amber", Faible: "slate" },
  },
  {
    key: "influence",
    label: "Influence",
    options: ["Faible", "Moyen", "Élevé"],
    badge: { Élevé: "rose", Moyen: "amber", Faible: "slate" },
  },
  { key: "contact", label: "Contact", placeholder: "(optionnel)" },
];

export function CharteEditor({
  charte,
  onChange,
  readOnly = false,
}: {
  charte: { mission: string; valeurs: { text: string }[]; regles: { text: string }[]; decision: string };
  onChange: (next: typeof charte) => void;
  readOnly?: boolean;
}) {
  const list = (
    key: "valeurs" | "regles",
    label: string,
    color: string,
    ph: string,
  ) => {
    const items = charte[key] ?? [];
    return (
      <div className="mb-4">
        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide" style={{ color }}>
          {label}
        </div>
        <div className="flex flex-col gap-1.5">
          {items.length === 0 && readOnly && <div className="text-sm text-slate-400">—</div>}
          {items.map((it, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border bg-white px-2.5 py-1.5"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
              {readOnly ? (
                <span className="flex-1 text-sm text-slate-700">{it.text}</span>
              ) : (
                <input
                  value={it.text}
                  placeholder={ph}
                  onChange={(e) => {
                    const next = { ...charte };
                    next[key] = items.map((x, j) => (j === i ? { text: e.target.value } : x));
                    onChange(next);
                  }}
                  className="flex-1 border-0 bg-transparent text-sm outline-none"
                />
              )}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onChange({ ...charte, [key]: items.filter((_, j) => j !== i) })}
                  className="text-slate-300 hover:text-red-500"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-fit rounded-lg text-xs"
              onClick={() => onChange({ ...charte, [key]: [...items, { text: "" }] })}
            >
              <Plus className="mr-1 h-3 w-3" /> Ajouter
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-blue-600">Mission</div>
        {readOnly ? (
          <p className="text-sm leading-relaxed text-slate-700">{charte.mission || "—"}</p>
        ) : (
          <textarea
            value={charte.mission}
            onChange={(e) => onChange({ ...charte, mission: e.target.value })}
            rows={3}
            className="w-full resize-y rounded-lg border px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Pourquoi cette équipe existe…"
          />
        )}
      </div>
      {list("valeurs", "Valeurs", "#059669", "Ex. Transparence")}
      {list("regles", "Règles de fonctionnement", "#7c3aed", "Ex. On commence à l'heure")}
      <div>
        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-amber-600">Mode de décision</div>
        {readOnly ? (
          <p className="text-sm text-slate-700">{charte.decision || "—"}</p>
        ) : (
          <textarea
            value={charte.decision}
            onChange={(e) => onChange({ ...charte, decision: e.target.value })}
            rows={2}
            className="w-full resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Consensus, vote, facilitateur tranche…"
          />
        )}
      </div>
    </div>
  );
}
