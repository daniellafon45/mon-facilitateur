"use client";

import {
  RevealOnScroll,
  StaggerItem,
  StaggerReveal,
} from "@/components/ui/reveal-on-scroll";

const PRODUCTIVITY_STATS = [
  {
    label: "Préparation accélérée",
    stat: "45 min gagnées par session.",
    desc: "Chaque rencontre démarre avec un plan structuré — fini l'improvisation.",
    color: "text-blue-600",
    span: 1,
  },
  {
    label: "Décisions concrètes",
    stat: "3× plus d'actions suivies.",
    desc: "Méthodes guidées, votes et synthèse pour transformer les échanges.",
    color: "text-violet-600",
    span: 1,
  },
  {
    label: "Temps d'équipe valorisé",
    stat: "8+ méthodes prêtes à l'emploi.",
    desc: "SWOT, rétrospectives, brainwriting et Six chapeaux — sans page blanche.",
    color: "text-amber-800",
    span: 2,
  },
] as const;

export function TrustedBySection() {
  return (
    <section id="clients" className="bg-muted/25 py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <RevealOnScroll className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Plus de productivité à chaque session
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Des équipes produit, innovation et RH gagnent du temps en structurant
            leurs rencontres — sans tableurs ni comptes rendus oubliés.
          </p>
        </RevealOnScroll>

        <StaggerReveal className="grid gap-4 md:grid-cols-2" stagger={0.1}>
          {PRODUCTIVITY_STATS.map((item) => (
            <StaggerItem
              key={item.label}
              className={`flex min-h-[200px] flex-col rounded-2xl border border-border/60 bg-background p-6 sm:min-h-[240px] sm:p-8 lg:p-10 ${
                item.span === 2 ? "md:col-span-2" : ""
              }`}
            >
              <p className="text-[15px] font-bold leading-none text-foreground">
                {item.label}
              </p>
              <p
                className={`mt-8 max-w-xl text-xl font-bold leading-[1.15] tracking-[-0.02em] sm:text-[1.75rem] sm:text-[2.15rem] lg:text-[2.35rem] ${item.color}`}
              >
                {item.stat}
              </p>
              <p className="mt-auto pt-8 text-[15px] leading-relaxed text-muted-foreground">
                {item.desc}
              </p>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
