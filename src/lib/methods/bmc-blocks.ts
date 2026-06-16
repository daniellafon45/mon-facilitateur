import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Handshake,
  Heart,
  Layers,
  Scale,
  Send,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export type BmcBlockColor = "slate" | "violet" | "green" | "amber" | "red" | "blue";

export interface BmcChip {
  id: string;
  text: string;
}

export interface BmcBlockDef {
  id: string;
  title: string;
  icon: LucideIcon;
  color: BmcBlockColor;
  hint: string;
}

export const BMC_BLOCK_DEFS: BmcBlockDef[] = [
  {
    id: "part",
    title: "Partenaires clés",
    icon: Handshake,
    color: "slate",
    hint: "Qui sont nos partenaires et fournisseurs clés ?",
  },
  {
    id: "act",
    title: "Activités clés",
    icon: Zap,
    color: "violet",
    hint: "Quelles activités notre proposition exige-t-elle ?",
  },
  {
    id: "res",
    title: "Ressources clés",
    icon: Layers,
    color: "green",
    hint: "De quelles ressources avons-nous besoin ?",
  },
  {
    id: "vp",
    title: "Proposition de valeur",
    icon: Sparkles,
    color: "amber",
    hint: "Quelle valeur apportons-nous au client ?",
  },
  {
    id: "rel",
    title: "Relations clients",
    icon: Heart,
    color: "red",
    hint: "Quel type de relation chaque segment attend-il ?",
  },
  {
    id: "can",
    title: "Canaux",
    icon: Send,
    color: "red",
    hint: "Comment atteignons-nous nos segments ?",
  },
  {
    id: "seg",
    title: "Segments de clientèle",
    icon: Users,
    color: "blue",
    hint: "Pour qui créons-nous de la valeur ?",
  },
  {
    id: "cost",
    title: "Structure de coûts",
    icon: Scale,
    color: "amber",
    hint: "Quels sont les coûts les plus importants ?",
  },
  {
    id: "rev",
    title: "Sources de revenus",
    icon: BarChart3,
    color: "green",
    hint: "Pour quelle valeur les clients paient-ils ?",
  },
];

export const BMC_STICKY: Record<
  BmcBlockColor,
  { paper: string; ink: string; tab: string }
> = {
  slate: { paper: "#EEF2F7", ink: "#334155", tab: "#CBD5E1" },
  violet: { paper: "#EDE9FE", ink: "#5B21B6", tab: "#C4B5FD" },
  green: { paper: "#D1FAE5", ink: "#065F46", tab: "#6EE7B7" },
  amber: { paper: "#FEF3C7", ink: "#92400E", tab: "#FCD34D" },
  red: { paper: "#FFE4E6", ink: "#9F1239", tab: "#FDA4AF" },
  blue: { paper: "#DBEAFE", ink: "#1E40AF", tab: "#93C5FD" },
};

export const BMC_PALETTE_FG: Record<BmcBlockColor, string> = {
  slate: "#475569",
  violet: "#6d28d9",
  green: "#059669",
  amber: "#d97706",
  red: "#e11d48",
  blue: "#2563eb",
};

export const BMC_GUIDED_QUESTIONS = [
  "Quels sont les 3 besoins prioritaires de nos utilisateurs à leur arrivée ?",
  "Quelles activités créent le plus de valeur dès la première semaine ?",
  "Quels canaux utilisent-ils déjà pour s'informer et communiquer ?",
  "Quelles ressources avons-nous déjà et que devons-nous acquérir ?",
];

export type BmcDesignMode = "couleur" | "pastel" | "neutre";
export type BmcThemeId = "classic" | "mono" | "dark" | "minimal";

export const BMC_THEMES: { id: BmcThemeId; label: string; desc: string }[] = [
  { id: "classic", label: "Classique", desc: "Blocs colorés, aérés" },
  { id: "mono", label: "Monochrome", desc: "Propre et minimaliste" },
  { id: "dark", label: "Sombre", desc: "Fond foncé idéal en présentation" },
  { id: "minimal", label: "Épuré", desc: "Contours seulement" },
];

export function bmcChipId() {
  return `k${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

export function buildBmcExportText(
  blocks: Record<string, BmcChip[]>,
): string {
  return (
    "BUSINESS MODEL CANVAS\n\n" +
    BMC_BLOCK_DEFS.map((b) => {
      const chips = blocks[b.id] ?? [];
      const lines = chips.length
        ? chips.map((c) => `  - ${c.text || "(vide)"}`).join("\n")
        : "  (aucune note)";
      return `■ ${b.title}\n${lines}`;
    }).join("\n\n")
  );
}
