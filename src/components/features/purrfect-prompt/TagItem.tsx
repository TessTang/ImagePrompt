
"use client";

import type { Tag } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react"; // Removed GripVertical
import type React from "react";

interface TagItemProps {
  tag: Tag;
  isSelected: boolean;
  onSelect: (tagId: string, selected: boolean) => void;
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, tagId: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetTagId: string) => void;
}

export function TagItem({
  tag,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  isDragging,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: TagItemProps) {
  
  const handleTextClick = () => {
    onSelect(tag.id, !isSelected);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onEdit(tag);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onDelete(tag.id);
  };

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, tag.id)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, tag.id)}
      className={`transition-all duration-150 ease-in-out shadow-md hover:shadow-lg ${isDragging ? 'opacity-50 ring-2 ring-primary' : 'opacity-100'} ${isSelected ? 'bg-secondary' : 'bg-card'}`}
      data-tag-id={tag.id}
    >
      <div className="flex items-center p-3 space-x-2">
        <div className="flex items-center"> {/* Removed space-x-2 as drag handle is gone */}
          {/* GripVertical button removed */}
          <Checkbox
            id={`tag-checkbox-${tag.id}`}
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(tag.id, !!checked)}
            aria-labelledby={`tag-category-label-${tag.id}`}
            onClick={(e) => e.stopPropagation()} 
            className="mr-2" // Add some margin to separate checkbox from text
          />
        </div>

        <div 
          className="flex-1 grid grid-cols-2 gap-x-3 items-center min-w-0 cursor-pointer"
          onClick={handleTextClick}
        >
          <div id={`tag-category-label-${tag.id}`} className="truncate font-semibold text-sm">
            {tag.category}
          </div>
          <div className="truncate text-sm">
            {tag.name}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={handleEditClick} aria-label={`編輯標籤 ${tag.name}`}>
            <Pencil size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label={`刪除標籤 ${tag.name}`}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
