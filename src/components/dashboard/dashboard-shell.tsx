"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AssistantIaHeaderButton } from "@/components/dashboard/assistant-ia-header-button";
import { createClient } from "@/lib/supabase/client";
import { MAIN_NAV, SECONDARY_NAV } from "@/lib/navigation/dashboard-nav";
import { useMessagesStore } from "@/lib/store/messages-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { WizardDraftBlock } from "@/components/wizard/wizard-draft-block";
import { useWizardStore } from "@/lib/store/wizard-store";
import type { Profile } from "@/types/facilitation";

const SIDEBAR_EXPANDED = "17rem";
const SIDEBAR_COLLAPSED = "4.75rem";

interface DashboardShellProps {
  children: React.ReactNode;
  onOpenAssistant?: () => void;
}

function profileAvatarUrl(profile: Profile | null, initials: string) {
  if (profile?.avatar_url) return profile.avatar_url;
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || initials;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=fff&size=128`;
}

export function DashboardShell({ children, onOpenAssistant }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const renderCount = useRef(0);
  renderCount.current += 1;
  // #region agent log
  if (renderCount.current <= 30) {
    fetch("http://127.0.0.1:7832/ingest/7be77228-998b-4d1e-b4e0-c2eb9fd16e21", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f9c664" },
      body: JSON.stringify({
        sessionId: "f9c664",
        hypothesisId: "H2-H4",
        location: "dashboard-shell.tsx:render",
        message: "DashboardShell render",
        data: { count: renderCount.current, pathname },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion
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
      if (p) {
        // #region agent log
        fetch("http://127.0.0.1:7832/ingest/7be77228-998b-4d1e-b4e0-c2eb9fd16e21", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f9c664" },
          body: JSON.stringify({
            sessionId: "f9c664",
            hypothesisId: "H2",
            location: "dashboard-shell.tsx:profile",
            message: "Profile loaded setState",
            data: { hasProfile: true },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        setProfile(p as Profile);
      }
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

  const NavLink = ({
    item,
    collapsed,
  }: {
    item: (typeof MAIN_NAV)[number];
    collapsed?: boolean;
  }) => {
    const active =
      pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

    return (
      <Link
        key={item.id}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center rounded-2xl text-sm font-medium transition-all",
          collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
          active
            ? "bg-foreground/8 text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        )}
      >
        <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && item.badge && (
          <Badge variant="accent" className="ml-auto px-1.5 py-0 text-[10px]">
            {item.badge}
          </Badge>
        )}
        {collapsed && item.badge && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" aria-hidden />
        )}
      </Link>
    );
  };

  const NavSection = ({
    title,
    items,
    open,
    onToggle,
    mobile,
    collapsed,
  }: {
    title: string;
    items: typeof MAIN_NAV;
    open: boolean;
    onToggle: () => void;
    mobile?: boolean;
    collapsed?: boolean;
  }) => {
    if (collapsed) {
      return (
        <nav className="flex flex-col gap-0.5 px-1">
          {items.map((item) => (
            <div key={item.id} className="relative">
              <NavLink item={item} collapsed />
            </div>
          ))}
        </nav>
      );
    }

    return (
      <div className={cn(mobile && "mt-2")}>
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          {title}
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <nav className="flex flex-col gap-0.5 px-1 pb-2">
            {items.map((item) => (
              <NavLink key={item.id} item={item} />
            ))}
          </nav>
        )}
      </div>
    );
  };

  const sidebarWidth = sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED;

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

        <ScrollArea className="flex-1 px-2 py-3">
          <WizardDraftBlock router={router} expanded={sidebarExpanded} />
          <NavSection
            title="Facilitation"
            items={navItems}
            open={mainOpen}
            onToggle={() => setMainOpen(!mainOpen)}
            collapsed={!sidebarExpanded}
          />
          {!sidebarExpanded ? (
            <div className="my-2 mx-auto h-px w-8 bg-border/60" aria-hidden />
          ) : (
            <Separator className="my-2" />
          )}
          <NavSection
            title="Ressources"
            items={SECONDARY_NAV}
            open={secondaryOpen}
            onToggle={() => setSecondaryOpen(!secondaryOpen)}
            collapsed={!sidebarExpanded}
          />
        </ScrollArea>

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
              <ScrollArea className="flex-1">
                  <div className="p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Image src="/logo.png" alt="" width={32} height={32} className="rounded-2xl" />
                    <span className="font-bold text-sm">Mon facilitateur</span>
                  </div>
                  <WizardDraftBlock router={router} expanded className="mb-4" />
                  <NavSection title="Facilitation" items={navItems} open onToggle={() => {}} mobile />
                  <NavSection title="Ressources" items={SECONDARY_NAV} open onToggle={() => {}} mobile />
                </div>
              </ScrollArea>
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

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
