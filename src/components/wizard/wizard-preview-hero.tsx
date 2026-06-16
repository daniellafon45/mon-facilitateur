"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WizardVisual } from "@/components/wizard/wizard-visual";

interface WizardPreviewHeroProps {
  imageSrc?: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  title: string;
  subtitle?: string;
  fg?: string;
  bg?: string;
  children?: ReactNode;
  className?: string;
}

export function WizardPreviewHero({
  imageSrc,
  icon: Icon,
  title,
  subtitle,
  fg = "var(--primary)",
  bg = "var(--muted)",
  children,
  className,
}: WizardPreviewHeroProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative h-[140px] w-full overflow-hidden rounded-xl">
        <WizardVisual
          imageSrc={imageSrc}
          icon={Icon}
          alt={title}
          fill
          imageClassName="rounded-xl transition-opacity duration-300"
          iconClassName="absolute inset-0 m-auto size-10"
          iconStyle={{ color: fg }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(to top, ${bg}ee 0%, transparent 60%)`,
          }}
        />
        {!imageSrc && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ background: `linear-gradient(160deg, ${bg}, var(--background))` }}
          >
            <div
              className="flex size-16 items-center justify-center rounded-xl"
              style={{ color: fg, background: bg }}
            >
              <Icon className="size-8" />
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-extrabold leading-tight text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
