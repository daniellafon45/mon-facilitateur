"use client";

import { useState, type ReactNode } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Flag,
  List,
  Pencil,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RAIL_ICONS,
  SESSION_RAIL_ITEMS,
  type SessionRailId,
} from "@/components/session/session-right-hub";
import { cn } from "@/lib/utils";

interface MenuAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

interface SessionMethodShellProps {
  title: string;
  onTitleChange?: (title: string) => void;
  badge?: string;
  onAssistant?: () => void;
  menuActions?: MenuAction[];
  onFinish?: () => void;
  finishLabel?: string;
  activeRail: SessionRailId;
  onRailChange: (id: SessionRailId) => void;
  hideParticipantsRail?: boolean;
  right: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  overlays?: ReactNode;
  focusMode?: boolean;
}

export function SessionMethodShell({
  title,
  onTitleChange,
  badge,
  onAssistant,
  menuActions,
  onFinish,
  finishLabel = "Terminer la séance",
  activeRail,
  onRailChange,
  hideParticipantsRail,
  right,
  children,
  footer,
  overlays,
  focusMode,
}: SessionMethodShellProps) {
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const railItems = SESSION_RAIL_ITEMS.filter(
    (r) => !(hideParticipantsRail && r.id === "participants"),
  );

  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border bg-card",
        focusMode && "ring-2 ring-primary/20",
      )}
      data-testid="session-method-shell"
    >
      <nav
        className={cn(
          "flex shrink-0 flex-col items-center gap-1 border-r bg-muted/20 py-3 transition-all",
          railCollapsed ? "w-12" : "w-[72px]",
        )}
      >
        {railCollapsed ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setRailCollapsed(false)}
            title="Déplier"
          >
            <List className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mb-1 h-auto flex-col gap-0.5 py-1 text-[10px] font-bold"
              onClick={() => setRailCollapsed(true)}
            >
              <ChevronLeft className="h-4 w-4" />
              Replier
            </Button>
            {railItems.map((r) => {
              const Icon = RAIL_ICONS[r.icon] ?? List;
              const on = activeRail === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  title={r.label}
                  onClick={() => onRailChange(r.id)}
                  className={cn(
                    "flex w-[60px] flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-bold transition-colors",
                    on
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="leading-tight">{r.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </>
        )}
      </nav>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {activeRail === "seance" && (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-primary" />
              {onTitleChange ? (
                <Input
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="h-8 max-w-md border-transparent bg-transparent px-1 font-extrabold shadow-none focus-visible:border-border"
                />
              ) : (
                <span className="font-extrabold">{title}</span>
              )}
              {badge && (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-extrabold text-primary">
                  {badge}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onAssistant && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-primary/30 bg-primary/5 text-primary"
                  onClick={onAssistant}
                >
                  <Sparkles className="h-4 w-4" />
                  Amaris
                </Button>
              )}
              {menuActions && menuActions.length > 0 && (
                <div className="relative">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1"
                    onClick={() => setMenuOpen((o) => !o)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Plus
                    <ChevronRight className={cn("h-3 w-3 rotate-90 transition-transform", menuOpen && "rotate-[270deg]")} />
                  </Button>
                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-xl border bg-popover p-1 shadow-lg">
                        {menuActions.map((a, i) => (
                          <button
                            key={i}
                            type="button"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-muted"
                            onClick={() => {
                              setMenuOpen(false);
                              a.onClick();
                            }}
                          >
                            {a.icon}
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              {onFinish && (
                <Button type="button" size="sm" className="gap-1" onClick={onFinish}>
                  <Flag className="h-4 w-4" />
                  {finishLabel}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer && (
          <div className="shrink-0 border-t px-4 py-3">{footer}</div>
        )}
      </main>

      <aside
        className={cn(
          "shrink-0 border-l bg-background transition-all",
          rightCollapsed ? "w-12" : "w-72 lg:w-80",
        )}
      >
        {rightCollapsed ? (
          <div className="flex justify-center py-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setRightCollapsed(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end p-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 rounded-lg text-xs"
                onClick={() => setRightCollapsed(true)}
              >
                <ChevronLeft className="h-3 w-3" />
                Replier
              </Button>
            </div>
            {right}
          </>
        )}
      </aside>

      {overlays}
    </div>
  );
}

export function SessionConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[1800] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-2 text-lg font-extrabold">{title}</p>
        <p className="mb-5 text-sm text-muted-foreground leading-relaxed">{body}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="button"
            variant={danger ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel ?? "Confirmer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SessionToast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[2200] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
      <Check className="h-4 w-4 text-emerald-400" />
      {message}
    </div>
  );
}

export function FloatingSessionNote({
  onSave,
  hidden,
}: {
  onSave: (text: string) => void;
  hidden?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  if (hidden) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[500] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        title="Note rapide"
      >
        <Pencil className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed bottom-20 right-6 z-[501] w-72 rounded-2xl border bg-background p-3 shadow-xl">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="mb-2 w-full resize-none rounded-xl border bg-muted/30 p-2 text-sm outline-none"
            placeholder="Note rapide…"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Fermer
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (text.trim()) onSave(text.trim());
                setText("");
                setOpen(false);
              }}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
