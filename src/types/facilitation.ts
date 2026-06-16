export type TaskStatus =
  | "completed"
  | "in-progress"
  | "pending"
  | "need-help"
  | "failed";

export interface Subtask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: string;
  tools?: string[];
}

export interface FacilitationTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
}

export type SessionMode = "solo" | "equipe" | "atelier";

export interface WizardSoloMusic {
  source: "youtube" | "spotify" | "other" | "ambiance" | "none";
  url?: string;
  ambianceId?: string;
}

/** Séance lancée depuis le wizard — conservée jusqu'à la fin de la séance (comme `st` dans la maquette). */
export interface ActiveSessionPayload {
  mode: SessionMode;
  objective: string;
  methodIds: string[];
  projectId: string | null;
  meetingId: string | null;
  genre: string | null;
  simulating?: boolean;
  soloMusic?: WizardSoloMusic;
  soloTools?: string[];
  durationMin?: number;
  launchedAt: string;
}

export type MemberRole = "owner" | "editor" | "commentator" | "viewer" | "observer";

export interface ChatRecommendation {
  ready: boolean;
  reply: string;
  objective?: string;
  mode?: SessionMode;
  methodIds?: string[];
  genreId?: string;
  followUpQuestions?: string[];
}

export type WizardLaunchMode = "now" | "schedule" | "simulate";
export type WizardAgendaLayout = "tableau" | "frise";

export interface WizardMember {
  id: string;
  name: string;
  email?: string;
  role?: string;
  projectAccess?: string;
  color?: string;
}

export interface WizardGroupAssign {
  groupId: string;
  facilitatorId?: string;
  methodId?: string;
}

export interface WizardConfirmedGroup {
  id: string;
  name: string;
  memberIds: string[];
}


export interface WizardPayload {
  ptype?: string | null;
  mode?: SessionMode | null;
  genre?: string | null;
  genreMin?: number;
  genreDur?: string | null;
  genreCondensed?: boolean;
  objective?: string;
  method?: string | null;
  methods?: string[];
  stepIdx?: number;
  projectId?: string | null;
  agendaPlan?: MeetingAgendaBlock[];
  agendaPomodoro?: boolean;
  agendaLayout?: WizardAgendaLayout;
  soloMusic?: WizardSoloMusic | null;
  soloTools?: string[];
  members?: WizardMember[];
  confirmedGroups?: WizardConfirmedGroup[] | null;
  groupAssign?: Record<string, WizardGroupAssign>;
  meetingTitle?: string;
  meetingDate?: string;
  meetingStart?: string;
  meetingEnd?: string;
  launchMode?: WizardLaunchMode;
  meetingPlatform?: string;
  meetingLink?: string;
  whiteboardElements?: import("@/lib/whiteboard/elements").WbElement[];
  whiteboardView?: { tx: number; ty: number; k: number };
}

export interface DbProject {
  id: string;
  owner_id: string;
  name: string;
  status: string;
  progress: number;
  tile: string;
  icon: string;
  starred: boolean;
  archived: boolean;
  objective: string | null;
  start_date?: string | null;
  end_date?: string | null;
  gantt_config?: { range?: string; zoom?: number } | null;
  created_at: string;
  updated_at: string;
}

export interface DbMeeting {
  id: string;
  project_id: string | null;
  owner_id: string;
  name: string;
  meeting_date: string;
  meeting_time: string;
  meeting_type: string;
  status: string;
  participants_count: number;
  methods: string[];
  subtitle: string | null;
  archived: boolean;
}

export interface DbTask {
  id: string;
  project_id: string | null;
  owner_id: string;
  title: string;
  done: boolean;
}

export interface DbContact {
  id: string;
  owner_id: string;
  name: string;
  email: string | null;
  role_label: string;
  status?: "todo" | "in_progress" | "done";
  avatar_url?: string | null;
}

export interface DbTeam {
  id: string;
  owner_id: string;
  name: string;
  member_ids: string[];
}

export interface DbActivity {
  id: string;
  user_id: string;
  project_id: string | null;
  icon: string;
  title: string;
  detail: string | null;
  color: string;
  created_at: string;
}

export interface DbSessionRun {
  id: string;
  project_id: string | null;
  meeting_id: string | null;
  owner_id: string;
  mode: SessionMode;
  method_ids: string[];
  current_method_index: number;
  state: Record<string, unknown>;
  report: Record<string, unknown> | null;
  started_at: string;
  ended_at: string | null;
}

export type ProjectStatusId = "actif" | "attente" | "termine";

export interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  tile: string;
  icon: string;
  members: number;
  modified: number;
  archived?: boolean;
  star?: boolean;
  shared?: boolean;
  objective?: string;
  last?: string;
  lastT?: string;
  next?: string | null;
  nextT?: string;
  iconBg?: string;
  iconFg?: string;
  pc?: string;
}

export interface DisplayProject extends Project {
  statusId: ProjectStatusId;
  iconBg: string;
  iconFg: string;
  pc: string;
  last: string;
  lastT: string;
  next: string | null;
  nextISO: string | null;
  nextT: string;
  shared: boolean;
}

export interface BoardTaskTag {
  label: string;
  bg: string;
  text: string;
}

export interface BoardSubtask {
  id: string;
  label: string;
  done: boolean;
}

export interface BoardTask {
  id: string;
  projectId: string;
  groupId: string;
  title: string;
  description?: string;
  ownerInitials: string;
  ownerColor: string;
  statusColor: string;
  statusDots?: string[];
  dueDate: string;
  numbers: number;
  timeline: string;
  tags?: BoardTaskTag[];
  timeTracking?: string;
  comments?: number;
  attachments?: number;
  subtasks?: BoardSubtask[];
  people: { initials: string; color: string }[];
  kanbanStatus: "todo" | "in-progress" | "stuck" | "done";
}

export interface BoardGroup {
  id: string;
  projectId: string;
  title: string;
  color: string;
  collapsed: boolean;
}

export interface ExtendedTaskItem {
  id: string;
  title: string;
  done: boolean;
  projectId?: string;
  proj?: string;
  who?: string;
  wc?: string;
  due?: string;
  dueISO?: string;
  late?: boolean;
  prio?: string;
}

export interface MeetingAgendaBlock {
  id: string;
  title: string;
  min: number;
  method?: string;
  importance?: "haute" | "normale" | "basse";
  docs?: string[];
  kind?: "focus" | "pause" | "synthèse" | "breakout" | "plénière" | "intro";
  activity?: string;
}

export interface MeetingAgendaTiming {
  title: string;
  planned: number;
  real: number;
  color: string;
}

export interface MeetingParticipantDetail {
  init: string;
  name: string;
  role: string;
  color: string;
}

export interface MeetingJournalEntry {
  t: string;
  phase: string;
  label: string;
  who: string;
  dur: string;
  color: string;
  desc: string;
}

export interface MeetingMethodResult {
  id: string;
  title: string;
  icon: string;
  color: string;
  filled: string;
  notes: number;
  highlights: string[];
}

export interface MeetingNoteEntry {
  author: string;
  time: string;
  vis: "public" | "prive";
  text: string;
}

export interface MeetingVoteEntry {
  kind: string;
  q: string;
  time: string;
  total: number;
  options: { label: string; pct: number }[];
}

export interface MeetingQuickLogEntry {
  kind: string;
  icon: string;
  color: string;
  time: string;
  q: string;
  result: string;
}

export interface MeetingTaskEntry {
  title: string;
  who: string;
  wc: string;
  due: string;
  prio: string;
  done: boolean;
  late?: boolean;
}

export interface MeetingDocumentEntry {
  name: string;
  type: string;
  size: string;
  by: string;
}

export interface MeetingWhiteboardEntry {
  text: string;
  x: number;
  y: number;
  c: string;
}

export interface MeetingReport {
  scribe: string;
  scribeRole: string;
  state: string;
  channels: string[];
  recipients: string;
  summary: string;
  decisions: string[];
}

export interface MeetingDetailSnapshot {
  ref?: string;
  duration?: string;
  facilitator?: string;
  participants?: MeetingParticipantDetail[];
  journal?: MeetingJournalEntry[];
  methods?: MeetingMethodResult[];
  projTools?: MeetingMethodResult[];
  notes?: MeetingNoteEntry[];
  votes?: MeetingVoteEntry[];
  quickLog?: MeetingQuickLogEntry[];
  tasks?: MeetingTaskEntry[];
  whiteboard?: MeetingWhiteboardEntry[];
  agenda?: MeetingAgendaTiming[];
  documents?: MeetingDocumentEntry[];
  report?: MeetingReport;
}

export interface Meeting {
  id: string;
  name: string;
  dateISO: string;
  time: string;
  type: string;
  status: string;
  participants: number;
  methods: string[];
  project?: string;
  sub?: string;
  archived?: boolean;
  star?: boolean;
  agendaPlan?: MeetingAgendaBlock[];
  snapshot?: MeetingDetailSnapshot;
}

export type MeetingDetailSectionId =
  | "apercu"
  | "minuterie"
  | "methodes"
  | "tableau"
  | "documents"
  | "notes"
  | "quicklog"
  | "taches";

export interface WizardState {
  ptype: string | null;
  mode: SessionMode | null;
  genre: string | null;
  objective: string;
  method: string | null;
  methods: string[];
  stepIdx: number;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  org: string | null;
  goals: string[] | null;
  onboarded: boolean;
  avatar_url: string | null;
}

export interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}
