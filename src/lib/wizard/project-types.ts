import type { LucideIcon } from "lucide-react";
import { BookOpen, Briefcase, Pencil, Rocket, User, Users } from "lucide-react";
import type { SessionMode } from "@/types/facilitation";
import { wizardImageSrc } from "./wizard-images";

export type ProjectTypeId = "academique" | "creation" | "entrepreneurial" | "pro";
export type ProjectColor = "blue" | "amber" | "violet" | "green";

export { wizardImageSrc };

export const PAL: Record<ProjectColor, string> = {
  blue: "#2563eb",
  green: "#059669",
  violet: "#7c3aed",
  amber: "#d97706",
};

export const PAL_BG: Record<ProjectColor, string> = {
  blue: "#eff6ff",
  green: "#ecfdf5",
  violet: "#f5f3ff",
  amber: "#fffbeb",
};

export interface ProjectUniverse {
  id: ProjectTypeId;
  label: string;
  title: string;
  desc: string;
  tag: string;
  color: ProjectColor;
  icon: LucideIcon;
  imageSrc?: string;
}

export const PROJECT_UNIVERSES: ProjectUniverse[] = [
  {
    id: "academique",
    label: "Académique",
    title: "Académique",
    tag: "Éducation",
    color: "blue",
    icon: BookOpen,
    imageSrc: wizardImageSrc("academique"),
    desc: "Études, recherche, projets étudiants, thèses.",
  },
  {
    id: "creation",
    label: "Création personnelle",
    title: "Création personnelle",
    tag: "Créatif",
    color: "amber",
    icon: Pencil,
    imageSrc: wizardImageSrc("creation"),
    desc: "Projets individuels, artistiques ou créatifs.",
  },
  {
    id: "entrepreneurial",
    label: "Innovation et entrepreneuriat",
    title: "Innovation et entrepreneuriat",
    tag: "Innovation",
    color: "violet",
    icon: Rocket,
    imageSrc: wizardImageSrc("entrepreneurial"),
    desc: "Création d'entreprise, startups, incubateurs.",
  },
  {
    id: "pro",
    label: "Entreprise",
    title: "Entreprise",
    tag: "Entreprise",
    color: "green",
    icon: Briefcase,
    imageSrc: wizardImageSrc("pro"),
    desc: "Équipes en poste, PME, grandes entreprises.",
  },
];

export interface WorkModeOption {
  id: SessionMode;
  label: string;
  title: string;
  desc: string;
  color: ProjectColor;
  icon: LucideIcon;
  imageSrc?: string;
}

export const WORK_MODES: WorkModeOption[] = [
  {
    id: "solo",
    label: "Solo",
    title: "Solo",
    color: "violet",
    icon: User,
    imageSrc: wizardImageSrc("solo"),
    desc: "Tu travailles seul, avec l'IA comme partenaire.",
  },
  {
    id: "equipe",
    label: "Équipe",
    title: "Équipe",
    color: "blue",
    icon: Users,
    imageSrc: wizardImageSrc("equipe"),
    desc: "Collaboration en temps réel, en plénière.",
  },
  {
    id: "atelier",
    label: "Grand atelier",
    title: "Grand atelier",
    color: "green",
    icon: Users,
    imageSrc: wizardImageSrc("atelier"),
    desc: "Plusieurs sous-groupes orchestrés.",
  },
];

export function getProjectUniverse(id: string | null | undefined): ProjectUniverse | undefined {
  return PROJECT_UNIVERSES.find((u) => u.id === id);
}

export function getWorkMode(id: string | null | undefined): WorkModeOption | undefined {
  return WORK_MODES.find((m) => m.id === id);
}

export function wizardTitleFromMode(mode: SessionMode | null): string {
  if (mode === "solo") return "Session solo";
  if (mode === "equipe") return "Rencontre d'équipe";
  if (mode === "atelier") return "Grand atelier";
  return "Nouveau projet";
}
