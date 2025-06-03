
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollToBottomButton() {
  const [scrollMode, setScrollMode] = useState<'toBottom' | 'toTop'>('toBottom');
  const [hasMounted, setHasMounted] = useState(false);

  const SCROLL_THRESHOLD = 200; // Pixels

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const updateScrollMode = () => {
    // This function will only be called after hasMounted is true
    if (window.pageYOffset < SCROLL_THRESHOLD) {
      setScrollMode('toBottom');
    } else {
      setScrollMode('toTop');
    }
  };

  const handleScrollAction = () => {
    // This function will only be called after hasMounted is true
    if (scrollMode === 'toBottom') {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    // Set initial mode
    updateScrollMode(); 

    window.addEventListener('scroll', updateScrollMode);
    return () => {
      window.removeEventListener('scroll', updateScrollMode);
    };
  }, [hasMounted]); // Run when hasMounted changes

  if (!hasMounted) {
    return null; // Ensures server and initial client render match
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50"
    )}>
      <Button
        onClick={handleScrollAction}
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg bg-card hover:bg-accent text-foreground"
        aria-label={scrollMode === 'toBottom' ? "捲動到底部" : "捲動到頂部"}
      >
        {scrollMode === 'toBottom' ? (
          <ArrowDownCircle className="h-6 w-6" />
        ) : (
          <ArrowUpCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
