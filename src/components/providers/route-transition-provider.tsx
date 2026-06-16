"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PageTransition } from "@/components/ui/page-transition";

interface RouteTransitionProviderProps {
  children: ReactNode;
}

/** Transitions fade + slide sur les changements de route (hors dashboard, géré par DashboardClientLayout). */
export function RouteTransitionProvider({ children }: RouteTransitionProviderProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <PageTransition transitionKey={pathname ?? "/"} variant="page">
      {children}
    </PageTransition>
  );
}
