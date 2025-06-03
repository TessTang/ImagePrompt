
"use client";

import React, { useState, useRef } from 'react';
import type { Tag } from "@/types";
import { DraggableSelectedTagItem } from "./DraggableSelectedTagItem";
import { Card, CardContent } from "@/components/ui/card";

interface SelectedTagListProps {
  selectedTags: Tag[];
  onReorderSelected: (reorderedSelectedTags: Tag[]) => void;
  onRemoveTag: (tagId: string) => void;
}

export function SelectedTagList({ selectedTags, onReorderSelected, onRemoveTag }: SelectedTagListProps) {
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const dragOverItemId = useRef<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, tagId: string) => {
    setDraggingItemId(tagId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tagId);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggingItemId(null);
    dragOverItemId.current = null;
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    document.querySelectorAll('[data-selected-drag-over="true"]').forEach(el => {
        el.removeAttribute('data-selected-drag-over');
        if (el instanceof HTMLElement) {
            el.style.borderTop = '';
            el.style.borderBottom = '';
        }
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetTagId: string) => {
    e.preventDefault();
    if (draggingItemId === targetTagId || !draggingItemId) return;
    
    const targetElement = e.currentTarget as HTMLElement;
    const boundingBox = targetElement.getBoundingClientRect();
    const mouseY = e.clientY;
    const isOverTopHalf = mouseY < boundingBox.top + boundingBox.height / 2;

    document.querySelectorAll('[data-selected-drag-over="true"]').forEach(el => {
        if (el !== targetElement && el instanceof HTMLElement) {
            el.removeAttribute('data-selected-drag-over');
            el.style.borderTop = ''; 
            el.style.borderBottom = '';
        }
    });

    targetElement.setAttribute('data-selected-drag-over', 'true');
    if (isOverTopHalf) {
      targetElement.style.borderTop = '2px dashed hsl(var(--primary))';
      targetElement.style.borderBottom = '';
    } else {
      targetElement.style.borderBottom = '2px dashed hsl(var(--primary))';
      targetElement.style.borderTop = '';
    }
    dragOverItemId.current = targetTagId;
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetTagId: string) => {
    e.preventDefault();
    if (!draggingItemId || draggingItemId === targetTagId) {
      handleDragEnd(e);
      return;
    }

    const currentSelectedTags = [...selectedTags];
    const draggedItemIndex = currentSelectedTags.findIndex(tag => tag.id === draggingItemId);
    let targetItemIndex = currentSelectedTags.findIndex(tag => tag.id === targetTagId);

    if (draggedItemIndex === -1 || targetItemIndex === -1) {
      handleDragEnd(e);
      return;
    }
    
    const [draggedItem] = currentSelectedTags.splice(draggedItemIndex, 1);
    
    targetItemIndex = currentSelectedTags.findIndex(tag => tag.id === targetTagId);

    const targetElement = e.currentTarget as HTMLElement;
    const boundingBox = targetElement.getBoundingClientRect();
    const mouseY = e.clientY;
    const dropOnTopHalf = mouseY < boundingBox.top + boundingBox.height / 2;

    if (dropOnTopHalf) {
      currentSelectedTags.splice(targetItemIndex, 0, draggedItem);
    } else {
      currentSelectedTags.splice(targetItemIndex + 1, 0, draggedItem);
    }
    
    onReorderSelected(currentSelectedTags);
    handleDragEnd(e); 
  };

  if (selectedTags.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">從上方列表中選擇標籤以將其新增至此處。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-1 max-h-[20rem] overflow-y-auto pr-1">
      {selectedTags.map((tag) => (
        <DraggableSelectedTagItem
          key={tag.id}
          tag={tag}
          isDragging={draggingItemId === tag.id}
          onDragStart={(ev) => handleDragStart(ev, tag.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(ev) => handleDragOver(ev, tag.id)}
          onDrop={(ev) => handleDrop(ev, tag.id)}
          onRemove={onRemoveTag}
        />
      ))}
    </div>
  );
}
