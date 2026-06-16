"use client";

import {
  Archive,
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  Clock,
  Copy,
  Eye,
  Folder,
  Info,
  LayoutGrid,
  Link,
  List,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Rocket,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  Trash2,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const PROJECT_ICON_MAP: Record<string, LucideIcon> = {
  Folder,
  Users,
  Bolt: Zap,
  Zap,
  Sparkle: Sparkles,
  Sparkles,
  Target,
  Briefcase,
  Rocket,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
};

export function ProjectIcon({
  name,
  size = 18,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = PROJECT_ICON_MAP[name] ?? Folder;
  return <Icon size={size} className={className} />;
}

export function IconTile({
  icon,
  color = "blue",
  size = 32,
  className,
}: {
  icon: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  const tones: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-600",
    green: "bg-emerald-500/10 text-emerald-600",
    violet: "bg-violet-500/10 text-violet-600",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg shrink-0",
        tones[color] ?? tones.blue,
        className,
      )}
      style={{ width: size, height: size }}
    >
      <ProjectIcon name={icon} size={Math.round(size * 0.5)} />
    </span>
  );
}

export {
  Archive,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  Copy,
  Eye,
  Folder,
  Info,
  LayoutGrid,
  Link,
  List,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  Users,
  X,
};
