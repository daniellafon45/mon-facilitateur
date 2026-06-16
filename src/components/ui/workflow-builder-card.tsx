"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface WorkflowCardUser {
  src: string;
  fallback: string;
}

export interface WorkflowCardAction {
  Icon: React.ElementType;
  bgColor: string;
}

export interface WorkflowBuilderCardProps {
  imageUrl: string;
  status: "Active" | "Inactive";
  lastUpdated: string;
  title: string;
  description: string;
  tags: string[];
  users: WorkflowCardUser[];
  actions: WorkflowCardAction[];
  className?: string;
  onClick?: () => void;
  onMenuClick?: (e: React.MouseEvent) => void;
}

export function WorkflowBuilderCard({
  imageUrl,
  status,
  lastUpdated,
  title,
  description,
  tags,
  users,
  actions,
  className,
  onClick,
  onMenuClick,
}: WorkflowBuilderCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const detailVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: "1rem",
      transition: { duration: 0.3, ease: "easeInOut" as const },
    },
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className={cn("w-full cursor-pointer", className)}
    >
      <Card
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className="overflow-hidden rounded-xl shadow-md transition-shadow duration-300 hover:shadow-xl"
      >
        <div className="relative h-36 w-full">
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{lastUpdated}</span>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      status === "Active" ? "bg-emerald-500" : "bg-red-500",
                    )}
                    aria-label={status}
                  />
                  <span>{status === "Active" ? "Interactif" : "Guide"}</span>
                </div>
              </div>
              <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-card-foreground">{title}</h3>
            </div>
            <button
              type="button"
              aria-label="Plus d'options"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.(e);
              }}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                key="details"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={detailVariants}
                className="overflow-hidden"
              >
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-border p-4">
          <div className="flex -space-x-2">
            {users.map((user, index) => (
              <Avatar
                key={`${user.fallback}-${index}`}
                className="h-7 w-7 border-2 border-card"
                aria-label={user.fallback}
              >
                <AvatarImage src={user.src} />
                <AvatarFallback>{user.fallback}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex items-center -space-x-2">
            {actions.map(({ Icon, bgColor }, index) => (
              <div
                key={index}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 border-card text-white",
                  bgColor,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
