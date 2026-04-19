"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/types";
import { UnauthorizedError } from "@/lib/errors";

/** 동기화 결과 */
export interface SyncResult {
  synced: number;
  errors: string[];
}

/**
 * 노션 견적서 동기화 뮤테이션 훅
 * - POST /api/invoices/sync 호출
 * - MutationOptions를 외부에서 주입 가능 (onSuccess, onError 등)
 */
export function useSyncInvoices(
  options?: UseMutationOptions<SyncResult, Error, void>
) {
  return useMutation<SyncResult, Error, void>({
    mutationFn: async (): Promise<SyncResult> => {
      const res = await fetch("/api/invoices/sync", {
        method: "POST",
        credentials: "include",
      });
      if (res.status === 401) throw new UnauthorizedError();
      if (!res.ok) {
        let message = "동기화에 실패했습니다.";
        try {
          const json: { message?: string } = await res.json();
          if (json.message) message = json.message;
        } catch {
          /* 파싱 실패 시 기본 메시지 사용 */
        }
        throw new Error(message);
      }
      const json: ApiResponse<SyncResult> = await res.json();
      return json.data;
    },
    ...options,
  });
}
