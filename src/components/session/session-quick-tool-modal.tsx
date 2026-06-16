"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { LIB_SEANCE, type LibMethodItem } from "@/lib/methods/library-data";
import { SessionQuickTool } from "@/components/modeles/session-quick-tool";
import { Button } from "@/components/ui/button";
import { MotionOverlay } from "@/components/ui/motion-overlay";
import { MOTION_DURATION } from "@/lib/motion/tokens";
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
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const item = toolId ? QT_BY_ID[toolId] : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (toolId && item) setOpen(true);
    else setOpen(false);
  }, [toolId, item]);

  const requestClose = () => {
    setOpen(false);
    window.setTimeout(onClose, MOTION_DURATION.overlay * 1000);
  };

  if (!mounted || !item) return null;

  return createPortal(
    <MotionOverlay
      open={open}
      onClose={requestClose}
      variant="center"
      zIndex={2500}
      className="bg-slate-900/45 backdrop-blur-sm"
      panelClassName="max-w-lg flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <p className="font-extrabold">{item.title}</p>
        <Button type="button" variant="ghost" size="icon" onClick={requestClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-y-auto p-4">
        <SessionQuickTool item={item} onJournalize={onJournalize} />
      </div>
    </MotionOverlay>,
    document.body,
  );
}
