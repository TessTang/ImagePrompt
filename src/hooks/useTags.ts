"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as tagService from "@/services/tagService";
import type { Tag } from "@/types";
import { useToast } from "@/hooks/use-toast";

const TAGS_QUERY_KEY = "tags";

// Add an options object to useTags for the 'enabled' flag
interface UseTagsOptions {
  enabled?: boolean;
}

export function useTags(options?: UseTagsOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: tags = [],
    isLoading,
    error,
  } = useQuery<Tag[]>({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: tagService.getTags,
    enabled: options?.enabled ?? true, // Default to true if not provided
  });

  const addTagMutation = useMutation({
    mutationFn: (
      newTagData: Omit<Tag, "id" | "createdAt" | "order"> & { order?: number }
    ) => {
      const currentTags =
        queryClient.getQueryData<Tag[]>([TAGS_QUERY_KEY]) || [];
      const highestOrder = currentTags.reduce(
        (max, tag) => Math.max(max, tag.order),
        -1
      );
      const order =
        newTagData.order !== undefined ? newTagData.order : highestOrder + 1;
      const category = newTagData.category || "未分類";
      return tagService.addTag({ ...newTagData, category, order });
    },
    onSuccess: (newlyAddedTag) => {
      queryClient.setQueryData(
        [TAGS_QUERY_KEY],
        (oldData: Tag[] | undefined) => {
          const newTags = oldData
            ? [...oldData, newlyAddedTag]
            : [newlyAddedTag];
          return newTags.sort((a, b) => a.order - b.order);
        }
      );
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
      toast({ title: "標籤已建立！", description: "您的新標籤已完美新增。" });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "建立標籤時發生錯誤",
        description: err.message,
      });
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({
      tagId,
      data,
    }: {
      tagId: string;
      data: Partial<Omit<Tag, "id" | "createdAt">>;
    }) => tagService.updateTag(tagId, data),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        [TAGS_QUERY_KEY],
        (oldData: Tag[] | undefined) => {
          if (!oldData) return [];
          return oldData
            .map((tag) =>
              tag.id === variables.tagId
                ? {
                    ...tag,
                    ...variables.data,
                    category: variables.data.category || "未分類",
                  }
                : tag
            )
            .sort((a, b) => a.order - b.order);
        }
      );
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
      toast({ title: "標籤已更新！", description: "您的標籤已完美更新。" });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "更新標籤時發生錯誤",
        description: err.message,
      });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: tagService.deleteTag,
    onSuccess: (_, tagId) => {
      queryClient.setQueryData(
        [TAGS_QUERY_KEY],
        (oldData: Tag[] | undefined) => {
          return oldData ? oldData.filter((tag) => tag.id !== tagId) : [];
        }
      );
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
      toast({ title: "標籤已刪除！", description: "您的標籤已被移除。" });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "刪除標籤時發生錯誤",
        description: err.message,
      });
    },
  });

  const updateTagOrdersMutation = useMutation({
    mutationFn: (tagsToUpdate: { id: string; order: number }[]) =>
      tagService.updateTagOrders(tagsToUpdate),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        [TAGS_QUERY_KEY],
        (oldData: Tag[] | undefined) => {
          if (!oldData) return [];
          const updatedTagsMap = new Map(variables.map((t) => [t.id, t.order]));
          return oldData
            .map((tag) => ({
              ...tag,
              order: updatedTagsMap.has(tag.id)
                ? updatedTagsMap.get(tag.id)!
                : tag.order,
            }))
            .sort((a, b) => a.order - b.order);
        }
      );
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
    onError: (err: Error) => {
      toast({
        variant: "destructive",
        title: "重新排序標籤時發生錯誤",
        description: err.message,
      });
      queryClient.invalidateQueries({ queryKey: [TAGS_QUERY_KEY] });
    },
  });

  return {
    tags,
    isLoading:
      isLoading ||
      addTagMutation.isPending ||
      updateTagMutation.isPending ||
      deleteTagMutation.isPending ||
      updateTagOrdersMutation.isPending,
    error,
    addTag: addTagMutation.mutate,
    updateTag: updateTagMutation.mutate,
    deleteTag: deleteTagMutation.mutate,
    updateTagOrders: updateTagOrdersMutation.mutate,
  };
}
