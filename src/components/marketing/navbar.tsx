"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { REVEAL_EASE } from "@/components/ui/reveal-on-scroll";

import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "#modeles", label: "Produit" },
  { href: "#modeles", label: "Solutions" },
  { href: "#integrations", label: "Intégrations" },
  { href: "#faq", label: "FAQ" },
  { href: "#avis", label: "Témoignages" },
  { href: "#contact", label: "Contact" },
];

export function MarketingNavbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        setLoggedIn(!!session?.user);
      });
      return () => sub.subscription.unsubscribe();
    } catch {
      setLoggedIn(false);
    }
  }, []);

  const Header = reduced ? "header" : motion.header;

  return (
    <Header
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm"
      {...(!reduced && {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: REVEAL_EASE },
      })}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-3 lg:h-[4.75rem] lg:px-8">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-2.5">
          <Image src="/logo.png" alt="Mon facilitateur" width={36} height={36} className="shrink-0 rounded-full" />
          <span className="truncate text-base font-semibold tracking-tight sm:text-[17px] lg:text-lg">
            Mon facilitateur
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-[15px] text-foreground/80 lg:flex lg:gap-9 lg:text-base">
          {NAV_LINKS.map((l) => (
            <a key={`${l.href}-${l.label}`} href={l.href} className="whitespace-nowrap transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          {loggedIn ? (
            <Button asChild className="h-10 rounded-full bg-foreground px-3 text-sm font-medium text-background hover:bg-foreground/90 sm:h-11 sm:px-5 sm:text-[15px]">
              <Link href="/dashboard">
                <span className="hidden sm:inline">Mon tableau de bord</span>
                <span className="sm:hidden">Dashboard</span>
                <ArrowUpRight className="ml-0.5 size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Link href="/login" className="hidden text-[15px] font-medium text-foreground/80 transition-colors hover:text-foreground sm:inline lg:text-base">
                Me connecter
              </Link>
              <Button asChild className="h-10 rounded-full bg-foreground px-3 text-sm font-medium text-background hover:bg-foreground/90 sm:h-11 sm:px-5 sm:text-[15px]">
                <Link href="/signup">
                  S&apos;inscrire
                  <ArrowUpRight className="ml-0.5 size-4" />
                </Link>
              </Button>
            </>
          )}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="size-10 shrink-0 sm:size-11" aria-label="Menu">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[min(100vw-2rem,20rem)] flex-col overflow-hidden p-0 sm:w-80">
              <nav className="flex max-h-[calc(100dvh-2rem)] flex-col gap-5 overflow-y-auto p-6">
                {NAV_LINKS.map((l) => (
                  <a key={`${l.href}-${l.label}`} href={l.href} className="text-lg font-medium">
                    {l.label}
                  </a>
                ))}
                {!loggedIn && (
                  <>
                    <Link href="/login" className="text-lg font-medium">Me connecter</Link>
                    <Button asChild className="mt-2 h-11 rounded-full text-base">
                      <Link href="/signup">S&apos;inscrire</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Header>
  );
}
