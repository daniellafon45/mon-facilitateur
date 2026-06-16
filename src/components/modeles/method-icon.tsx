"use client";

import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Flag,
  Globe,
  Grid3X3,
  Handshake,
  Headphones,
  Heart,
  Layers,
  Lightbulb,
  Link2,
  List,
  Mail,
  Pencil,
  RefreshCw,
  Rocket,
  Scale,
  Search,
  Send,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Square,
  Star,
  StopCircle,
  Target,
  User,
  Users,
  Video,
  Vote,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Target, Search, Users, Grid: Grid3X3, Flag, Layers, Hat: Square, Sliders: SlidersHorizontal,
  Globe, Shield, Document: FileText, User, Heart, Bolt: Zap, Bulb: Lightbulb, Pencil, Rocket,
  Sparkle: Sparkles, Handshake, Send, Scale, Calendar, Reset: RefreshCw, List, Link: Link2,
  Vote, Clock, Stop: StopCircle, Sparkles, Eye: Target, Video, Mail, Briefcase, Bell,
  CheckCircle, Star, BarChart: BarChart3,
};

export function MethodIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Sparkles;
  return <Icon className={className} />;
}

const TILE_COLORS: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600",
  green: "bg-emerald-500/10 text-emerald-600",
  violet: "bg-violet-500/10 text-violet-600",
  amber: "bg-amber-500/10 text-amber-600",
  rose: "bg-rose-500/10 text-rose-600",
  red: "bg-red-500/10 text-red-600",
  slate: "bg-slate-500/10 text-slate-600",
};

export function MethodIconTile({
  icon,
  color = "blue",
  size = 42,
}: {
  icon: string;
  color?: string;
  size?: number;
}) {
  const pal = TILE_COLORS[color === "rose" ? "violet" : color] ?? TILE_COLORS.blue;
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-xl", pal)}
      style={{ width: size, height: size }}
    >
      <MethodIcon name={icon} className="h-5 w-5" />
    </span>
  );
}

export function MemberAvatar({ member, size = 28 }: { member: { name: string; init: string; c: string }; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-white"
      style={{ width: size, height: size, background: member.c, fontSize: size * 0.36 }}
    >
      {member.init}
    </span>
  );
}
