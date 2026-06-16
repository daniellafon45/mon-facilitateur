"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bell,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AssistantIaHeaderButton } from "@/components/dashboard/assistant-ia-header-button";
import { DashboardNavSection } from "@/components/dashboard/dashboard-nav";
import { createClient } from "@/lib/supabase/client";
import { MAIN_NAV, SECONDARY_NAV } from "@/lib/navigation/dashboard-nav";
import { useMessagesStore } from "@/lib/store/messages-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { WizardDraftBlock } from "@/components/wizard/wizard-draft-block";
import { useWizardStore } from "@/lib/store/wizard-store";
import { PageTransition } from "@/components/ui/page-transition";
import type { Profile } from "@/types/facilitation";

const SIDEBAR_EXPANDED = "17rem";
const SIDEBAR_COLLAPSED = "4.75rem";

interface DashboardShellProps {
  children: React.ReactNode;
  onOpenAssistant?: () => void;
  fullBleed?: boolean;
}

function profileAvatarUrl(profile: Profile | null, initials: string) {
  if (profile?.avatar_url) return profile.avatar_url;
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || initials;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=fff&size=128`;
}

export function DashboardShell({ children, onOpenAssistant, fullBleed }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mainOpen, setMainOpen] = useState(true);
  const [secondaryOpen, setSecondaryOpen] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const prev = prevPathRef.current;
    const wasWizard = prev?.startsWith("/dashboard/wizard");
    const nowWizard = pathname?.startsWith("/dashboard/wizard");
    if (wasWizard && !nowWizard) {
      void useWizardStore.getState().persistDraft();
    }
    prevPathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      if (p) setProfile(p as Profile);
    });
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = profile
    ? `${(profile.first_name || "?")[0]}${(profile.last_name || "")[0] || ""}`.toUpperCase()
    : "?";

  const avatarSrc = profileAvatarUrl(profile, initials);
  const messagesUnread = useMessagesStore((s) => s.convos.reduce((sum, c) => sum + (c.unread || 0), 0));

  const navItems = MAIN_NAV.map((item) =>
    item.id === "messages" && messagesUnread > 0
      ? { ...item, badge: String(messagesUnread) }
      : item,
  );

  const sidebarWidth = sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

  const pageTransitionKey =
    pathname?.startsWith("/dashboard/wizard") ? "/dashboard/wizard" : (pathname ?? "/dashboard");

  return (
    <div className="min-h-[100dvh] bg-background" data-testid="dashboard-shell">
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden md:flex flex-col border-r bg-background/80 backdrop-blur-xl shadow-sm transition-[width] duration-300"
        style={{ width: sidebarWidth }}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center",
            sidebarExpanded ? "gap-2 px-4" : "flex-col justify-center gap-2 px-2 py-3 h-auto min-h-[4.5rem]",
          )}
        >
          <Image
            src="/logo.png"
            alt="Mon facilitateur"
            width={36}
            height={36}
            className="shrink-0 rounded-2xl"
          />
          {sidebarExpanded && (
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold tracking-tight">Mon facilitateur</span>
              <span className="block truncate text-[10px] text-muted-foreground">Espace facilitation</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("shrink-0 rounded-2xl", sidebarExpanded ? "" : "h-8 w-8")}
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            aria-label={sidebarExpanded ? "Réduire le menu" : "Agrandir le menu"}
          >
            {sidebarExpanded ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          <WizardDraftBlock router={router} expanded={sidebarExpanded} />
          <DashboardNavSection
            title="Facilitation"
            items={navItems}
            pathname={pathname}
            open={mainOpen}
            onToggle={() => setMainOpen(!mainOpen)}
            collapsed={!sidebarExpanded}
          />
          {!sidebarExpanded ? (
            <div className="my-2 mx-auto h-px w-8 bg-border/60" aria-hidden />
          ) : (
            <Separator className="my-2" />
          )}
          <DashboardNavSection
            title="Ressources"
            items={SECONDARY_NAV}
            pathname={pathname}
            open={secondaryOpen}
            onToggle={() => setSecondaryOpen(!secondaryOpen)}
            collapsed={!sidebarExpanded}
          />
        </div>

        <div className="p-3">
          <Button
            variant="ghost"
            size={sidebarExpanded ? "sm" : "icon"}
            className={cn(
              "rounded-2xl text-muted-foreground hover:text-foreground",
              sidebarExpanded ? "w-full justify-start gap-2" : "mx-auto",
            )}
            onClick={logout}
            title={sidebarExpanded ? undefined : "Déconnexion"}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarExpanded && "Déconnexion"}
          </Button>
        </div>
      </aside>

      <div
        className={cn(
          "transition-[padding] duration-300",
          sidebarExpanded ? "md:pl-[17rem]" : "md:pl-[4.75rem]",
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-background/80 px-3 backdrop-blur-xl sm:h-16 sm:gap-3 sm:px-5 lg:px-8">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-[min(100vw-2rem,18rem)] flex-col overflow-hidden p-0 sm:w-72">
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Image src="/logo.png" alt="" width={32} height={32} className="rounded-2xl" />
                    <span className="font-bold text-sm">Mon facilitateur</span>
                  </div>
                  <WizardDraftBlock router={router} expanded className="mb-4" />
                  <DashboardNavSection
                    title="Facilitation"
                    items={navItems}
                    pathname={pathname}
                    open
                    onToggle={() => {}}
                    mobile
                  />
                  <DashboardNavSection
                    title="Ressources"
                    items={SECONDARY_NAV}
                    pathname={pathname}
                    open
                    onToggle={() => {}}
                    mobile
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher projets, rencontres…"
              className="h-10 rounded-2xl border-0 bg-muted/40 pl-9"
              onFocus={onOpenAssistant}
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <AssistantIaHeaderButton onClick={onOpenAssistant ?? (() => {})} />
            <Button variant="ghost" size="icon" className="relative rounded-2xl">
              <Bell className="h-5 w-5" />
            </Button>
            <Link href="/dashboard/parametres" title="Mon profil">
              <Avatar className="h-9 w-9 ring-2 ring-foreground/10 transition-opacity hover:opacity-90">
                <AvatarImage src={avatarSrc} alt={initials} />
                <AvatarFallback className="bg-muted text-xs font-bold text-foreground">{initials}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className={cn("p-4 lg:p-8", fullBleed && "p-0")}>
          <PageTransition transitionKey={pageTransitionKey} variant="page">
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
