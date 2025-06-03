
"use client";

import React, { useState, useRef, useMemo } from 'react';
import type { Tag } from "@/types";
import { TagItem } from "./TagItem";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, X } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Lottie from "lottie-react";
import { loadingAnimationData } from "@/animations/catPookieAnimation";

interface TagListProps {
  tags: Tag[];
  selectedTagIds: Set<string>;
  onSelectTag: (tagId: string, selected: boolean) => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
  onReorderTags: (reorderedTags: Tag[]) => void;
  isLoading: boolean;
}

type SortableField = 'category' | 'name' | 'order';
type SortDirection = 'asc' | 'desc';

const ALL_CATEGORIES_ITEM_VALUE = "__ALL_CATEGORIES_SENTINEL__";

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
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortableField>('order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    tags.forEach(tag => {
      if (tag.category && tag.category.trim() !== '') {
        categories.add(tag.category);
      }
    });
    // Ensure "All Categories" is always an option, even if other categories exist.
    const sortedCategories = Array.from(categories).sort((a, b) => a.localeCompare(b));
    return [ALL_CATEGORIES_ITEM_VALUE, ...sortedCategories];
  }, [tags]);

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

    const currentProcessedTags = processedTags; 
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
    setSortBy('order'); 
    setSortDirection('asc');
    handleDragEnd(e); 
  };

  const handleSort = (field: SortableField) => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleCategoryChange = (valueFromSelect: string) => {
    if (valueFromSelect === ALL_CATEGORIES_ITEM_VALUE) {
      setSelectedCategory(''); 
    } else {
      setSelectedCategory(valueFromSelect);
    }
  };

  const processedTags = useMemo(() => {
    let displayTags = [...tags];

    if (selectedCategory && selectedCategory !== ALL_CATEGORIES_ITEM_VALUE) { 
      displayTags = displayTags.filter(tag => tag.category === selectedCategory);
    }

    if (filterText) {
      const lowerFilterText = filterText.toLowerCase();
      displayTags = displayTags.filter(tag =>
        (tag.category?.toLowerCase() || '').includes(lowerFilterText) ||
        (tag.name?.toLowerCase() || '').includes(lowerFilterText) ||
        (tag.content?.toLowerCase() || '').includes(lowerFilterText)
      );
    }

    if (sortBy) {
      displayTags.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (sortBy === 'order') {
            valA = a.order;
            valB = b.order;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
    }
    return displayTags;
  }, [tags, filterText, selectedCategory, sortBy, sortDirection]);

  const renderSortIcon = (field: SortableField) => {
    if (sortBy === field) {
      return sortDirection === 'asc' ? <ArrowUpDown className="h-4 w-4 inline ml-1 transform rotate-0" /> : <ArrowUpDown className="h-4 w-4 inline ml-1 transform rotate-180" />;
    }
    return <ArrowUpDown className="h-4 w-4 inline ml-1 opacity-30" />;
  };
  
  const columnHeaderButtonClass = "font-medium text-sm text-muted-foreground hover:text-foreground px-1 py-1 rounded-md w-full text-left flex items-center justify-start";
  
  // This value drives the Select component's displayed value.
  // When selectedCategory is '', it means "All Categories" is logically selected.
  const selectValueForComponent = selectedCategory === '' ? ALL_CATEGORIES_ITEM_VALUE : selectedCategory;

  return (
    <div className="space-y-1">
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <div className="flex-grow sm:min-w-[180px] md:min-w-[200px]">
            <Select
              value={selectValueForComponent}
              onValueChange={handleCategoryChange}
              disabled={isLoading || uniqueCategories.length <= 1}
            >
              <SelectTrigger className="shadow-sm w-full"> {/* Removed data-[placeholder] as it should now always show a value */}
                <SelectValue placeholder="依標籤類別篩選..." />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(categoryValue => {
                  const isAllCategoriesOption = categoryValue === ALL_CATEGORIES_ITEM_VALUE;
                  const itemDisplay = isAllCategoriesOption ? '所有類別' : categoryValue;
                  return (
                    <SelectItem key={categoryValue} value={categoryValue}>
                      {itemDisplay}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          {!isLoading && selectedCategory && selectedCategory !== ALL_CATEGORIES_ITEM_VALUE && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
              onClick={() => handleCategoryChange(ALL_CATEGORIES_ITEM_VALUE)}
              aria-label="清除類別篩選"
            >
              <X size={18} />
            </Button>
          )}
        </div>
        
        <div className="relative flex-grow">
          <Input
            placeholder="依標籤類別、名稱或內容搜尋..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="shadow-sm w-full pr-10" 
            disabled={isLoading}
          />
          {!isLoading && filterText && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setFilterText('')}
              aria-label="清除搜尋文字"
            >
              <X size={18} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center p-3 space-x-2 mb-1 sticky top-[60px] bg-background/80 backdrop-blur-sm z-10 rounded-md shadow-sm">
        <div className="flex items-center">
          <Checkbox disabled className="invisible mr-2" /> 
        </div>
        <div className="flex-1 grid grid-cols-2 gap-x-3 items-center min-w-0">
            <Button variant="ghost" onClick={() => handleSort('category')} className={columnHeaderButtonClass}>
              標籤類別 {renderSortIcon('category')}
            </Button>
            <Button variant="ghost" onClick={() => handleSort('name')} className={columnHeaderButtonClass}>
              提示詞名稱 {renderSortIcon('name')}
            </Button>
        </div>
        <div className="flex items-center space-x-1 invisible">
          <Button variant="ghost" size="icon" aria-label="編輯標籤">
            <ArrowUpDown size={18} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="刪除標籤">
            <ArrowUpDown size={18} />
          </Button>
        </div>
      </div>

      {isLoading ? (
         <div className="flex justify-center items-center h-[20rem] p-1">
           <Lottie animationData={loadingAnimationData} loop={true} style={{ width: 150, height: 150 }} />
         </div>
      ) : processedTags.length === 0 ? (
        filterText || (selectedCategory && selectedCategory !== ALL_CATEGORIES_ITEM_VALUE) ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">沒有符合篩選條件的標籤。</p>
              <p className="text-sm text-muted-foreground">請嘗試調整您的類別或搜尋詞。</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">尚無標籤，一片喵白！</p>
              <p className="text-sm text-muted-foreground">點擊「建立新標籤」開始。</p>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="max-h-[20rem] overflow-y-auto space-y-1 pr-1">
          {processedTags.map((tag) => (
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

