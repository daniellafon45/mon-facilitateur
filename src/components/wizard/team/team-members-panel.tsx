"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Search, Upload, Users, X } from "lucide-react";
import type { ProjectMember } from "@/lib/project/registry-types";
import {
  ACCESS_ROLES,
  MEETING_ROLES,
  MEMBER_COLORS,
  PIZZA_MAX,
} from "@/lib/project/team-constants";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function parseCsvMembers(text: string, existingCount: number) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows =
    lines[0] && /nom|name|email|courriel/i.test(lines[0]) ? lines.slice(1) : lines;
  const fresh: Omit<ProjectMember, "id" | "projectId">[] = [];
  rows.forEach((line, i) => {
    const parts = line.split(/[,;\t]/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const nameRaw = parts[0];
    const mail = parts.find((p) => p.includes("@")) || "";
    const name = nameRaw
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    fresh.push({
      contactId: null,
      displayName: name,
      email: mail || undefined,
      color: MEMBER_COLORS[(existingCount + i) % MEMBER_COLORS.length],
      accessRole: "Éditeur",
      meetingRole: "Participante",
    });
  });
  return fresh;
}

function formatGuestName(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.includes("@")) {
    const local = trimmed.split("@")[0] ?? trimmed;
    return local.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return trimmed.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TeamMembersPanel({
  members,
  loading,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onOverflow,
  addInputRef,
}: {
  members: ProjectMember[];
  loading?: boolean;
  onAddMember: (member: Omit<ProjectMember, "id" | "projectId">) => Promise<void>;
  onUpdateMember: (member: ProjectMember) => Promise<void>;
  onRemoveMember: (id: string) => Promise<void>;
  onOverflow?: () => void;
  addInputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const contacts = useFacilitationStore((s) => s.contacts);
  const [query, setQuery] = useState("");
  const [showContacts, setShowContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const csvRef = useRef<HTMLInputElement>(null);

  const availableContacts = useMemo(
    () =>
      contacts.filter(
        (c) =>
          !members.some(
            (m) => (m.contactId && m.contactId === c.id) || (m.email && m.email === c.email),
          ),
      ),
    [contacts, members],
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    return availableContacts
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [availableContacts, query]);

  const filteredContacts = useMemo(() => {
    const q = contactSearch.toLowerCase();
    return availableContacts.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q),
    );
  }, [availableContacts, contactSearch]);

  const addFromInput = async (value?: string) => {
    const raw = (value ?? query).trim();
    if (!raw) return;
    const isEmail = raw.includes("@");
    const displayName = formatGuestName(raw);
    const match = availableContacts.find(
      (c) =>
        c.name.toLowerCase() === raw.toLowerCase() ||
        (c.email ?? "").toLowerCase() === raw.toLowerCase(),
    );
    await onAddMember({
      contactId: match?.id ?? null,
      displayName: match?.name ?? displayName,
      email: match?.email ?? (isEmail ? raw : undefined),
      color: MEMBER_COLORS[members.length % MEMBER_COLORS.length],
      accessRole: "Éditeur",
      meetingRole: match?.role ?? "Participante",
    });
    setQuery("");
    if (members.length + 1 > PIZZA_MAX) onOverflow?.();
  };

  const addContact = async (contactId: string) => {
    const c = contacts.find((x) => x.id === contactId);
    if (!c) return;
    await onAddMember({
      contactId: c.id,
      displayName: c.name,
      email: c.email,
      color: MEMBER_COLORS[members.length % MEMBER_COLORS.length],
      accessRole: "Éditeur",
      meetingRole: c.role || "Participante",
    });
    if (members.length + 1 > PIZZA_MAX) onOverflow?.();
  };

  const onCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsvMembers(text, members.length);
    let nextCount = members.length;
    for (const row of parsed) {
      await onAddMember(row);
      nextCount += 1;
    }
    if (nextCount > PIZZA_MAX) onOverflow?.();
    e.target.value = "";
  };

  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="border-b px-4 py-3.5">
        <h3 className="font-extrabold">Membres du projet</h3>
      </div>

      <div className="hidden gap-2 border-b bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[1fr_100px_120px_28px]">
        <span>Membre</span>
        <span>Accès</span>
        <span>Rôle rencontre</span>
        <span />
      </div>

      <div className="max-h-[340px] overflow-y-auto">
        {loading && members.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Chargement…</p>
        ) : members.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Aucun membre — ajoutez des participants.</p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="grid items-center gap-2 border-b border-slate-100 px-4 py-2.5 sm:grid-cols-[1fr_100px_120px_28px]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                  style={{ background: m.color }}
                >
                  {m.displayName.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{m.displayName}</p>
                  {m.email && (
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  )}
                </div>
              </div>
              <Select
                value={m.accessRole}
                onValueChange={(v) => void onUpdateMember({ ...m, accessRole: v })}
              >
                <SelectTrigger className="h-8 text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCESS_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={m.meetingRole}
                onValueChange={(v) => void onUpdateMember({ ...m, meetingRole: v })}
              >
                <SelectTrigger className="h-8 text-xs font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEETING_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                className="text-slate-400 hover:text-red-500"
                onClick={() => void onRemoveMember(m.id)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t p-4">
        <div className="relative mb-2">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                ref={addInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void addFromInput();
                }}
                placeholder="Nom ou courriel d'un invité…"
                className="h-auto border-0 p-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button type="button" size="sm" onClick={() => void addFromInput()}>
              <Plus className="mr-1 h-4 w-4" />
              Ajouter
            </Button>
          </div>
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-16 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-xl border bg-white shadow-lg">
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="flex w-full items-center gap-2 border-b px-3 py-2 text-left last:border-0 hover:bg-slate-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void addContact(c.id)}
                >
                  <span className="text-sm font-bold">{c.name}</span>
                  {c.email && (
                    <span className="truncate text-xs text-muted-foreground">{c.email}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="mb-2 flex items-center gap-1.5 text-sm font-bold text-violet-700"
          onClick={() => setShowContacts((v) => !v)}
        >
          <Users className="h-4 w-4" />
          Contacts enregistrés
          <span className="text-xs text-muted-foreground">{showContacts ? "▲" : "▼"}</span>
        </button>

        {showContacts && (
          <div className="mb-3 overflow-hidden rounded-xl border">
            <div className="flex items-center gap-2 border-b bg-slate-50 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Rechercher un contact…"
                className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="max-h-44 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <p className="p-3 text-center text-sm text-muted-foreground">
                  Tous vos contacts sont déjà ajoutés ✓
                </p>
              ) : (
                filteredContacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 border-b px-3 py-2 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{c.name}</p>
                      {c.email && (
                        <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                      )}
                    </div>
                    <Button type="button" size="icon" className="h-7 w-7 shrink-0" onClick={() => void addContact(c.id)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-between border-t bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
              <span>{filteredContacts.length} contact(s) disponible(s)</span>
              <Link href="/dashboard/dreamteam" className="inline-flex items-center gap-1 font-bold text-violet-700">
                Gérer mes contacts <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        <button
          type="button"
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          onClick={() => csvRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          Importer depuis un fichier CSV
        </button>
        <input ref={csvRef} type="file" accept=".csv,text/csv,text/plain" className="hidden" onChange={onCsvFile} />
      </div>
    </div>
  );
}
