"use client";

import { useEffect, useState } from "react";
import { Plug, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProviderId } from "@/lib/integrations/types";

const PROVIDER_FIELDS: Record<
  string,
  { label: string; fields: { key: string; label: string; placeholder: string }[] }
> = {
  slack: {
    label: "Slack",
    fields: [{ key: "channel", label: "Canal Slack", placeholder: "#projet-innovation" }],
  },
  teams: {
    label: "Microsoft Teams",
    fields: [
      { key: "teamId", label: "ID équipe", placeholder: "team-id" },
      { key: "channelId", label: "ID canal", placeholder: "channel-id" },
    ],
  },
  notion: {
    label: "Notion",
    fields: [{ key: "databaseId", label: "ID base de données", placeholder: "xxxxxxxx-xxxx" }],
  },
  gdrive: {
    label: "Google Drive",
    fields: [{ key: "folderId", label: "ID dossier", placeholder: "folder-id" }],
  },
  onedrive: {
    label: "OneDrive",
    fields: [{ key: "folderPath", label: "Chemin dossier", placeholder: "/Projets/Innovation" }],
  },
  miro: {
    label: "Miro",
    fields: [{ key: "boardId", label: "ID board", placeholder: "board-id" }],
  },
  asana: {
    label: "Asana",
    fields: [{ key: "workspaceId", label: "Workspace ID", placeholder: "workspace-id" }],
  },
  trello: {
    label: "Trello",
    fields: [{ key: "listId", label: "ID liste", placeholder: "list-id" }],
  },
};

export function ProjectIntegrationsPanel({ projectId }: { projectId: string }) {
  const [connected, setConnected] = useState<ProviderId[]>([]);
  const [settings, setSettings] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    void (async () => {
      const [intRes, setRes] = await Promise.all([
        fetch("/api/integrations"),
        fetch(`/api/integrations/project-settings?projectId=${projectId}`),
      ]);
      if (intRes.ok) {
        const data = await intRes.json();
        setConnected(
          data.integrations.filter((i: { status: string }) => i.status === "connected").map((i: { id: ProviderId }) => i.id),
        );
      }
      if (setRes.ok) {
        const data = await setRes.json();
        const map: Record<string, Record<string, string>> = {};
        for (const row of data.settings ?? []) {
          map[row.provider_id] = row.settings as Record<string, string>;
        }
        setSettings(map);
      }
    })();
  }, [projectId]);

  async function save(providerId: ProviderId) {
    setSaving(providerId);
    try {
      const res = await fetch("/api/integrations/project-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, providerId, settings: settings[providerId] ?? {} }),
      });
      if (!res.ok) throw new Error("Erreur");
      setToast(`${PROVIDER_FIELDS[providerId]?.label ?? providerId} enregistré`);
      window.setTimeout(() => setToast(""), 2000);
    } catch {
      setToast("Erreur enregistrement");
    } finally {
      setSaving(null);
    }
  }

  const relevant = connected.filter((id) => PROVIDER_FIELDS[id]);

  if (relevant.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plug className="size-4" /> Intégrations du projet
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connectez des outils depuis{" "}
          <a href="/dashboard/integrations" className="font-semibold text-primary underline">
            Intégrations
          </a>{" "}
          pour configurer Slack, Teams, Notion, Drive et plus par projet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Plug className="size-4" /> Intégrations du projet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {relevant.map((providerId) => {
          const cfg = PROVIDER_FIELDS[providerId];
          return (
            <div key={providerId} className="space-y-3 rounded-xl border p-4">
              <div className="font-semibold">{cfg.label}</div>
              {cfg.fields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label htmlFor={`${providerId}-${f.key}`}>{f.label}</Label>
                  <Input
                    id={`${providerId}-${f.key}`}
                    placeholder={f.placeholder}
                    value={settings[providerId]?.[f.key] ?? ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        [providerId]: { ...prev[providerId], [f.key]: e.target.value },
                      }))
                    }
                  />
                </div>
              ))}
              <Button size="sm" disabled={saving === providerId} onClick={() => save(providerId)}>
                <Save className="mr-1 size-3.5" />
                {saving === providerId ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          );
        })}
      </CardContent>
      {toast ? <div className="px-6 pb-4 text-sm text-emerald-700">{toast}</div> : null}
    </Card>
  );
}
