"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LEADER_QUOTES } from "@/lib/data/leader-quotes";
import {
  RevealOnScroll,
  StaggerItem,
  StaggerReveal,
} from "@/components/ui/reveal-on-scroll";
import { cn } from "@/lib/utils";

function QuoteCard({
  author,
  role,
  quote,
  featured,
  image,
  className,
}: (typeof LEADER_QUOTES)[number] & { className?: string }) {
  if (featured && image) {
    return (
      <article
        className={cn(
          "relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl p-6 sm:min-h-[340px] sm:p-7",
          className,
        )}
      >
        <img
          src={image}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/55 to-black/30" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">{author}</p>
            <p className="text-xs text-white/65">{role}</p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-white/50" />
        </div>
        <blockquote className="relative mt-8 text-lg font-medium leading-snug text-white sm:text-xl md:text-2xl">
          « {quote} »
        </blockquote>
        <Link
          href="#avis"
          className="relative mt-6 inline-flex w-fit items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          Lire les témoignages
          <ArrowUpRight className="size-4" />
        </Link>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "flex min-h-[220px] flex-col justify-between rounded-2xl bg-neutral-900 p-6 sm:p-7",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{author}</p>
          <p className="text-xs text-neutral-400">{role}</p>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-neutral-500" />
      </div>
      <blockquote className="mt-6 text-sm leading-relaxed text-neutral-300 sm:text-[15px]">
        « {quote} »
      </blockquote>
    </article>
  );
}

export function LeaderQuotesSection() {
  const standard = LEADER_QUOTES.filter((q) => !q.featured);
  const featured = LEADER_QUOTES.find((q) => q.featured)!;

  return (
    <section id="citations" className="bg-neutral-950 py-16 text-white lg:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-12">
          <RevealOnScroll className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Ne nous croyez pas sur parole.
            </h2>
            <p className="mt-4 text-neutral-400">
              Les grands gestionnaires de projet rappellent pourquoi structurer
              chaque rencontre change la productivité des équipes.
            </p>
            <Link
              href="#avis"
              className="mt-8 inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-neutral-500 hover:bg-neutral-900"
            >
              Voir tous les avis
              <ArrowUpRight className="size-4" />
            </Link>
          </RevealOnScroll>

          <StaggerReveal className="grid gap-4 sm:grid-cols-2 sm:grid-rows-2" stagger={0.1}>
            <StaggerItem>
              <QuoteCard {...standard[0]} />
            </StaggerItem>
            <StaggerItem>
              <QuoteCard {...standard[1]} />
            </StaggerItem>
            <StaggerItem>
              <QuoteCard {...standard[2]} />
            </StaggerItem>
            <StaggerItem
              className="sm:col-start-2 sm:row-span-2 sm:row-start-1"
            >
              <QuoteCard {...featured} className="h-full" />
            </StaggerItem>
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}
