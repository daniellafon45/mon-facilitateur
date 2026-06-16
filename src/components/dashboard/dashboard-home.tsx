"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rocket, Calendar, CheckCircle, Users, Folder, ArrowRight } from "lucide-react";
import { AssistantIaCard } from "@/components/dashboard/assistant-ia-card";
import {
  useAssistantFocusHandler,
  useDashboardUi,
} from "@/components/dashboard/dashboard-ui-context";
import { WizardDraftHomeCard } from "@/components/wizard/wizard-draft-block";
import { AnimatedTestimonials } from "@/components/ui/testimonial";
import { FAMOUS_AUTHOR_QUOTES } from "@/lib/data/author-quotes";
import type { SessionMode } from "@/types/facilitation";
import { useFacilitationStore, todayISO } from "@/lib/store/facilitation-store";
import { startWizardSession } from "@/lib/wizard/start-wizard-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function DashboardHome() {
  const router = useRouter();
  const { openAssistant } = useDashboardUi();
  const meetings = useFacilitationStore((s) => s.meetings);
  const projects = useFacilitationStore((s) => s.projects);
  const tasks = useFacilitationStore((s) => s.tasks);
  const contactsCount = useFacilitationStore((s) => s.contacts.length);
  const [prompt, setPrompt] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mounted, setMounted] = useState(false);

  useAssistantFocusHandler(() => prompt.trim());

  useEffect(() => {
    setMounted(true);
    try {
      createClient()
        .from("profiles")
        .select("first_name")
        .single()
        .then(({ data }) => {
          if (data?.first_name) setFirstName(data.first_name);
        });
    } catch {
      /* Supabase non configuré */
    }
    const heroPrompt = sessionStorage.getItem("mf-hero-prompt");
    if (heroPrompt) {
      sessionStorage.removeItem("mf-hero-prompt");
      setPrompt(heroPrompt);
      openAssistant(heroPrompt);
    }
  }, [openAssistant]);

  const launchAssistant = () => {
    openAssistant(prompt.trim());
  };

  const launch = (mode?: SessionMode) => {
    void startWizardSession(router, mode);
  };

  const weekStats = useMemo(() => {
    const today = todayISO();
    const upcoming = meetings.filter(
      (m) => m.status === "À venir" && !m.archived && m.dateISO >= today,
    ).length;
    const openTasksCount = tasks.filter((t) => !t.done).length;
    const activeProjects = projects.filter((p) => !p.archived).length;

    return [
      { icon: Calendar, label: "Rencontres", sub: "À venir", n: upcoming, href: "/dashboard/rencontres" },
      { icon: CheckCircle, label: "Tâches", sub: "Ouvertes", n: openTasksCount, href: "/dashboard/projets" },
      { icon: Folder, label: "Projets", sub: "Actifs", n: activeProjects, href: "/dashboard/projets" },
      { icon: Users, label: "Contacts", sub: "Dream Team", n: contactsCount, href: "/dashboard/dreamteam" },
    ];
  }, [meetings, projects, tasks, contactsCount]);

  const modes = [
    { label: "Solo", mode: "solo" as const },
    { label: "Équipe", mode: "equipe" as const },
    { label: "Grand atelier", mode: "atelier" as const },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl">
            Bonjour {firstName || "!"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Prêt à faciliter une session plus courte et plus productive ?
          </p>
        </div>

        <AssistantIaCard
          prompt={prompt}
          onPromptChange={setPrompt}
          onSubmit={launchAssistant}
          modes={modes}
          onModeSelect={launch}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weekStats.map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="rounded-3xl hover:border-foreground/15 hover:shadow-md transition-all h-full">
                <CardContent className="p-5">
                  <s.icon className="h-5 w-5 text-foreground/70 mb-3" />
                  <p className="text-2xl font-bold">{mounted ? s.n : 0}</p>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <WizardDraftHomeCard router={router} />
          <Card className="rounded-3xl group cursor-pointer hover:shadow-lg transition-shadow" onClick={() => launch()}>
            <CardHeader>
              <Rocket className="h-8 w-8 text-foreground/80 mb-2" />
              <CardTitle className="text-lg">Lancer une séance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Parcours guidé solo, équipe ou grand atelier</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground mt-4">
                Commencer <ArrowRight className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
          <Card className="rounded-3xl group cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/dashboard/modeles")}>
            <CardHeader>
              <Folder className="h-8 w-8 text-foreground/80 mb-2" />
              <CardTitle className="text-lg">Explorer les méthodes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">SCAMPER, Ishikawa, brainwriting et plus</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground mt-4">
                Voir la bibliothèque <ArrowRight className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        </div>

        <section className="w-full min-w-0 pt-2">
          <div className="mb-6">
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              Paroles de grands auteurs
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sagesse, leadership et créativité collective pour inspirer vos sessions.
            </p>
          </div>
          <div className="rounded-3xl border bg-card/60 p-5 shadow-sm sm:p-8">
            <AnimatedTestimonials
              testimonials={FAMOUS_AUTHOR_QUOTES}
              compact
              className="w-full"
            />
          </div>
        </section>
      </div>
  );
}
