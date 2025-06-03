
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TagForm, type TagFormValues } from "./TagForm";
import type { Tag } from "@/types";

interface EditTagDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: TagFormValues) => void;
  tag: Tag | null;
  isLoading?: boolean;
}

export function EditTagDialog({ isOpen, onOpenChange, onSubmit, tag, isLoading }: EditTagDialogProps) {
  if (!tag) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">編輯標籤</DialogTitle>
          <DialogDescription>
            更新標籤的標籤類別、名稱或內容。
          </DialogDescription>
        </DialogHeader>
        <TagForm 
          onSubmit={onSubmit} 
          defaultValues={tag} 
          isLoading={isLoading}
          submitButtonText="儲存變更"
        />
      </DialogContent>
    </Dialog>
  );
}
