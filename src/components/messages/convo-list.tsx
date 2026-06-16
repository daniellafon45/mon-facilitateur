"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  EyeOff,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessagesStore } from "@/lib/store/messages-store";
import { useFacilitationStore } from "@/lib/store/facilitation-store";
import { MSG_COLORS } from "@/lib/messages/constants";
import { dtAvatarColor, dtTeamColor } from "@/lib/dreamteam/constants";
import { MessageAvatar } from "@/components/messages/message-avatar";
import { DreamTeamAvatar } from "@/components/dashboard/dreamteam-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ConvoTab } from "@/lib/messages/types";

const TABS: { id: ConvoTab; label: string }[] = [
  { id: "tous", label: "Tous" },
  { id: "dm", label: "Directs" },
  { id: "team", label: "Équipes" },
  { id: "arch", label: "Archivées" },
];

interface ConvoListProps {
  activeId: string | null;
  onPick: (id: string | null) => void;
}

export function ConvoList({ activeId, onPick }: ConvoListProps) {
  const convos = useMessagesStore((s) => s.convos);
  const ensureDM = useMessagesStore((s) => s.ensureDM);
  const ensureTeam = useMessagesStore((s) => s.ensureTeam);
  const setArchived = useMessagesStore((s) => s.setArchived);
  const setHidden = useMessagesStore((s) => s.setHidden);
  const remove = useMessagesStore((s) => s.remove);

  const contacts = useFacilitationStore((s) => s.contacts);
  const teams = useFacilitationStore((s) => s.teams);

  const [q, setQ] = useState("");
  const [tab, setTab] = useState<ConvoTab>("tous");
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const list = useMemo(() => {
    let items = [...convos];
    if (tab === "arch") {
      items = items.filter((c) => c.archived);
    } else {
      items = items.filter((c) => !c.archived && !c.hidden);
      if (tab === "dm") items = items.filter((c) => c.kind === "dm");
      if (tab === "team") items = items.filter((c) => c.kind === "team" || c.kind === "atelier");
    }
    if (q.trim()) {
      const needle = q.toLowerCase();
      items = items.filter((c) => c.name.toLowerCase().includes(needle));
    }
    return items;
  }, [convos, tab, q]);

  function startDM(contact: { id: string; name: string; color?: string }) {
    const id = ensureDM({
      id: contact.id,
      name: contact.name,
      color: contact.color || dtAvatarColor(contact.name),
    });
    setNewOpen(false);
    setNewName("");
    onPick(id);
  }

  function startTeam(team: { id: string; name: string; memberIds?: string[] }) {
    const memberNames = (team.memberIds ?? [])
      .map((mid) => contacts.find((c) => c.id === mid)?.name)
      .filter(Boolean) as string[];
    const id = ensureTeam(
      { id: team.id, name: team.name, color: dtTeamColor(team.name) },
      memberNames,
    );
    setNewOpen(false);
    onPick(id);
  }

  function startCustom() {
    const n = newName.trim();
    if (!n) return;
    startDM({
      id: `x${Date.now()}`,
      name: n,
      color: MSG_COLORS[Math.floor(Math.random() * MSG_COLORS.length)],
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col border-r bg-card/30">
      <div className="shrink-0 space-y-3 p-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher…"
              className="h-10 rounded-xl border-input/70 bg-muted/40 pl-9 text-sm"
            />
          </div>
          <div className="relative shrink-0">
            <Button
              size="icon"
              className="h-10 w-10 rounded-xl shadow-md"
              onClick={() => setNewOpen((o) => !o)}
              aria-label="Nouvelle conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {newOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label="Fermer"
                  onClick={() => setNewOpen(false)}
                />
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-64 max-h-[min(460px,60vh)] overflow-y-auto rounded-2xl border bg-popover p-2 shadow-xl">
                  {teams.length > 0 && (
                    <>
                      <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Équipes
                      </p>
                      {teams.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => startTeam(t)}
                          className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/80"
                        >
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                            style={{ background: `${dtTeamColor(t.name)}1a`, color: dtTeamColor(t.name) }}
                          >
                            <Users className="h-3.5 w-3.5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{t.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {(t.memberIds ?? []).length} membre
                              {(t.memberIds ?? []).length > 1 ? "s" : ""}
                            </p>
                          </div>
                        </button>
                      ))}
                      <div className="my-2 border-t" />
                    </>
                  )}
                  <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Contacts
                  </p>
                  {contacts.length === 0 && (
                    <p className="px-2 py-3 text-xs text-muted-foreground">
                      Ajoutez des contacts dans Dream Team.
                    </p>
                  )}
                  {contacts.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => startDM({ ...c, color: dtAvatarColor(c.name, i) })}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted/80"
                    >
                      <DreamTeamAvatar name={c.name} index={i} size={28} avatarUrl={c.avatarUrl} />
                      <span className="truncate text-sm font-semibold">{c.name}</span>
                    </button>
                  ))}
                  <div className="mt-2 flex gap-2 border-t pt-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") startCustom();
                      }}
                      placeholder="Autre personne…"
                      className="h-8 min-w-0 flex-1 rounded-lg text-xs"
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8 shrink-0 rounded-lg"
                      disabled={!newName.trim()}
                      onClick={startCustom}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                tab === t.id
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {list.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            Aucune conversation.
          </p>
        )}
        {list.map((c) => {
          const last = c.messages.filter((m) => m.from !== "system").slice(-1)[0];
          const on = c.id === activeId;
          return (
            <div key={c.id} className="group relative mb-0.5">
              <button
                type="button"
                onClick={() => onPick(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                  on
                    ? "bg-foreground/8 shadow-sm"
                    : "hover:bg-muted/70",
                )}
              >
                <MessageAvatar kind={c.kind} name={c.name} color={c.color} size={42} />
                <div className="min-w-0 flex-1 pr-6">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 truncate text-sm font-bold">{c.name}</span>
                    {last && (
                      <span className="shrink-0 text-[11px] text-muted-foreground">{last.ts}</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span
                      className={cn(
                        "flex-1 truncate text-xs",
                        c.unread ? "font-semibold text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {last
                        ? `${last.from === "me" ? "Vous : " : ""}${last.text}`
                        : "Nouvelle conversation"}
                    </span>
                    {c.unread > 0 && (
                      <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-bold text-background">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100",
                      on && "opacity-100",
                    )}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                  {c.archived ? (
                    <DropdownMenuItem onClick={() => setArchived(c.id, false)}>
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      Désarchiver
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => setArchived(c.id, true)}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archiver
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setHidden(c.id, true)}>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Masquer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      if (on) onPick(null);
                      remove(c.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}
