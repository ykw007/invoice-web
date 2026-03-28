"use client";

import { Toaster } from "@/components/ui/sonner";

/** Sonner 토스트 Provider */
export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
    />
  );
}
