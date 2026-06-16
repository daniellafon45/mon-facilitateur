"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Home, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFacilitationStore } from "@/lib/store/facilitation-store";

const CAPTURE_LABELS: Record<string, string> = {
  idea: "Idées",
  decision: "Décisions",
  action: "Actions",
  question: "Questions",
};

export function SoloSummaryView({
  meetingId,
  objective,
}: {
  meetingId?: string | null;
  objective?: string;
}) {
  const router = useRouter();
  const addTask = useFacilitationStore((s) => s.addTask);
  const meeting = useFacilitationStore((s) =>
    meetingId ? s.meetings.find((m) => m.id === meetingId) : null,
  );
  const [themes, setThemes] = useState<string[]>(["Thème principal"]);
  const [starred, setStarred] = useState<string[]>([]);

  const snapshot = meeting?.snapshot;
  const captures = snapshot?.quickLog ?? [];
  const actions = snapshot?.tasks ?? [];

  const stats = Object.entries(CAPTURE_LABELS).map(([key, label]) => ({
    key,
    label,
    count: captures.filter((c) => c.kind?.toLowerCase().includes(key.slice(0, 4))).length,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Résumé de la session solo</h1>
        <p className="mt-2 text-muted-foreground">{objective || meeting?.name || "Session terminée"}</p>
        {meeting && (
          <p className="mt-1 text-xs text-muted-foreground">
            {meeting.dateISO} · {meeting.time}
            {snapshot?.duration ? ` · ${snapshot.duration}` : ""}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.key} className="rounded-xl border bg-white p-4 text-center">
            <div className="text-2xl font-extrabold text-primary">{s.count}</div>
            <div className="text-xs font-semibold text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {actions.length > 0 && (
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="font-extrabold">Actions à faire</h2>
          <ul className="mt-3 space-y-2">
            {actions.map((t, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span className="font-semibold">{t.title}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => void addTask({ title: t.title, projectId: meeting?.project })}
                >
                  Envoyer vers mes tâches
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-extrabold">Thèmes principaux</h2>
        <ul className="mt-3 space-y-2">
          {themes.map((t, i) => (
            <li key={i} className="flex items-center gap-2">
              <button type="button" onClick={() => setStarred((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))}>
                <Star className={cnStar(starred.includes(t))} />
              </button>
              <input
                value={t}
                onChange={(e) => setThemes((th) => th.map((x, j) => (j === i ? e.target.value : x)))}
                className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold"
              />
            </li>
          ))}
        </ul>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setThemes((th) => [...th, "Nouveau thème"])}
        >
          Ajouter un thème
        </Button>
      </section>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <h2 className="font-extrabold">Prochaine étape recommandée</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Partagez vos idées avec votre équipe lors d&apos;une rencontre collaborative.
        </p>
        <Button className="mt-4 rounded-xl" asChild>
          <Link href="/dashboard/wizard/project-type">
            Préparer une rencontre d&apos;équipe
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" className="rounded-xl" asChild>
          <Link href="/dashboard">
            <Home className="mr-2 h-4 w-4" /> Accueil
          </Link>
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={() => router.push("/dashboard/rencontres")}>
          Voir mes rencontres
        </Button>
      </div>
    </div>
  );
}

function cnStar(on: boolean) {
  return on ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 text-slate-300";
}
