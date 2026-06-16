"use client";

import Image from "next/image";
import { useState, type ComponentType, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface WizardVisualProps {
  imageSrc?: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  alt: string;
  className?: string;
  imageClassName?: string;
  iconClassName?: string;
  iconStyle?: CSSProperties;
  fill?: boolean;
}

export function WizardVisual({
  imageSrc,
  icon: Icon,
  alt,
  className,
  imageClassName,
  iconClassName,
  iconStyle,
  fill = false,
}: WizardVisualProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageSrc) && !failed;

  if (!showImage) {
    return (
      <div className={cn(fill ? "absolute inset-0 flex items-center justify-center" : "flex items-center justify-center", className)}>
        <Icon className={iconClassName} style={iconStyle} aria-hidden />
      </div>
    );
  }

  return (
    <Image
      src={imageSrc!}
      alt={alt}
      fill={fill}
      width={fill ? undefined : 64}
      height={fill ? undefined : 64}
      className={cn(fill ? "object-cover" : "size-full object-cover", imageClassName, className)}
      sizes={fill ? "(max-width: 768px) 100vw, 25vw" : "64px"}
      onError={() => setFailed(true)}
    />
  );
}
