import type { ReactNode } from "react";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function WbToolIcon({ name, size = 19 }: { name: string; size?: number }) {
  const icons: Record<string, ReactNode> = {
    select: <path d="M5 3l15 7-6 2.2L11 19z" {...stroke} />,
    hand: (
      <path
        d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11m0-.5V5.5a1.5 1.5 0 0 1 3 0V11m0-.5V6.5a1.5 1.5 0 0 1 3 0V13c0 3.5-2 6-5 6s-4-1.5-5.5-3.5L5 13a1.5 1.5 0 0 1 2.4-1.8L8 12z"
        {...stroke}
      />
    ),
    pen: <path d="M4 20h4L18 10a2.8 2.8 0 0 0-4-4L4 16v4z" {...stroke} />,
    note: <path d="M5 4h14v10l-5 5H5z M14 19v-5h5" {...stroke} />,
    rect: <rect x="4" y="6" width="16" height="12" rx="1.5" {...stroke} />,
    ellipse: <ellipse cx="12" cy="12" rx="9" ry="7" {...stroke} />,
    arrow: <path d="M4 18L18 6M11 6h7v7" {...stroke} />,
    text: <path d="M5 6V4h14v2M12 4v16M9 20h6" {...stroke} />,
    eraser: <path d="M4 15l7-7 7 7-4 4H8z M9 20h11" {...stroke} />,
  };

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="shrink-0">
      {icons[name]}
    </svg>
  );
}

export function TemplateThumb({ id }: { id: string }) {
  const s = { width: 46, height: 40 };
  const strokeProps = { fill: "none", stroke: "currentColor", strokeWidth: 1.5 };

  if (id === "bmc")
    return (
      <svg viewBox="0 0 46 40" style={s} {...strokeProps}>
        <rect x="2" y="4" width="8" height="26" rx="1.5" />
        <rect x="12" y="4" width="8" height="12" rx="1.5" />
        <rect x="12" y="18" width="8" height="12" rx="1.5" />
        <rect x="22" y="4" width="9" height="26" rx="1.5" />
        <rect x="33" y="4" width="11" height="26" rx="1.5" />
        <rect x="2" y="32" width="20" height="6" rx="1.5" />
        <rect x="24" y="32" width="20" height="6" rx="1.5" />
      </svg>
    );
  if (id === "swot")
    return (
      <svg viewBox="0 0 46 40" style={s} {...strokeProps}>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <rect x="25" y="4" width="18" height="14" rx="2" />
        <rect x="3" y="22" width="18" height="14" rx="2" />
        <rect x="25" y="22" width="18" height="14" rx="2" />
      </svg>
    );
  if (id === "matrix")
    return (
      <svg viewBox="0 0 46 40" style={s} {...strokeProps}>
        <rect x="5" y="4" width="36" height="32" rx="2" />
        <path d="M23 4v32M5 20h36" />
      </svg>
    );
  if (id === "kanban")
    return (
      <svg viewBox="0 0 46 40" style={s} {...strokeProps}>
        <rect x="3" y="4" width="12" height="32" rx="2" />
        <rect x="17" y="4" width="12" height="32" rx="2" />
        <rect x="31" y="4" width="12" height="32" rx="2" />
      </svg>
    );
  if (id === "mindmap")
    return (
      <svg viewBox="0 0 46 40" style={s} {...strokeProps}>
        <circle cx="23" cy="20" r="6" />
        <circle cx="7" cy="8" r="4" />
        <circle cx="39" cy="8" r="4" />
        <circle cx="7" cy="32" r="4" />
        <circle cx="39" cy="32" r="4" />
        <path d="M18 16l-8-5M28 16l8-5M18 24l-8 5M28 24l8 5" />
      </svg>
    );
  if (id === "flow")
    return (
      <svg viewBox="0 0 46 40" style={s} {...strokeProps}>
        <rect x="2" y="14" width="12" height="12" rx="2" />
        <rect x="32" y="14" width="12" height="12" rx="2" />
        <path d="M14 20h18M27 16l5 4-5 4" />
      </svg>
    );
  return null;
}
