"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import type { ApiResponse, Report } from "@/types";

/** 리포트 페이지 */
export default function ReportsPage() {
  const { data, isLoading, isError, refetch } = useQuery<ApiResponse<Report[]>>({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
      return res.json() as Promise<ApiResponse<Report[]>>;
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시 유지
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="리포트 데이터를 불러오지 못했습니다."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="리포트"
        description="비즈니스 현황 및 분석 리포트를 확인하세요."
      />

      {/* 리포트 목록 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data?.data.map((report: Report) => (
          <div
            key={report.id}
            className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="font-medium">{report.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{report.date}</p>
            <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {report.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
