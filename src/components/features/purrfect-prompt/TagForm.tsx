
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Tag } from "@/types";

const tagFormSchema = z.object({
  category: z.string().min(1, "標籤類別為必填項").max(50, "標籤類別太長 (最多 50 個字元)"),
  name: z.string().min(1, "提示詞名稱為必填項").max(100, "提示詞名稱太長 (最多 100 個字元)"),
  content: z.string().min(1, "提示詞內容為必填項"),
});

export type TagFormValues = z.infer<typeof tagFormSchema>;

interface TagFormProps {
  onSubmit: (values: TagFormValues) => void;
  defaultValues?: Partial<Tag>;
  isLoading?: boolean;
  submitButtonText?: string;
}

export function TagForm({ onSubmit, defaultValues, isLoading, submitButtonText = "儲存標籤" }: TagFormProps) {
  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      category: defaultValues?.category || "",
      name: defaultValues?.name || "",
      content: defaultValues?.content || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>標籤類別</FormLabel>
              <FormControl>
                <Input placeholder="例如：視角, 人物姿勢" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>提示詞名稱</FormLabel> 
              <FormControl>
                <Input placeholder="例如：俯視, 指甲油, Art Style" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>提示詞內容</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="例如：from above, ??? nail polish"
                  className="resize-y min-h-[100px] font-code"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "儲存中..." : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}
