
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TagForm, type TagFormValues } from "./TagForm";

interface CreateTagDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: TagFormValues) => void;
  isLoading?: boolean;
}

export function CreateTagDialog({ isOpen, onOpenChange, onSubmit, isLoading }: CreateTagDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">建立新標籤</DialogTitle>
          <DialogDescription>
            新增一個標籤來打造你的完美提示詞。請填寫下方的標籤類別、名稱和內容。
          </DialogDescription>
        </DialogHeader>
        <TagForm onSubmit={onSubmit} isLoading={isLoading} submitButtonText="建立標籤" />
      </DialogContent>
    </Dialog>
  );
}
