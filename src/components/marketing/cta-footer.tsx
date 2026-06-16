import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Calendar } from "lucide-react";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

/** Liens vers les sections réellement présentes sur la homepage */
const HOME_SECTIONS = [
  { label: "Accueil", href: "#hero" },
  { label: "Productivité", href: "#clients" },
  { label: "Solutions IA", href: "#modeles" },
  { label: "Intégrations", href: "#integrations" },
  { label: "FAQ", href: "#faq" },
  { label: "Témoignages", href: "#avis" },
  { label: "Citations", href: "#citations" },
  { label: "Contact", href: "#contact" },
];

export function MarketingFooter() {
  return (
    <footer id="contact" className="relative overflow-x-hidden bg-neutral-950 text-neutral-400">
      {/* Logo filigrane — sur tout le footer (bandeau + navigation), non coupé */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex justify-center overflow-visible pb-6 lg:pb-10"
        aria-hidden
      >
        <Image
          src="/logo-blanc.png"
          alt=""
          width={720}
          height={720}
          className="h-auto w-[min(88vw,520px)] max-w-none object-contain opacity-[0.07] select-none lg:w-[min(82vw,680px)]"
        />
      </div>

      <div className="relative z-10 border-b border-neutral-800">
        <RevealOnScroll
          y={16}
          className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-8 lg:flex-row lg:items-center lg:px-8 lg:py-10"
        >
          <div className="flex max-w-2xl items-start gap-4">
            <span className="relative mt-3 flex size-6 shrink-0 items-center justify-center" aria-hidden>
              <span className="absolute size-3.5 animate-pulse-ring rounded-full bg-white/45" />
              <span className="absolute size-3.5 animate-pulse-ring rounded-full bg-white/25 [animation-delay:1s]" />
              <span className="relative size-3.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
            </span>
            <p className="text-base font-medium leading-relaxed text-neutral-200 sm:text-lg">
              Besoin de solutions personnalisées ? Nous pourvoyons les entreprises
              en facilitation sur mesure. Planifiez un appel avec notre équipe ou
              essayez par vous-même.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href="mailto:hello@monfacilitateur.app"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-neutral-400 hover:bg-neutral-900"
            >
              Planifier un appel
              <Calendar className="size-4" />
            </a>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-100"
            >
              Commencer gratuitement
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>

      <div className="relative z-10">
        <RevealOnScroll
          delay={0.08}
          className="relative mx-auto max-w-7xl px-4 py-14 pb-32 sm:pb-44 lg:px-8 lg:pb-56"
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <p className="mb-4 text-sm font-medium text-neutral-300">Navigation</p>
              <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2 md:grid-cols-3">
                {HOME_SECTIONS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:text-right">
              <p className="mb-4 text-sm font-medium text-neutral-300">Clients</p>
              <a
                href="mailto:hello@monfacilitateur.app"
                className="text-sm text-white transition-opacity hover:opacity-80"
              >
                hello@monfacilitateur.app
              </a>
              <div className="mt-8 flex flex-col gap-2 text-sm lg:items-end">
                <Link href="/login" className="transition-colors hover:text-white">
                  Connexion
                </Link>
                <Link href="/signup" className="transition-colors hover:text-white">
                  Inscription
                </Link>
              </div>
              <p className="mt-8 text-xs text-neutral-500">
                © {new Date().getFullYear()} Mon facilitateur. Tous droits réservés.
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </footer>
  );
}
