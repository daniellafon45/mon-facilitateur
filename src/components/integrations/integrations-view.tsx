"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Bolt,
  Check,
  Headphones,
  Link2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { IntegrationLogo, providerMatchesSearch } from "@/components/integrations/integration-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  INTEGRATION_CATEGORIES,
  POPULAR_PROVIDER_IDS,
  PROVIDER_CATALOG,
} from "@/lib/integrations/providers/registry";
import type { IntegrationItem } from "@/lib/integrations/catalog-items";
import type { ProviderId } from "@/lib/integrations/types";

type TabId = "all" | "connected" | "popular" | "new" | "category";

interface IntegrationsViewProps {
  initialItems: IntegrationItem[];
  connectedCount: number;
}

export type { IntegrationItem };

export function IntegrationsView({ initialItems, connectedCount }: IntegrationsViewProps) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabId>("all");
  const [category, setCategory] = useState("Toutes les catégories");
  const [statusFilter, setStatusFilter] = useState<"all" | "connected" | "disconnected">("all");
  const [loadingId, setLoadingId] = useState<ProviderId | null>(null);
  const [toast, setToast] = useState("");

  const connectedParam = searchParams.get("connected");
  const errorParam = searchParams.get("error");

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2800);
  }

  async function refreshList() {
    const res = await fetch("/api/integrations");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.integrations);
  }

  async function connect(id: ProviderId) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/integrations/${id}/connect`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur connexion");
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      if (data.zapier) {
        flash(`Zapier configuré — URL inbound copiée dans la console`);
        console.info("Zapier inbound:", data.zapier.inboundUrl);
      }
      await refreshList();
      flash(`${id} connecté`);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoadingId(null);
    }
  }

  async function disconnect(id: ProviderId) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/integrations/${id}/disconnect`, { method: "POST" });
      if (!res.ok) throw new Error("Erreur déconnexion");
      await refreshList();
      flash(`${id} déconnecté`);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoadingId(null);
    }
  }

  async function syncProvider(id: ProviderId) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/integrations/sync/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType: "meetings" }),
      });
      const data = await res.json();
      flash(`Sync ${id}: ${data.pulled ?? 0} reçus, ${data.pushed ?? 0} envoyés`);
    } catch {
      flash("Erreur sync");
    } finally {
      setLoadingId(null);
    }
  }

  const filtered = useMemo(() => {
    let list = items.filter((i) => providerMatchesSearch(i, search));

    if (tab === "connected") list = list.filter((i) => i.status === "connected");
    if (tab === "popular") list = list.filter((i) => POPULAR_PROVIDER_IDS.includes(i.id));
    if (tab === "new") list = list.filter((i) => ["zapier", "miro", "hubspot"].includes(i.id));
    if (category !== "Toutes les catégories") list = list.filter((i) => i.category === category);

    if (statusFilter === "connected") list = list.filter((i) => i.status === "connected");
    if (statusFilter === "disconnected") list = list.filter((i) => i.status !== "connected");

    return list;
  }, [items, search, tab, category, statusFilter]);

  const stats = [
    {
      icon: Link2,
      color: "text-blue-600 bg-blue-50",
      val: String(PROVIDER_CATALOG.length),
      label: "Intégrations disponibles",
      hint: "À connecter à votre compte",
    },
    {
      icon: Check,
      color: "text-emerald-600 bg-emerald-50",
      val: String(connectedCount),
      label: "Connectées",
      hint: connectedCount === 0 ? "Aucune pour l'instant" : "Actives sur votre compte",
    },
    {
      icon: Star,
      color: "text-violet-600 bg-violet-50",
      val: String(POPULAR_PROVIDER_IDS.length),
      label: "Populaires",
      hint: "Les plus utilisées",
    },
    {
      icon: Bolt,
      color: "text-amber-600 bg-amber-50",
      val: "0",
      label: "Automatisations",
      hint: "Configurez Zapier",
    },
  ];

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6 pb-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Intégrations</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Connectez Mon facilitateur à vos outils préférés pour centraliser votre travail.
              </p>
            </div>
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une intégration..."
                className="pl-9"
              />
            </div>
          </div>

          {(connectedParam || errorParam) && (
            <div
              className={cn(
                "rounded-lg border px-4 py-3 text-sm",
                errorParam ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-emerald-200 bg-emerald-50 text-emerald-800",
              )}
            >
              {errorParam
                ? `Erreur : ${decodeURIComponent(errorParam)}`
                : `${connectedParam} connecté avec succès`}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <div className={cn("mb-2 inline-flex rounded-lg p-2", s.color)}>
                    <s.icon className="size-4" />
                  </div>
                  <div className="text-2xl font-extrabold">{s.val}</div>
                  <div className="text-sm font-semibold">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.hint}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="hidden xl:block">
            <CardContent className="p-4">
              <div className="font-bold">À propos des intégrations</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Connectez vos outils pour synchroniser rencontres, tâches, contacts et documents.
              </p>
              <Link href="/dashboard/apprendre" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                En savoir plus <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
            <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
              {[
                ["all", "Toutes les intégrations"],
                ["connected", "Connectées"],
                ["popular", "Populaires"],
                ["new", "Nouvelles"],
              ].map(([id, label]) => (
                <TabsTrigger key={id} value={id} className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-6 lg:flex-row">
            <aside className="w-full shrink-0 space-y-4 lg:w-48">
              <div>
                <div className="mb-2 text-sm font-bold">Catégories</div>
                {INTEGRATION_CATEGORIES.map((c) => (
                  <label key={c} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
                    <input
                      type="radio"
                      name="cat"
                      checked={category === c}
                      onChange={() => setCategory(c)}
                      className="accent-primary"
                    />
                    {c}
                  </label>
                ))}
              </div>
              <div>
                <div className="mb-2 text-sm font-bold">Statut</div>
                {(
                  [
                    ["all", "Toutes"],
                    ["connected", "Connectées uniquement"],
                    ["disconnected", "Non connectées"],
                  ] as const
                ).map(([id, label]) => (
                  <label key={id} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
                    <input
                      type="radio"
                      name="status"
                      checked={statusFilter === id}
                      onChange={() => setStatusFilter(id)}
                      className="accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="mb-3 text-sm font-semibold text-muted-foreground">
                Résultats ({filtered.length})
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filtered.map((item) => {
                  const isConnected = item.status === "connected";
                  return (
                    <Card key={item.id} className="flex flex-col">
                      <CardContent className="flex flex-1 flex-col gap-3 p-4">
                        <div className="flex items-start justify-between">
                          <IntegrationLogo name={item.name} color={item.color} bg={item.bg} />
                          <Button variant="ghost" size="icon" className="size-8" aria-label="Options">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </div>
                        <div>
                          <div className="font-bold">{item.name}</div>
                          <Badge variant="outline" className="mt-1 text-[10px]">
                            {item.category}
                          </Badge>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                          {item.accountName ? (
                            <p className="mt-1 text-xs text-emerald-700">{item.accountName}</p>
                          ) : null}
                        </div>
                        <div className="mt-auto flex flex-wrap gap-2">
                          {isConnected ? (
                            <>
                              <Badge className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                <Check className="size-3" /> Connectée
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={loadingId === item.id}
                                onClick={() => syncProvider(item.id)}
                              >
                                <RefreshCw className="mr-1 size-3" /> Sync
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={loadingId === item.id}
                                onClick={() => disconnect(item.id)}
                              >
                                Déconnecter
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={loadingId === item.id}
                              onClick={() => connect(item.id)}
                            >
                              {loadingId === item.id ? "Connexion…" : "Connecter"}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden w-60 shrink-0 xl:block">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="font-bold">Intégrations populaires</div>
              {PROVIDER_CATALOG.filter((p) => p.popular).map((p) => (
                <div key={p.id} className="flex items-center gap-3 border-b border-border/60 pb-3 last:border-0">
                  <IntegrationLogo name={p.name} color={p.color} bg={p.bg} size={32} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.category}</div>
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Headphones className="size-4" /> Besoin d&apos;aide ?
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Consultez le centre d&apos;aide pour connecter vos outils.
                </p>
                <Link href="/dashboard/apprendre" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Centre d&apos;aide <ArrowRight className="size-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg">
          {toast}
        </div>
      ) : null}
    </DashboardShell>
  );
}
