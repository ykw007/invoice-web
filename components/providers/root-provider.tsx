"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { BaseProps } from "@/types";

/** 모든 Provider를 통합하는 루트 Provider 래퍼 */
export function RootProvider({ children }: BaseProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <TooltipProvider>
          <ToastProvider />
          {children}
        </TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
