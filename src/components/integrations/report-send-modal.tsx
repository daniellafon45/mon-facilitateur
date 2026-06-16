"use client";

import { useEffect, useState } from "react";
import {
  Bolt,
  Check,
  Globe,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ProviderId } from "@/lib/integrations/types";

const SEND_CHANNELS = [
  { id: "email" as const, label: "Courriel", icon: Mail, color: "#2563eb", desc: "Envoyez par courriel à chaque responsable." },
  { id: "teams" as ProviderId, label: "Microsoft Teams", icon: Globe, color: "#5b5fc7", desc: "Publiez dans le canal de l'équipe." },
  { id: "slack" as ProviderId, label: "Slack", icon: Bolt, color: "#4a154b", desc: "Envoyez dans un canal Slack." },
  { id: "notion" as ProviderId, label: "Notion", icon: Sparkles, color: "#191919", desc: "Créez une page dans votre workspace." },
];

function SendReportModal({
  open,
  onClose,
  title,
  content,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
}) {
  const [channel, setChannel] = useState<(typeof SEND_CHANNELS)[number]["id"]>("email");
  const [connected, setConnected] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    void fetch("/api/integrations")
      .then((r) => r.json())
      .then((data) => {
        setConnected(
          data.integrations.filter((i: { status: string }) => i.status === "connected").map((i: { id: string }) => i.id),
        );
      });
  }, [open]);

  async function handleSend() {
    setSending(true);
    try {
      const res = await fetch("/api/integrations/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, title, content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur");
      }
      setSent(true);
      window.setTimeout(onClose, 1400);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur envoi");
    } finally {
      setSending(false);
    }
  }

  const ch = SEND_CHANNELS.find((c) => c.id === channel);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Envoyer le compte rendu</DialogTitle>
        </DialogHeader>
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Check className="size-6" />
            </div>
            <p className="font-bold">Envoyé avec succès !</p>
            <p className="text-sm text-muted-foreground">Via {ch?.label}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Choisissez un canal de diffusion.</p>
            <div className="grid gap-2">
              {SEND_CHANNELS.map((c) => {
                const needsConnection = c.id !== "email" && !connected.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={needsConnection}
                    onClick={() => setChannel(c.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                      channel === c.id ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                      needsConnection && "opacity-50",
                    )}
                  >
                    <c.icon className="mt-0.5 size-4 shrink-0" style={{ color: c.color }} />
                    <div>
                      <div className="text-sm font-semibold">{c.label}</div>
                      <div className="text-xs text-muted-foreground">{c.desc}</div>
                      {needsConnection ? (
                        <div className="mt-1 text-xs text-amber-600">Non connecté</div>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
            <Button className="w-full" disabled={sending} onClick={handleSend}>
              <Send className="mr-2 size-4" />
              {sending ? "Envoi…" : "Envoyer"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ReportPageClient() {
  const [sendOpen, setSendOpen] = useState(false);
  const title = "Compte rendu de session";
  const content =
    "Décisions prises lors de la session.\n\nActions:\n- Rédiger les spécifications\n- Contacter les résidences\n- Recruter des pairs-mentors";

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-muted/20">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Compte rendu de session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Décisions, actions assignées et export. Envoyez le rapport vers Slack, Teams, Notion ou par courriel.
          </p>
          <div className="rounded-lg border bg-muted/30 p-3 text-xs whitespace-pre-wrap">{content}</div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={() => setSendOpen(true)}>
              <Send className="mr-2 size-4" /> Envoyer
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
              Exporter PDF
            </Button>
          </div>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </CardContent>
      </Card>
      <SendReportModal open={sendOpen} onClose={() => setSendOpen(false)} title={title} content={content} />
    </div>
  );
}
