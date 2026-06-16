import { WBP_NOTE } from "@/lib/whiteboard/constants";
import type { WbElement } from "@/lib/whiteboard/elements";
import { hasVisualBoardContent } from "@/lib/whiteboard/describe-board";

const PAD = 40;

function elementBounds(els: WbElement[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const grow = (x: number, y: number, w = 0, h = 0) => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  };

  for (const el of els) {
    if (el.type === "path" && el.pts.length) {
      for (const [x, y] of el.pts) grow(x, y);
    } else if (el.type === "rect" || el.type === "ellipse" || el.type === "note") {
      grow(el.x, el.y, el.w, el.h);
    } else if (el.type === "text") {
      grow(el.x, el.y, el.w, 24);
    } else if (el.type === "arrow") {
      grow(el.x1, el.y1);
      grow(el.x2, el.y2);
    }
  }

  if (!Number.isFinite(minX)) return { x: 0, y: 0, w: 800, h: 500 };
  return {
    x: minX - PAD,
    y: minY - PAD,
    w: Math.max(320, maxX - minX + PAD * 2),
    h: Math.max(240, maxY - minY + PAD * 2),
  };
}

function renderBoardSvg(els: WbElement[], bounds: ReturnType<typeof elementBounds>): string {
  const shapes: string[] = [];

  for (const el of els) {
    if (el.type === "path" && el.pts.length > 1) {
      const pts = el.pts.map(([x, y]) => `${x - bounds.x},${y - bounds.y}`).join(" ");
      shapes.push(
        `<polyline points="${pts}" fill="none" stroke="${el.color}" stroke-width="${el.sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    } else if (el.type === "rect") {
      shapes.push(
        `<rect x="${el.x - bounds.x}" y="${el.y - bounds.y}" width="${el.w}" height="${el.h}" rx="6" fill="${el.fill === "transparent" ? "none" : el.fill}" stroke="${el.color}" stroke-width="${el.sw}"/>`,
      );
    } else if (el.type === "ellipse") {
      shapes.push(
        `<ellipse cx="${el.x - bounds.x + el.w / 2}" cy="${el.y - bounds.y + el.h / 2}" rx="${el.w / 2}" ry="${el.h / 2}" fill="${el.fill === "transparent" ? "none" : el.fill}" stroke="${el.color}" stroke-width="${el.sw}"/>`,
      );
    } else if (el.type === "arrow") {
      shapes.push(
        `<line x1="${el.x1 - bounds.x}" y1="${el.y1 - bounds.y}" x2="${el.x2 - bounds.x}" y2="${el.y2 - bounds.y}" stroke="${el.color}" stroke-width="${el.sw}" stroke-linecap="round"/>`,
      );
    } else if (el.type === "note") {
      const col = WBP_NOTE[el.c] ?? WBP_NOTE[0];
      shapes.push(
        `<rect x="${el.x - bounds.x}" y="${el.y - bounds.y}" width="${el.w}" height="${el.h}" rx="10" fill="${col.bg}" stroke="${col.bd}" stroke-width="1"/>`,
      );
      if (el.text.trim()) {
        const escaped = el.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        shapes.push(
          `<text x="${el.x - bounds.x + 8}" y="${el.y - bounds.y + 20}" font-family="system-ui,sans-serif" font-size="12" fill="#1e293b">${escaped.slice(0, 120)}</text>`,
        );
      }
    } else if (el.type === "text" && el.text.trim()) {
      const escaped = el.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      shapes.push(
        `<text x="${el.x - bounds.x}" y="${el.y - bounds.y + 16}" font-family="system-ui,sans-serif" font-size="${el.size}" fill="${el.color}">${escaped.slice(0, 200)}</text>`,
      );
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.w}" height="${bounds.h}" viewBox="0 0 ${bounds.w} ${bounds.h}"><rect width="100%" height="100%" fill="#f8fafc"/>${shapes.join("")}</svg>`;
}

/** Exporte le tableau en PNG base64 (sans préfixe data:). Retourne null si rien à exporter visuellement. */
export async function exportBoardImageBase64(els: WbElement[]): Promise<string | null> {
  if (!hasVisualBoardContent(els) && els.length === 0) return null;

  const bounds = elementBounds(els);
  const svg = renderBoardSvg(els, bounds);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1200 / bounds.w);
    canvas.width = Math.round(bounds.w * scale);
    canvas.height = Math.round(bounds.h * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png", 0.92);
    return dataUrl.replace(/^data:image\/png;base64,/, "");
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
