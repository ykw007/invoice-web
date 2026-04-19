"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNotionStatus } from "@/hooks/use-notion-status";
import { cn } from "@/lib/utils";

interface NotionConnectionBannerProps {
  className?: string;
}

/**
 * 노션 미연동 안내 배너 컴포넌트
 * - useNotionStatus() 훅으로 상태 조회
 * - status === 'disconnected' 일 때만 배너 렌더링
 * - connected / error 상태: null 반환
 */
export function NotionConnectionBanner({ className }: NotionConnectionBannerProps) {
  const { data, isLoading } = useNotionStatus();

  /* 로딩 중이거나 disconnected가 아닌 경우 숨김 */
  if (isLoading || !data || data.status !== "disconnected") {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4",
        "dark:border-amber-800 dark:bg-amber-900/20",
        className
      )}
    >
      <AlertTriangle
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
        aria-hidden="true"
      />
      <div className="flex-1 text-sm">
        <p className="font-medium text-amber-800 dark:text-amber-300">
          노션 연동이 필요합니다
        </p>
        <p className="mt-0.5 text-amber-700 dark:text-amber-400">
          노션 데이터베이스를 연동해야 견적서를 동기화할 수 있습니다.
        </p>
      </div>
      <Link
        href="/settings/notion"
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-md text-sm font-medium",
          "text-amber-700 underline-offset-4 hover:underline dark:text-amber-400"
        )}
        aria-label="노션 연동 설정 페이지로 이동"
      >
        설정하기
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
