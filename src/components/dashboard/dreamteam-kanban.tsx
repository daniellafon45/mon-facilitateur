"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { DreamTeamAvatar } from "@/components/dashboard/dreamteam-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  contactShortId,
  dtRoleClasses,
  dtTeamColor,
  KANBAN_COLUMNS,
} from "@/lib/dreamteam/constants";

export type ContactStatus = "todo" | "in_progress" | "done";

export interface DreamTeamContact {
  id: string;
  name: string;
  role: string;
  email?: string;
  status: ContactStatus;
  avatarUrl?: string;
}

export interface DreamTeamTeam {
  id: string;
  name: string;
  memberIds: string[];
}

type FilterId = "all" | "with_email" | "recent";

interface DreamTeamKanbanProps {
  contacts: DreamTeamContact[];
  search: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (id: string, status: ContactStatus) => Promise<void>;
  onEditContact: (contact: DreamTeamContact) => void;
  onMessageContact?: (contact: DreamTeamContact) => void;
}

function statusIcon(status: ContactStatus) {
  if (status === "done") return "bg-emerald-500";
  if (status === "in_progress") return "bg-blue-500";
  return "bg-slate-400";
}

function priorityMeta(status: ContactStatus) {
  if (status === "done") return { icon: ArrowDown, value: "1", tone: "text-emerald-600" };
  if (status === "in_progress") return { icon: ArrowUp, value: "2", tone: "text-blue-600" };
  return { icon: ArrowUp, value: "3", tone: "text-amber-600" };
}

export function DreamTeamKanban({
  contacts,
  search,
  onSearchChange,
  onStatusChange,
  onEditContact,
  onMessageContact,
}: DreamTeamKanbanProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");

  const filtered = contacts.filter((c) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q);
    const matchesFilter =
      filter === "all" ||
      (filter === "with_email" && !!c.email) ||
      (filter === "recent" && c.status !== "done");
    return matchesSearch && matchesFilter;
  });

  function handleDrop(columnId: ContactStatus) {
    if (!dragId) return;
    const contact = contacts.find((c) => c.id === dragId);
    if (contact && contact.status !== columnId) {
      void onStatusChange(dragId, columnId);
    }
    setDragId(null);
  }

  const filters: { id: FilterId; label: string }[] = [
    { id: "all", label: "Tous les contacts" },
    { id: "with_email", label: "Avec courriel" },
    { id: "recent", label: "En cours" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Dream Team</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Pipeline des invitations</span>
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">All contacts</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher un contact…"
              className="h-9 rounded-lg border-input/80 bg-background pl-9"
            />
          </div>

          <div className="flex -space-x-2">
            {contacts.slice(0, 5).map((c, i) => (
              <DreamTeamAvatar key={c.id} name={c.name} index={i} size={32} avatarUrl={c.avatarUrl} className="ring-2 ring-background" />
            ))}
            {contacts.length > 5 && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold ring-2 ring-background">
                +{contacts.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.id
                ? "bg-foreground text-background"
                : "bg-muted/70 text-muted-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3" data-testid="dreamteam-kanban">
        {KANBAN_COLUMNS.map((col) => {
          const columnContacts = filtered.filter((c) => c.status === col.id);
          return (
            <div
              key={col.id}
              className="flex min-h-[480px] flex-col rounded-lg bg-[#f4f5f7] p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {col.title}
                </h3>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {columnContacts.length}
                </span>
              </div>
              <p className="mb-3 px-1 text-[11px] text-muted-foreground/80">{col.labelFr}</p>

              <div className="flex flex-1 flex-col gap-2.5">
                {columnContacts.map((contact, index) => {
                  const priority = priorityMeta(contact.status);
                  const PriorityIcon = priority.icon;
                  return (
                    <article
                      key={contact.id}
                      draggable
                      onDragStart={() => setDragId(contact.id)}
                      onDragEnd={() => setDragId(null)}
                      className={cn(
                        "cursor-grab rounded-lg border border-border/60 bg-white p-3 shadow-sm transition-shadow active:cursor-grabbing hover:shadow-md",
                        dragId === contact.id && "opacity-60 ring-2 ring-primary/20",
                      )}
                    >
                      <p className="text-[13px] font-medium leading-snug text-foreground">
                        {contact.name}
                      </p>
                      {contact.role && contact.role !== "Sans rôle" ? (
                        <span
                          className={cn(
                            "mt-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide border",
                            dtRoleClasses(contact.role),
                          )}
                        >
                          {contact.role}
                        </span>
                      ) : null}

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn("h-3.5 w-3.5 shrink-0 rounded-sm", statusIcon(contact.status))} />
                          <PriorityIcon className={cn("h-3.5 w-3.5 shrink-0", priority.tone)} />
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                            {priority.value}
                          </span>
                          <span className="truncate font-mono text-[10px] text-muted-foreground">
                            {contactShortId(contact.id)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {onMessageContact && (
                            <button
                              type="button"
                              onClick={() => onMessageContact(contact)}
                              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label={`Message à ${contact.name}`}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onEditContact(contact)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label={`Modifier ${contact.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <DreamTeamAvatar name={contact.name} index={index} size={28} avatarUrl={contact.avatarUrl} />
                        </div>
                      </div>
                      {contact.email ? (
                        <p className="mt-2 flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          {contact.email}
                        </p>
                      ) : null}
                    </article>
                  );
                })}

                {columnContacts.length === 0 ? (
                  <div
                    className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/70 bg-white/50 px-4 py-10 text-center text-xs text-muted-foreground"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(col.id)}
                  >
                    Glissez un contact ici
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DreamTeamTeamsGridProps {
  teams: DreamTeamTeam[];
  contacts: DreamTeamContact[];
  onCreateTeam: () => void;
  onEditTeam: (team: DreamTeamTeam) => void;
  onDeleteTeam: (team: DreamTeamTeam) => void;
  onMessageTeam?: (team: DreamTeamTeam) => void;
}

export function DreamTeamTeamsGrid({
  teams,
  contacts,
  onCreateTeam,
  onEditTeam,
  onDeleteTeam,
  onMessageTeam,
}: DreamTeamTeamsGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {teams.map((team) => {
        const members = team.memberIds
          .map((id) => contacts.find((c) => c.id === id))
          .filter(Boolean) as DreamTeamContact[];
        const color = dtTeamColor(team.name);

        return (
          <div
            key={team.id}
            className="rounded-2xl border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${color}1a`, color }}
              >
                <Users className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-foreground">{team.name}</p>
                <p className="text-xs text-muted-foreground">
                  {members.length} membre{members.length > 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => onEditTeam(team)}
                aria-label={`Modifier ${team.name}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
              {onMessageTeam && (
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => onMessageTeam(team)}
                  aria-label={`Message à ${team.name}`}
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDeleteTeam(team)}
                aria-label={`Supprimer ${team.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center">
              {members.slice(0, 6).map((m, i) => (
                <span key={m.id} className={cn(i > 0 && "-ml-2.5")}>
                  <DreamTeamAvatar name={m.name} index={i} size={32} avatarUrl={m.avatarUrl} className="ring-2 ring-card" />
                </span>
              ))}
              {members.length > 6 && (
                <span className="ml-2 text-xs font-bold text-muted-foreground">+{members.length - 6}</span>
              )}
              {members.length === 0 && (
                <span className="text-xs text-muted-foreground">Aucun membre</span>
              )}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onCreateTeam}
        className="flex min-h-[110px] items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 text-sm font-bold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
      >
        <Plus className="h-5 w-5" />
        Créer une équipe
      </button>
    </div>
  );
}

interface DreamTeamStatsProps {
  contactsCount: number;
  teamsCount: number;
  withEmailCount: number;
}

export function DreamTeamStats({ contactsCount, teamsCount, withEmailCount }: DreamTeamStatsProps) {
  const stats = [
    { label: "Contacts", value: contactsCount, icon: Users },
    { label: "Équipes", value: teamsCount, icon: Users },
    { label: "Avec coordonnées", value: withEmailCount, icon: Mail },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm"
        >
          <s.icon className="h-5 w-5 shrink-0 text-foreground" />
          <div>
            <p className="text-2xl font-extrabold tracking-tight">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DreamTeamHeaderActions({
  onNewTeam,
  onNewContact,
}: {
  onNewTeam: () => void;
  onNewContact: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      <Button variant="outline" className="rounded-xl" onClick={onNewTeam}>
        <Users className="h-4 w-4" />
        Nouvelle équipe
      </Button>
      <Button className="rounded-xl" onClick={onNewContact}>
        <Plus className="h-4 w-4" />
        Nouveau contact
      </Button>
    </div>
  );
}
