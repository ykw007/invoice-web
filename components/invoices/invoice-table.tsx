"use client";

import { useRouter } from "next/navigation";
import { Link2, Link2Off } from "lucide-react";
import { DataTable } from "@/components/common/data-table";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import type { InvoiceListItem, TableColumn } from "@/types";
import { formatDate } from "@/lib/date";

/** 금액을 한국 원화 형식으로 포맷 */
function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** 견적서 목록 테이블 컬럼 정의 */
const COLUMNS: TableColumn<InvoiceListItem>[] = [
  {
    key: "invoiceNumber",
    header: "견적서 번호",
    sortable: true,
  },
  {
    key: "clientName",
    header: "클라이언트",
    sortable: true,
  },
  {
    key: "totalAmount",
    header: "견적 금액",
    sortable: true,
    render: (value) => (
      <span className="tabular-nums font-medium">
        {formatKRW(Number(value))}
      </span>
    ),
  },
  {
    key: "status",
    header: "상태",
    sortable: true,
    render: (value) => (
      <InvoiceStatusBadge status={value as InvoiceListItem["status"]} />
    ),
  },
  {
    key: "issuedAt",
    header: "발행일",
    sortable: true,
    render: (value) => (
      <span className="tabular-nums text-muted-foreground">
        {formatDate(String(value), "yyyy.MM.dd")}
      </span>
    ),
  },
  {
    key: "hasShareLink",
    header: "공유",
    render: (value) =>
      value ? (
        <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
          <Link2 className="h-3.5 w-3.5" />
          공유됨
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link2Off className="h-3.5 w-3.5" />
          미공유
        </span>
      ),
  },
];

interface InvoiceTableProps {
  data: InvoiceListItem[];
  isLoading?: boolean;
  error?: Error | null;
  refetch?: () => void;
}

/**
 * 견적서 목록 테이블 컴포넌트
 * - 로딩/에러/빈 상태 처리
 * - 행 클릭 시 견적서 상세 페이지 이동
 * - 6개 컬럼: 번호/클라이언트/금액/상태/발행일/공유여부
 */
export function InvoiceTable({
  data,
  isLoading = false,
  error = null,
  refetch,
}: InvoiceTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        onRetry={refetch ? () => void refetch() : undefined}
      />
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="견적서가 없습니다"
        description="노션에서 동기화하거나 새 견적서를 추가해주세요."
      />
    );
  }

  return (
    <DataTable<InvoiceListItem>
      columns={COLUMNS}
      data={data}
      keyField="id"
      onRowClick={(row) => router.push(`/invoices/${row.id}`)}
    />
  );
}
