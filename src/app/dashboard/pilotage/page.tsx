"use client";

import { useMemo } from "react";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PilotagePage() {
  const store = useFacilitationStore();

  const stats = useMemo(() => {
    const projects = store.projectsView();
    const meetings = store.meetings;
    const tasks = store.tasks;
    const doneTasks = tasks.filter((t) => t.done).length;
    const methodCounts: Record<string, number> = {};
    meetings.forEach((m) => {
      m.methods.forEach((id) => {
        methodCounts[id] = (methodCounts[id] ?? 0) + 1;
      });
    });
    const topMethods = Object.entries(methodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return {
      activeProjects: projects.length,
      upcomingMeetings: store.upcoming().length,
      taskCompletion: tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0,
      sessionsMonth: meetings.filter((m) => m.status === "Terminée").length,
      topMethods,
    };
  }, [store]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Centre de pilotage</h1>
          <p className="text-muted-foreground mt-1">Vue d&apos;ensemble de votre activité de facilitation</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Projets actifs", value: stats.activeProjects },
            { label: "Rencontres à venir", value: stats.upcomingMeetings },
            { label: "Séances terminées", value: stats.sessionsMonth },
            { label: "Tâches complétées", value: `${stats.taskCompletion}%` },
          ].map((kpi) => (
            <Card key={kpi.label} className="rounded-3xl border-0 shadow-sm bg-card">
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{kpi.label}</p>
                <p className="text-3xl font-bold mt-2">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base">Méthodes les plus utilisées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.topMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée pour le moment.</p>
            ) : (
              stats.topMethods.map(([id, count]) => (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-sm w-40 truncate">{id}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(count * 25, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-6">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
  );
}
