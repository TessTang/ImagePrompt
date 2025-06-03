
"use client";

import type { Tag } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X } from "lucide-react";
import type React from "react";

interface DraggableSelectedTagItemProps {
  tag: Tag;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, tagId: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetTagId: string) => void;
  onRemove: (tagId: string) => void;
}

export function DraggableSelectedTagItem({
  tag,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onRemove,
}: DraggableSelectedTagItemProps) {
  
  const handleDragHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(tag.id);
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, tag.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, tag.id)}
      className={`transition-all duration-150 ease-in-out shadow-sm hover:shadow-md py-2 px-3 ${isDragging ? 'opacity-50 ring-2 ring-primary' : 'opacity-100'} bg-card`}
      data-tag-id={tag.id}
    >
      <div className="flex items-center space-x-2">
        <button
          aria-label="拖曳以重新排序"
          className="cursor-grab p-1 text-muted-foreground hover:text-foreground"
          onMouseDown={handleDragHandleMouseDown}
        >
          <GripVertical size={18} />
        </button>
        <div className="flex-1 grid grid-cols-2 gap-x-3 items-center min-w-0">
          <div className="truncate font-medium text-xs text-muted-foreground">
            {tag.category}
          </div>
          <div className="truncate text-sm font-semibold">
            {tag.name}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={handleRemoveClick}
          aria-label={`從已選標籤中移除 ${tag.name}`}
        >
          <X size={16} />
        </Button>
      </div>
    </Card>
  );
}
