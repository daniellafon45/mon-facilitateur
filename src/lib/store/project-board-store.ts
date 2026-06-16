"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BoardGroup, BoardTask } from "@/types/facilitation";
import { TAG_PRESETS } from "@/lib/projets/constants";
import { createClient } from "@/lib/supabase/client";
import { fetchBoardTasks, upsertBoardTask, deleteBoardTask } from "@/lib/supabase/queries/board-tasks";

const DEFAULT_GROUPS: Omit<BoardGroup, "projectId">[] = [
  { id: "in-progress-1", title: "In Progress", color: "#fb923c", collapsed: false },
  { id: "in-progress-2", title: "In Progress", color: "#4ade80", collapsed: false },
  { id: "stuck-1", title: "Stuck", color: "#f87171", collapsed: false },
  { id: "stuck-2", title: "Stuck", color: "#9ca3af", collapsed: false },
];

function seedTasks(projectId: string): BoardTask[] {
  return [
    {
      id: `${projectId}-t1`,
      projectId,
      groupId: "in-progress-1",
      title: "Cadrage du parcours utilisateur",
      description: "Cartographier les étapes clés du parcours d'accueil des étudiants internationaux.",
      ownerInitials: "SL",
      ownerColor: "#2563eb",
      statusColor: "#fb923c",
      statusDots: ["#9ca3af", "#4ade80", "#fb923c", "#f87171"],
      dueDate: "30 Sep",
      numbers: 3,
      timeline: "20 Sep - 30 Sep",
      tags: [TAG_PRESETS[0], TAG_PRESETS[4]],
      timeTracking: "4h 30m",
      comments: 5,
      attachments: 2,
      subtasks: [
        { id: "s1", label: "Interviews utilisateurs", done: true },
        { id: "s2", label: "Cartographie des étapes", done: false },
      ],
      people: [
        { initials: "MD", color: "#7c3aed" },
        { initials: "AT", color: "#059669" },
      ],
      kanbanStatus: "in-progress",
    },
    {
      id: `${projectId}-t2`,
      projectId,
      groupId: "in-progress-1",
      title: "Atelier de priorisation",
      description: "Prioriser les fonctionnalités du MVP avec les parties prenantes.",
      ownerInitials: "MD",
      ownerColor: "#7c3aed",
      statusColor: "#4ade80",
      statusDots: ["#4ade80", "#4ade80"],
      dueDate: "30 Sep",
      numbers: 3,
      timeline: "20 Sep - 30 Sep",
      tags: [TAG_PRESETS[4]],
      timeTracking: "2h",
      comments: 3,
      attachments: 0,
      people: [{ initials: "JR", color: "#d97706" }],
      kanbanStatus: "in-progress",
    },
    {
      id: `${projectId}-t3`,
      projectId,
      groupId: "in-progress-2",
      title: "Prototype interface accueil",
      description: "Maquettes haute fidélité pour le portail d'accueil étudiant.",
      ownerInitials: "AT",
      ownerColor: "#059669",
      statusColor: "#4ade80",
      statusDots: ["#4ade80", "#4ade80", "#4ade80"],
      dueDate: "30 Sep",
      numbers: 3,
      timeline: "20 Sep - 30 Sep",
      tags: [TAG_PRESETS[1], TAG_PRESETS[2]],
      timeTracking: "6h 15m",
      comments: 8,
      attachments: 4,
      subtasks: [
        { id: "s3", label: "Wireframes mobile", done: true },
        { id: "s4", label: "Prototype desktop", done: true },
        { id: "s5", label: "Tests utilisateurs", done: false },
      ],
      people: [
        { initials: "SL", color: "#2563eb" },
        { initials: "EM", color: "#db2777" },
      ],
      kanbanStatus: "done",
    },
    {
      id: `${projectId}-t4`,
      projectId,
      groupId: "stuck-1",
      title: "Validation juridique FAQ",
      description: "Relecture légale des contenus FAQ multilingues.",
      ownerInitials: "EM",
      ownerColor: "#db2777",
      statusColor: "#f87171",
      statusDots: ["#f87171", "#f87171"],
      dueDate: "30 Sep",
      numbers: 3,
      timeline: "20 Sep - 30 Sep",
      tags: [TAG_PRESETS[0]],
      comments: 12,
      attachments: 1,
      people: [{ initials: "SL", color: "#2563eb" }],
      kanbanStatus: "stuck",
    },
    {
      id: `${projectId}-t5`,
      projectId,
      groupId: "stuck-2",
      title: "Intégration portail étudiant",
      description: "Connexion SSO et synchronisation des données étudiantes.",
      ownerInitials: "JR",
      ownerColor: "#d97706",
      statusColor: "#9ca3af",
      statusDots: ["#9ca3af"],
      dueDate: "30 Sep",
      numbers: 3,
      timeline: "20 Sep - 30 Sep",
      tags: [TAG_PRESETS[2]],
      timeTracking: "1h 45m",
      people: [
        { initials: "MD", color: "#7c3aed" },
        { initials: "AT", color: "#059669" },
      ],
      kanbanStatus: "todo",
    },
    {
      id: `${projectId}-t6`,
      projectId,
      groupId: "in-progress-1",
      title: "Présentation pour Dribbble",
      description: "Préparer la présentation du case study pour la communauté design.",
      ownerInitials: "AT",
      ownerColor: "#059669",
      statusColor: "#fb923c",
      statusDots: ["#fb923c"],
      dueDate: "15 Oct",
      numbers: 1,
      timeline: "10 Oct - 15 Oct",
      tags: [TAG_PRESETS[1], TAG_PRESETS[3]],
      comments: 18,
      attachments: 10,
      subtasks: [
        { id: "s6", label: "Captures d'écran", done: true },
        { id: "s7", label: "Rédaction case study", done: false },
      ],
      people: [{ initials: "EM", color: "#db2777" }],
      kanbanStatus: "todo",
    },
    {
      id: `${projectId}-t7`,
      projectId,
      groupId: "in-progress-2",
      title: "Landing page accueil",
      description: "Page d'atterrissage pour la campagne de lancement.",
      ownerInitials: "SL",
      ownerColor: "#2563eb",
      statusColor: "#4ade80",
      dueDate: "5 Oct",
      numbers: 2,
      timeline: "1 Oct - 5 Oct",
      tags: [TAG_PRESETS[0], TAG_PRESETS[1]],
      comments: 6,
      attachments: 3,
      people: [{ initials: "MD", color: "#7c3aed" }],
      kanbanStatus: "todo",
    },
    {
      id: `${projectId}-t8`,
      projectId,
      groupId: "stuck-1",
      title: "Audit accessibilité",
      ownerInitials: "MD",
      ownerColor: "#7c3aed",
      statusColor: "#4ade80",
      dueDate: "20 Oct",
      numbers: 1,
      timeline: "15 Oct - 20 Oct",
      tags: [TAG_PRESETS[0]],
      comments: 2,
      people: [{ initials: "AT", color: "#059669" }],
      kanbanStatus: "done",
    },
  ];
}

interface ProjectBoardStore {
  groups: BoardGroup[];
  tasks: BoardTask[];
  loadedProjects: string[];
  ensureProject: (projectId: string) => void;
  loadFromSupabase: (projectId: string) => Promise<void>;
  syncTask: (task: BoardTask) => Promise<void>;
  toggleGroup: (groupId: string) => void;
  addGroup: (projectId: string) => void;
  addTask: (projectId: string, groupId: string, title: string, kanbanStatus?: BoardTask["kanbanStatus"]) => void;
  addKanbanTask: (projectId: string, kanbanStatus: BoardTask["kanbanStatus"], title?: string) => void;
  updateTask: (taskId: string, patch: Partial<BoardTask>) => void;
  removeTask: (taskId: string) => void;
  projectGroups: (projectId: string) => BoardGroup[];
  projectTasks: (projectId: string) => BoardTask[];
}

export const useProjectBoardStore = create<ProjectBoardStore>()(
  persist(
    (set, get) => ({
      groups: [],
      tasks: [],
      loadedProjects: [] as string[],

      loadFromSupabase: async (projectId) => {
        if (get().loadedProjects.includes(projectId)) return;
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;
        try {
          const remote = await fetchBoardTasks(supabase, auth.user.id, projectId);
          if (remote.length) {
            set((s) => ({
              tasks: [...s.tasks.filter((t) => t.projectId !== projectId), ...remote],
              loadedProjects: [...s.loadedProjects, projectId],
            }));
            return;
          }
        } catch {
          /* seed local */
        }
        get().ensureProject(projectId);
        set((s) => ({ loadedProjects: [...s.loadedProjects, projectId] }));
      },

      syncTask: async (task) => {
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;
        try {
          const id = await upsertBoardTask(supabase, auth.user.id, task);
          if (task.id !== id) {
            set((s) => ({
              tasks: s.tasks.map((t) => (t.id === task.id ? { ...t, id } : t)),
            }));
          }
        } catch {
          /* offline */
        }
      },

      ensureProject: (projectId) => {
        const has = get().groups.some((g) => g.projectId === projectId);
        if (has) return;
        const groups = DEFAULT_GROUPS.map((g) => ({ ...g, projectId }));
        const tasks = seedTasks(projectId);
        set((s) => ({
          groups: [...s.groups, ...groups],
          tasks: [...s.tasks, ...tasks],
        }));
      },

      toggleGroup: (groupId) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, collapsed: !g.collapsed } : g,
          ),
        })),

      addGroup: (projectId) => {
        const id = `group-${Date.now()}`;
        set((s) => ({
          groups: [
            ...s.groups,
            {
              id,
              projectId,
              title: "Nouveau groupe",
              color: "#60a5fa",
              collapsed: false,
            },
          ],
        }));
      },

      addTask: (projectId, groupId, title, kanbanStatus = "todo") => {
        const id = `task-${Date.now()}`;
        const task: BoardTask = {
          id,
          projectId,
          groupId,
          title,
          ownerInitials: "VO",
          ownerColor: "#64748b",
          statusColor: "#60a5fa",
          statusDots: ["#60a5fa"],
          dueDate: "—",
          numbers: 0,
          timeline: "—",
          tags: [],
          people: [],
          kanbanStatus,
        };
        set((s) => ({ tasks: [...s.tasks, task] }));
        void get().syncTask(task);
      },

      addKanbanTask: (projectId, kanbanStatus, title = "Nouvelle tâche") => {
        const groups = get().projectGroups(projectId);
        const groupId = groups[0]?.id ?? `group-${Date.now()}`;
        if (!groups.length) {
          get().addGroup(projectId);
        }
        get().addTask(projectId, groupId, title, kanbanStatus);
      },

      updateTask: (taskId, patch) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
        }));
        const task = get().tasks.find((t) => t.id === taskId);
        if (task) void get().syncTask({ ...task, ...patch });
      },

      removeTask: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
        if (task && !taskId.startsWith("task-")) {
          const supabase = createClient();
          void deleteBoardTask(supabase, taskId);
        }
      },

      projectGroups: (projectId) =>
        get().groups.filter((g) => g.projectId === projectId),

      projectTasks: (projectId) =>
        get().tasks.filter((t) => t.projectId === projectId),
    }),
    { name: "mf-project-board-v2" },
  ),
);
