"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LoaderCoreProps {
  size?: number;
  text?: string;
  className?: string;
  letterClassName?: string;
  /** Plein écran (texte clair) ou inline dans l'UI (texte foncé) */
  variant?: "fullscreen" | "inline";
}

export function AiLoaderCore({
  size = 180,
  text = "Generating",
  className,
  letterClassName,
  variant = "fullscreen",
}: LoaderCoreProps) {
  const letters = text.split("");
  const isInline = variant === "inline";
  const letterSize = isInline
    ? letters.length > 7
      ? size * 0.085
      : size * 0.11
    : size * 0.12;

  return (
    <div
      className={cn(
        "relative flex select-none items-center justify-center font-sans",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {letters.map((letter, index) => (
        <span
          key={index}
          className={cn(
            "inline-block animate-loader-letter opacity-40",
            isInline
              ? "font-medium text-slate-700"
              : "text-white dark:text-gray-800",
            letterClassName,
          )}
          style={{
            animationDelay: `${index * 0.1}s`,
            fontSize: letterSize,
          }}
        >
          {letter}
        </span>
      ))}

      <div
        className={cn(
          "absolute inset-0 rounded-full animate-loader-circle",
          isInline && "animate-loader-circle-inline",
        )}
      />
    </div>
  );
}

interface LoaderProps extends LoaderCoreProps {
  className?: string;
}

export function AiLoader({
  size = 180,
  text = "Generating",
  className,
  letterClassName,
  variant = "fullscreen",
}: LoaderProps) {
  return (
    <div
      className={cn(
        "ai-loader-backdrop fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#1a3379] via-[#0f172a] to-black dark:from-gray-100 dark:via-gray-200 dark:to-gray-300",
        className,
      )}
    >
      <AiLoaderCore
        size={size}
        text={text}
        letterClassName={letterClassName}
        variant={variant}
      />
    </div>
  );
}

/** Alias pour compatibilité avec les démos Aceternity */
export const Component = AiLoader;
