"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFacilitationStore } from "@/lib/store/facilitation-store";

export function PlaceholderDashboardPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{description}</p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Retour à l&apos;accueil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

export function SessionPage({ mode }: { mode: "solo" | "equipe" | "atelier" }) {
  const store = useFacilitationStore();
  const label = mode === "solo" ? "Session solo" : mode === "atelier" ? "Grand atelier" : "Séance d'équipe";

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold">{label} en cours</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Quitter</Link>
        </Button>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle>Salle de séance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Interface de séance interactive (tableau blanc, votes, minuteur) à porter depuis la maquette Vite.
              La session est prête à être animée.
            </p>
            <Button
              onClick={() => {
                store.logSession({ mode, name: label, methodTitle: "Facilitation" });
                window.location.href = "/dashboard/report";
              }}
            >
              Terminer la session
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
