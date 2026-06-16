"use client";

interface PizzaSVGProps {
  used: number;
  total?: number;
  size?: number;
}

export function PizzaSVG({ used, total = 5, size = 90 }: PizzaSVGProps) {
  const cx = 50;
  const cy = 50;
  const r = 44;
  const sliceAngle = (2 * Math.PI) / total;
  const full = used >= total;

  const slicePath = (i: number) => {
    const s = -Math.PI / 2 + i * sliceAngle;
    const e = s + sliceAngle - 0.04;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`;
  };

  const usedFill = full ? "#f97316" : "#fbbf24";
  const unusedFill = "#fef9c3";

  const toppings = Array.from({ length: Math.min(used, total) }).map((_, i) => {
    const mid = -Math.PI / 2 + (i + 0.5) * sliceAngle;
    return { x: cx + 26 * Math.cos(mid), y: cy + 26 * Math.sin(mid) };
  });

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <circle cx={cx} cy={cy} r={r + 3} fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
      {Array.from({ length: total }).map((_, i) => (
        <path
          key={i}
          d={slicePath(i)}
          fill={i < used ? usedFill : unusedFill}
          stroke="white"
          strokeWidth="2"
        />
      ))}
      {toppings.map((t, i) => (
        <circle key={i} cx={t.x} cy={t.y} r={4} fill="#dc2626" opacity={0.75} />
      ))}
      <circle cx={cx} cy={cy} r={7} fill="#fde68a" stroke="white" strokeWidth="2" />
    </svg>
  );
}
