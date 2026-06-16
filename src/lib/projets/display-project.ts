import type { DisplayProject, Meeting, Project } from "@/types/facilitation";
import { formatFrDate, ICON_PALETTES, normalizeStatusId } from "@/lib/projets/constants";

function paletteFor(project: Project, index: number) {
  if (project.iconBg && project.iconFg) {
    return {
      iconBg: project.iconBg,
      iconFg: project.iconFg,
      pc: project.pc ?? "#2563eb",
    };
  }
  return ICON_PALETTES[index % ICON_PALETTES.length];
}

function meetingsForProject(meetings: Meeting[], project: Project) {
  return meetings.filter(
    (m) => !m.archived && (m.project === project.id || m.project === project.name),
  );
}

export function toDisplayProject(
  project: Project,
  meetings: Meeting[],
  index = 0,
): DisplayProject {
  const statusId = normalizeStatusId(project.status);
  const pal = paletteFor(project, index);
  const related = meetingsForProject(meetings, project);
  const upcoming = related
    .filter((m) => m.status === "À venir")
    .sort((a, b) => `${a.dateISO}${a.time}`.localeCompare(`${b.dateISO}${b.time}`));
  const past = related
    .filter((m) => m.status === "Terminée")
    .sort((a, b) => `${b.dateISO}${b.time}`.localeCompare(`${a.dateISO}${a.time}`));

  const nextMeeting = upcoming[0];
  const lastMeeting = past[0];

  return {
    ...project,
    statusId,
    iconBg: pal.iconBg,
    iconFg: pal.iconFg,
    pc: project.pc ?? pal.pc,
    last: project.last ?? (lastMeeting ? formatFrDate(lastMeeting.dateISO) : "—"),
    lastT: project.lastT ?? (lastMeeting?.time ?? "—"),
    next: project.next !== undefined ? project.next : nextMeeting ? formatFrDate(nextMeeting.dateISO) : null,
    nextISO: nextMeeting?.dateISO ?? null,
    nextT:
      project.nextT ??
      (nextMeeting ? nextMeeting.time : statusId === "termine" ? "Aucune" : "À définir"),
    shared: project.shared ?? false,
    star: project.star ?? false,
    modified: project.modified ?? index + 1,
  };
}

export function displayProjects(projects: Project[], meetings: Meeting[]): DisplayProject[] {
  return projects.map((p, i) => toDisplayProject(p, meetings, i));
}
