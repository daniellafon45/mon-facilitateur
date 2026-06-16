"use client";

import { FilesystemItem, type FilesystemNode } from "@/components/ui/filesystem-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DocumentsTreeViewProps {
  nodes: FilesystemNode[];
  animated?: boolean;
  compact?: boolean;
  selectedId?: string | null;
  onFileClick?: (docId: string) => void;
  className?: string;
}

export function DocumentsTreeView({
  nodes,
  animated = true,
  compact = false,
  selectedId,
  onFileClick,
  className,
}: DocumentsTreeViewProps) {
  if (nodes.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", compact ? "py-2" : "px-6 py-8 text-center")}>
        Aucun élément à afficher
      </p>
    );
  }

  const list = (
    <ul className={cn(compact ? "space-y-0.5" : "space-y-1")}>
      {nodes.map((node) => (
        <FilesystemItem
          key={`${node.docId ?? node.name}`}
          node={node}
          animated={animated}
          onFileClick={onFileClick}
          selectedId={selectedId}
        />
      ))}
    </ul>
  );

  if (compact) {
    return <div className={cn("text-sm", className)}>{list}</div>;
  }

  return (
    <ScrollArea className={cn("max-h-[min(70vh,640px)]", className)}>
      <div className="p-4">{list}</div>
    </ScrollArea>
  );
}
