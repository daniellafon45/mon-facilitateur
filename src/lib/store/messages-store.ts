"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CANNED_REPLIES, contactColor, msgTime } from "@/lib/messages/constants";
import type { ContactRef, Conversation, TeamRef } from "@/lib/messages/types";

interface MessagesStore {
  convos: Conversation[];
  activeId: string | null;
  pendingOpenId: string | null;
  send: (id: string, text: string) => void;
  markRead: (id: string) => void;
  remove: (id: string) => void;
  setArchived: (id: string, archived: boolean) => void;
  setHidden: (id: string, hidden: boolean) => void;
  setActiveId: (id: string | null) => void;
  ensureDM: (contact: ContactRef) => string;
  ensureTeam: (team: TeamRef, memberNames: string[]) => string;
  ensureAtelier: (sessId: string, name: string, memberNames: string[]) => string;
  requestOpen: (id: string) => void;
  consumePendingOpen: () => string | null;
  totalUnread: () => number;
  resetAll: () => void;
}

function pushSimulatedReply(get: () => MessagesStore, id: string) {
  const state = get();
  const c = state.convos.find((x) => x.id === id);
  if (!c || c.kind === "atelier") return;

  const reps =
    c.kind === "team" && c.members?.length ? c.members : [c.name];
  const who = reps[Math.floor(Math.random() * reps.length)];
  const txt = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];

  window.setTimeout(() => {
    const current = get();
    const isActive = current.activeId === id;

    useMessagesStore.setState((s) => ({
      convos: s.convos.map((x) =>
        x.id === id
          ? {
              ...x,
              hidden: false,
              unread: isActive ? 0 : (x.unread || 0) + 1,
              messages: x.messages.concat({
                id: `m${Date.now()}`,
                from: "other",
                name: who,
                text: txt,
                ts: msgTime(),
              }),
            }
          : x,
      ),
    }));
  }, 1200 + Math.random() * 1400);
}

export const useMessagesStore = create<MessagesStore>()(
  persist(
    (set, get) => ({
      convos: [],
      activeId: null,
      pendingOpenId: null,

      send: (id, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => ({
          convos: s.convos.map((c) =>
            c.id === id
              ? {
                  ...c,
                  hidden: false,
                  messages: c.messages.concat({
                    id: `m${Date.now()}`,
                    from: "me",
                    name: "Vous",
                    text: trimmed,
                    ts: msgTime(),
                  }),
                }
              : c,
          ),
        }));
        if (Math.random() > 0.25) pushSimulatedReply(get, id);
      },

      markRead: (id) => {
        set((s) => ({
          convos: s.convos.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
        }));
      },

      remove: (id) => {
        set((s) => ({
          convos: s.convos.filter((c) => c.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        }));
      },

      setArchived: (id, archived) => {
        set((s) => ({
          convos: s.convos.map((c) =>
            c.id === id ? { ...c, archived, hidden: archived ? false : c.hidden } : c,
          ),
        }));
      },

      setHidden: (id, hidden) => {
        set((s) => ({
          convos: s.convos.map((c) =>
            c.id === id ? { ...c, hidden, archived: hidden ? false : c.archived } : c,
          ),
        }));
      },

      setActiveId: (id) => set({ activeId: id }),

      ensureDM: (contact) => {
        const id = `dm-${contact.id}`;
        const existing = get().convos.find((c) => c.id === id);
        if (existing) return id;
        const convo: Conversation = {
          id,
          kind: "dm",
          name: contact.name,
          color: contact.color || contactColor(contact.name),
          unread: 0,
          messages: [],
        };
        set((s) => ({ convos: [convo, ...s.convos] }));
        return id;
      },

      ensureTeam: (team, memberNames) => {
        const id = `team-${team.id}`;
        const existing = get().convos.find((c) => c.id === id);
        if (existing) return id;
        const convo: Conversation = {
          id,
          kind: "team",
          name: team.name,
          color: team.color || contactColor(team.name),
          unread: 0,
          members: memberNames,
          messages: [],
        };
        set((s) => ({ convos: [convo, ...s.convos] }));
        return id;
      },

      ensureAtelier: (sessId, name, memberNames) => {
        const id = `atelier-${sessId || "courante"}`;
        const existing = get().convos.find((c) => c.id === id);
        if (existing) return id;
        const convo: Conversation = {
          id,
          kind: "atelier",
          name: name || "Discussion de séance",
          color: "#059669",
          unread: 0,
          members: memberNames,
          messages: [
            {
              id: "m0",
              from: "system",
              name: "",
              text: "Début de la discussion de séance.",
              ts: msgTime(),
            },
          ],
        };
        set((s) => ({ convos: [convo, ...s.convos] }));
        return id;
      },

      requestOpen: (id) => set({ pendingOpenId: id }),

      consumePendingOpen: () => {
        const id = get().pendingOpenId;
        if (id) set({ pendingOpenId: null });
        return id;
      },

      totalUnread: () => get().convos.reduce((sum, c) => sum + (c.unread || 0), 0),

      resetAll: () => set({ convos: [], activeId: null, pendingOpenId: null }),
    }),
    { name: "mf-msgs-v2" },
  ),
);
