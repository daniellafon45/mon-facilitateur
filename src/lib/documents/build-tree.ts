import type { FilesystemNode } from "@/components/ui/filesystem-item";
import type { DocItem, DocView } from "@/lib/documents/types";

interface ProjectRef {
  id: string;
  name: string;
}

interface MeetingRef {
  id: string;
  name: string;
  projectId?: string | null;
}

function fileNode(doc: DocItem): FilesystemNode {
  return { name: doc.name, docId: doc.id };
}

function folder(name: string, nodes: FilesystemNode[]): FilesystemNode {
  return { name, nodes };
}

function byProjectTree(
  docs: DocItem[],
  projects: ProjectRef[],
  meetings: MeetingRef[],
): FilesystemNode[] {
  const roots: FilesystemNode[] = [];

  for (const project of projects) {
    const projectDocs = docs.filter((d) => d.projectId === project.id);
    if (projectDocs.length === 0) continue;

    const meetingIds = new Set(
      projectDocs.filter((d) => d.meetingId).map((d) => d.meetingId as string),
    );
    const children: FilesystemNode[] = [];

    for (const meetingId of meetingIds) {
      const meet = meetings.find((m) => m.id === meetingId);
      const meetDocs = projectDocs.filter((d) => d.meetingId === meetingId);
      if (meetDocs.length === 0) continue;
      children.push(folder(meet?.name ?? "Réunion", meetDocs.map(fileNode)));
    }

    const loose = projectDocs.filter((d) => !d.meetingId);
    if (loose.length > 0) {
      children.push(folder("Documents du projet", loose.map(fileNode)));
    }

    roots.push(folder(project.name, children));
  }

  const orphan = docs.filter((d) => !d.projectId);
  if (orphan.length > 0) {
    roots.push(folder("Sans projet", orphan.map(fileNode)));
  }

  return roots;
}

function byMeetingTree(
  docs: DocItem[],
  meetings: MeetingRef[],
): FilesystemNode[] {
  const roots: FilesystemNode[] = [];

  for (const meeting of meetings) {
    const meetDocs = docs.filter((d) => d.meetingId === meeting.id);
    if (meetDocs.length === 0) continue;
    roots.push(folder(meeting.name, meetDocs.map(fileNode)));
  }

  const loose = docs.filter((d) => !d.meetingId);
  if (loose.length > 0) {
    roots.push(folder("Hors réunion", loose.map(fileNode)));
  }

  return roots;
}

function byTypeTree(docs: DocItem[]): FilesystemNode[] {
  const groups = new Map<string, DocItem[]>();
  for (const doc of docs) {
    const key = doc.type || "Dossier";
    const list = groups.get(key) ?? [];
    list.push(doc);
    groups.set(key, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr"))
    .map(([type, items]) => folder(type, items.map(fileNode)));
}

function bySourceTree(docs: DocItem[]): FilesystemNode[] {
  const groups = new Map<string, DocItem[]>();
  for (const doc of docs) {
    const key = doc.source || "autre";
    const list = groups.get(key) ?? [];
    list.push(doc);
    groups.set(key, list);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "fr"))
    .map(([source, items]) => folder(source, items.map(fileNode)));
}

export function buildDocumentsTree(
  docs: DocItem[],
  view: DocView,
  projects: ProjectRef[],
  meetings: MeetingRef[],
): FilesystemNode[] {
  if (docs.length === 0) return [];

  switch (view) {
    case "projets":
      return byProjectTree(docs, projects, meetings);
    case "reunions":
      return byMeetingTree(docs, meetings);
    case "partages":
      return [folder("Partagés avec moi", docs.map(fileNode))];
    case "favoris":
      return [folder("Favoris", docs.map(fileNode))];
    case "recents":
      return [folder("Récents", docs.map(fileNode))];
    case "corbeille":
      return [folder("Corbeille", docs.map(fileNode))];
    case "tous":
    default:
      return [
        folder("Par projet", byProjectTree(docs, projects, meetings)),
        folder("Par type", byTypeTree(docs)),
        folder("Par source", bySourceTree(docs)),
      ].filter((n) => (n.nodes?.length ?? 0) > 0);
  }
}
