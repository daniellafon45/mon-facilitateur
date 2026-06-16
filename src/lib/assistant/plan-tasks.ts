import type { FacilitationTask } from "@/types/facilitation";

export function createFacilitationPlanTasks(userMessage: string): FacilitationTask[] {
  const preview = userMessage.slice(0, 80);
  return [
    {
      id: "1",
      title: "Analyser votre objectif de session",
      description: `Comprendre le besoin exprimé : « ${preview}${userMessage.length > 80 ? "…" : ""} »`,
      status: "in-progress",
      priority: "high",
      level: 0,
      dependencies: [],
      subtasks: [
        {
          id: "1.1",
          title: "Identifier l'enjeu principal",
          description: "Clarifier le résultat attendu de la session",
          status: "in-progress",
          priority: "high",
        },
        {
          id: "1.2",
          title: "Repérer le contexte",
          description: "Équipe, organisation, contraintes de temps",
          status: "pending",
          priority: "medium",
        },
      ],
    },
    {
      id: "2",
      title: "Identifier le format adapté",
      description: "Solo, équipe ou grand atelier selon participants et durée",
      status: "pending",
      priority: "high",
      level: 0,
      dependencies: [],
      subtasks: [
        {
          id: "2.1",
          title: "Estimer le nombre de participants",
          description: "Détermine le mode de facilitation",
          status: "pending",
          priority: "high",
        },
        {
          id: "2.2",
          title: "Proposer une durée cible",
          description: "Session courte et productive",
          status: "pending",
          priority: "medium",
        },
      ],
    },
    {
      id: "3",
      title: "Recommander une méthode",
      description: "SCAMPER, rétrospective, brainstorming ou autre format adapté",
      status: "pending",
      priority: "high",
      level: 0,
      dependencies: ["1"],
      subtasks: [
        {
          id: "3.1",
          title: "Sélectionner la méthode",
          description: "Alignée sur l'objectif et le profil du groupe",
          status: "pending",
          priority: "high",
          tools: ["method-library"],
        },
      ],
    },
    {
      id: "4",
      title: "Préparer l'ordre du jour",
      description: "Structurer les étapes pour une réunion efficace",
      status: "pending",
      priority: "medium",
      level: 1,
      dependencies: ["2", "3"],
      subtasks: [
        {
          id: "4.1",
          title: "Définir les créneaux",
          description: "Introduction, travail, décision, clôture",
          status: "pending",
          priority: "medium",
        },
        {
          id: "4.2",
          title: "Suggérer le lancement",
          description: "Proposer d'ouvrir le parcours de création",
          status: "pending",
          priority: "low",
        },
      ],
    },
  ];
}

export function advancePlanTasks(tasks: FacilitationTask[], step: number): FacilitationTask[] {
  return tasks.map((task, index) => {
    if (index < step) {
      return {
        ...task,
        status: "completed" as const,
        subtasks: task.subtasks.map((s) => ({ ...s, status: "completed" as const })),
      };
    }
    if (index === step) {
      return { ...task, status: "in-progress" as const };
    }
    return task;
  });
}
