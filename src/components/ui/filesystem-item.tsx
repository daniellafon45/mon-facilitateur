"use client";

import { useState } from "react";
import { ChevronRight, Folder, File } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export type FilesystemNode = {
  name: string;
  docId?: string;
  nodes?: FilesystemNode[];
};

interface FilesystemItemProps {
  node: FilesystemNode;
  animated?: boolean;
  onFileClick?: (docId: string) => void;
  selectedId?: string | null;
}

export function FilesystemItem({
  node,
  animated = false,
  onFileClick,
  selectedId,
}: FilesystemItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const isFile = !node.nodes;
  const isSelected = isFile && node.docId && node.docId === selectedId;

  const ChevronIcon = () =>
    animated ? (
      <motion.span
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="flex"
      >
        <ChevronRight className="size-4 text-muted-foreground" />
      </motion.span>
    ) : (
      <ChevronRight
        className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-90")}
      />
    );

  const ChildrenList = () => {
    const children = node.nodes?.map((child) => (
      <FilesystemItem
        node={child}
        key={`${child.docId ?? child.name}`}
        animated={animated}
        onFileClick={onFileClick}
        selectedId={selectedId}
      />
    ));

    if (animated) {
      return (
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="flex flex-col justify-end overflow-hidden pl-6"
            >
              {children}
            </motion.ul>
          )}
        </AnimatePresence>
      );
    }

    return isOpen ? <ul className="pl-6">{children}</ul> : null;
  };

  const handleClick = () => {
    if (isFile && node.docId) onFileClick?.(node.docId);
  };

  return (
    <li>
      <span
        role={isFile ? "button" : undefined}
        tabIndex={isFile ? 0 : undefined}
        onClick={isFile ? handleClick : undefined}
        onKeyDown={
          isFile
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick();
                }
              }
            : undefined
        }
        className={cn(
          "flex items-center gap-1.5 rounded-md py-1 pr-2 text-sm",
          isFile && "cursor-pointer hover:bg-muted/60",
          isSelected && "bg-foreground/5 font-semibold",
        )}
      >
        {node.nodes && node.nodes.length > 0 && (
          <button type="button" onClick={() => setIsOpen(!isOpen)} className="-m-1 p-1">
            <ChevronIcon />
          </button>
        )}

        {node.nodes ? (
          <Folder
            className={cn(
              "size-5 fill-sky-500 text-sky-500",
              node.nodes.length === 0 && "ml-[22px]",
            )}
          />
        ) : (
          <File className="ml-[22px] size-5 text-foreground" />
        )}
        <span className="truncate">{node.name}</span>
      </span>

      <ChildrenList />
    </li>
  );
}
