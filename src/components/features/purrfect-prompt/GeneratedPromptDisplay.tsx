
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GeneratedPromptDisplayProps {
  prompt: string;
}

export function GeneratedPromptDisplay({ prompt }: GeneratedPromptDisplayProps) {
  const [editablePrompt, setEditablePrompt] = useState(prompt);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditablePrompt(prompt);
    setIsCopied(false); // Reset copied state when prompt prop changes
  }, [prompt]);

  const handleCopy = async () => {
    if (!editablePrompt) {
      toast({
        variant: "destructive",
        title: "沒有內容可複製",
        description: "提示詞是空的。",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(editablePrompt);
      setIsCopied(true);
      toast({
        title: "已複製到剪貼簿！",
        description: "你的完美提示詞已準備就緒。",
      });
      setTimeout(() => setIsCopied(false), 2000); 
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        variant: "destructive",
        title: "複製失敗",
        description: "無法將提示詞複製到剪貼簿。",
      });
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditablePrompt(event.target.value);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
         <CardTitle className="text-xl font-headline flex items-center justify-between">
          <Image 
            src="./images/cat-paw-title.png" 
            alt="貓掌"
            width={40}
            height={40}
            data-ai-hint="cat paw"
          />
           <Button onClick={handleCopy} variant="outline" size="sm" className="ml-auto transition-all duration-150">
            {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            <span className="ml-2">{isCopied ? "已複製！" : "複製"}</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Textarea
            value={editablePrompt}
            onChange={handleChange}
            placeholder="選擇標籤以在此處產生提示詞，或直接在此編輯..."
            className="min-h-[200px] w-full p-3 rounded-md bg-muted/50 font-code text-sm shadow-inner"
            aria-label="Generated Prompt Text"
          />
        </div>
        {editablePrompt && (
          <p className="mt-2 text-xs text-muted-foreground">
            提示詞長度：{editablePrompt.length} 個字元
          </p>
        )}
      </CardContent>
    </Card>
  );
}
