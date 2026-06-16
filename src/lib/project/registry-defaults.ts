import type { ProjectRegistryPayload } from "@/lib/project/registry-types";

export function emptyRegistry(): ProjectRegistryPayload {
  return {
    raci: { roles: [], tasks: [] },
    comms: [],
    suppliers: [],
    stakeholders: [],
    charte: { mission: "", valeurs: [], regles: [], decision: "" },
  };
}

export function seedRegistry(memberNames: string[] = []): ProjectRegistryPayload {
  const roles = memberNames.length > 0 ? memberNames : ["Resp.", "Membre 1", "Membre 2"];
  return {
    raci: {
      roles,
      tasks: [
        { task: "Cadrer le projet", vals: roles.map((_, i) => (i === 0 ? "A" : i === 1 ? "R" : "C")) },
        { task: "Réaliser", vals: roles.map((_, i) => (i === 1 ? "R" : "I")) },
      ],
    },
    comms: [
      { canal: "Réunion d'équipe", public: "Équipe", freq: "Hebdomadaire", but: "Suivi" },
    ],
    suppliers: [],
    stakeholders: [],
    charte: {
      mission: "",
      valeurs: [{ text: "Bienveillance" }],
      regles: [{ text: "On démarre et on termine à l'heure." }],
      decision: "Consensus recherché ; à défaut, le facilitateur tranche.",
    },
  };
}
