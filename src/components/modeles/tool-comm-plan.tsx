"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  COMM_PLAN_INIT,
  DEFAULT_LIB_MEMBERS,
  FREQ_OPTIONS,
  RECIPIENT_OPTIONS,
  type CommPlanRow,
  type LibMember,
} from "@/lib/methods/tool-constants";
import { METHOD_OVERLAY_POPOVER_Z } from "@/lib/methods/overlay-layer";
import { MemberAvatar, MethodIcon } from "@/components/modeles/method-icon";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ToolCommPlanProps {
  members?: LibMember[];
}

export function ToolCommPlan({ members = DEFAULT_LIB_MEMBERS }: ToolCommPlanProps) {
  const [rows, setRows] = useState<CommPlanRow[]>(COMM_PLAN_INIT.map((r) => ({ ...r })));

  const upd = (id: string, patch: Partial<CommPlanRow>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const add = () =>
    setRows([
      ...rows,
      {
        id: `c${Date.now()}`,
        icon: "Document",
        iconBg: "#EFF6FF",
        iconC: "#2563EB",
        title: "Nouvelle communication",
        desc: "",
        recipient: "Équipe projet",
        freq: "À définir",
        format: "Email",
        fmtIcon: "Mail",
        who: members[0]?.id ?? "me",
        date: "À définir",
      },
    ]);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              {["Information", "Destinataire", "Fréquence", "Format / Canal", "Responsable", "Prochaine date", ""].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const m = members.find((x) => x.id === r.who) ?? members[0];
              return (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-3 py-3">
                    <div className="flex gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: r.iconBg, color: r.iconC }}
                      >
                        <MethodIcon name={r.icon} className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <input
                          value={r.title}
                          onChange={(e) => upd(r.id, { title: e.target.value })}
                          className="w-full rounded-lg border-0 bg-transparent p-0 text-sm font-bold outline-none focus:ring-0"
                          placeholder="Titre…"
                        />
                        <input
                          value={r.desc}
                          onChange={(e) => upd(r.id, { desc: e.target.value })}
                          className="w-full rounded-lg border-0 bg-transparent p-0 text-xs text-muted-foreground outline-none"
                          placeholder="Description…"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <Select value={r.recipient} onValueChange={(v) => upd(r.id, { recipient: v })}>
                      <SelectTrigger className="h-8 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className={METHOD_OVERLAY_POPOVER_Z}>
                        {RECIPIENT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-2">
                    <Select value={r.freq} onValueChange={(v) => upd(r.id, { freq: v })}>
                      <SelectTrigger className="h-8 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className={METHOD_OVERLAY_POPOVER_Z}>
                        {FREQ_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <MethodIcon name={r.fmtIcon} className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <input
                        value={r.format}
                        onChange={(e) => upd(r.id, { format: e.target.value })}
                        className="w-full rounded-lg border bg-background px-2 py-1 text-xs"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      {m && <MemberAvatar member={m} size={22} />}
                      <Select value={r.who} onValueChange={(v) => upd(r.id, { who: v })}>
                        <SelectTrigger className="h-8 min-w-0 flex-1 rounded-lg border-0 bg-transparent text-xs shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className={METHOD_OVERLAY_POPOVER_Z}>
                          {members.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.you ? "Vous" : p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      value={r.date}
                      onChange={(e) => upd(r.id, { date: e.target.value })}
                      className="w-full rounded-lg border bg-background px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <button type="button" onClick={() => setRows(rows.filter((x) => x.id !== r.id))} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="border-t px-4 py-3">
        <Button variant="ghost" size="sm" onClick={add}>
          <Plus className="mr-1 h-4 w-4" /> Ajouter une communication
        </Button>
      </div>
    </div>
  );
}
