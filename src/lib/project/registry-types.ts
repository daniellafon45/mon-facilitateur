export interface RaciTask {
  task: string;
  vals: string[];
}

export interface RaciData {
  roles: string[];
  tasks: RaciTask[];
}

export interface RegistryRow {
  [key: string]: string;
}

export interface CharteItem {
  text: string;
}

export interface CharteData {
  mission: string;
  valeurs: CharteItem[];
  regles: CharteItem[];
  decision: string;
}

export interface ProjectRegistryPayload {
  raci: RaciData;
  comms: RegistryRow[];
  suppliers: RegistryRow[];
  stakeholders: RegistryRow[];
  charte: CharteData;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  contactId?: string | null;
  userId?: string | null;
  invitedEmail?: string | null;
  displayName: string;
  email?: string;
  color: string;
  accessRole: string;
  meetingRole: string;
}

export interface GanttPhase {
  id: string;
  projectId: string;
  name: string;
  startWeek: number;
  durationWeeks: number;
  color: string;
  progress: number;
  milestone: boolean;
  dependsOn?: string | null;
  sortOrder: number;
}

export interface GanttMarker {
  id: string;
  projectId: string;
  label: string;
  markerDate: string;
  color: string;
  sortOrder: number;
}

export interface GanttConfig {
  range: "daily" | "monthly" | "quarterly";
  zoom: number;
}

export interface ProjectGanttMeta {
  startDate?: string | null;
  endDate?: string | null;
  ganttConfig: GanttConfig;
  createdAt?: string;
}

export interface MethodSave {
  id: string;
  projectId: string;
  methodId: string;
  title: string;
  payload: Record<string, unknown>;
  createdAt?: string;
}

export interface PostMortemColumn {
  id: string;
  label: string;
  items: { id: string; text: string; votes: number }[];
}
