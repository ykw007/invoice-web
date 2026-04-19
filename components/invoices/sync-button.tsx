"use client";

import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useSyncInvoices } from "@/hooks/use-sync-invoices";
import { toast } from "@/lib/toast";

/**
 * 노션 견적서 동기화 버튼 컴포넌트
 * - useSyncInvoices() 훅으로 POST /api/invoices/sync 호출
 * - 성공: 견적서 목록 캐시 무효화 + 성공 토스트
 * - 실패: 에러 토스트
 * - 로딩 중: 버튼 비활성화 + 스피너 표시
 */
export function SyncButton() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useSyncInvoices({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(
        "동기화 완료",
        `${data.synced}개 견적서가 동기화되었습니다.`
      );
    },
    onError: (error: Error) => {
      toast.error("동기화 실패", error.message ?? "동기화에 실패했습니다.");
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => mutate()}
      disabled={isPending}
      aria-label="노션에서 견적서 동기화"
    >
      {isPending ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          동기화 중...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          동기화
        </>
      )}
    </Button>
  );
}
