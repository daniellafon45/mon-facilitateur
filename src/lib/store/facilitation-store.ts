"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExtendedTaskItem, Meeting, MeetingTaskEntry, Project, SessionMode, ActiveSessionPayload } from "@/types/facilitation";
import type { SessionState } from "@/components/session/methods/column-workspace";
import { buildMeetingSnapshot, snapshotSummaryFromSession } from "@/lib/meetings/build-meeting-snapshot";
import { createSessionCapture, finalizeCaptureTiming, type SessionCaptureState } from "@/lib/session/session-capture";
import { formatFrDate, ICON_PALETTES } from "@/lib/projets/constants";
import { createClient } from "@/lib/supabase/client";
import {
  fetchWorkspace,
  upsertProject,
  patchProject,
  archiveProject,
  upsertMeeting,
  patchMeeting,
  archiveMeeting,
  logActivity,
} from "@/lib/supabase/queries/workspace";

const isUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const activityBucket = (createdAt?: string) => {
  const today = todayISO();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yIso = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  if (!createdAt) return "Plus tôt";
  const day = createdAt.slice(0, 10);
  if (day === today) return "Aujourd'hui";
  if (day === yIso) return "Hier";
  return "Plus tôt";
};

const formatTime = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
};

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

interface ActivityItem {
  id: string;
  icon: string;
  t: string;
  d: string;
  c: string;
  pid?: string;
  time?: string;
  bucket?: string;
}

interface TaskItem extends ExtendedTaskItem {}

interface ContactItem {
  id: string;
  name: string;
  role: string;
  email?: string;
  status: "todo" | "in_progress" | "done";
  avatarUrl?: string;
}

interface TeamItem {
  id: string;
  name: string;
  memberIds: string[];
}

interface FacilitationStore {
  hydrated: boolean;
  userId: string | null;
  meetings: Meeting[];
  projects: Project[];
  tasks: TaskItem[];
  activity: ActivityItem[];
  contacts: ContactItem[];
  teams: TeamItem[];
  wizardObjective: string;
  wizardMode: SessionMode | null;
  wizardMethodIds: string[];
  activeSession: ActiveSessionPayload | null;
  hydrateFromSupabase: () => Promise<void>;
  addMeeting: (m: Partial<Meeting>) => Promise<Meeting>;
  updateMeeting: (id: string, data: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  toggleMeetingStar: (id: string) => void;
  duplicateMeeting: (id: string) => Promise<Meeting | null>;
  setMeetingStatus: (id: string, status: string) => Promise<void>;
  archiveMeetingLocal: (id: string, archived?: boolean) => void;
  addProject: (p: Partial<Project> & { objective?: string }) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  toggleProjectStar: (id: string) => void;
  duplicateProject: (id: string) => Promise<Project | null>;
  archiveProjectLocal: (id: string) => void;
  scheduleProjectMeeting: (projectId: string, date: string, time: string) => Promise<void>;
  projectsView: () => Project[];
  projectMeetings: (projectId: string) => Meeting[];
  activityView: () => ActivityItem[];
  meetingsView: () => Meeting[];
  tasksView: () => TaskItem[];
  addTask: (payload: { title: string; projectId?: string }) => void;
  toggleTask: (id: string) => void;
  upcoming: () => Meeting[];
  todayMeetings: () => Meeting[];
  openTasks: () => TaskItem[];
  logSession: (payload: { mode: SessionMode; name: string; methodTitle?: string | null; projectId?: string }) => Promise<void>;
  finalizeMeeting: (payload: {
    meetingId?: string | null;
    mode: SessionMode;
    name: string;
    projectId?: string;
    methodIds: string[];
    capture: SessionCaptureState;
    methodStates: Record<string, SessionState>;
    simulating?: boolean;
    participants?: number;
  }) => Promise<Meeting | null>;
  addTasksFromReport: (tasks: MeetingTaskEntry[], projectId?: string) => number;
  updateMeetingSnapshot: (id: string, snapshot: Meeting["snapshot"]) => Promise<void>;
  setWizardSeed: (objective: string, mode?: SessionMode | null, methodIds?: string[]) => void;
  launchSession: (payload: Omit<ActiveSessionPayload, "launchedAt">) => void;
  clearActiveSession: () => void;
  resetWorkspace: () => void;
}

export const useFacilitationStore = create<FacilitationStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      userId: null,
      meetings: [],
      projects: [],
      tasks: [],
      activity: [],
      contacts: [],
      teams: [],
      wizardObjective: "",
      wizardMode: null,
      wizardMethodIds: [],
      activeSession: null,

      hydrateFromSupabase: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        try {
          const ws = await fetchWorkspace(supabase, user.id);
          set({ ...ws, hydrated: true, userId: user.id });
        } catch {
          set({ hydrated: true, userId: user.id });
        }
      },

      addMeeting: async (m) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const local: Meeting = {
          id: `m${Date.now()}`,
          name: m.name ?? "Nouvelle rencontre",
          dateISO: m.dateISO ?? todayISO(),
          time: m.time ?? "10:00",
          type: m.type ?? "Réunion",
          status: m.status ?? "À venir",
          participants: m.participants ?? 2,
          methods: m.methods ?? [],
          project: m.project,
          sub: m.sub,
          archived: m.archived,
          star: m.star,
          agendaPlan: m.agendaPlan,
          snapshot: m.snapshot,
        };
        if (user) {
          try {
            const saved = await upsertMeeting(supabase, user.id, {
              name: local.name,
              project_id: local.project,
              meeting_date: local.dateISO,
              meeting_time: local.time,
              meeting_type: local.type,
              methods: local.methods,
              status: local.status,
              participants_count: local.participants,
            });
            set((s) => ({ meetings: [saved, ...s.meetings] }));
            return saved;
          } catch {
            /* fallback local */
          }
        }
        set((s) => ({ meetings: [local, ...s.meetings] }));
        return local;
      },

      updateMeeting: async (id, data) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isUuid(id)) {
          try {
            const saved = await patchMeeting(supabase, id, {
              name: data.name,
              meeting_date: data.dateISO,
              meeting_time: data.time,
              meeting_type: data.type,
              methods: data.methods,
              status: data.status,
              participants_count: data.participants,
              subtitle: data.sub ?? null,
              project_id: data.project ?? null,
            });
            set((s) => ({
              meetings: s.meetings.map((m) => (m.id === id ? saved : m)),
            }));
            return;
          } catch {
            /* fallback local */
          }
        }
        set((s) => ({
          meetings: s.meetings.map((m) => (m.id === id ? { ...m, ...data } : m)),
        }));
      },

      deleteMeeting: async (id) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isUuid(id)) {
          try {
            await archiveMeeting(supabase, id);
            set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) }));
            return;
          } catch {
            /* fallback local */
          }
        }
        set((s) => ({ meetings: s.meetings.filter((m) => m.id !== id) }));
      },

      toggleMeetingStar: (id) =>
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === id ? { ...m, star: !m.star } : m,
          ),
        })),

      duplicateMeeting: async (id) => {
        const src = get().meetings.find((m) => m.id === id);
        if (!src) return null;
        return get().addMeeting({
          name: `${src.name} (copie)`,
          dateISO: src.dateISO,
          time: src.time,
          type: src.type,
          status: "Brouillon",
          participants: src.participants,
          methods: [...src.methods],
          project: src.project,
          sub: src.sub,
          agendaPlan: src.agendaPlan ? [...src.agendaPlan] : undefined,
        });
      },

      setMeetingStatus: async (id, status) => {
        await get().updateMeeting(id, { status });
      },

      archiveMeetingLocal: (id, archived = true) =>
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === id ? { ...m, archived } : m,
          ),
        })),

      addProject: async (p) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            const saved = await upsertProject(supabase, user.id, {
              name: p.name ?? "Nouveau projet",
              objective: p.objective,
              tile: p.tile,
              icon: p.icon,
            });
            set((s) => ({ projects: [saved, ...s.projects] }));
            await logActivity(supabase, user.id, {
              title: "Projet créé",
              detail: saved.name,
              icon: "Folder",
              project_id: saved.id,
            });
            return saved;
          } catch {
            /* fallback */
          }
        }
        const full: Project = {
          id: `p${Date.now()}`,
          name: p.name ?? "Nouveau projet",
          status: p.status ?? "actif",
          progress: p.progress ?? 0,
          tile: p.tile ?? "violet",
          icon: p.icon ?? "Folder",
          members: p.members ?? 1,
          modified: p.modified ?? 0,
          star: p.star ?? false,
          shared: p.shared ?? false,
          iconBg: p.iconBg,
          iconFg: p.iconFg,
          pc: p.pc,
        };
        set((s) => ({ projects: [full, ...s.projects] }));
        return full;
      },

      updateProject: async (id, data) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isUuid(id)) {
          try {
            const saved = await patchProject(supabase, id, { name: data.name });
            set((s) => ({
              projects: s.projects.map((p) => (p.id === id ? { ...saved, ...data, name: data.name ?? saved.name } : p)),
            }));
            return;
          } catch {
            /* fallback local */
          }
        }
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...data, modified: Date.now() } : p,
          ),
        }));
      },

      renameProject: async (id, name) => get().updateProject(id, { name }),

      toggleProjectStar: (id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, star: !p.star, modified: Date.now() } : p,
          ),
        })),

      duplicateProject: async (id) => {
        const src = get().projects.find((p) => p.id === id);
        if (!src) return null;
        const pal = ICON_PALETTES[get().projects.length % ICON_PALETTES.length];
        return get().addProject({
          name: `${src.name} (copie)`,
          status: src.status,
          progress: src.progress,
          members: src.members,
          icon: src.icon,
          tile: src.tile ?? pal.tile,
          iconBg: src.iconBg ?? pal.iconBg,
          iconFg: src.iconFg ?? pal.iconFg,
          pc: src.pc ?? pal.pc,
          shared: src.shared,
        });
      },

      archiveProjectLocal: (id) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, archived: true, status: "termine", modified: Date.now() } : p,
          ),
        })),

      scheduleProjectMeeting: async (projectId, date, time) => {
        const project = get().projects.find((p) => p.id === projectId);
        await get().addMeeting({
          name: `Rencontre · ${project?.name ?? "Projet"}`,
          dateISO: date,
          time,
          project: projectId,
          status: "À venir",
          participants: project?.members ?? 2,
        });
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  next: formatFrDate(date),
                  nextT: time,
                  modified: Date.now(),
                }
              : p,
          ),
        }));
      },

      deleteProject: async (id) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isUuid(id)) {
          try {
            await archiveProject(supabase, id);
            set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
            return;
          } catch {
            /* fallback local */
          }
        }
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
      },

      projectsView: () => get().projects.filter((p) => !p.archived),

      projectMeetings: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        return get().meetings.filter(
          (m) =>
            !m.archived &&
            (m.project === projectId || (project && m.project === project.name)),
        );
      },

      activityView: () =>
        get().activity.map((a, i) => ({
          ...a,
          id: a.id || `act-${i}`,
          time: a.time ?? "—",
          bucket: a.bucket ?? "Plus tôt",
        })),

      meetingsView: () => get().meetings.filter((m) => !m.archived),

      tasksView: () => {
        const projects = get().projects;
        return get().tasks.map((t) => {
          const proj = projects.find((p) => p.id === t.projectId);
          return {
            ...t,
            proj: proj?.name ?? t.proj ?? "Sans projet",
            who: t.who ?? "Vous",
            wc: t.wc ?? "#2563eb",
            prio: t.prio ?? "Moyenne",
          };
        });
      },

      addTask: (payload) => {
        const projects = get().projects;
        const proj = projects.find((p) => p.id === payload.projectId);
        set((s) => ({
          tasks: [
            {
              id: `task-${Date.now()}`,
              title: payload.title,
              done: false,
              projectId: payload.projectId,
              proj: proj?.name,
              who: "Vous",
              wc: "#2563eb",
              prio: "Moyenne",
            },
            ...s.tasks,
          ],
        }));
      },

      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),

      upcoming: () => {
        const today = todayISO();
        return get()
          .meetings.filter((m) => m.status === "À venir" && !m.archived && m.dateISO >= today)
          .sort((a, b) => `${a.dateISO}${a.time}`.localeCompare(`${b.dateISO}${b.time}`));
      },

      todayMeetings: () => {
        const today = todayISO();
        return get()
          .meetings.filter((m) => m.dateISO === today && m.status !== "Terminée" && !m.archived)
          .sort((a, b) => a.time.localeCompare(b.time));
      },

      openTasks: () => get().tasks.filter((t) => !t.done),

      logSession: async ({ mode, name, methodTitle, projectId }) => {
        await get().finalizeMeeting({
          mode,
          name,
          projectId,
          methodIds: methodTitle ? [methodTitle] : [],
          capture: finalizeCaptureTiming(createSessionCapture()),
          methodStates: {},
        });
      },

      finalizeMeeting: async ({
        meetingId,
        mode,
        name,
        projectId,
        methodIds,
        capture: rawCapture,
        methodStates,
        simulating = false,
        participants,
      }) => {
        if (simulating) return null;

        const capture = finalizeCaptureTiming(rawCapture);
        const existing = meetingId ? get().meetings.find((m) => m.id === meetingId) : null;
        const type =
          mode === "solo" ? "Session solo" : mode === "atelier" ? "Grand atelier" : "Séance d'équipe";

        const snapshot = buildMeetingSnapshot({
          meeting: existing ?? null,
          capture,
          methodIds,
          methodStates,
          mode,
          name,
          projectId,
          participants: participants ?? existing?.participants,
          reportDraft: {
            summary: snapshotSummaryFromSession(name, mode, methodIds),
            state: "brouillon",
          },
        });

        let meeting: Meeting;
        if (meetingId && existing) {
          await get().updateMeeting(meetingId, {
            status: "Terminée",
            snapshot,
            methods: methodIds.length ? methodIds : existing.methods,
            sub: name,
          });
          meeting = get().meetings.find((m) => m.id === meetingId)!;
        } else {
          meeting = await get().addMeeting({
            name,
            type,
            status: "Terminée",
            project: projectId,
            methods: methodIds,
            sub: name,
            participants: participants ?? 2,
            snapshot,
          });
        }

        set((s) => ({
          activity: [
            {
              id: `act-${Date.now()}`,
              icon: "CheckCircle",
              t: "Séance terminée",
              d: `${meeting.name} · ${meeting.time}`,
              c: "#22c55e",
              pid: projectId,
              time: formatTime(new Date().toISOString()),
              bucket: activityBucket(new Date().toISOString()),
            },
            ...s.activity,
          ].slice(0, 80),
        }));

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          try {
            await logActivity(supabase, user.id, {
              title: "Séance terminée",
              detail: meeting.name,
              icon: "Play",
              project_id: projectId,
            });
          } catch {
            /* offline */
          }
        }

        return meeting;
      },

      addTasksFromReport: (tasks, projectId) => {
        const project = projectId ? get().projects.find((p) => p.id === projectId) : undefined;
        const added: TaskItem[] = [];
        tasks.forEach((t) => {
          if (!t.title?.trim()) return;
          added.push({
            id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            title: t.title,
            done: t.done ?? false,
            projectId,
            proj: project?.name ?? "Compte rendu de séance",
            who: t.who ?? "Vous",
            wc: t.wc ?? "#2563eb",
            due: t.due,
            prio: t.prio ?? "Moyenne",
          });
        });
        if (!added.length) return 0;
        set((s) => ({ tasks: [...added, ...s.tasks] }));
        return added.length;
      },

      updateMeetingSnapshot: async (id, snapshot) => {
        await get().updateMeeting(id, { snapshot });
      },

      setWizardSeed: (objective, mode = null, methodIds = []) =>
        set({ wizardObjective: objective, wizardMode: mode, wizardMethodIds: methodIds }),

      launchSession: (payload) =>
        set({
          activeSession: {
            ...payload,
            launchedAt: new Date().toISOString(),
          },
        }),

      clearActiveSession: () => set({ activeSession: null }),

      resetWorkspace: () =>
        set({
          meetings: [],
          projects: [],
          tasks: [],
          activity: [],
          contacts: [],
          teams: [],
          wizardObjective: "",
          wizardMode: null,
          wizardMethodIds: [],
          activeSession: null,
          hydrated: false,
          userId: null,
        }),
    }),
    {
      name: "mf-store-v6",
      partialize: (s) => ({
        meetings: s.meetings,
        projects: s.projects,
        tasks: s.tasks,
        activity: s.activity,
        contacts: s.contacts,
        teams: s.teams,
        wizardObjective: s.wizardObjective,
        wizardMode: s.wizardMode,
        wizardMethodIds: s.wizardMethodIds,
        activeSession: s.activeSession,
      }),
    },
  ),
);

export { todayISO };
