
"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Cat, AlertTriangle, PanelLeftClose, PanelRightOpen, KeyRound, Loader2, ArrowUpDown, X, Pencil, Trash2 } from "lucide-react";
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
import { verifyPasscode } from "@/services/passcodeService"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortableField = 'category' | 'name' | 'order';
type SortDirection = 'asc' | 'desc';

const PASSCODE_STORAGE_KEY = "purrfectPromptPasscodeVerified";
const ALL_CATEGORIES_ITEM_VALUE = "__ALL_CATEGORIES_SENTINEL__";

export default function PurrfectPromptPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState("");
  const [isVerifyingPasscode, setIsVerifyingPasscode] = useState(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);

  const { tags, isLoading: isLoadingTagsDb, error: tagsError, addTag, updateTag, deleteTag, updateTagOrders } = useTags({
    enabled: isAuthenticated 
  });
  
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [isTagSectionCollapsed, setIsTagSectionCollapsed] = useState(false);

  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_ITEM_VALUE);
  const [sortBy, setSortBy] = useState<SortableField>('order');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuthStatus = localStorage.getItem(PASSCODE_STORAGE_KEY);
      if (storedAuthStatus === "true") {
        setIsAuthenticated(true);
      }
    }
    setInitialAuthCheckDone(true);
  }, []);

  const uniqueCategories = useMemo(() => {
    if (!isAuthenticated) return [ALL_CATEGORIES_ITEM_VALUE];
    const categories = new Set<string>();
    tags.forEach(tag => {
      if (tag.category && tag.category.trim() !== '') {
        categories.add(tag.category);
      }
    });
    const sortedCategories = Array.from(categories).sort((a, b) => a.localeCompare(b));
    return [ALL_CATEGORIES_ITEM_VALUE, ...sortedCategories];
  }, [tags, isAuthenticated]);

  const displayedTags = useMemo(() => {
    if (!isAuthenticated) return [];
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
  }, [tags, filterText, selectedCategory, sortBy, sortDirection, isAuthenticated]);
  
  const tagsForSelectedList = useMemo(() => {
    if (!isAuthenticated) return [];
     const selectedMap = new Map(tags.filter(tag => selectedTagIds.has(tag.id)).map(tag => [tag.id, tag]));
     return Array.from(selectedTagIds).map(id => selectedMap.get(id)).filter(Boolean) as Tag[];
  }, [selectedTagIds, tags, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setGeneratedPrompt("");
      return;
    }
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
  }, [tagsForSelectedList, isAuthenticated]);


  useEffect(() => {
    if (tagsError) {
      console.error("載入標籤時發生錯誤:", tagsError);
    }
  }, [tagsError]);

  const handlePasscodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsVerifyingPasscode(true);
    setPasscodeError(null);
    const isValid = await verifyPasscode(enteredPasscode);
    if (isValid) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PASSCODE_STORAGE_KEY, "true");
      }
    } else {
      setPasscodeError("通關密碼錯誤，請再試一次。");
    }
    setIsVerifyingPasscode(false);
  };


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
    setSortBy('order'); 
    setSortDirection('asc');
  };

  const handleReorderSelectedTags = (newlyOrderedSelectedTags: Tag[]) => {
    setSelectedTagIds(new Set(newlyOrderedSelectedTags.map(tag => tag.id)));
  };

  const handleRemoveFromSelected = (tagId: string) => {
    handleSelectTag(tagId, false);
  };
  
  const handleSort = (field: SortableField) => {
    const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortDirection(newDirection);
  };

  const renderSortIcon = (field: SortableField) => {
    if (sortBy === field) {
      return sortDirection === 'asc' ? <ArrowUpDown className="h-4 w-4 inline ml-1 transform rotate-0" /> : <ArrowUpDown className="h-4 w-4 inline ml-1 transform rotate-180" />;
    }
    return <ArrowUpDown className="h-4 w-4 inline ml-1 opacity-30" />;
  };
  
  const columnHeaderButtonClass = "font-medium text-sm text-muted-foreground hover:text-foreground px-1 py-1 rounded-md w-full text-left flex items-center justify-start";

  const isLoading = isLoadingTagsDb || isVerifyingPasscode;

  if (!initialAuthCheckDone) {
    return (
      <div className="flex flex-col flex-1 bg-background">
        <AppHeader />
        <main className="flex-grow flex items-center justify-center p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col flex-1 bg-background">
        <AppHeader />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-center flex items-center justify-center">
                <KeyRound className="mr-2 h-6 w-6 text-primary" />
                請輸入通關密碼
              </CardTitle>
              <CardDescription className="text-center">
                請輸入通關密碼以存取喵喵提示詞產生器。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                <Input
                  type="password"
                  placeholder="通關密碼"
                  value={enteredPasscode}
                  onChange={(e) => setEnteredPasscode(e.target.value)}
                  disabled={isVerifyingPasscode}
                  aria-label="通關密碼"
                />
                {passcodeError && (
                  <p className="text-sm text-destructive">{passcodeError}</p>
                )}
                <Button type="submit" className="w-full" disabled={isVerifyingPasscode || !enteredPasscode}>
                  {isVerifyingPasscode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      驗證中...
                    </>
                  ) : (
                    "進入"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-background">
      <AppHeader />
      <main className={`flex-1 w-full grid ${isTagSectionCollapsed ? 'lg:grid-cols-[min-content_1fr]' : 'lg:grid-cols-2'} gap-x-8 lg:gap-x-8`}>
        
        <section className={`p-4 sm:p-6 lg:p-8 flex flex-col min-h-0 ${isTagSectionCollapsed ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
          <div className={`lg:sticky lg:top-0 lg:z-20 bg-background ${isTagSectionCollapsed ? 'pb-0' : 'pb-4'}`}>
            <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
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
                <div className="flex flex-col sm:flex-row gap-3 mb-3 pt-1">
                  <div className="flex items-center gap-1 w-full sm:w-auto">
                    <div className="flex-grow sm:min-w-[180px] md:min-w-[200px]">
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        disabled={isLoading || uniqueCategories.length <= 1}
                      >
                        <SelectTrigger className="shadow-sm w-full">
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
                        onClick={() => setSelectedCategory(ALL_CATEGORIES_ITEM_VALUE)}
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
                {/* Column Headers for TagList - now part of the sticky block */}
                <div className="flex items-center p-3 space-x-2 rounded-md shadow-sm bg-muted/30">
                  <div className="flex items-center">
                    {/* Placeholder for checkbox alignment, invisible */}
                    <div className="w-4 h-4 mr-2" /> 
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-x-3 items-center min-w-0">
                      <Button variant="ghost" onClick={() => handleSort('category')} className={columnHeaderButtonClass}>
                        標籤類別 {renderSortIcon('category')}
                      </Button>
                      <Button variant="ghost" onClick={() => handleSort('name')} className={columnHeaderButtonClass}>
                        提示詞名稱 {renderSortIcon('name')}
                      </Button>
                  </div>
                  <div className="flex items-center space-x-1 invisible"> {/* Placeholder for actions */}
                    <Button variant="ghost" size="icon"><Pencil size={18} /></Button>
                    <Button variant="ghost" size="icon"><Trash2 size={18} /></Button>
                  </div>
                </div>
              </>
            )}
          </div> {/* End of sticky block */}
          
          {!isTagSectionCollapsed && (
            <div className="flex-grow min-h-0"> {/* This div makes TagList scrollable and fill remaining space */}
              {tagsError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>載入標籤時發生錯誤</AlertTitle>
                  <AlertDescription>
                    無法載入您的標籤。請檢查您的 Firestore 安全性規則和網路連線。
                    訊息：{(tagsError as Error)?.message || '未知錯誤'}
                  </AlertDescription>
                </Alert>
              )}
              <TagList
                tags={displayedTags}
                selectedTagIds={selectedTagIds}
                onSelectTag={handleSelectTag}
                onEditTag={openEditModal}
                onDeleteTag={openDeleteConfirm}
                onReorderTags={handleReorderAllTags}
                isLoading={isLoadingTagsDb}
              />
            </div>
          )}
        </section>

        <section className="space-y-6 sticky top-24 self-start lg:col-span-1 p-4 sm:p-6 lg:p-8">
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
      </main>

      <CreateTagDialog
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateTag}
        isLoading={isLoadingTagsDb} 
      />
      {editingTag && (
        <EditTagDialog
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSubmit={handleEditTag}
          tag={editingTag}
          isLoading={isLoadingTagsDb}
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

    