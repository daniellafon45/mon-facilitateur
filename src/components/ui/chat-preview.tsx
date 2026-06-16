"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { AssistantAvatar } from "@/components/ui/assistant-avatar";

export interface ChatPreviewMessage {
  avatar?: string;
  avatarBackground?: string;
  username: string;
  content: string;
  color?: string;
  duration: number;
  timestamp?: number;
}

export interface ChatPreviewChannel {
  name: string;
  description: string;
}

type Variations = "default" | "compact" | "expanded";

export interface ChatPreviewTheme {
  background?: string;
  border?: string;
  textColor?: string;
  avatarSize?: string;
}

export const defaultChatPreviewTheme: ChatPreviewTheme = {
  background: "bg-white",
  border: "border border-zinc-200/80",
  textColor: "text-foreground/90",
  avatarSize: "w-7 h-7 sm:w-8 sm:h-8",
};

/** Thème blanc pour l’assistant IA (modale + carte dashboard). */
export const assistantChatTheme: ChatPreviewTheme = {
  background: "bg-white",
  border: "border border-zinc-200/80",
  textColor: "text-foreground/90",
  avatarSize: "w-7 h-7 sm:w-8 sm:h-8",
};

export interface ChatPanelProps {
  channel: ChatPreviewChannel;
  className?: string;
  variation?: Variations;
  gradientBackground?: boolean;
  removeShadow?: boolean;
  /** Ombre colorée pulsée (modale assistant IA) */
  pulseShadow?: boolean;
  theme?: ChatPreviewTheme;
  headerAction?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  bodyClassName?: string;
}

/** Shell glassmorphism partagé entre la démo ChatPreview et l’assistant IA. */
export function ChatPanel({
  channel,
  className,
  variation = "default",
  gradientBackground = true,
  removeShadow = false,
  pulseShadow = false,
  theme = defaultChatPreviewTheme,
  headerAction,
  children,
  footer,
  bodyClassName,
}: ChatPanelProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-[500px]",
        variation === "compact" && "max-w-[350px]",
        variation === "expanded" && "max-w-[700px]",
        className,
      )}
    >
      {gradientBackground && (
        <div
          className={cn(
            "absolute -inset-2 rounded-2xl bg-gradient-to-r from-orange-500/25 via-pink-500/25 to-purple-500/25 blur-2xl",
            pulseShadow ? "animate-assistant-aura-pulse" : "opacity-75",
          )}
        />
      )}

      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl",
          !removeShadow && !pulseShadow && "shadow-2xl",
          pulseShadow && "animate-assistant-window-shadow-pulse",
          theme.border,
          theme.background,
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200/80 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
          <span className="text-[13px] font-medium sm:text-sm">#{channel.name}</span>
          <span className="text-muted-foreground">|</span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground sm:text-sm">
            {channel.description}
          </span>
          {headerAction}
        </div>

        <div className={cn("relative flex min-h-0 flex-1 flex-col", bodyClassName)}>{children}</div>

        {footer}
      </div>
    </div>
  );
}

export function ChatPreviewMessageRow({
  message,
  theme = defaultChatPreviewTheme,
  animate = false,
  liveAssistantAvatar = false,
  assistantActive = false,
}: {
  message: Pick<ChatPreviewMessage, "avatar" | "avatarBackground" | "username" | "content" | "color">;
  theme?: ChatPreviewTheme;
  animate?: boolean;
  liveAssistantAvatar?: boolean;
  assistantActive?: boolean;
}) {
  const showLiveAvatar = liveAssistantAvatar && message.username === "Assistant";

  return (
    <div className={cn("flex items-start gap-2 sm:gap-3", animate && "animate-message-appear")}>
      {showLiveAvatar ? (
        <AssistantAvatar active={assistantActive} sizeClassName={theme.avatarSize} />
      ) : (
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-full",
            theme.avatarSize,
            !message.avatar && (message.avatarBackground ?? "bg-gray-500/30"),
          )}
        >
          {message.avatar && (
            <Image
              src={message.avatar}
              alt={`${message.username}'s avatar`}
              fill
              className="object-cover"
            />
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn("text-[13px] font-medium sm:text-sm", message.color ?? "text-foreground")}
          >
            {message.username}
          </span>
          <span className="shrink-0 text-[11px] text-muted-foreground sm:text-xs">just now</span>
        </div>
        <p className={cn(theme.textColor, "mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed sm:text-sm")}>
          {message.content}
        </p>
      </div>
    </div>
  );
}

interface ChatPreviewProps {
  messages?: ChatPreviewMessage[];
  channel?: ChatPreviewChannel;
  maxMessages?: number;
  className?: string;
  gradientBackground?: boolean;
  variation?: Variations;
  removeShadow?: boolean;
  theme?: ChatPreviewTheme;
}

const defaultChannel: ChatPreviewChannel = {
  name: "creative-writing",
  description: "Share your verses and artistic expressions.",
};

const defaultMessages: ChatPreviewMessage[] = [
  {
    avatarBackground: "bg-blue-500/30",
    username: "TechPoet",
    content: "In the realm of web, where Next.js shines bright,",
    color: "text-blue-400",
    duration: 3000,
  },
  {
    avatarBackground: "bg-red-500/30",
    username: "ReactBard",
    content: "React components dance in the night,",
    color: "text-pink-400",
    duration: 2000,
  },
  {
    avatarBackground: "bg-green-500/30",
    username: "CodeScribe",
    content: "With hooks and state, we build with care,",
    color: "text-green-400",
    duration: 3500,
  },
  {
    avatarBackground: "bg-yellow-500/30",
    username: "WebVerse",
    content: "Server-side rendering, beyond compare!",
    color: "text-yellow-400",
    duration: 2000,
  },
  {
    avatarBackground: "bg-purple-500/30",
    username: "DevRhymer",
    content: "Static pages load in a flash,",
    color: "text-purple-400",
    duration: 3500,
  },
  {
    avatarBackground: "bg-indigo-500/30",
    username: "JSPoet",
    content: "While TypeScript keeps our code from crash,",
    color: "text-indigo-400",
    duration: 2000,
  },
  {
    avatarBackground: "bg-red-500/30",
    username: "VerseWriter",
    content: "Next.js and React, a perfect pair,",
    color: "text-red-400",
    duration: 3500,
  },
  {
    avatarBackground: "bg-teal-500/30",
    username: "ByteBard",
    content: "Creating apps with modern flair!",
    color: "text-teal-400",
    duration: 2500,
  },
];

export function ChatPreview({
  messages = defaultMessages,
  channel = defaultChannel,
  maxMessages = 3,
  className,
  gradientBackground = true,
  variation = "default",
  removeShadow = false,
  theme = defaultChatPreviewTheme,
}: ChatPreviewProps) {
  const [visibleMessages, setVisibleMessages] = useState<ChatPreviewMessage[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const addMessage = () => {
      const newMessage = {
        ...messages[currentIndexRef.current],
        timestamp: Date.now(),
      };
      currentIndexRef.current = (currentIndexRef.current + 1) % messages.length;

      setVisibleMessages((prev) => [...prev, newMessage].slice(-maxMessages));

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(addMessage, newMessage.duration);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          currentIndexRef.current = 0;
          setVisibleMessages([]);
          addMessage();
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setVisibleMessages([]);
        }
      },
      { threshold: 0.5 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [messages, maxMessages]);

  return (
    <div ref={containerRef} className={cn("relative flex-1", className)}>
      <ChatPanel
        channel={channel}
        variation={variation}
        gradientBackground={gradientBackground}
        removeShadow={removeShadow}
        theme={theme}
        bodyClassName="h-[calc(64px*3+16px)] justify-end p-2.5 pt-0 sm:h-[calc(52px*3+24px)] sm:p-4 sm:pt-0"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-white to-transparent" />
        <div className="flex flex-col justify-end gap-2 overflow-hidden sm:gap-3">
          {visibleMessages.map((message, index) => (
            <ChatPreviewMessageRow
              key={message.timestamp}
              message={message}
              theme={theme}
              animate={index === visibleMessages.length - 1}
            />
          ))}
        </div>
      </ChatPanel>
    </div>
  );
}
