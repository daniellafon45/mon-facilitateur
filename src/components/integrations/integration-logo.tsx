import type { ProviderCatalogEntry } from "@/lib/integrations/types";
import { cn } from "@/lib/utils";

export function IntegrationLogo({
  name,
  color,
  bg,
  size = 40,
  className,
}: {
  name: string;
  color: string;
  bg: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-[10px] font-extrabold", className)}
      style={{
        width: size,
        height: size,
        background: bg,
        border: `1px solid ${color}30`,
        fontSize: size * 0.36,
        color,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function providerMatchesSearch(entry: ProviderCatalogEntry, q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  return (
    entry.name.toLowerCase().includes(query) ||
    entry.category.toLowerCase().includes(query) ||
    entry.desc.toLowerCase().includes(query)
  );
}
