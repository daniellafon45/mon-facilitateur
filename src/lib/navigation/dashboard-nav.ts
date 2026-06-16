import type { LucideIcon } from "lucide-react";
import {
  Home,
  Folder,
  Calendar,
  Users,
  MessageSquare,
  Pencil,
  FileText,
  Grid,
  BarChart3,
  BookOpen,
  Plug,
  Settings,
  HelpCircle,
  StickyNote,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const MAIN_NAV: NavItem[] = [
  { id: "accueil", label: "Accueil", href: "/dashboard", icon: Home },
  { id: "projets", label: "Mes projets", href: "/dashboard/projets", icon: Folder },
  { id: "rencontres", label: "Mes rencontres", href: "/dashboard/rencontres", icon: Calendar },
  { id: "dreamteam", label: "Dream Team", href: "/dashboard/dreamteam", icon: Users },
  { id: "messages", label: "Messagerie", href: "/dashboard/messages", icon: MessageSquare },
  { id: "tableau", label: "Tableau blanc", href: "/dashboard/tableau", icon: Pencil },
  { id: "documents", label: "Documents", href: "/dashboard/documents", icon: FileText },
  { id: "modeles", label: "Modèles de méthodes", href: "/dashboard/modeles", icon: Grid },
  { id: "pilotage", label: "Centre de pilotage", href: "/dashboard/pilotage", icon: BarChart3, badge: "NOUVEAU" },
  { id: "apprendre", label: "Apprendre", href: "/dashboard/apprendre", icon: BookOpen },
];

export const SECONDARY_NAV: NavItem[] = [
  { id: "integrations", label: "Intégrations", href: "/dashboard/integrations", icon: Plug },
  { id: "parametres", label: "Paramètres", href: "/dashboard/parametres", icon: Settings },
  { id: "aide", label: "Aide & support", href: "/dashboard/aide", icon: HelpCircle },
  { id: "pense-bete", label: "Pense-bête", href: "/dashboard/pense-bete", icon: StickyNote },
];
