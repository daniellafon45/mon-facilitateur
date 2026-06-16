import type { DisplayProject } from "@/types/facilitation";
import type { Meeting } from "@/types/facilitation";
import type { ProjectMember } from "@/lib/project/registry-types";
import type { ProjectRegistryPayload } from "@/lib/project/registry-types";

export function buildProjectExportText({
  project,
  objective,
  members,
  meetings,
  registry,
  taskCount,
}: {
  project: DisplayProject;
  objective: string;
  members: ProjectMember[];
  meetings: Meeting[];
  registry: ProjectRegistryPayload;
  taskCount: number;
}) {
  const lines: string[] = [
    project.name.toUpperCase(),
    "",
    `Objectif : ${objective || "—"}`,
    `Avancement : ${project.progress}%`,
    `Statut : ${project.status}`,
    "",
    "ÉQUIPE",
    ...(members.length
      ? members.map((m) => `  - ${m.displayName} (${m.meetingRole}, ${m.accessRole})`)
      : ["  (aucun membre)"]),
    "",
    "RACI (résumé)",
    ...registry.raci.tasks.map(
      (t) => `  - ${t.task}: ${registry.raci.roles.map((r, i) => `${r}=${t.vals[i] || "—"}`).join(", ")}`,
    ),
    "",
    "RENCONTRES",
    ...(meetings.length
      ? meetings.map((m) => `  - ${m.dateISO} · ${m.name} (${m.status})`)
      : ["  (aucune)"]),
    "",
    `Tâches board : ${taskCount}`,
    "",
    "CHARTE — Mission",
    registry.charte.mission || "—",
    "",
    "Plan de communication",
    ...registry.comms.map((c) => `  - ${c.canal}: ${c.but}`),
  ];
  return lines.join("\n");
}

export function downloadTextFile(filename: string, content: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
