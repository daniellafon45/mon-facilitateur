"use client";

import { AssistantAvatar } from "@/components/ui/assistant-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WizardAmarisButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function WizardAmarisButton({
  onClick,
  label = "Laisser Amaris recommander",
  className,
}: WizardAmarisButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("shrink-0 gap-2 rounded-xl", className)}
      onClick={onClick}
    >
      <AssistantAvatar sizeClassName="h-5 w-5" />
      {label}
    </Button>
  );
}
