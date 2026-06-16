"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessagesStore } from "@/lib/store/messages-store";
import { ConvoList } from "@/components/messages/convo-list";
import { ChatThread } from "@/components/messages/chat-thread";

export function MessagesPage() {
  const convos = useMessagesStore((s) => s.convos);
  const consumePendingOpen = useMessagesStore((s) => s.consumePendingOpen);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const pending = consumePendingOpen();
    if (pending) setActive(pending);
  }, [consumePendingOpen]);

  useEffect(() => {
    if (active) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;
    const first = convos.find((c) => !c.archived && !c.hidden);
    if (first) setActive(first.id);
  }, [convos, active]);

  const unreadTotal = convos.reduce((s, c) => s + (c.unread || 0), 0);
  const showList = !active;
  const showThread = !!active;

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-[520px] flex-col">
      <div className="mb-4 shrink-0 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messagerie</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Échangez avec votre équipe autour des projets et sessions de facilitation.
          </p>
        </div>
        {unreadTotal > 0 && (
          <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">
            {unreadTotal} non lu{unreadTotal > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(280px,320px)_1fr]">
          <div className={cn("h-full min-h-0", showThread && "hidden lg:block")}>
            <ConvoList activeId={active} onPick={setActive} />
          </div>
          {active ? (
            <div className={cn("h-full min-h-0", showList && "hidden lg:block")}>
              <ChatThread convoId={active} onBack={() => setActive(null)} />
            </div>
          ) : (
            <div className="hidden flex-col items-center justify-center gap-4 bg-gradient-to-br from-muted/30 via-background to-muted/20 p-8 lg:flex">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground/5 text-foreground/70 ring-1 ring-border/60">
                <MessageSquare className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-foreground/80">Sélectionnez une conversation</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Créez un fil direct ou rejoignez une équipe via le bouton +.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
