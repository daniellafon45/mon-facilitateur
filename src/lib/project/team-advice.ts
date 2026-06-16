import { PIZZA_MAX } from "./team-constants";

export type TeamAdviceAction =
  | "invite"
  | "teams"
  | "close"
  | "subgroups"
  | "atelier"
  | "limit";

export interface TeamAdviceActionItem {
  icon: "Users" | "Link" | "Sparkle" | "Globe" | "Sliders";
  color: "blue" | "green" | "violet";
  title: string;
  btn: string;
  act: TeamAdviceAction;
}

export interface TeamAdvice {
  title: string;
  boxBg: string;
  boxBd: string;
  iconBg: string;
  iconFg: string;
  reasonFg: string;
  headline: string;
  sub: string;
  reasons: string[];
  actions: TeamAdviceActionItem[];
}

function plural(n: number, singular: string, pluralForm = `${singular}s`) {
  return n > 1 ? pluralForm : singular;
}

export function getTeamAdvice(count: number): TeamAdvice {
  if (count < 3) {
    return {
      title: "Nos conseils pour une petite équipe",
      boxBg: "#fef2f2",
      boxBd: "#fecaca",
      iconBg: "#fecaca",
      iconFg: "#dc2626",
      reasonFg: "#991b1b",
      headline: `Votre équipe compte ${count} ${plural(count, "participant")}.`,
      sub: "C'est peu pour une dynamique collaborative riche.",
      reasons: [
        "Moins de diversité d'idées et de points de vue",
        "Difficile de répartir les rôles essentiels",
        "Risque de biais de confirmation",
        "Charge de travail concentrée sur peu de personnes",
      ],
      actions: [
        {
          icon: "Users",
          color: "blue",
          title: "Inviter plus de membres",
          btn: "Inviter des membres",
          act: "invite",
        },
        {
          icon: "Link",
          color: "green",
          title: "Fusionner avec une équipe enregistrée",
          btn: "Voir mes équipes",
          act: "teams",
        },
        {
          icon: "Sparkle",
          color: "violet",
          title: "Garder une petite équipe agile",
          btn: "Continuer ainsi",
          act: "close",
        },
      ],
    };
  }

  if (count > PIZZA_MAX) {
    return {
      title: "Nos conseils pour une équipe trop grande",
      boxBg: "#fef2f2",
      boxBd: "#fecaca",
      iconBg: "#fecaca",
      iconFg: "#dc2626",
      reasonFg: "#991b1b",
      headline: `Votre équipe compte ${count} participants.`,
      sub: "Vous dépassez la limite recommandée par la règle des deux pizzas.",
      reasons: [
        "Discussions plus longues et moins inclusives",
        "Participation inégale en plénière",
        "Difficile d'aligner tout le monde sur les décisions",
        "Risque de sous-groupes informels non orchestrés",
      ],
      actions: [
        {
          icon: "Users",
          color: "blue",
          title: "Créer des sous-groupes",
          btn: "Créer des sous-groupes",
          act: "subgroups",
        },
        {
          icon: "Globe",
          color: "green",
          title: "Passer en Grand atelier",
          btn: "Passer en Grand atelier",
          act: "atelier",
        },
        {
          icon: "Sliders",
          color: "violet",
          title: "Limiter les participants actifs",
          btn: "Limiter les participants",
          act: "limit",
        },
      ],
    };
  }

  return {
    title: "Nos conseils pour une équipe à la limite",
    boxBg: "#fff7ed",
    boxBd: "#fed7aa",
    iconBg: "#fed7aa",
    iconFg: "#c2410c",
    reasonFg: "#78350f",
    headline: `Votre équipe compte ${count} participants.`,
    sub: "C'est la limite recommandée pour une rencontre productive.",
    reasons: [
      "Discussions plus longues",
      "Moins de participation",
      "Plus difficile à aligner",
      "Risque de sous-groupes informels",
    ],
    actions: [
      {
        icon: "Users",
        color: "blue",
        title: "Créer des sous-groupes",
        btn: "Créer des sous-groupes",
        act: "subgroups",
      },
      {
        icon: "Globe",
        color: "green",
        title: "Passer en Grand atelier",
        btn: "Passer en Grand atelier",
        act: "atelier",
      },
      {
        icon: "Sliders",
        color: "violet",
        title: "Limiter les participants actifs",
        btn: "Limiter les participants",
        act: "limit",
      },
    ],
  };
}

export function shouldShowOverflowBanner(count: number, dismissed: boolean) {
  return count > PIZZA_MAX && !dismissed;
}
