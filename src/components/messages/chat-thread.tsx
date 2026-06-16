"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessagesStore } from "@/lib/store/messages-store";
import { MessageAvatar } from "@/components/messages/message-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Conversation } from "@/lib/messages/types";

function convoSubtitle(c: Conversation) {
  if (c.kind === "dm") return "Message direct";
  if (c.kind === "atelier") return "Discussion de séance";
  if (c.members?.length) return `${c.members.length} membre${c.members.length > 1 ? "s" : ""}`;
  return "Équipe";
}

interface ChatThreadProps {
  convoId: string;
  compact?: boolean;
  onBack?: () => void;
}

export function ChatThread({ convoId, compact, onBack }: ChatThreadProps) {
  const convos = useMessagesStore((s) => s.convos);
  const send = useMessagesStore((s) => s.send);
  const markRead = useMessagesStore((s) => s.markRead);
  const setActiveId = useMessagesStore((s) => s.setActiveId);

  const c = convos.find((x) => x.id === convoId);
  const [val, setVal] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveId(convoId);
    markRead(convoId);
    return () => setActiveId(null);
  }, [convoId, markRead, setActiveId]);

  useEffect(() => {
    const el = endRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [c?.messages.length]);

  if (!c) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Conversation introuvable.
      </div>
    );
  }

  const handleSend = () => {
    if (!val.trim()) return;
    send(convoId, val);
    setVal("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 border-b bg-background/80 backdrop-blur-sm",
          compact ? "px-4 py-3" : "px-5 py-4",
        )}
      >
        {onBack && (
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-xl lg:hidden" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <MessageAvatar kind={c.kind} name={c.name} color={c.color} size={compact ? 36 : 40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold tracking-tight">{c.name}</p>
          <p className="text-xs text-muted-foreground">{convoSubtitle(c)}</p>
        </div>
      </div>

      <div
        ref={endRef}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto",
          compact ? "px-4 py-4" : "px-5 py-5",
        )}
      >
        {c.messages.map((m) => {
          if (m.from === "system") {
            return (
              <p key={m.id} className="py-1 text-center text-[11px] text-muted-foreground">
                {m.text}
              </p>
            );
          }
          const me = m.from === "me";
          return (
            <div
              key={m.id}
              className={cn("flex flex-col", me ? "items-end" : "items-start")}
            >
              {!me && c.kind !== "dm" && (
                <span className="mb-1 ml-1 text-[11px] font-semibold text-muted-foreground">
                  {m.name}
                </span>
              )}
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm",
                  me
                    ? "rounded-br-md bg-foreground text-background"
                    : "rounded-bl-md bg-muted/80 text-foreground",
                )}
              >
                {m.text}
              </div>
              <span className="mt-1 px-1 text-[10.5px] text-muted-foreground">{m.ts}</span>
            </div>
          );
        })}
      </div>

      <div
        className={cn(
          "flex shrink-0 items-end gap-2 border-t bg-background/90 backdrop-blur-sm",
          compact ? "px-3 py-3" : "px-4 py-4",
        )}
      >
        <Textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Écrire un message…"
          className="min-h-[42px] max-h-[90px] flex-1 resize-none rounded-xl border-input/80 bg-muted/30 py-2.5 text-[13.5px] shadow-none focus-visible:ring-1"
        />
        <Button
          size="icon"
          disabled={!val.trim()}
          onClick={handleSend}
          aria-label="Envoyer"
          className="h-[42px] w-[42px] shrink-0 rounded-xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
