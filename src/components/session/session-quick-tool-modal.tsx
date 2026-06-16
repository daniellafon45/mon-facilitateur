"use client";

import { X } from "lucide-react";
import { LIB_SEANCE, type LibMethodItem } from "@/lib/methods/library-data";
import { SessionQuickTool } from "@/components/modeles/session-quick-tool";
import { Button } from "@/components/ui/button";
import type { MeetingQuickLogEntry } from "@/types/facilitation";

const QT_BY_ID = Object.fromEntries(LIB_SEANCE.filter((i) => i.qt).map((i) => [i.id, i])) as Record<
  string,
  LibMethodItem
>;

interface SessionQuickToolModalProps {
  toolId: string | null;
  onClose: () => void;
  onJournalize?: (entry: Omit<MeetingQuickLogEntry, "time">) => void;
}

export function SessionQuickToolModal({ toolId, onClose, onJournalize }: SessionQuickToolModalProps) {
  if (!toolId) return null;
  const item = QT_BY_ID[toolId];
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[1600] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-extrabold">{item.title}</p>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto p-4">
          <SessionQuickTool item={item} onJournalize={onJournalize} />
        </div>
      </div>
    </div>
  );
}
