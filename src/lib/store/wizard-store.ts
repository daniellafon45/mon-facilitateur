"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SessionMode,
  WizardPayload,
  MeetingAgendaBlock,
  WizardMember,
  WizardConfirmedGroup,
  WizardGroupAssign,
  WizardSoloMusic,
  WizardLaunchMode,
  WizardAgendaLayout,
} from "@/types/facilitation";
import type { WbElement } from "@/lib/whiteboard/elements";
import {
  getStepPath,
  hasWizardDraftPayload,
  pickWizardDraftWinner,
} from "@/lib/wizard/steps";
import { logDraftError } from "@/lib/wizard/draft-log";
import { createClient } from "@/lib/supabase/client";
import {
  deleteWizardDraft,
  loadWizardDraft,
  saveWizardDraft,
} from "@/lib/supabase/queries/workspace";

interface WizardStoreState {
  ptype: string | null;
  mode: SessionMode | null;
  objective: string;
  genre: string | null;
  genreMin: number;
  genreDur: string | null;
  genreCondensed: boolean;
  method: string | null;
  methods: string[];
  methodsManual: boolean;
  methodsAiSummary: string | null;
  stepIdx: number;
  projectId: string | null;
  rightCollapsed: boolean;
  whiteboardElements: WbElement[];
  whiteboardView: { tx: number; ty: number; k: number };
  whiteboardTextMode: boolean;
  agendaPlan: MeetingAgendaBlock[];
  agendaPomodoro: boolean;
  agendaLayout: WizardAgendaLayout;
  soloMusic: WizardSoloMusic | null;
  soloTools: string[];
  members: WizardMember[];
  confirmedGroups: WizardConfirmedGroup[] | null;
  groupAssign: Record<string, WizardGroupAssign>;
  meetingTitle: string;
  meetingDate: string;
  meetingStart: string;
  meetingEnd: string;
  launchMode: WizardLaunchMode;
  meetingPlatform: string;
  meetingLink: string;
  draftHydrated: boolean;
}

interface WizardStore extends WizardStoreState {
  setPtype: (ptype: string | null) => void;
  setMode: (mode: SessionMode | null) => void;
  setObjective: (objective: string) => void;
  setGenre: (genre: string | null, idealMin?: number, dur?: string) => void;
  setGenreMeta: (patch: { genreDur?: string; genreMin?: number; genreCondensed?: boolean }) => void;
  setMethod: (method: string | null) => void;
  setMethods: (methods: string[], manual?: boolean) => void;
  setMethodsAiSummary: (summary: string | null) => void;
  setStepIdx: (idx: number) => void;
  setProjectId: (id: string | null) => void;
  setWhiteboard: (elements: WbElement[], view?: { tx: number; ty: number; k: number }) => void;
  setWhiteboardTextMode: (on: boolean) => void;
  setAgendaPlan: (blocks: MeetingAgendaBlock[]) => void;
  setAgendaPomodoro: (on: boolean) => void;
  setAgendaLayout: (layout: WizardAgendaLayout) => void;
  setSoloMusic: (music: WizardSoloMusic | null) => void;
  setSoloTools: (tools: string[]) => void;
  setMembers: (members: WizardMember[]) => void;
  setConfirmedGroups: (groups: WizardConfirmedGroup[] | null) => void;
  setGroupAssign: (assign: Record<string, WizardGroupAssign>) => void;
  setMeetingDetails: (patch: Partial<Pick<WizardStore, "meetingTitle" | "meetingDate" | "meetingStart" | "meetingEnd" | "meetingPlatform" | "meetingLink" | "launchMode">>) => void;
  setLaunchMode: (launchMode: WizardLaunchMode) => void;
  setRightCollapsed: (collapsed: boolean) => void;
  seed: (data: Partial<WizardPayload>, options?: { skipPersist?: boolean }) => void;
  applyPayload: (data: WizardPayload, options?: { skipPersist?: boolean }) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  getCurrentStepKey: () => string;
  persistDraft: () => Promise<void>;
  hydrateDraftFromServer: () => Promise<void>;
  deleteDraft: () => Promise<void>;
  /** @deprecated Utiliser hydrateDraftFromServer */
  loadDraft: () => Promise<void>;
}

const INITIAL_STATE: WizardStoreState = {
  ptype: null,
  mode: null,
  objective: "",
  genre: null,
  genreMin: 0,
  genreDur: null,
  genreCondensed: false,
  method: null,
  methods: [],
  methodsManual: false,
  methodsAiSummary: null,
  stepIdx: 0,
  projectId: null,
  rightCollapsed: true,
  whiteboardElements: [],
  whiteboardView: { tx: 0, ty: 0, k: 1 },
  whiteboardTextMode: true,
  agendaPlan: [],
  agendaPomodoro: false,
  agendaLayout: "tableau",
  soloMusic: null,
  soloTools: [],
  members: [],
  confirmedGroups: null,
  groupAssign: {},
  meetingTitle: "Ma session de travail",
  meetingDate: new Date().toISOString().slice(0, 10),
  meetingStart: "13:30",
  meetingEnd: "15:00",
  launchMode: "now",
  meetingPlatform: "meet",
  meetingLink: "",
  draftHydrated: false,
};

const PERSIST_KEYS: (keyof WizardStoreState)[] = [
  "ptype",
  "mode",
  "objective",
  "genre",
  "genreMin",
  "genreDur",
  "genreCondensed",
  "method",
  "methods",
  "methodsManual",
  "stepIdx",
  "projectId",
  "rightCollapsed",
  "whiteboardElements",
  "whiteboardView",
  "whiteboardTextMode",
  "agendaPlan",
  "agendaPomodoro",
  "agendaLayout",
  "soloMusic",
  "soloTools",
  "members",
  "confirmedGroups",
  "groupAssign",
  "meetingTitle",
  "meetingDate",
  "meetingStart",
  "meetingEnd",
  "launchMode",
  "meetingPlatform",
  "meetingLink",
];

function toPayload(state: WizardStoreState): WizardPayload {
  return {
    ptype: state.ptype,
    mode: state.mode,
    objective: state.objective,
    genre: state.genre,
    genreMin: state.genreMin,
    genreDur: state.genreDur,
    genreCondensed: state.genreCondensed,
    method: state.method,
    methods: state.methods,
    stepIdx: state.stepIdx,
    projectId: state.projectId,
    agendaPlan: state.agendaPlan,
    agendaPomodoro: state.agendaPomodoro,
    agendaLayout: state.agendaLayout,
    soloMusic: state.soloMusic,
    soloTools: state.soloTools,
    members: state.members,
    confirmedGroups: state.confirmedGroups,
    groupAssign: state.groupAssign,
    meetingTitle: state.meetingTitle,
    meetingDate: state.meetingDate,
    meetingStart: state.meetingStart,
    meetingEnd: state.meetingEnd,
    launchMode: state.launchMode,
    meetingPlatform: state.meetingPlatform,
    meetingLink: state.meetingLink,
    whiteboardElements: state.whiteboardElements,
    whiteboardView: state.whiteboardView,
  };
}

function payloadToState(data: WizardPayload): Partial<WizardStoreState> {
  return {
    ptype: data.ptype ?? null,
    mode: data.mode ?? null,
    objective: data.objective ?? "",
    genre: data.genre ?? null,
    genreMin: data.genreMin ?? 0,
    genreDur: data.genreDur ?? null,
    genreCondensed: data.genreCondensed ?? false,
    method: data.method ?? null,
    methods: data.methods ?? [],
    stepIdx: Number(data.stepIdx ?? 0),
    projectId: data.projectId ?? null,
    agendaPlan: data.agendaPlan ?? [],
    agendaPomodoro: data.agendaPomodoro ?? false,
    agendaLayout: data.agendaLayout ?? "tableau",
    soloMusic: data.soloMusic ?? null,
    soloTools: data.soloTools ?? [],
    members: data.members ?? [],
    confirmedGroups: data.confirmedGroups ?? null,
    groupAssign: data.groupAssign ?? {},
    meetingTitle: data.meetingTitle ?? "Ma session de travail",
    meetingDate: data.meetingDate ?? new Date().toISOString().slice(0, 10),
    meetingStart: data.meetingStart ?? "13:30",
    meetingEnd: data.meetingEnd ?? "15:00",
    launchMode: data.launchMode ?? "now",
    meetingPlatform: data.meetingPlatform ?? "meet",
    meetingLink: data.meetingLink ?? "",
    whiteboardElements: data.whiteboardElements ?? [],
    whiteboardView: data.whiteboardView ?? { tx: 0, ty: 0, k: 1 },
  };
}

let hydrateInFlight: Promise<void> | null = null;

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      applyPayload: (data, options) => {
        set(payloadToState(data));
        if (!options?.skipPersist) void get().persistDraft();
      },

      setPtype: (ptype) => { set({ ptype }); void get().persistDraft(); },
      setMode: (mode) => { set({ mode }); void get().persistDraft(); },
      setObjective: (objective) => { set({ objective }); void get().persistDraft(); },
      setGenre: (genre, idealMin = 0, dur) => {
        set({ genre, genreMin: idealMin, genreDur: dur ?? get().genreDur });
        void get().persistDraft();
      },
      setGenreMeta: (patch) => { set(patch); void get().persistDraft(); },
      setMethod: (method) => { set({ method }); void get().persistDraft(); },
      setMethods: (methods, manual = true) => {
        set({
          methods,
          method: methods[0] ?? null,
          methodsManual: manual,
          ...(manual ? { methodsAiSummary: null } : {}),
        });
        void get().persistDraft();
      },
      setMethodsAiSummary: (methodsAiSummary) => set({ methodsAiSummary }),
      setStepIdx: (stepIdx) => { set({ stepIdx }); void get().persistDraft(); },
      setProjectId: (projectId) => set({ projectId }),
      setWhiteboard: (whiteboardElements, whiteboardView) => {
        set((s) => ({
          whiteboardElements,
          whiteboardView: whiteboardView ?? s.whiteboardView,
        }));
        void get().persistDraft();
      },
      setWhiteboardTextMode: (whiteboardTextMode) => set({ whiteboardTextMode }),
      setAgendaPlan: (agendaPlan) => { set({ agendaPlan }); void get().persistDraft(); },
      setAgendaPomodoro: (agendaPomodoro) => { set({ agendaPomodoro }); void get().persistDraft(); },
      setAgendaLayout: (agendaLayout) => set({ agendaLayout }),
      setSoloMusic: (soloMusic) => { set({ soloMusic }); void get().persistDraft(); },
      setSoloTools: (soloTools) => { set({ soloTools }); void get().persistDraft(); },
      setMembers: (members) => { set({ members }); void get().persistDraft(); },
      setConfirmedGroups: (confirmedGroups) => { set({ confirmedGroups }); void get().persistDraft(); },
      setGroupAssign: (groupAssign) => { set({ groupAssign }); void get().persistDraft(); },
      setMeetingDetails: (patch) => { set(patch); void get().persistDraft(); },
      setLaunchMode: (launchMode) => { set({ launchMode }); void get().persistDraft(); },
      setRightCollapsed: (rightCollapsed) => set({ rightCollapsed }),

      seed: (data, options) => {
        set({
          ptype: data.ptype ?? get().ptype,
          mode: data.mode ?? get().mode,
          objective: data.objective ?? get().objective,
          genre: data.genre ?? get().genre,
          genreMin: data.genreMin ?? get().genreMin,
          genreDur: data.genreDur ?? get().genreDur,
          genreCondensed: data.genreCondensed ?? get().genreCondensed,
          method: data.method ?? get().method,
          methods: data.methods ?? get().methods,
          stepIdx: data.stepIdx ?? get().stepIdx,
          projectId: data.projectId ?? get().projectId,
          agendaPlan: data.agendaPlan ?? get().agendaPlan,
          agendaPomodoro: data.agendaPomodoro ?? get().agendaPomodoro,
          agendaLayout: data.agendaLayout ?? get().agendaLayout,
          soloMusic: data.soloMusic ?? get().soloMusic,
          soloTools: data.soloTools ?? get().soloTools,
          members: data.members ?? get().members,
          confirmedGroups: data.confirmedGroups ?? get().confirmedGroups,
          groupAssign: data.groupAssign ?? get().groupAssign,
          meetingTitle: data.meetingTitle ?? get().meetingTitle,
          meetingDate: data.meetingDate ?? get().meetingDate,
          meetingStart: data.meetingStart ?? get().meetingStart,
          meetingEnd: data.meetingEnd ?? get().meetingEnd,
          launchMode: data.launchMode ?? get().launchMode,
          meetingPlatform: data.meetingPlatform ?? get().meetingPlatform,
          meetingLink: data.meetingLink ?? get().meetingLink,
          whiteboardElements: data.whiteboardElements ?? get().whiteboardElements,
          whiteboardView: data.whiteboardView ?? get().whiteboardView,
        });
        if (!options?.skipPersist) void get().persistDraft();
      },

      nextStep: () => {
        const path = getStepPath(get().mode);
        set((s) => ({ stepIdx: Math.min(s.stepIdx + 1, path.length - 1) }));
        void get().persistDraft();
      },

      prevStep: () => {
        set((s) => ({ stepIdx: Math.max(0, s.stepIdx - 1) }));
        void get().persistDraft();
      },

      reset: () =>
        set({
          ...INITIAL_STATE,
          meetingDate: new Date().toISOString().slice(0, 10),
          draftHydrated: get().draftHydrated,
        }),

      getCurrentStepKey: () => {
        const path = getStepPath(get().mode);
        return path[get().stepIdx] ?? "0";
      },

      persistDraft: async () => {
        const payload = toPayload(get());
        if (!hasWizardDraftPayload(payload)) return;
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        try {
          await saveWizardDraft(supabase, user.id, payload);
        } catch (error) {
          logDraftError("persist", error);
        }
      },

      hydrateDraftFromServer: async () => {
        if (hydrateInFlight) return hydrateInFlight;
        hydrateInFlight = (async () => {
          if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("mf-wizard-skip-draft")) {
            sessionStorage.removeItem("mf-wizard-skip-draft");
            set({ draftHydrated: true });
            return;
          }

          const local = toPayload(get());
          const localHas = hasWizardDraftPayload(local);

          try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const remoteRecord = await loadWizardDraft(supabase, user.id);
            if (!remoteRecord) {
              if (localHas) await saveWizardDraft(supabase, user.id, local);
              return;
            }

            const remote = remoteRecord.payload;
            const remoteHas = hasWizardDraftPayload(remote);
            const winner = pickWizardDraftWinner(local, remote);

            if (!winner) return;

            if (!localHas && remoteHas) {
              get().applyPayload(remote, { skipPersist: true });
            } else if (localHas && !remoteHas) {
              await saveWizardDraft(supabase, user.id, local);
            } else {
              const localStep = Number(local.stepIdx ?? 0);
              const remoteStep = Number(remote.stepIdx ?? 0);
              if (remoteStep >= localStep) {
                const merged: WizardPayload = {
                  ...remote,
                  launchMode: local.launchMode ?? remote.launchMode,
                  meetingTitle: local.meetingTitle ?? remote.meetingTitle,
                  meetingDate: local.meetingDate ?? remote.meetingDate,
                  meetingStart: local.meetingStart ?? remote.meetingStart,
                  meetingEnd: local.meetingEnd ?? remote.meetingEnd,
                  meetingPlatform: local.meetingPlatform ?? remote.meetingPlatform,
                  meetingLink: local.meetingLink ?? remote.meetingLink,
                };
                get().applyPayload(merged, { skipPersist: true });
              } else {
                await saveWizardDraft(supabase, user.id, local);
              }
            }
          } catch (error) {
            logDraftError("hydrate", error);
          } finally {
            set({ draftHydrated: true });
            hydrateInFlight = null;
          }
        })();
        return hydrateInFlight;
      },

      loadDraft: async () => get().hydrateDraftFromServer(),

      deleteDraft: async () => {
        set({
          ...INITIAL_STATE,
          meetingDate: new Date().toISOString().slice(0, 10),
          draftHydrated: true,
        });
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) await deleteWizardDraft(supabase, user.id);
        } catch (error) {
          logDraftError("delete", error);
        }
      },
    }),
    {
      name: "mf-wizard-v3",
      partialize: (state) => {
        const out: Partial<WizardStoreState> = {};
        for (const key of PERSIST_KEYS) {
          (out as Record<string, unknown>)[key] = state[key];
        }
        return out;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) logDraftError("rehydrate", error);
        queueMicrotask(() => {
          void useWizardStore.getState().hydrateDraftFromServer();
        });
      },
    },
  ),
);
