
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Cat, AlertTriangle, PanelLeftClose, PanelRightOpen } from "lucide-react";
import { useTags } from "@/hooks/useTags";
import type { Tag } from "@/types";
import { CreateTagDialog } from "@/components/features/purrfect-prompt/CreateTagDialog";
import { EditTagDialog } from "@/components/features/purrfect-prompt/EditTagDialog";
import { TagList } from "@/components/features/purrfect-prompt/TagList";
import { SelectedTagList } from "@/components/features/purrfect-prompt/SelectedTagList";
import { GeneratedPromptDisplay } from "@/components/features/purrfect-prompt/GeneratedPromptDisplay";
import type { TagFormValues } from "@/components/features/purrfect-prompt/TagForm";
import { AppHeader } from "@/components/AppHeader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollToBottomButton } from "@/components/ScrollToBottomButton";


export default function PurrfectPromptPage() {
  const { tags, isLoading: isLoadingFromHook, error, addTag, updateTag, deleteTag, updateTagOrders } = useTags();
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [isTagSectionCollapsed, setIsTagSectionCollapsed] = useState(false);

  const sortedTags = useMemo(() => {
    return [...tags].sort((a, b) => a.order - b.order);
  }, [tags]);
  
  const tagsForSelectedList = useMemo(() => {
    return sortedTags.filter(tag => selectedTagIds.has(tag.id));
  }, [selectedTagIds, sortedTags]);

  useEffect(() => {
    const newPrompt = tagsForSelectedList.reduce((acc, tag) => {
      const currentContent = tag.content.trim();
      if (currentContent === "") return acc;
      if (acc === "") return currentContent;

      const accEndsWithComma = acc.endsWith(',');
      const currentStartsWithComma = currentContent.startsWith(',');

      if (accEndsWithComma && currentStartsWithComma) {
        return acc + " " + currentContent.substring(1).trim();
      } else if (accEndsWithComma || currentStartsWithComma) {
         return acc + (accEndsWithComma ? " " : "") + currentContent;
      } else {
        return acc + ", " + currentContent;
      }
    }, "");
    setGeneratedPrompt(newPrompt);
  }, [tagsForSelectedList]);


  useEffect(() => {
    if (error) {
      console.error("載入標籤時發生錯誤:", error);
    }
  }, [error]);


  const handleSelectTag = (tagId: string, selected: boolean) => {
    setSelectedTagIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(tagId);
      } else {
        newSet.delete(tagId);
      }
      return newSet;
    });
  };

  const handleCreateTag = (values: TagFormValues) => {
    addTag(values, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleEditTag = (values: TagFormValues) => {
    if (editingTag) {
      updateTag({ tagId: editingTag.id, data: { ...values, category: values.category || '未分類' } }, {
        onSuccess: () => setIsEditModalOpen(false),
      });
    }
  };

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag);
    setIsEditModalOpen(true);
  };

  const openDeleteConfirm = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
      setTagToDelete(tag);
      setIsDeleteConfirmOpen(true);
    }
  };

  const confirmDeleteTag = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete.id, {
        onSuccess: () => {
          setSelectedTagIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(tagToDelete.id);
            return newSet;
          });
          setIsDeleteConfirmOpen(false);
          setTagToDelete(null);
        }
      });
    }
  };

  const handleReorderAllTags = (reorderedAllTags: Tag[]) => {
    const updates = reorderedAllTags.map((tag, index) => ({ id: tag.id, order: index }));
    updateTagOrders(updates);
  };

  const handleReorderSelectedTags = (newlyOrderedSelectedTags: Tag[]) => {
    const currentGlobalTags = [...sortedTags];
    const newGlobalOrderArray: Tag[] = [];

    const selectedIter = newlyOrderedSelectedTags[Symbol.iterator]();
    const unselectedTagsOrdered = currentGlobalTags.filter(t => !selectedTagIds.has(t.id)); 
    const unselectedIter = unselectedTagsOrdered[Symbol.iterator]();

    for (const originalTagInSlot of currentGlobalTags) {
      if (selectedTagIds.has(originalTagInSlot.id)) {
        const nextSelected = selectedIter.next();
        if (!nextSelected.done) {
          newGlobalOrderArray.push(nextSelected.value);
        }
      } else {
        const nextUnselected = unselectedIter.next();
        if (!nextUnselected.done) {
          newGlobalOrderArray.push(nextUnselected.value);
        }
      }
    }
    
    if (newGlobalOrderArray.length !== currentGlobalTags.length) {
        console.error("重新排序錯誤：陣列長度不符。為安全起見，回復至原始順序。");
        return;
    }

    const updates = newGlobalOrderArray.map((tag, index) => ({ id: tag.id, order: index }));
    updateTagOrders(updates);
  };

  const handleRemoveFromSelected = (tagId: string) => {
    handleSelectTag(tagId, false);
  };
  
  const isLoading = isLoadingFromHook;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow w-full">
        
        <div className={`grid grid-cols-1 ${isTagSectionCollapsed ? 'lg:grid-cols-[min-content_1fr]' : 'lg:grid-cols-2'} gap-x-8 gap-y-8`}>
          <section className="space-y-6">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsTagSectionCollapsed(!isTagSectionCollapsed)}
                  aria-label={isTagSectionCollapsed ? "展開標籤區塊" : "收合標籤區塊"}
                >
                  {isTagSectionCollapsed ? <PanelRightOpen size={20} /> : <PanelLeftClose size={20} />}
                </Button>
                {!isTagSectionCollapsed && <h2 className="text-3xl font-headline text-primary ml-2 font-bold">TAGS</h2>}
              </div>
              
              {isTagSectionCollapsed ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" size="icon" className="mt-2 sm:mt-0">
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>建立新標籤</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-5 w-5" /> 建立新標籤
                </Button>
              )}
            </div>

            {!isTagSectionCollapsed && (
              <>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>載入標籤時發生錯誤</AlertTitle>
                    <AlertDescription>
                      無法載入您的標籤。請檢查您的 Firestore 安全性規則和網路連線。
                      訊息：{(error as Error)?.message || '未知錯誤'}
                    </AlertDescription>
                  </Alert>
                )}
                <TagList
                  tags={sortedTags}
                  selectedTagIds={selectedTagIds}
                  onSelectTag={handleSelectTag}
                  onEditTag={openEditModal}
                  onDeleteTag={openDeleteConfirm}
                  onReorderTags={handleReorderAllTags}
                  isLoading={isLoading}
                />
              </>
            )}
          </section>

          <section className="space-y-6 sticky top-24 self-start">
            <div>
              <h3 className="text-2xl font-headline text-primary mb-3">已選標籤</h3>
              <SelectedTagList 
                selectedTags={tagsForSelectedList}
                onReorderSelected={handleReorderSelectedTags}
                onRemoveTag={handleRemoveFromSelected}
              />
            </div>
            <GeneratedPromptDisplay prompt={generatedPrompt} />
          </section>
        </div>
      </main>

      <CreateTagDialog
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateTag}
        isLoading={isLoading} 
      />
      {editingTag && (
        <EditTagDialog
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSubmit={handleEditTag}
          tag={editingTag}
          isLoading={isLoading}
        />
      )}
      
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline">你確定嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作無法復原。這將永久刪除標籤
              「{tagToDelete?.name}」。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTagToDelete(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTag}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ScrollToBottomButton />

      <footer className="py-6 text-center text-muted-foreground text-sm border-t mt-12">
        <p>&copy; {new Date().getFullYear()} 喵喵提示詞產生器。用 <Cat size={16} className="inline text-primary" /> 愛製作。</p>
      </footer>
    </div>
  );
}
