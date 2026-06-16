"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { VoiceChatButton } from "@/components/ui/voice-chat-button";
import {
  canAddAttachments,
  fileToAttachment,
  type ChatAttachment,
} from "@/lib/assistant/chat-attachments";

interface AssistantComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  attachments: ChatAttachment[];
  onAttachmentsChange: (attachments: ChatAttachment[]) => void;
  busy?: boolean;
  inputTestId?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  onLaunchProject?: () => void;
  showLaunchLink?: boolean;
}

export function AssistantComposer({
  value,
  onChange,
  onSubmit,
  attachments,
  onAttachmentsChange,
  busy = false,
  inputTestId,
  inputRef,
  onLaunchProject,
  showLaunchLink = true,
}: AssistantComposerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canSend = (value.trim().length > 0 || attachments.length > 0) && !busy;

  async function addFiles(files: FileList | File[]) {
    const next = [...attachments];
    for (const file of Array.from(files)) {
      const attachment = await fileToAttachment(file);
      if (!attachment) continue;
      const check = canAddAttachments(next, attachment.size);
      if (!check.ok) break;
      next.push(attachment);
    }
    onAttachmentsChange(next);
  }

  return (
    <div className="shrink-0 border-t border-zinc-200/80 bg-white px-3 py-3 sm:px-4">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((doc) => (
            <span
              key={doc.id}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/70 px-2.5 py-1 text-xs"
            >
              <span className="truncate">{doc.name}</span>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onAttachmentsChange(attachments.filter((d) => d.id !== doc.id))}
              >
                Retirer
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-end gap-1 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.csv,.json,text/*,application/json"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="shrink-0 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          Joindre
        </button>

        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => {
            const files: File[] = [];
            for (const item of Array.from(e.clipboardData?.items ?? [])) {
              if (item.kind === "file") {
                const f = item.getAsFile();
                if (f) files.push(f);
              }
            }
            if (files.length) {
              e.preventDefault();
              void addFiles(files);
            }
          }}
          placeholder="Écrivez votre message…"
          rows={1}
          disabled={busy}
          data-testid={inputTestId}
          className="max-h-[120px] min-h-[38px] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/70 disabled:opacity-60 sm:text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSubmit();
            }
          }}
        />

        <VoiceChatButton
          variant="inline"
          disabled={busy}
          onTranscript={(text) => {
            const trimmed = text.trim();
            if (!trimmed) return;
            onChange(value.trim() ? `${value.trim()} ${trimmed}` : trimmed);
          }}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSend}
          data-testid="assistant-send-btn"
          className={cn(
            "shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors sm:text-sm",
            canSend
              ? "bg-slate-500 text-white hover:bg-slate-600"
              : "bg-slate-200/80 text-slate-400",
          )}
        >
          Envoyer
        </button>
      </div>

      {showLaunchLink && onLaunchProject && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onLaunchProject}
            className="text-[13px] font-semibold text-foreground/70 transition-colors hover:text-foreground hover:underline"
          >
            Prêt ? Lancer un projet
          </button>
        </div>
      )}
    </div>
  );
}
