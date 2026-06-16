"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Plug,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { cn } from "@/lib/utils";

const FEATURES = [
  { label: "Cadrage IA — objectif & méthode", icon: Sparkles },
  { label: "Projets, rencontres & sessions liés", icon: RefreshCw },
  { label: "Rapport exportable en fin de session", icon: Target },
  { label: "Données hébergées en toute sécurité", icon: Shield },
];

type IntegrationStatus = "available" | "soon";

const INTEGRATIONS: {
  name: string;
  logo: string;
  status: IntegrationStatus;
}[] = [
  { name: "OpenAI", logo: "/integrations/openai.png", status: "available" },
  { name: "Claude", logo: "/integrations/claude.png", status: "available" },
  { name: "Supabase", logo: "/integrations/supabase.png", status: "available" },
  { name: "Export PDF", logo: "/integrations/pdf.png", status: "available" },
  { name: "Google Sheets", logo: "/integrations/google-sheet.png", status: "available" },
  { name: "Google Docs", logo: "/integrations/google-docs.png", status: "available" },
  { name: "Microsoft Teams", logo: "/integrations/teams.svg", status: "available" },
  { name: "Slack", logo: "/integrations/slack.svg", status: "available" },
  { name: "Google Calendar", logo: "/integrations/calendar.svg", status: "available" },
  { name: "Notion", logo: "/integrations/notion.svg", status: "available" },
];

function IntegrationIcon({
  item,
  active,
  onHover,
}: {
  item: (typeof INTEGRATIONS)[number];
  active: boolean;
  onHover: (name: string | null) => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover(item.name)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(item.name)}
      onBlur={() => onHover(null)}
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background transition-all sm:size-12",
        active
          ? "z-10 scale-105 border-foreground/15 shadow-md"
          : "border-border/60 opacity-90 hover:opacity-100",
        item.status === "soon" && "opacity-60",
      )}
      aria-label={item.name}
    >
      <Image
        src={item.logo}
        alt=""
        width={28}
        height={28}
        className="size-6 object-contain sm:size-7"
      />
      {item.status === "soon" ? (
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amber-400 ring-2 ring-background" />
      ) : null}
    </button>
  );
}

export function IntegrationsSection() {
  const [hovered, setHovered] = useState<string | null>("Claude");

  return (
    <section id="integrations" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <RevealOnScroll y={24} duration={0.65}>
          <div className="relative rounded-3xl border border-border/80 bg-card p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05),0_16px_48px_rgba(0,0,0,0.06)] lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="max-w-xl">
                <Badge
                  variant="outline"
                  className="mb-5 gap-1.5 border-blue-200 bg-blue-50 px-3 py-1 text-blue-700"
                >
                  <Plug className="size-3.5" strokeWidth={2.5} />
                  Écosystème
                </Badge>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-[2.4rem] lg:leading-[1.15]">
                  Préparez, animez, partagez.
                  <span className="mt-1 block text-muted-foreground">
                    Un seul fil, du cadrage au compte-rendu.
                  </span>
                </h2>

                <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
                  Vous n&apos;avez pas besoin d&apos;un nouvel outil de visio — vous
                  avez besoin de clarifier l&apos;objectif, choisir la bonne méthode et
                  repartir avec une trace exploitable. Mon facilitateur relie ces
                  étapes : l&apos;assistant IA (Claude ou OpenAI) cadrant votre
                  session, le wizard qui structure l&apos;atelier, la session live qui
                  capture les contributions, puis l&apos;export PDF, Sheets ou Docs pour
                  votre équipe. Teams, Slack, Calendar et Notion sont disponibles dans le
                  tableau de bord pour synchroniser rencontres, tâches et comptes rendus.
                </p>
              </div>

              <div className="flex flex-col gap-2 lg:items-end">
                {FEATURES.map(({ label, icon: Icon }) => (
                  <Badge
                    key={label}
                    variant="outline"
                    className="w-fit gap-2 border-border/80 bg-muted/30 px-3 py-1.5 text-foreground"
                  >
                    <Icon className="size-3.5" strokeWidth={2} />
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="relative mt-8 rounded-2xl bg-muted/45 p-4 lg:p-5">
              {hovered ? (
                <div className="pointer-events-none absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium shadow-sm sm:left-auto sm:translate-x-0">
                  {hovered}
                  {INTEGRATIONS.find((i) => i.name === hovered)?.status === "soon" ? (
                    <>
                      <CalendarCheck className="size-3 text-amber-500" />
                      Bientôt
                    </>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] sm:gap-2.5 [&::-webkit-scrollbar]:hidden">
                  {INTEGRATIONS.map((item) => (
                    <IntegrationIcon
                      key={item.name}
                      item={item}
                      active={hovered === item.name}
                      onHover={setHovered}
                    />
                  ))}
                </div>

                <Link
                  href="/dashboard/integrations"
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 sm:w-auto"
                >
                  Configurer dans le dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
