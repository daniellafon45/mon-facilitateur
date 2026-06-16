"use client";

import { useState } from "react";
import { CheckCircle2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ALL_CHANNELS,
  CHARTER_EXPECT_INIT,
  CHARTER_RULES_INIT,
  CHARTER_VALUES,
} from "@/lib/methods/tool-constants";
import { MethodIcon } from "@/components/modeles/method-icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const FACES = ["😐", "🙂", "😊"];

export function ToolTeamCharter() {
  const [rules, setRules] = useState([...CHARTER_RULES_INIT]);
  const [expects, setExpects] = useState(CHARTER_EXPECT_INIT.map((e) => ({ ...e })));
  const [channels, setChannels] = useState(["teams", "email", "mf"]);
  const [engage, setEngage] = useState(
    "Nous nous engageons à collaborer activement pour atteindre nos objectifs communs.",
  );

  const toggleChan = (c: string) =>
    setChannels((ch) => (ch.includes(c) ? ch.filter((x) => x !== c) : [...ch, c]));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <p className="mb-3 text-sm font-extrabold">Nos valeurs</p>
          {CHARTER_VALUES.map((v) => (
            <div key={v.id} className="mb-2 flex items-center gap-3 rounded-xl border px-3 py-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `${v.c}18`, color: v.c }}
              >
                <MethodIcon name={v.icon} className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold">{v.label}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-3 text-sm font-extrabold">Nos règles de collaboration</p>
          {rules.map((r, i) => (
            <div key={i} className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <input
                value={r}
                onChange={(e) => setRules(rules.map((x, k) => (k === i ? e.target.value : x)))}
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <button type="button" onClick={() => setRules(rules.filter((_, k) => k !== i))} className="text-muted-foreground hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="mt-1" onClick={() => setRules([...rules, "Nouvelle règle…"])}>
            <Plus className="mr-1 h-4 w-4" /> Ajouter une règle
          </Button>
        </div>

        <div>
          <p className="mb-3 text-sm font-extrabold">Nos attentes</p>
          {expects.map((e, i) => (
            <div key={i} className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{e.label}</span>
              <div className="flex gap-1">
                {FACES.map((f, l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setExpects(expects.map((x, k) => (k === i ? { ...x, level: l } : x)))}
                    className={cn(
                      "rounded-lg px-2 py-1 text-lg transition-colors",
                      e.level === l ? "bg-foreground/10 ring-2 ring-foreground/20" : "opacity-50 hover:opacity-100",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <p className="mb-3 text-sm font-extrabold">Disponibilités</p>
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-xl font-extrabold">Lun – Ven</p>
            <p className="text-xs text-muted-foreground">Jours de travail</p>
          </div>
          <div className="mt-2 rounded-xl border bg-muted/30 p-4">
            <p className="text-xl font-extrabold">9h00 – 17h00</p>
            <p className="text-xs text-muted-foreground">Heures de disponibilité</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">(UTC−5) Montréal</p>
        </div>

        <div>
          <p className="mb-3 text-sm font-extrabold">Canaux de communication</p>
          <div className="flex flex-wrap gap-2">
            {ALL_CHANNELS.map((c) => {
              const on = channels.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleChan(c.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                    on ? "border-foreground bg-foreground/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <MethodIcon name={c.icon} className="h-3.5 w-3.5" /> {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-extrabold">Engagement</p>
          <Textarea value={engage} onChange={(e) => setEngage(e.target.value)} rows={5} className="rounded-xl" />
        </div>
      </div>
    </div>
  );
}
