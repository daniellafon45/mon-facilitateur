"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { NavItem } from "@/lib/navigation/dashboard-nav";

interface DashboardNavLinkProps {
  item: NavItem;
  pathname: string;
  collapsed?: boolean;
}

export function DashboardNavLink({ item, pathname, collapsed }: DashboardNavLinkProps) {
  const active =
    pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "relative flex items-center rounded-2xl text-sm font-medium transition-colors duration-200",
        collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
      )}
    >
      {active && !collapsed && (
        <motion.span
          layoutId="dashboard-nav-active"
          className="absolute inset-0 rounded-2xl bg-foreground/8 shadow-sm"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      {active && collapsed && (
        <span className="absolute inset-0 rounded-2xl bg-foreground/8 shadow-sm" aria-hidden />
      )}
      <item.icon className={cn("relative shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
      {!collapsed && <span className="relative truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <Badge variant="accent" className="relative ml-auto px-1.5 py-0 text-[10px]">
          {item.badge}
        </Badge>
      )}
      {collapsed && item.badge && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" aria-hidden />
      )}
    </Link>
  );
}

interface DashboardNavSectionProps {
  title: string;
  items: NavItem[];
  pathname: string;
  open: boolean;
  onToggle: () => void;
  mobile?: boolean;
  collapsed?: boolean;
}

export function DashboardNavSection({
  title,
  items,
  pathname,
  open,
  onToggle,
  mobile,
  collapsed,
}: DashboardNavSectionProps) {
  if (collapsed) {
    return (
      <nav className="flex flex-col gap-0.5 px-1">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <DashboardNavLink item={item} pathname={pathname} collapsed />
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
            <DashboardNavLink key={item.id} item={item} pathname={pathname} />
          ))}
        </nav>
      )}
    </div>
  );
}
