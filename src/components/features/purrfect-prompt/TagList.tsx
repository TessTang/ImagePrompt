
"use client";

import React, { useState, useRef } from 'react';
import type { Tag } from "@/types";
import { TagItem } from "./TagItem";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react"; // Keep Pencil, Trash2 for page.tsx
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import Lottie from "lottie-react";
import { loadingAnimationData } from "@/animations/catPookieAnimation";

// SortableField and SortDirection types might be needed in page.tsx now if sorting buttons are there.
// For now, TagList only receives sorted tags.

interface TagListProps {
  tags: Tag[]; // Receives filtered and sorted tags from parent
  selectedTagIds: Set<string>;
  onSelectTag: (tagId: string, selected: boolean) => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
  onReorderTags: (reorderedTags: Tag[]) => void;
  isLoading: boolean;
  // Sorting props (sortBy, sortDirection, onSortChange) are removed as column headers are moved to parent
}


export function TagList({
  tags,
  selectedTagIds,
  onSelectTag,
  onEditTag,
  onDeleteTag,
  onReorderTags,
  isLoading,
}: TagListProps) {
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
    document.querySelectorAll('[data-drag-over="true"]').forEach(el => {
        el.removeAttribute('data-drag-over');
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

    document.querySelectorAll('[data-drag-over="true"]').forEach(el => {
        if (el !== targetElement && el instanceof HTMLElement) {
            el.removeAttribute('data-drag-over');
            el.style.borderTop = ''; 
            el.style.borderBottom = '';
        }
    });

    targetElement.setAttribute('data-drag-over', 'true');
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

    const currentProcessedTags = tags; 
    const draggedItemIndex = currentProcessedTags.findIndex(tag => tag.id === draggingItemId);
    let targetItemVisualIndex = currentProcessedTags.findIndex(tag => tag.id === targetTagId);

    if (draggedItemIndex === -1 || targetItemVisualIndex === -1) {
      handleDragEnd(e);
      return;
    }
    
    let newVisualTags = [...currentProcessedTags];
    const [draggedItem] = newVisualTags.splice(draggedItemIndex, 1);
    
    targetItemVisualIndex = newVisualTags.findIndex(tag => tag.id === targetTagId);

    const targetElement = e.currentTarget as HTMLElement;
    const boundingBox = targetElement.getBoundingClientRect();
    const mouseY = e.clientY;
    const dropOnTopHalf = mouseY < boundingBox.top + boundingBox.height / 2;

    let insertAtIndex = targetItemVisualIndex;

    if (dropOnTopHalf) {
      newVisualTags.splice(insertAtIndex, 0, draggedItem);
    } else {
      newVisualTags.splice(insertAtIndex + 1, 0, draggedItem);
    }
    
    const reorderedTagsForBackend = newVisualTags.map((tag, index) => ({ ...tag, order: index }));
    onReorderTags(reorderedTagsForBackend);
    // Parent (page.tsx) should handle resetting sort to 'order'
    // onSortChange('order', 'asc'); // This line is removed as onSortChange is removed
    handleDragEnd(e); 
  };

  return (
    <div className="flex flex-col lg:h-full min-h-0"> {/* Removed space-y-1 as headers are gone */}
      {/* Column Headers are now rendered in page.tsx */}

      {isLoading ? (
         <div className="flex flex-col flex-grow justify-center items-center min-h-0 p-1">
           <Lottie animationData={loadingAnimationData} loop={true} style={{ width: 150, height: 150 }} />
         </div>
      ) : tags.length === 0 ? (
          <Card className="border-dashed border-2 flex flex-grow items-center justify-center min-h-0">
            <CardContent className="p-6 text-center flex items-center justify-center">
              <div>
                <p className="text-muted-foreground">尚無標籤，或沒有符合篩選條件的標籤。</p>
                <p className="text-sm text-muted-foreground">嘗試調整篩選或建立新標籤。</p>
              </div>
            </CardContent>
          </Card>
      ) : (
        <div className="overflow-y-auto space-y-1 pr-1 max-h-72 lg:max-h-none lg:flex-grow lg:min-h-0">
          {tags.map((tag) => (
            <TagItem
              key={tag.id}
              tag={tag}
              isSelected={selectedTagIds.has(tag.id)}
              onSelect={onSelectTag}
              onEdit={onEditTag}
              onDelete={onDeleteTag}
              isDragging={draggingItemId === tag.id}
              onDragStart={(e) => handleDragStart(e, tag.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, tag.id)}
              onDrop={(e) => handleDrop(e, tag.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

    