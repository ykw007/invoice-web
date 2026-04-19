"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/types";
import { UnauthorizedError } from "@/lib/errors";

/** 공유 링크 생성 응답 */
export interface ShareLinkResult {
  /** 생성된 공유 토큰 */
  shareToken: string;
  /** 완전한 공유 URL */
  shareUrl: string;
}

/**
 * 견적서 공유 링크 생성 뮤테이션 훅
 * - POST /api/invoices/[invoiceId]/share 호출
 * - 성공: invoice + invoices 쿼리 무효화
 * - 반환: { shareToken, shareUrl }
 */
export function useCreateShareLink(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation<ShareLinkResult, Error, void>({
    mutationFn: async (): Promise<ShareLinkResult> => {
      const res = await fetch(`/api/invoices/${invoiceId}/share`, {
        method: "POST",
        credentials: "include",
      });

      if (res.status === 401) throw new UnauthorizedError();
      if (!res.ok) {
        let message = "공유 링크 생성에 실패했습니다.";
        try {
          const json: { message?: string } = await res.json();
          if (json.message) message = json.message;
        } catch {
          /* 파싱 실패 시 기본 메시지 사용 */
        }
        throw new Error(message);
      }

      const json: ApiResponse<ShareLinkResult> = await res.json();
      return json.data;
    },
    onSuccess: () => {
      /* 개별 견적서 + 목록 캐시 무효화 */
      queryClient.invalidateQueries({ queryKey: ["invoice", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
