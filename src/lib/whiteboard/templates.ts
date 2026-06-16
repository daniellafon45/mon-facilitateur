import { wbpArrow, wbpNote, wbpRect, wbpText, type WbElement } from "@/lib/whiteboard/elements";

export interface WhiteboardTemplate {
  id: string;
  name: string;
  desc: string;
  color: string;
  build: (ox: number, oy: number) => WbElement[];
}

export const WBP_TEMPLATES: WhiteboardTemplate[] = [
  {
    id: "bmc",
    name: "Business Model Canvas",
    desc: "9 blocs",
    color: "blue",
    build: (ox, oy) => {
      const W = 190,
        H = 150,
        g = 10;
      const els: WbElement[] = [];
      const cell = (cx: number, cy: number, w: number, h: number, title: string, fill?: string) => {
        els.push(wbpRect(cx, cy, w, h, { fill: fill || "#ffffff", color: "#cbd5e1" }));
        els.push(wbpText(cx + 10, cy + 10, title, { size: 12, color: "#475569", w: w - 20 }));
      };
      cell(ox, oy, W, H * 2 + g, "Partenaires clés", "#eff6ff");
      cell(ox + W + g, oy, W, H, "Activités clés", "#f5f3ff");
      cell(ox + W + g, oy + H + g, W, H, "Ressources clés", "#f5f3ff");
      cell(ox + (W + g) * 2, oy, W, H * 2 + g, "Proposition de valeur", "#ecfdf5");
      cell(ox + (W + g) * 3, oy, W, H, "Relations clients", "#fff7ed");
      cell(ox + (W + g) * 3, oy + H + g, W, H, "Canaux", "#fff7ed");
      cell(ox + (W + g) * 4, oy, W, H * 2 + g, "Segments clients", "#fef2f2");
      cell(ox, oy + (H * 2 + g) + g, (W + g) * 2.5 - g, H, "Structure de coûts", "#f8fafc");
      cell(ox + (W + g) * 2.5, oy + (H * 2 + g) + g, (W + g) * 2.5 - g, H, "Flux de revenus", "#f8fafc");
      return els;
    },
  },
  {
    id: "swot",
    name: "SWOT / FFOM",
    desc: "4 quadrants",
    color: "green",
    build: (ox, oy) => {
      const W = 250,
        H = 180,
        g = 12;
      const els: WbElement[] = [];
      const q = (cx: number, cy: number, t: string, fill: string, col: string) => {
        els.push(wbpRect(cx, cy, W, H, { fill, color: col }));
        els.push(wbpText(cx + 14, cy + 12, t, { size: 15, color: col, w: W - 28 }));
      };
      q(ox, oy, "Forces", "#ecfdf5", "#059669");
      q(ox + W + g, oy, "Faiblesses", "#fef2f2", "#dc2626");
      q(ox, oy + H + g, "Opportunités", "#eff6ff", "#2563eb");
      q(ox + W + g, oy + H + g, "Menaces", "#fff7ed", "#d97706");
      return els;
    },
  },
  {
    id: "matrix",
    name: "Matrice 2×2",
    desc: "Impact / Effort",
    color: "violet",
    build: (ox, oy) => {
      const S = 420;
      const els: WbElement[] = [
        wbpRect(ox, oy, S, S, { fill: "#ffffff", color: "#cbd5e1" }),
        wbpArrow(ox, oy + S / 2, ox + S, oy + S / 2, { color: "#cbd5e1", sw: 1.5 }),
        wbpArrow(ox + S / 2, oy + S, ox + S / 2, oy, { color: "#cbd5e1", sw: 1.5 }),
        wbpText(ox + 14, oy + 12, "Gains rapides", { size: 13, color: "#059669" }),
        wbpText(ox + S / 2 + 14, oy + 12, "Grands projets", { size: 13, color: "#2563eb" }),
        wbpText(ox + 14, oy + S - 28, "À combler", { size: 13, color: "#64748b" }),
        wbpText(ox + S / 2 + 14, oy + S - 28, "Ingrat", { size: 13, color: "#dc2626" }),
        wbpText(ox + S / 2 - 30, oy - 26, "Impact ↑", { size: 12, color: "#94a3b8" }),
        wbpText(ox + S + 10, oy + S / 2 - 8, "Effort →", { size: 12, color: "#94a3b8" }),
      ];
      return els;
    },
  },
  {
    id: "kanban",
    name: "Kanban",
    desc: "En attente · En cours · Achevé",
    color: "amber",
    build: (ox, oy) => {
      const W = 210,
        H = 360,
        g = 14;
      const els: WbElement[] = [];
      const cols: [string, string, string][] = [
        ["En attente", "#f8fafc", "#64748b"],
        ["En cours", "#eff6ff", "#2563eb"],
        ["Achevé", "#ecfdf5", "#059669"],
      ];
      cols.forEach((c, i) => {
        const cx = ox + i * (W + g);
        els.push(wbpRect(cx, oy, W, H, { fill: c[1], color: "#e2e8f0" }));
        els.push(wbpText(cx + 14, oy + 12, c[0], { size: 15, color: c[2] }));
      });
      els.push(wbpNote(ox + 30, oy + 56, "Cadrer le besoin", 0));
      els.push(wbpNote(ox + 30, oy + 158, "Lister les idées", 0));
      els.push(wbpNote(ox + (W + g) + 30, oy + 56, "Prototype v1", 1));
      els.push(wbpNote(ox + (W + g) * 2 + 30, oy + 56, "Recherche", 2));
      return els;
    },
  },
  {
    id: "mindmap",
    name: "Carte mentale",
    desc: "Nœud central",
    color: "violet",
    build: (ox, oy) => {
      const els: WbElement[] = [];
      const cx = ox + 230,
        cy = oy + 180;
      els.push(wbpRect(cx - 70, cy - 30, 140, 60, { fill: "#ede9fe", color: "#7c3aed" }));
      els.push(wbpText(cx - 55, cy - 12, "Sujet central", { size: 14, color: "#5b21b6" }));
      const branch: [number, number, string, number][] = [
        [-180, -140, "Idée 1", 1],
        [180, -140, "Idée 2", 2],
        [-180, 150, "Idée 3", 3],
        [180, 150, "Idée 4", 5],
      ];
      branch.forEach((b) => {
        const bx = cx + b[0],
          by = cy + b[1];
        els.push(wbpArrow(cx, cy, bx + 70, by + 30, { color: "#c4b5fd", sw: 2 }));
        els.push(wbpNote(bx, by, b[2], b[3]));
      });
      return els;
    },
  },
  {
    id: "flow",
    name: "Parcours / Flux",
    desc: "Étapes reliées",
    color: "blue",
    build: (ox, oy) => {
      const els: WbElement[] = [];
      const W = 150,
        H = 80,
        g = 70;
      const steps = ["Découverte", "Cadrage", "Idéation", "Décision"];
      steps.forEach((s, i) => {
        const cx = ox + i * (W + g);
        els.push(wbpRect(cx, oy, W, H, { fill: "#eff6ff", color: "#2563eb" }));
        els.push(wbpText(cx + 14, oy + 30, s, { size: 14, color: "#1e40af" }));
        if (i < steps.length - 1) {
          els.push(wbpArrow(cx + W, oy + H / 2, cx + W + g, oy + H / 2, { color: "#93c5fd", sw: 2.5 }));
        }
      });
      return els;
    },
  },
];
