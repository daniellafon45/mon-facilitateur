"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardVisual } from "@/components/wizard/wizard-visual";

export interface WizardOptionCardProps {
  imageSrc?: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  title: string;
  subtitle?: string;
  selected?: boolean;
  color?: string;
  fg?: string;
  bg?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  imageHeight?: string;
  layout?: "vertical" | "horizontal";
  trailing?: ReactNode;
  testId?: string;
  roundedImage?: boolean;
}

export function WizardOptionCard({
  imageSrc,
  icon: Icon,
  title,
  subtitle,
  selected = false,
  fg = "var(--primary)",
  bg = "var(--muted)",
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  className,
  imageHeight = "h-[100px]",
  layout = "vertical",
  trailing,
  testId,
  roundedImage = true,
}: WizardOptionCardProps) {
  const isHorizontal = layout === "horizontal";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      data-testid={testId}
      className={cn(
        "group relative text-left transition-all duration-200 active:scale-[0.98]",
        isHorizontal
          ? "flex w-full items-start gap-3 rounded-xl border bg-background p-3"
          : "flex w-full flex-col rounded-xl border bg-background p-3.5",
        selected
          ? "border-primary ring-2 ring-primary/20 shadow-sm"
          : "border-border hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
        className,
      )}
    >
      {selected && (
        <span className="absolute right-2.5 top-2.5 z-10 flex size-[22px] items-center justify-center rounded-full bg-primary text-white shadow-sm">
          <Check className="size-3" />
        </span>
      )}

      {isHorizontal ? (
        <div
          className={cn(
            "relative size-14 shrink-0 overflow-hidden",
            roundedImage ? "rounded-lg" : "rounded-md",
          )}
        >
          <WizardVisual
            imageSrc={imageSrc}
            icon={Icon}
            alt={title}
            fill
            imageClassName={cn("transition-transform duration-300 group-hover:scale-105", roundedImage && "rounded-lg")}
            iconClassName="absolute inset-0 m-auto size-5"
            iconStyle={{ color: fg }}
            className={cn(!imageSrc && "flex items-center justify-center", !imageSrc && roundedImage && "rounded-lg")}
          />
          {!imageSrc && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-lg"
              style={{ background: bg, color: fg }}
            >
              <Icon className="size-5" />
            </div>
          )}
        </div>
      ) : (
        <div className={cn("relative mb-3 w-full overflow-hidden", imageHeight, roundedImage && "rounded-xl")}>
          <WizardVisual
            imageSrc={imageSrc}
            icon={Icon}
            alt={title}
            fill
            imageClassName={cn(
              "transition-transform duration-300 group-hover:scale-105",
              roundedImage && "rounded-xl",
            )}
            iconClassName="absolute inset-0 m-auto size-8"
            iconStyle={{ color: fg }}
          />
          <div
            className={cn("pointer-events-none absolute inset-0", roundedImage && "rounded-xl")}
            style={{ background: `linear-gradient(160deg, ${bg}88, transparent)` }}
          />
          {!imageSrc && (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                roundedImage && "rounded-xl",
              )}
              style={{ background: `linear-gradient(160deg, ${bg}, var(--background))` }}
            >
              <div
                className="flex size-14 items-center justify-center rounded-xl"
                style={{ color: fg, background: bg }}
              >
                <Icon className="size-7" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className={cn("min-w-0 flex-1", isHorizontal ? "" : "")}>
        <p className={cn("font-extrabold leading-tight", isHorizontal ? "text-sm" : "pr-6 text-sm")}>{title}</p>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {trailing}
    </button>
  );
}
