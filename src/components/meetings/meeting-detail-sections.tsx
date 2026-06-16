"use client";

import {
  Bolt,
  Check,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Grid3X3,
  Pencil,
  Sparkles,
  Vote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Meeting, MeetingDetailSnapshot } from "@/types/facilitation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PAL: Record<string, { bg: string; text: string; bar: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-600" },
  green: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-600" },
  slate: { bg: "bg-slate-100", text: "text-slate-700", bar: "bg-slate-500" },
  rose: { bg: "bg-pink-50", text: "text-pink-700", bar: "bg-pink-600" },
};

const STICKY: Record<string, string> = {
  amber: "bg-amber-100 border-amber-200 text-amber-900",
  blue: "bg-blue-100 border-blue-200 text-blue-900",
  green: "bg-emerald-100 border-emerald-200 text-emerald-900",
  violet: "bg-violet-100 border-violet-200 text-violet-900",
  rose: "bg-pink-100 border-pink-200 text-pink-900",
};

function SectionTitle({
  icon: Icon,
  color,
  title,
  count,
}: {
  icon: LucideIcon;
  color: string;
  title: string;
  count?: string | number | null;
}) {
  const pal = PAL[color] ?? PAL.slate;
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-[10px]", pal.bg, pal.text)}>
        <Icon className="h-4 w-4" />
      </span>
      <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
      {count != null && count !== "" && (
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", pal.bg, pal.text)}>
          {count}
        </span>
      )}
    </div>
  );
}

export function MeetingDetailOverview({ meeting, snapshot }: { meeting: Meeting; snapshot: MeetingDetailSnapshot }) {
  const stats = [
    { label: "Durée réelle", val: snapshot.duration ?? "—", color: "blue" },
    { label: "Méthodes complétées", val: snapshot.methods?.length ?? 0, color: "violet" },
    { label: "Votes & sondages", val: snapshot.votes?.length ?? 0, color: "amber" },
    { label: "Tâches créées", val: snapshot.tasks?.length ?? 0, color: "green" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const pal = PAL[s.color];
          return (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className={cn("text-2xl font-extrabold", pal.text)}>{s.val}</div>
                <div className="text-xs font-semibold text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {snapshot.participants && snapshot.participants.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <SectionTitle icon={Eye} color="blue" title="Participants" count={snapshot.participants.length} />
            <div className="flex flex-wrap gap-2">
              {snapshot.participants.map((p) => (
                <div key={p.init} className="flex items-center gap-2 rounded-xl border px-3 py-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: p.color }}
                  >
                    {p.init}
                  </span>
                  <div>
                    <div className="text-sm font-bold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {snapshot.report?.summary ? (
        <Card>
          <CardContent className="p-5">
            <SectionTitle icon={FileText} color="green" title="En bref" />
            <p className="text-sm leading-relaxed text-slate-700">{snapshot.report.summary}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Aperçu de la rencontre « {meeting.name} » — {meeting.type}.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function MeetingDetailMinuterie({ snapshot }: { snapshot: MeetingDetailSnapshot }) {
  const agenda = snapshot.agenda ?? [];
  const tp = agenda.reduce((a, x) => a + x.planned, 0);
  const tr = agenda.reduce((a, x) => a + x.real, 0);
  const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? String(m % 60).padStart(2, "0") : "00"}` : `${m} min`);

  return (
    <Card>
      <CardContent className="p-5">
        <SectionTitle icon={Clock} color="blue" title="Minuterie de la rencontre" count={`${fmt(tr)} / ${fmt(tp)} prévu`} />
        <p className="mb-4 text-sm text-muted-foreground">
          Temps réel passé sur chaque bloc du déroulé, comparé au temps prévu.
        </p>
        <div className="space-y-3">
          {agenda.map((a, i) => {
            const over = a.real > a.planned;
            const under = a.real < a.planned;
            const w = Math.min(100, (a.real / Math.max(a.planned, a.real)) * 100);
            const pal = PAL[a.color] ?? PAL.slate;
            return (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{a.title}</span>
                  <span className={cn("text-xs font-bold tabular-nums", over && "text-red-600", under && "text-emerald-600")}>
                    {a.real} min / {a.planned} prévu
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className={cn("h-full rounded-full", over ? "bg-red-500" : pal.bar)} style={{ width: `${w}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function MeetingDetailMethods({ snapshot }: { snapshot: MeetingDetailSnapshot }) {
  const all = [...(snapshot.methods ?? []), ...(snapshot.projTools ?? [])];
  return (
    <div className="space-y-4">
      {all.map((m) => {
        const pal = PAL[m.color] ?? PAL.blue;
        return (
          <Card key={m.id + m.title}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-extrabold">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.filled}{m.notes > 0 ? ` · ${m.notes} notes` : ""}</div>
                </div>
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold", pal.bg, pal.text)}>
                  <CheckCircle className="h-3 w-3" /> Complétée
                </span>
              </div>
              <div className="space-y-2">
                {m.highlights.map((h, j) => (
                  <div key={j} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {h}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
      {all.length === 0 && (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Aucune méthode enregistrée.</CardContent></Card>
      )}
    </div>
  );
}

export function MeetingDetailWhiteboard({ snapshot }: { snapshot: MeetingDetailSnapshot }) {
  const items = snapshot.whiteboard ?? [];
  return (
    <Card>
      <CardContent className="p-5">
        <SectionTitle icon={Sparkles} color="violet" title="Tableau blanc" count={items.length} />
        <div className="relative min-h-[280px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80">
          {items.map((s, i) => (
            <div
              key={i}
              className={cn("absolute max-w-[140px] rounded-lg border px-2.5 py-1.5 text-xs font-bold shadow-sm", STICKY[s.c] ?? STICKY.amber)}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
            >
              {s.text}
            </div>
          ))}
          {items.length === 0 && (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              Tableau blanc vide
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function MeetingDetailDocuments({ snapshot }: { snapshot: MeetingDetailSnapshot }) {
  const docs = snapshot.documents ?? [];
  return (
    <Card>
      <CardContent className="p-5">
        <SectionTitle icon={FileText} color="blue" title="Documents" count={docs.length} />
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.name} className="flex items-center justify-between rounded-xl border px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-bold">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{d.type} · {d.size} · {d.by}</div>
                </div>
              </div>
            </div>
          ))}
          {docs.length === 0 && <p className="text-sm text-muted-foreground">Aucun document lié.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function MeetingDetailNotes({ snapshot }: { snapshot: MeetingDetailSnapshot }) {
  const notes = snapshot.notes ?? [];
  return (
    <Card>
      <CardContent className="p-5">
        <SectionTitle icon={Pencil} color="amber" title="Notes" count={notes.length} />
        <div className="space-y-3">
          {notes.map((n, i) => (
            <div key={i} className="rounded-xl border px-4 py-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{n.author}</span>
                <span>{n.time}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", n.vis === "prive" ? "bg-slate-100" : "bg-blue-50 text-blue-700")}>
                  {n.vis === "prive" ? "Privée" : "Publique"}
                </span>
              </div>
              <p className="text-sm">{n.text}</p>
            </div>
          ))}
          {notes.length === 0 && <p className="text-sm text-muted-foreground">Aucune note.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function MeetingDetailJournal({ snapshot }: { snapshot: MeetingDetailSnapshot }) {
  const votes = snapshot.votes ?? [];
  const quickLog = snapshot.quickLog ?? [];
  return (
    <div className="space-y-4">
      {votes.map((v, i) => (
        <Card key={`v-${i}`}>
          <CardContent className="p-5">
            <SectionTitle icon={Vote} color="violet" title={v.kind} count={`${v.total} votes`} />
            <p className="mb-3 text-sm font-semibold">{v.q}</p>
            <div className="space-y-2">
              {v.options.map((o) => (
                <div key={o.label}>
                  <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>{o.label}</span>
                    <span>{o.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-violet-500" style={{ width: `${o.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardContent className="p-5">
          <SectionTitle icon={Bolt} color="amber" title="Journal des outils rapides" count={quickLog.length} />
          <div className="space-y-2">
            {quickLog.map((e, i) => (
              <div key={i} className="rounded-xl border px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <span>{e.kind}</span>
                  <span>{e.time}</span>
                </div>
                <div className="text-sm font-semibold">{e.q}</div>
                <div className="text-xs text-muted-foreground">{e.result}</div>
              </div>
            ))}
            {quickLog.length === 0 && <p className="text-sm text-muted-foreground">Aucune entrée.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MeetingDetailTasksReport({ snapshot }: { snapshot: MeetingDetailSnapshot }) {
  const tasks = snapshot.tasks ?? [];
  const report = snapshot.report;
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <SectionTitle icon={Check} color="green" title="Tâches" count={tasks.length} />
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-3">
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white", t.done ? "bg-emerald-500" : "bg-slate-300")}>
                  {t.done ? "✓" : ""}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={cn("text-sm font-bold", t.done && "line-through text-muted-foreground")}>{t.title}</div>
                  <div className="text-xs text-muted-foreground">{t.who} · {t.due} · {t.prio}</div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-sm text-muted-foreground">Aucune tâche.</p>}
          </div>
        </CardContent>
      </Card>
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compte rendu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>Scribe :</strong> {report.scribe} ({report.scribeRole})</p>
            <p>{report.summary}</p>
            {report.decisions.length > 0 && (
              <ul className="list-disc space-y-1 pl-5">
                {report.decisions.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function MeetingDetailUpcoming({ meeting, agendaItems }: { meeting: Meeting; agendaItems: { t: string; dur: string }[] }) {
  const isDraft = meeting.status === "Brouillon";
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardContent className="flex gap-3 p-5 text-sm text-muted-foreground">
          {isDraft
            ? "Cette rencontre est encore un brouillon. Reprenez la préparation pour définir le genre, la méthode et l'ordre du jour."
            : "Cette rencontre n'a pas encore eu lieu. Vous pouvez la simuler pour parcourir le déroulé seul."}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <SectionTitle icon={Grid3X3} color="blue" title="Ordre du jour prévu" count={`${agendaItems.length} blocs`} />
          <div className="space-y-2">
            {agendaItems.map((a, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border bg-slate-50 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-bold">{a.t}</span>
                <span className="text-xs font-bold text-muted-foreground">{a.dur}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {meeting.methods.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <SectionTitle icon={Grid3X3} color="violet" title="Méthodes prévues" />
            <div className="flex flex-wrap gap-2">
              {meeting.methods.map((mt) => (
                <span key={mt} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
                  {mt}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
