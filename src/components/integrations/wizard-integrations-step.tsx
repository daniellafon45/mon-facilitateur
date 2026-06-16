"use client";

import { useEffect, useState } from "react";
import { Calendar, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProviderId } from "@/lib/integrations/types";

export function WizardIntegrationsStep({
  meetingName,
  meetingDate,
  meetingTime,
}: {
  meetingName: string;
  meetingDate: string;
  meetingTime: string;
}) {
  const [connected, setConnected] = useState<ProviderId[]>([]);
  const [loading, setLoading] = useState<ProviderId | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/integrations")
      .then((r) => r.json())
      .then((data) => {
        setConnected(
          data.integrations
            .filter((i: { status: string }) => i.status === "connected")
            .map((i: { id: ProviderId }) => i.id),
        );
      })
      .catch(() => {});
  }, []);

  async function pushToCalendar(provider: "gcal" | "teams") {
    setLoading(provider);
    try {
      const res = await fetch(`/api/integrations/sync/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: "meetings", direction: "push" }),
      });
      const data = await res.json();
      setMessage(
        data.pushed > 0
          ? `Rencontre ajoutée à ${provider === "gcal" ? "Google Calendar" : "Teams"}`
          : `Sync ${provider}: ${data.errors?.[0] ?? "terminée"}`,
      );
    } catch {
      setMessage("Erreur lors de la planification");
    } finally {
      setLoading(null);
    }
  }

  const hasGcal = connected.includes("gcal");
  const hasTeams = connected.includes("teams");

  if (!hasGcal && !hasTeams) {
    return (
      <p className="text-sm text-muted-foreground">
        Connectez Google Calendar ou Microsoft Teams dans{" "}
        <a href="/dashboard/integrations" className="font-semibold text-primary underline">
          Intégrations
        </a>{" "}
        pour planifier automatiquement cette rencontre.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Planification externe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {meetingName || "Rencontre"} — {meetingDate} à {meetingTime}
        </p>
        <div className="flex flex-wrap gap-2">
          {hasGcal && (
            <Button
              variant="outline"
              size="sm"
              disabled={loading === "gcal"}
              onClick={() => pushToCalendar("gcal")}
            >
              <Calendar className="mr-1 size-3.5" />
              {loading === "gcal" ? "Ajout…" : "Google Calendar"}
            </Button>
          )}
          {hasTeams && (
            <Button
              variant="outline"
              size="sm"
              disabled={loading === "teams"}
              onClick={() => pushToCalendar("teams")}
            >
              <Video className="mr-1 size-3.5" />
              {loading === "teams" ? "Création…" : "Réunion Teams"}
            </Button>
          )}
        </div>
        {message ? <p className="text-xs text-emerald-700">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
