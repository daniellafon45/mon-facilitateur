"use client";

import { createPortal } from "react-dom";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { exportBoardImageBase64 } from "@/lib/whiteboard/export-board-image";
import {
  CheckCircle,
  FileText,
  Grid3x3,
  Minus,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateThumb, WbToolIcon } from "@/components/whiteboard/whiteboard-tool-icons";
import { METHOD_OVERLAY_POPOVER_Z } from "@/lib/methods/overlay-layer";
import {
  TEMPLATE_PAL,
  WBP_INK,
  WBP_MARKER_COLORS,
  WBP_NOTE,
  WHITEBOARD_STORAGE_KEY,
  type WhiteboardTool,
} from "@/lib/whiteboard/constants";
import {
  wbpId,
  wbpNote,
  wbpText,
  type WbElement,
} from "@/lib/whiteboard/elements";
import { WBP_TEMPLATES } from "@/lib/whiteboard/templates";
import { cn } from "@/lib/utils";

type ViewState = { tx: number; ty: number; k: number };

type OpState =
  | { kind: "pan"; sx: number; sy: number; tx: number; ty: number }
  | { kind: "pen"; id: string }
  | { kind: "shape"; sx: number; sy: number }
  | { kind: "arrow" }
  | { kind: "move"; id: string; wx: number; wy: number; ox: number; oy: number }
  | { kind: "moveArrow"; id: string; wx: number; wy: number; x1: number; y1: number; x2: number; y2: number };

const TOOLS: { id: WhiteboardTool; t: string }[] = [
  { id: "select", t: "Sélection" },
  { id: "hand", t: "Déplacer (pan)" },
  { id: "pen", t: "Crayon" },
  { id: "note", t: "Note" },
  { id: "rect", t: "Rectangle" },
  { id: "ellipse", t: "Ellipse" },
  { id: "arrow", t: "Flèche" },
  { id: "text", t: "Texte" },
  { id: "eraser", t: "Gomme" },
];

interface WhiteboardBoardProps {
  className?: string;
  height?: number | string;
  boardId?: string | null;
  boardName?: string;
  initialElements?: WbElement[];
  initialView?: ViewState;
  onSave?: (payload: {
    name: string;
    elements: WbElement[];
    view: ViewState;
  }) => Promise<void>;
  /** Notifie l’overlay parent (ex. modale méthode) qu’un sous-dialog est ouvert. */
  onSubdialogOpenChange?: (open: boolean) => void;
  onElementsChange?: (elements: WbElement[], view: ViewState) => void;
  /** Appelé quand l’édition d’une note/texte se termine (blur) — utile pour flush debounce parent. */
  onEditingBlur?: () => void;
}

export type WhiteboardBoardHandle = {
  exportImage: () => Promise<string | null>;
};

export const WhiteboardBoard = forwardRef<WhiteboardBoardHandle, WhiteboardBoardProps>(function WhiteboardBoard(
  {
    className,
    height = 540,
    boardId = null,
    boardName,
    initialElements = [],
    initialView = { tx: 0, ty: 0, k: 1 },
    onSave,
    onSubdialogOpenChange,
    onElementsChange,
    onEditingBlur,
  },
  ref,
) {
  const [els, setEls] = useState<WbElement[]>(initialElements);
  const [saveToast, setSaveToast] = useState("");
  const [tool, setTool] = useState<WhiteboardTool>("select");
  const [ink, setInk] = useState(0);
  const [noteCol, setNoteCol] = useState(0);
  const [sw, setSw] = useState(3);
  const [sel, setSel] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>(initialView);
  const [draft, setDraft] = useState<WbElement | null>(null);
  const [tplOpen, setTplOpen] = useState(false);
  const [tplMounted, setTplMounted] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const vpRef = useRef<HTMLDivElement>(null);
  const opRef = useRef<OpState | null>(null);
  const draftRef = useRef<WbElement | null>(null);
  const viewRef = useRef(view);

  useImperativeHandle(
    ref,
    () => ({
      exportImage: () => exportBoardImageBase64(els),
    }),
    [els],
  );

  useEffect(() => {
    setTplMounted(true);
  }, []);

  useEffect(() => {
    onSubdialogOpenChange?.(tplOpen);
  }, [tplOpen, onSubdialogOpenChange]);

  useEffect(() => {
    if (!tplOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTplOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tplOpen]);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const toWorld = useCallback((clientX: number, clientY: number) => {
    const r = vpRef.current!.getBoundingClientRect();
    const v = viewRef.current;
    return {
      x: (clientX - r.left - v.tx) / v.k,
      y: (clientY - r.top - v.ty) / v.k,
    };
  }, []);

  const add = useCallback((el: WbElement) => {
    setEls((a) => a.concat(el));
    return el;
  }, []);

  const upd = useCallback((id: string, patch: Partial<WbElement>) => {
    setEls((a) => a.map((x) => (x.id === id ? ({ ...x, ...patch } as WbElement) : x)));
  }, []);

  const del = useCallback(
    (id: string) => {
      setEls((a) => a.filter((x) => x.id !== id));
      if (sel === id) setSel(null);
    },
    [sel],
  );

  const bringFront = useCallback((id: string) => {
    setEls((a) => {
      const i = a.findIndex((x) => x.id === id);
      if (i < 0) return a;
      const n = a.slice();
      const [el] = n.splice(i, 1);
      n.push(el);
      return n;
    });
  }, []);

  const creating = ["pen", "rect", "ellipse", "arrow", "text", "note"].includes(tool);

  const zoomBy = useCallback((factor: number, cx?: number, cy?: number) => {
    setView((v) => {
      const k = Math.max(0.25, Math.min(3, v.k * factor));
      const r = vpRef.current!.getBoundingClientRect();
      const px = cx ?? r.width / 2;
      const py = cy ?? r.height / 2;
      const wx = (px - v.tx) / v.k;
      const wy = (py - v.ty) / v.k;
      return { k, tx: px - wx * k, ty: py - wy * k };
    });
  }, []);

  const fit = () => setView({ tx: 0, ty: 0, k: 1 });

  const onOpMove = useCallback(
    (e: PointerEvent) => {
      const o = opRef.current;
      if (!o) return;
      if (o.kind === "pan") {
        setView((v) => ({
          k: v.k,
          tx: o.tx + (e.clientX - o.sx),
          ty: o.ty + (e.clientY - o.sy),
        }));
        return;
      }
      const w = toWorld(e.clientX, e.clientY);
      if (o.kind === "pen") {
        setDraft((d) =>
          d && d.type === "path"
            ? { ...d, pts: d.pts.concat([[w.x, w.y]]) }
            : d,
        );
      } else if (o.kind === "shape") {
        setDraft((d) =>
          d && (d.type === "rect" || d.type === "ellipse")
            ? {
                ...d,
                x: Math.min(o.sx, w.x),
                y: Math.min(o.sy, w.y),
                w: Math.abs(w.x - o.sx),
                h: Math.abs(w.y - o.sy),
              }
            : d,
        );
      } else if (o.kind === "arrow") {
        setDraft((d) =>
          d && d.type === "arrow" ? { ...d, x2: w.x, y2: w.y } : d,
        );
      } else if (o.kind === "move") {
        upd(o.id, { x: o.ox + (w.x - o.wx), y: o.oy + (w.y - o.wy) });
      } else if (o.kind === "moveArrow") {
        upd(o.id, {
          x1: o.x1 + (w.x - o.wx),
          y1: o.y1 + (w.y - o.wy),
          x2: o.x2 + (w.x - o.wx),
          y2: o.y2 + (w.y - o.wy),
        });
      }
    },
    [toWorld, upd],
  );

  const onOpUp = useCallback(() => {
    const o = opRef.current;
    opRef.current = null;
    setIsPanning(false);
    window.removeEventListener("pointermove", onOpMove);
    window.removeEventListener("pointerup", onOpUp);
    if (!o) return;
    if (o.kind === "pen" || o.kind === "shape" || o.kind === "arrow") {
      const d = draftRef.current;
      if (d) {
        if (d.type === "path" && d.pts.length > 1) add(d);
        else if ((d.type === "rect" || d.type === "ellipse") && d.w > 6 && d.h > 6) add(d);
        else if (
          d.type === "arrow" &&
          (Math.abs(d.x2 - d.x1) > 6 || Math.abs(d.y2 - d.y1) > 6)
        )
          add(d);
      }
      setDraft(null);
    }
  }, [add, onOpMove]);

  const bindOp = useCallback(() => {
    window.addEventListener("pointermove", onOpMove);
    window.addEventListener("pointerup", onOpUp);
  }, [onOpMove, onOpUp]);

  const startPan = useCallback(
    (e: React.PointerEvent) => {
      opRef.current = {
        kind: "pan",
        sx: e.clientX,
        sy: e.clientY,
        tx: viewRef.current.tx,
        ty: viewRef.current.ty,
      };
      setIsPanning(true);
      bindOp();
    },
    [bindOp],
  );

  const onVpDown = (e: React.PointerEvent) => {
    if (e.button === 1) {
      startPan(e);
      return;
    }
    const w = toWorld(e.clientX, e.clientY);
    if (tool === "select" || tool === "hand") {
      setSel(null);
      setEditing(null);
      startPan(e);
      return;
    }
    if (tool === "note") {
      const el = add(wbpNote(w.x - 75, w.y - 45, "", noteCol));
      setSel(el.id);
      setEditing(el.id);
      return;
    }
    if (tool === "text") {
      const el = add(wbpText(w.x, w.y - 10, "", { color: WBP_INK[ink] }));
      setSel(el.id);
      setEditing(el.id);
      return;
    }
    if (tool === "pen") {
      opRef.current = { kind: "pen", id: wbpId() };
      setDraft({
        id: opRef.current.id,
        type: "path",
        pts: [[w.x, w.y]],
        color: WBP_INK[ink],
        sw,
      });
      bindOp();
      return;
    }
    if (tool === "rect" || tool === "ellipse") {
      opRef.current = { kind: "shape", sx: w.x, sy: w.y };
      setDraft({
        id: wbpId(),
        type: tool,
        x: w.x,
        y: w.y,
        w: 0,
        h: 0,
        color: WBP_INK[ink],
        fill: "transparent",
        sw,
      });
      bindOp();
      return;
    }
    if (tool === "arrow") {
      opRef.current = { kind: "arrow" };
      setDraft({
        id: wbpId(),
        type: "arrow",
        x1: w.x,
        y1: w.y,
        x2: w.x,
        y2: w.y,
        color: WBP_INK[ink],
        sw,
      });
      bindOp();
    }
  };

  const elDown = (e: React.PointerEvent, el: WbElement) => {
    if ((e.target as HTMLElement).closest("textarea")) return;
    if (tool === "eraser") {
      e.stopPropagation();
      del(el.id);
      return;
    }
    if (tool !== "select") return;
    e.stopPropagation();
    setSel(el.id);
    bringFront(el.id);
    const w = toWorld(e.clientX, e.clientY);
    if (el.type === "arrow") {
      opRef.current = {
        kind: "moveArrow",
        id: el.id,
        wx: w.x,
        wy: w.y,
        x1: el.x1,
        y1: el.y1,
        x2: el.x2,
        y2: el.y2,
      };
    } else if ("x" in el && "y" in el) {
      opRef.current = {
        kind: "move",
        id: el.id,
        wx: w.x,
        wy: w.y,
        ox: el.x,
        oy: el.y,
      };
    }
    bindOp();
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const r = vpRef.current!.getBoundingClientRect();
      zoomBy(e.deltaY < 0 ? 1.1 : 0.9, e.clientX - r.left, e.clientY - r.top);
    } else {
      setView((v) => ({ tx: v.tx - e.deltaX, ty: v.ty - e.deltaY, k: v.k }));
    }
  };

  const insertTpl = (t: (typeof WBP_TEMPLATES)[number]) => {
    const vp = vpRef.current;
    if (!vp) return;
    const r = vp.getBoundingClientRect();
    const v = viewRef.current;
    const ox = (r.width / 2 - v.tx) / v.k - 250;
    const oy = (r.height / 2 - v.ty) / v.k - 150;
    setEls((a) => a.concat(t.build(Math.max(20, ox), Math.max(20, oy))));
    setTplOpen(false);
    setTool("select");
    setSel(null);
  };

  useEffect(() => {
    setEls(initialElements);
    setView(initialView);
    setSel(null);
    setEditing(null);
    setDraft(null);
  }, [boardId]);

  useEffect(() => {
    onElementsChange?.(els, view);
  }, [els, view, onElementsChange]);

  const saveBoard = async () => {
    const defaultName = boardName || `Tableau ${new Date().toLocaleDateString("fr-CA")}`;
    const name = (
      boardId
        ? defaultName
        : window.prompt("Nom du tableau à enregistrer :", defaultName) || ""
    ).trim();
    if (!name) return;

    if (onSave) {
      await onSave({ name, elements: els, view });
      setSaveToast(name);
      window.setTimeout(() => setSaveToast(""), 2600);
      return;
    }

    try {
      const list = JSON.parse(localStorage.getItem(WHITEBOARD_STORAGE_KEY) || "[]") as {
        id: string;
        name: string;
        els: WbElement[];
        createdAt: number;
      }[];
      list.unshift({ id: `wb${Date.now()}`, name, els, createdAt: Date.now() });
      localStorage.setItem(WHITEBOARD_STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
    setSaveToast(name);
    window.setTimeout(() => setSaveToast(""), 2600);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (sel) del(sel);
      }
      const shortcuts: Record<string, WhiteboardTool> = {
        v: "select",
        h: "hand",
        p: "pen",
        n: "note",
        t: "text",
        r: "rect",
        e: "ellipse",
        a: "arrow",
      };
      const next = shortcuts[e.key.toLowerCase()];
      if (next && !e.ctrlKey && !e.metaKey) {
        setTool(next);
        setSel(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [del, sel]);

  const selEl = els.find((x) => x.id === sel);
  const allDraw = draft ? els.concat(draft) : els;
  const vector = allDraw.filter((x) =>
    ["path", "rect", "ellipse", "arrow"].includes(x.type),
  );
  const html = allDraw.filter((x) => ["note", "text"].includes(x.type));
  const childPE = tool === "select" || tool === "eraser" ? "auto" : "none";

  const cursor =
    isPanning || (opRef.current?.kind === "pan")
      ? "grabbing"
      : tool === "hand"
        ? "grab"
        : tool === "select"
          ? "default"
          : tool === "eraser"
            ? "cell"
            : "crosshair";

  const helpText =
    tool === "select"
      ? "Glissez le fond pour naviguer · molette pour défiler · Ctrl+molette pour zoomer"
      : tool === "pen"
        ? "Dessinez en glissant"
        : tool === "note"
          ? "Cliquez pour poser une note"
          : tool === "text"
            ? "Cliquez pour écrire"
            : tool === "eraser"
              ? "Cliquez un élément pour l'effacer"
              : "Glissez pour tracer";

  const showColorPalette =
    (creating && tool !== "note") ||
    (selEl && ["path", "rect", "ellipse", "arrow", "text"].includes(selEl.type));

  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card shadow-sm",
          className,
        )}
        style={{ height }}
        data-testid="whiteboard-board"
      >
        <div
          ref={vpRef}
          onPointerDown={onVpDown}
          onWheel={onWheel}
          className="absolute inset-0 touch-none"
          style={{
            cursor,
            backgroundImage: "radial-gradient(#e2e8f0 1.2px, transparent 1.2px)",
            backgroundSize: `${22 * view.k}px ${22 * view.k}px`,
            backgroundPosition: `${view.tx}px ${view.ty}px`,
          }}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              transform: `translate(${view.tx}px,${view.ty}px) scale(${view.k})`,
              transformOrigin: "0 0",
            }}
          >
            <svg
              width={6000}
              height={4000}
              className="pointer-events-none absolute left-0 top-0 overflow-visible"
            >
              <defs>
                {WBP_MARKER_COLORS.map((c, i) => (
                  <marker
                    key={i}
                    id={`wbar${i}`}
                    markerWidth="10"
                    markerHeight="10"
                    refX="7"
                    refY="5"
                    orient="auto"
                  >
                    <path d="M0 0L8 5L0 10z" fill={c} />
                  </marker>
                ))}
              </defs>
              {vector.map((el) => {
                const isSel = el.id === sel;
                const pe = childPE;
                if (el.type === "path") {
                  return (
                    <polyline
                      key={el.id}
                      points={el.pts.map((p) => p.join(",")).join(" ")}
                      fill="none"
                      stroke={el.color}
                      strokeWidth={el.sw}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        pointerEvents: pe,
                        cursor: tool === "select" ? "move" : undefined,
                      }}
                      onPointerDown={(e) => elDown(e, el)}
                    />
                  );
                }
                if (el.type === "rect") {
                  return (
                    <rect
                      key={el.id}
                      x={el.x}
                      y={el.y}
                      width={el.w}
                      height={el.h}
                      rx={6}
                      fill={el.fill}
                      stroke={isSel ? "#2563eb" : el.color}
                      strokeWidth={el.sw}
                      style={{
                        pointerEvents: pe,
                        cursor: tool === "select" ? "move" : undefined,
                      }}
                      onPointerDown={(e) => elDown(e, el)}
                    />
                  );
                }
                if (el.type === "ellipse") {
                  return (
                    <ellipse
                      key={el.id}
                      cx={el.x + el.w / 2}
                      cy={el.y + el.h / 2}
                      rx={el.w / 2}
                      ry={el.h / 2}
                      fill={el.fill}
                      stroke={isSel ? "#2563eb" : el.color}
                      strokeWidth={el.sw}
                      style={{
                        pointerEvents: pe,
                        cursor: tool === "select" ? "move" : undefined,
                      }}
                      onPointerDown={(e) => elDown(e, el)}
                    />
                  );
                }
                if (el.type === "arrow") {
                  const mi = WBP_MARKER_COLORS.indexOf(el.color);
                  return (
                    <line
                      key={el.id}
                      x1={el.x1}
                      y1={el.y1}
                      x2={el.x2}
                      y2={el.y2}
                      stroke={isSel ? "#2563eb" : el.color}
                      strokeWidth={el.sw}
                      strokeLinecap="round"
                      markerEnd={`url(#wbar${mi < 0 ? 0 : mi})`}
                      style={{ pointerEvents: pe }}
                      onPointerDown={(e) => elDown(e, el)}
                    />
                  );
                }
                return null;
              })}
            </svg>

            {(html as Array<Extract<WbElement, { type: "note" } | { type: "text" }>>).map((el) => {
              const isSel = el.id === sel;
              if (el.type === "note") {
                const col = WBP_NOTE[el.c] || WBP_NOTE[0];
                return (
                  <div
                    key={el.id}
                    onPointerDown={(e) => elDown(e, el)}
                    className="absolute flex flex-col rounded-xl p-2 shadow-md"
                    style={{
                      left: el.x,
                      top: el.y,
                      width: el.w,
                      height: el.h,
                      boxSizing: "border-box",
                      background: col.bg,
                      border: `1px solid ${col.bd}`,
                      outline: isSel ? "2px solid #2563eb" : "none",
                      pointerEvents: childPE,
                      cursor:
                        tool === "select" ? "move" : tool === "eraser" ? "cell" : "default",
                    }}
                  >
                    <textarea
                      value={el.text}
                      autoFocus={editing === el.id}
                      onPointerDown={(e) => {
                        if (tool === "select") e.stopPropagation();
                      }}
                      onFocus={() => {
                        setEditing(el.id);
                        setSel(el.id);
                      }}
                      onBlur={() => {
                        setEditing(null);
                        onEditingBlur?.();
                      }}
                      onChange={(e) => upd(el.id, { text: e.target.value })}
                      placeholder="Écrire…"
                      className="h-full w-full resize-none overflow-y-auto border-0 bg-transparent text-xs font-semibold leading-snug outline-none"
                      style={{ color: col.fg }}
                    />
                  </div>
                );
              }
              return (
                <div
                  key={el.id}
                  onPointerDown={(e) => elDown(e, el)}
                  className="absolute rounded"
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.w,
                    pointerEvents: childPE,
                    cursor: tool === "select" ? "move" : "default",
                    outline: isSel ? "2px solid #2563eb" : "none",
                  }}
                >
                  <textarea
                    value={el.text}
                    autoFocus={editing === el.id}
                    onPointerDown={(e) => {
                      if (tool === "select") e.stopPropagation();
                    }}
                    onFocus={() => {
                      setEditing(el.id);
                      setSel(el.id);
                    }}
                    onBlur={() => {
                      setEditing(null);
                      onEditingBlur?.();
                    }}
                    onChange={(e) => upd(el.id, { text: e.target.value })}
                    placeholder="Texte…"
                    rows={1}
                    className="w-full resize-none overflow-hidden border-0 bg-transparent font-bold outline-none"
                    style={{
                      fontSize: el.size,
                      color: el.color,
                      minHeight: el.size * 1.6,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute right-3 top-3 z-[6]">
          <Button size="sm" className="gap-1.5 shadow-md" onClick={() => setTplOpen(true)}>
            <Grid3x3 className="h-4 w-4" />
            Modèles
          </Button>
        </div>

        <div className="absolute left-1/2 top-3 z-[5] flex -translate-x-1/2 items-center gap-0.5 rounded-[13px] border bg-card p-1 shadow-md">
          {TOOLS.map((tl, i) => (
            <span key={tl.id} className="flex items-center">
              {(i === 2 || i === 8) && <span className="mx-0.5 h-[22px] w-px bg-border" />}
              <button
                type="button"
                title={tl.t}
                onClick={() => {
                  setTool(tl.id);
                  setSel(null);
                }}
                className={cn(
                  "flex h-[34px] w-[34px] items-center justify-center rounded-[9px] transition-colors",
                  tool === tl.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <WbToolIcon name={tl.id} />
              </button>
            </span>
          ))}
          <span className="mx-0.5 h-[22px] w-px bg-border" />
          <button
            type="button"
            title="Enregistrer le tableau"
            onClick={() => void saveBoard()}
            className="flex h-[34px] items-center gap-1.5 rounded-[9px] bg-primary/10 px-2.5 text-xs font-bold text-primary"
          >
            <FileText className="h-4 w-4" />
            {boardId ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>

        {saveToast && (
          <div className="absolute left-1/2 top-14 z-[9] flex -translate-x-1/2 items-center gap-2 rounded-[10px] bg-foreground px-3.5 py-2 text-xs font-semibold text-background shadow-lg">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            « {saveToast} » enregistré
          </div>
        )}

        {showColorPalette && !paletteOpen && (
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="absolute left-3 top-16 z-[6] flex h-9 items-center gap-2 rounded-[11px] border bg-card px-2.5 text-xs font-bold text-muted-foreground shadow-sm"
          >
            <span
              className="h-3.5 w-3.5 rounded border"
              style={{
                background:
                  (selEl && "color" in selEl && selEl.color) || WBP_INK[ink],
              }}
            />
            Couleur
          </button>
        )}

        {showColorPalette && paletteOpen && (
          <div className="absolute left-3 top-16 z-[5] w-[132px] rounded-xl border bg-card p-2.5 shadow-md">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                Couleur
              </span>
              <button type="button" onClick={() => setPaletteOpen(false)} className="text-muted-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mb-2.5 grid grid-cols-4 gap-1.5">
              {WBP_INK.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setInk(i);
                    if (selEl && "color" in selEl) upd(selEl.id, { color: c });
                  }}
                  className="h-6 w-6 rounded-md border-2 border-white shadow-sm ring-1 ring-border"
                  style={{
                    background: c,
                    outline:
                      (selEl && "color" in selEl ? selEl.color === c : ink === i)
                        ? "2.5px solid #0f172a"
                        : undefined,
                  }}
                />
              ))}
            </div>
            {(tool === "pen" ||
              tool === "rect" ||
              tool === "ellipse" ||
              tool === "arrow" ||
              (selEl && ["path", "rect", "ellipse", "arrow"].includes(selEl.type))) && (
              <>
                <div className="mb-1.5 text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  Épaisseur
                </div>
                <div className="flex gap-1.5">
                  {[2, 3, 5, 8].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSw(s);
                        if (selEl && "sw" in selEl) upd(selEl.id, { sw: s });
                      }}
                      className={cn(
                        "flex h-[26px] flex-1 items-center justify-center rounded-md border",
                        (selEl && "sw" in selEl ? selEl.sw === s : sw === s)
                          ? "border-primary bg-primary/10"
                          : "border-border",
                      )}
                    >
                      <span
                        className="w-4 rounded-full bg-slate-700"
                        style={{ height: s }}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
            {selEl && (selEl.type === "rect" || selEl.type === "ellipse") && (
              <>
                <div className="mb-1.5 mt-2.5 text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
                  Remplissage
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["transparent", "#eff6ff", "#ecfdf5", "#fef9c3", "#fef2f2", "#f5f3ff"].map(
                    (c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => upd(selEl.id, { fill: c })}
                        className="relative h-[22px] w-[22px] overflow-hidden rounded-md border"
                        style={{
                          background: c === "transparent" ? "#fff" : c,
                          outline:
                            selEl.fill === c ? "2.5px solid #0f172a" : "1px solid #e2e8f0",
                        }}
                      >
                        {c === "transparent" && (
                          <span className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,#ef4444_45%,#ef4444_55%,transparent_55%)]" />
                        )}
                      </button>
                    ),
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {(tool === "note" || (selEl && selEl.type === "note")) && (
          <div className="absolute left-3 top-16 z-[5] rounded-xl border bg-card p-2.5 shadow-md">
            <div className="mb-1.5 text-[10.5px] font-extrabold uppercase tracking-wide text-muted-foreground">
              Note
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {WBP_NOTE.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setNoteCol(i);
                    if (selEl?.type === "note") upd(selEl.id, { c: i });
                  }}
                  className="h-[26px] w-[26px] rounded-md border-2"
                  style={{
                    background: c.bg,
                    borderColor:
                      (selEl?.type === "note" ? selEl.c === i : noteCol === i)
                        ? c.fg
                        : c.bd,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {selEl && (
          <div className="absolute right-3 top-14 z-[7] flex gap-0.5 rounded-[10px] border bg-card p-1 shadow-md">
            <button
              type="button"
              title="Supprimer"
              onClick={() => del(selEl.id)}
              className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="absolute bottom-3 right-3 z-[5] flex items-center gap-1 rounded-[11px] border bg-card p-1 shadow-md">
          <button
            type="button"
            title="Zoom −"
            onClick={() => zoomBy(0.9)}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={fit}
            className="min-w-[52px] text-xs font-bold text-muted-foreground"
          >
            {Math.round(view.k * 100)}%
          </button>
          <button
            type="button"
            title="Zoom +"
            onClick={() => zoomBy(1.1)}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="mx-0.5 h-[18px] w-px bg-border" />
          <button
            type="button"
            title="Réinitialiser la vue"
            onClick={fit}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 z-[4] rounded-lg bg-white/85 px-2.5 py-1 text-[11.5px] text-muted-foreground">
          {helpText}
        </div>
      </div>

      {tplMounted &&
        tplOpen &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 flex items-center justify-center p-4",
              METHOD_OVERLAY_POPOVER_Z,
            )}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Fermer"
              onClick={() => setTplOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="wb-tpl-title"
              className="relative w-full max-w-[620px] overflow-hidden rounded-[20px] border bg-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setTplOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-sm text-muted-foreground hover:text-foreground"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="border-b px-5 py-4">
                <h2 id="wb-tpl-title" className="text-left text-lg font-extrabold">
                  Importer un modèle
                </h2>
                <p className="text-left text-sm text-muted-foreground">
                  Ajouté au tableau, repositionnable
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4">
                {WBP_TEMPLATES.map((t) => {
                  const pal = TEMPLATE_PAL[t.color] || TEMPLATE_PAL.blue;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => insertTpl(t)}
                      className="rounded-[14px] border bg-card p-3 text-left transition-all hover:border-primary hover:shadow-md"
                    >
                      <div
                        className="mb-2 flex h-[70px] items-center justify-center rounded-lg"
                        style={{ background: pal.bg, color: pal.fg }}
                      >
                        <TemplateThumb id={t.id} />
                      </div>
                      <p className="text-sm font-extrabold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
              <div className="border-t px-4 pb-4 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setEls([]);
                    setTplOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Vider le tableau
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
});
