"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  CheckCircle,
  ChevronLeft,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";
import type { Meeting, MeetingTaskEntry } from "@/types/facilitation";
import { formatFrDate } from "@/lib/projets/constants";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ReportTask {
  id: string;
  title: string;
  who: string;
  due: string;
  done: boolean;
}

export function SessionReportPage({
  meeting,
  onViewJournal,
  onReplay,
}: {
  meeting: Meeting;
  onViewJournal?: () => void;
  onReplay?: () => void;
}) {
  const router = useRouter();
  const addTasksFromReport = useFacilitationStore((s) => s.addTasksFromReport);
  const updateMeetingSnapshot = useFacilitationStore((s) => s.updateMeetingSnapshot);
  const addMeeting = useFacilitationStore((s) => s.addMeeting);

  const initialTasks: ReportTask[] =
    meeting.snapshot?.tasks?.map((t, i) => ({
      id: `t-${i}`,
      title: t.title,
      who: t.who,
      due: t.due,
      done: t.done,
    })) ?? [
      { id: "t1", title: "", who: "Vous", due: "", done: false },
    ];

  const [tasks, setTasks] = useState<ReportTask[]>(initialTasks);
  const [scribeText, setScribeText] = useState(meeting.snapshot?.report?.summary ?? "");
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("10:00");
  const [nextScheduled, setNextScheduled] = useState(false);
  const [toast, setToast] = useState("");

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2400);
  };

  const persistSnapshot = async (patch: { summary?: string; state?: string; tasks?: MeetingTaskEntry[] }) => {
    const snap = meeting.snapshot ?? {};
    const next = {
      ...snap,
      tasks: patch.tasks ?? snap.tasks,
      report: {
        scribe: snap.report?.scribe ?? "Scribe",
        scribeRole: snap.report?.scribeRole ?? "Scribe",
        state: patch.state ?? snap.report?.state ?? "brouillon",
        channels: snap.report?.channels ?? ["My Facilitator"],
        recipients: snap.report?.recipients ?? `${meeting.participants} participants`,
        summary: patch.summary ?? snap.report?.summary ?? "",
        decisions: snap.report?.decisions ?? [],
      },
    };
    await updateMeetingSnapshot(meeting.id, next);
  };

  const saveScribe = async () => {
    await persistSnapshot({
      summary: scribeText,
      state: scribeText.trim() ? "redige" : "brouillon",
    });
    flash(scribeText.trim() ? "Compte rendu enregistré" : "Brouillon sauvegardé");
  };

  const pushTasks = async () => {
    const valid = tasks.filter((t) => t.title.trim());
    const entries: MeetingTaskEntry[] = valid.map((t) => ({
      title: t.title,
      who: t.who,
      wc: "#2563eb",
      due: t.due || "—",
      prio: "Moyenne",
      done: t.done,
    }));
    const n = addTasksFromReport(entries, meeting.project);
    await persistSnapshot({ tasks: entries });
    flash(n > 0 ? `${n} tâche${n > 1 ? "s" : ""} ajoutée${n > 1 ? "s" : ""} au journal` : "Aucune tâche à ajouter");
  };

  const scheduleNext = async () => {
    if (!nextDate) return;
    await addMeeting({
      name: `Suivi · ${meeting.name}`,
      project: meeting.project,
      dateISO: nextDate,
      time: nextTime,
      status: "À venir",
      type: meeting.type,
      participants: meeting.participants,
    });
    setNextScheduled(true);
    flash(`Rencontre programmée le ${formatFrDate(nextDate)}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 pb-16">
      <div className="mb-6">
        <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Compte rendu de rencontre</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{meeting.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatFrDate(meeting.dateISO)} · {meeting.time} · {meeting.type}
        </p>
      </div>

      <section className="mb-6 rounded-2xl border p-5">
        <h2 className="mb-3 text-base font-extrabold">Tâches d&apos;action</h2>
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-2 rounded-xl border bg-slate-50/80 p-3">
              <Input
                value={t.title}
                onChange={(e) => setTasks((list) => list.map((x) => (x.id === t.id ? { ...x, title: e.target.value } : x)))}
                placeholder="Intitulé de la tâche…"
                className="min-w-[180px] flex-1 rounded-lg"
              />
              <Input
                value={t.who}
                onChange={(e) => setTasks((list) => list.map((x) => (x.id === t.id ? { ...x, who: e.target.value } : x)))}
                placeholder="Responsable"
                className="w-28 rounded-lg"
              />
              <Input
                type="date"
                value={t.due}
                onChange={(e) => setTasks((list) => list.map((x) => (x.id === t.id ? { ...x, due: e.target.value } : x)))}
                className="w-36 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setTasks((list) => list.filter((x) => x.id !== t.id))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => setTasks([...tasks, { id: `t-${Date.now()}`, title: "", who: "Vous", due: "", done: false }])}
          >
            <Plus className="mr-1 h-4 w-4" /> Ajouter une tâche
          </Button>
          <Button type="button" size="sm" className="rounded-xl" onClick={() => void pushTasks()}>
            <Check className="mr-1 h-4 w-4" /> Enregistrer les tâches
          </Button>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border p-5">
        <h2 className="mb-1 text-base font-extrabold">Compte rendu du scribe</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Vous pouvez le laisser vide et le compléter plus tard dans le journal de la rencontre.
        </p>
        <Textarea
          value={scribeText}
          onChange={(e) => setScribeText(e.target.value)}
          rows={8}
          className="rounded-xl font-mono text-sm"
          placeholder="Points abordés, décisions prises, prochaines étapes…"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {scribeText.length > 0 ? `${scribeText.length} caractères` : "Vide pour l'instant"}
          </span>
          <Button type="button" size="sm" className="rounded-xl" onClick={() => void saveScribe()}>
            Enregistrer le compte rendu
          </Button>
        </div>
      </section>

      <section className="mb-8 rounded-2xl border p-5">
        <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold">
          <Calendar className="h-4 w-4" /> Programmer la prochaine rencontre
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-bold text-muted-foreground">
            Date
            <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} className="mt-1 rounded-lg" />
          </label>
          <label className="text-xs font-bold text-muted-foreground">
            Heure
            <Input type="time" value={nextTime} onChange={(e) => setNextTime(e.target.value)} className="mt-1 rounded-lg" />
          </label>
          <Button
            type="button"
            className="rounded-xl"
            disabled={!nextDate || nextScheduled}
            onClick={() => void scheduleNext()}
          >
            <Plus className="mr-1 h-4 w-4" />
            {nextScheduled ? "Rencontre programmée" : "Programmer"}
          </Button>
        </div>
      </section>

      <div className="flex flex-wrap justify-between gap-3 border-t pt-6">
        <Button type="button" variant="ghost" className="rounded-xl" onClick={() => router.push("/dashboard")}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Retour à l&apos;accueil
        </Button>
        <div className="flex flex-wrap gap-2">
          {onReplay && (
            <Button type="button" variant="outline" className="rounded-xl" onClick={onReplay}>
              <Eye className="mr-1 h-4 w-4" /> Rejouer la session
            </Button>
          )}
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => {
              if (onViewJournal) onViewJournal();
              else router.push(`/dashboard/rencontres?open=${meeting.id}`);
            }}
          >
            <CheckCircle className="mr-1 h-4 w-4" /> Voir le journal de la rencontre
          </Button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-7 left-1/2 z-[1200] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          {toast}
        </div>
      )}
    </div>
  );
}
