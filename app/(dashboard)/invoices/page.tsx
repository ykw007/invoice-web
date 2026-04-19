"use client";

import { PageHeader } from "@/components/layout/page-header";
import { SyncButton } from "@/components/invoices/sync-button";
import { NotionConnectionBanner } from "@/components/invoices/notion-connection-banner";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { useInvoices } from "@/hooks/use-invoices";

/**
 * 견적서 목록 페이지 (F002, F003)
 * - useInvoices()로 GET /api/invoices 데이터 fetch
 * - SyncButton으로 노션 동기화
 * - NotionConnectionBanner: 미연동 시 안내 배너
 * - InvoiceTable: 로딩/에러/목록 표시
 */
export default function InvoicesPage() {
  const { data = [], isLoading, error, refetch } = useInvoices();

  return (
    <div className="space-y-6">
      <PageHeader
        title="견적서 목록"
        description="노션 데이터베이스에서 동기화된 견적서를 관리합니다."
        actions={<SyncButton />}
      />

      {/* 노션 미연동 안내 배너 (disconnected일 때만 표시) */}
      <NotionConnectionBanner />

      {/* 견적서 목록 테이블 */}
      <InvoiceTable
        data={data}
        isLoading={isLoading}
        error={error}
        refetch={refetch}
      />
    </div>
  );
}
