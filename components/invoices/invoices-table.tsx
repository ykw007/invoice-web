"use client";

import Link from "next/link";
import { RefreshCw, Link2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { InvoiceStatusBadge } from "@/components/common/invoice-status-badge";
import type { InvoiceListItem, TableColumn } from "@/types";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

/** 금액을 한국 원화 형식으로 포맷 */
function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** 견적서 목록 테이블 컬럼 정의 */
const INVOICE_COLUMNS: TableColumn<InvoiceListItem>[] = [
  {
    key: "invoiceNumber",
    header: "견적서 번호",
    sortable: true,
    render: (value, row) => (
      <Link
        href={`/invoices/${row.id}`}
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        {String(value)}
      </Link>
    ),
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
      <span className="font-medium tabular-nums">
        {formatKRW(Number(value))}
      </span>
    ),
  },
  {
    key: "status",
    header: "상태",
    render: (value) => (
      <InvoiceStatusBadge status={value as InvoiceListItem["status"]} />
    ),
  },
  {
    key: "issuedAt",
    header: "발행일",
    sortable: true,
    render: (value) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {formatDate(String(value), "yyyy.MM.dd")}
      </span>
    ),
  },
  {
    key: "hasShareLink",
    header: "공유 링크",
    render: (value, row) => {
      if (value) {
        return (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-muted-foreground"
            onClick={() => {
              /* TODO: 클립보드 복사 구현 */
            }}
            aria-label={`${row.invoiceNumber} 공유 링크 복사`}
          >
            <Link2 className="h-3.5 w-3.5" />
            복사
          </Button>
        );
      }
      return (
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => {
            /* TODO: 공유 링크 생성 API 연결 */
          }}
          aria-label={`${row.invoiceNumber} 공유 링크 생성`}
        >
          <Link2 className="h-3.5 w-3.5" />
          생성
        </Button>
      );
    },
  },
];

interface InvoicesTableProps {
  /** 견적서 목록 데이터 (실제 구현 시 TanStack Query에서 주입) */
  data?: InvoiceListItem[];
  /** 동기화 진행 중 여부 */
  isSyncing?: boolean;
  /** 노션 미연동 여부 */
  isNotionDisconnected?: boolean;
}

/** 견적서 목록 + 동기화 버튼 클라이언트 컴포넌트 */
export function InvoicesTable({
  data = [],
  isSyncing = false,
  isNotionDisconnected = false,
}: InvoicesTableProps) {
  return (
    <div className="space-y-4">
      {/* 노션 미연동 배너 */}
      {isNotionDisconnected && (
        <div
          role="alert"
          className={cn(
            "flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3",
            "sm:flex-row sm:items-center sm:justify-between",
            "dark:border-amber-800/50 dark:bg-amber-950/30"
          )}
        >
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              노션 데이터베이스가 연동되지 않았습니다
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              견적서를 동기화하려면 노션 연동 설정을 완료해주세요.
            </p>
          </div>
          <Link href="/settings/notion">
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200"
            >
              연동 설정으로 이동
            </Button>
          </Link>
        </div>
      )}

      {/* 툴바: 건수 표시 + 동기화 버튼 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총{" "}
          <span className="font-medium text-foreground tabular-nums">
            {data.length}
          </span>
          건
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={isSyncing}
          onClick={() => {
            /* TODO: POST /api/invoices/sync 연결 */
          }}
          aria-label="노션에서 견적서 동기화"
        >
          <RefreshCw
            className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")}
          />
          {isSyncing ? "동기화 중..." : "동기화"}
        </Button>
      </div>

      {/* 데이터 테이블 또는 빈 상태 */}
      {data.length === 0 ? (
        <div className="rounded-lg border">
          <EmptyState
            icon={FileText}
            title="견적서가 없습니다"
            description="노션에서 동기화하거나 설정에서 데이터베이스를 연결해주세요."
            action={{
              label: "지금 동기화",
              onClick: () => {
                /* TODO: POST /api/invoices/sync 연결 */
              },
            }}
          />
        </div>
      ) : (
        <DataTable<InvoiceListItem>
          columns={INVOICE_COLUMNS}
          data={data}
          keyField="id"
        />
      )}
    </div>
  );
}
