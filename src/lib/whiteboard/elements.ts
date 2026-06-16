let _wbpId = 1;
export const wbpId = () => `e${_wbpId++}${Math.random().toString(36).slice(2, 5)}`;

export type WbPathEl = {
  id: string;
  type: "path";
  pts: [number, number][];
  color: string;
  sw: number;
};

export type WbRectEl = {
  id: string;
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  fill: string;
  sw: number;
};

export type WbEllipseEl = {
  id: string;
  type: "ellipse";
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  fill: string;
  sw: number;
};

export type WbArrowEl = {
  id: string;
  type: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  sw: number;
};

export type WbNoteEl = {
  id: string;
  type: "note";
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  c: number;
};

export type WbTextEl = {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  w: number;
};

export type WbElement = WbPathEl | WbRectEl | WbEllipseEl | WbArrowEl | WbNoteEl | WbTextEl;

export function wbpText(x: number, y: number, text: string, o?: Partial<WbTextEl>): WbTextEl {
  return {
    id: wbpId(),
    type: "text",
    x,
    y,
    text,
    color: "#1e293b",
    size: 15,
    w: 200,
    ...o,
  };
}

export function wbpRect(x: number, y: number, w: number, h: number, o?: Partial<WbRectEl>): WbRectEl {
  return {
    id: wbpId(),
    type: "rect",
    x,
    y,
    w,
    h,
    color: "#94a3b8",
    fill: "transparent",
    sw: 2,
    ...o,
  };
}

export function wbpNote(x: number, y: number, text: string, c = 0): WbNoteEl {
  return { id: wbpId(), type: "note", x, y, w: 150, h: 90, text, c };
}

export function wbpArrow(x1: number, y1: number, x2: number, y2: number, o?: Partial<WbArrowEl>): WbArrowEl {
  return {
    id: wbpId(),
    type: "arrow",
    x1,
    y1,
    x2,
    y2,
    color: "#64748b",
    sw: 2,
    ...o,
  };
}
