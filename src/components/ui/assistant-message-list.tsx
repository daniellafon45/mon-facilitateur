"use client";

import {
  ChatPreviewMessageRow,
  defaultChatPreviewTheme,
  type ChatPreviewTheme,
} from "@/components/ui/chat-preview";
import { AssistantAvatar } from "@/components/ui/assistant-avatar";
import { cn } from "@/lib/utils";

export interface AssistantChatMessage {
  role: "user" | "assistant";
  content: string;
  apiContent?: string;
  attachments?: { name: string }[];
}

const ROLE_META = {
  user: {
    username: "Vous",
    color: "text-blue-500",
    avatarBackground: "bg-blue-500/30",
  },
  assistant: {
    username: "Assistant",
    color: "text-foreground/80",
    avatarBackground: "bg-orange-500/25",
  },
} as const;

function TypingIndicator() {
  return (
    <p className="mt-0.5 text-[13px] text-muted-foreground sm:text-sm">
      <span className="inline-flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block animate-pulse"
            style={{ animationDelay: `${i * 180}ms` }}
          >
            ·
          </span>
        ))}
      </span>
    </p>
  );
}

interface AssistantMessageListProps {
  messages: AssistantChatMessage[];
  busy?: boolean;
  className?: string;
  theme?: ChatPreviewTheme;
}

export function AssistantMessageList({
  messages,
  busy,
  className,
  theme = defaultChatPreviewTheme,
}: AssistantMessageListProps) {
  return (
    <div className={cn("flex flex-col justify-end gap-2 sm:gap-3", className)}>
      {messages.map((message, index) => {
        const meta = ROLE_META[message.role];
        const isLast = index === messages.length - 1 && !busy;

        return (
          <div key={`${message.role}-${index}`}>
            <ChatPreviewMessageRow
              message={{
                username: meta.username,
                content: message.content,
                color: meta.color,
                avatarBackground: meta.avatarBackground,
              }}
              theme={theme}
              animate={isLast}
              liveAssistantAvatar={message.role === "assistant"}
              assistantActive={busy && message.role === "assistant" && isLast}
            />
            {message.attachments && message.attachments.length > 0 && (
              <div className="ml-9 mt-1.5 flex flex-wrap gap-1.5 sm:ml-10">
                {message.attachments.map((doc) => (
                  <span
                    key={doc.name}
                    className="rounded-full border border-foreground/10 bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {doc.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {busy && (
        <div className="flex animate-message-appear items-start gap-2 sm:gap-3">
          <AssistantAvatar active sizeClassName={theme.avatarSize} />
          <div className="min-w-0 flex-1">
            <span
              className={cn("text-[13px] font-medium sm:text-sm", ROLE_META.assistant.color)}
            >
              Assistant
            </span>
            <TypingIndicator />
          </div>
        </div>
      )}
    </div>
  );
}
