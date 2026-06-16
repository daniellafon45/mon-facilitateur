export interface PizzaStatus {
  label: string;
  tone: "warning" | "success" | "danger" | "info";
  advice: string;
}

export const PIZZA_STATUS_TONE_CLASS: Record<PizzaStatus["tone"], string> = {
  warning: "border-transparent bg-amber-700 text-white",
  success: "border-transparent bg-emerald-700 text-white",
  danger: "border-transparent bg-red-700 text-white",
  info: "border-transparent bg-blue-700 text-white",
};

export function pizzaSlices(count: number) {
  const n = Math.max(0, count);
  return {
    pizza1: Math.min(n, 5),
    pizza2: Math.min(Math.max(n - 5, 0), 5),
    total: n,
  };
}

export function pizzaStatus(count: number): PizzaStatus {
  if (count < 3) {
    return {
      label: "Équipe trop petite",
      tone: "warning",
      advice: "Invitez au moins 3 personnes pour une dynamique de groupe efficace.",
    };
  }
  if (count <= 9) {
    return {
      label: "Taille optimale",
      tone: "success",
      advice: "Parfait pour une équipe « two-pizza » — collaboration fluide.",
    };
  }
  if (count === 10) {
    return {
      label: "Limite atteinte",
      tone: "info",
      advice: "10 participants max recommandé. Envisagez des sous-groupes pour la prochaine étape.",
    };
  }
  return {
    label: "Équipe trop grande",
    tone: "danger",
    advice: "Créez des sous-groupes ou passez en mode Grand atelier (15+).",
  };
}
