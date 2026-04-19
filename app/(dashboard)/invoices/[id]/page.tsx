"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { InvoiceMetaSection } from "@/components/invoices/invoice-meta-section";
import { InvoiceItemsTable } from "@/components/invoices/invoice-items-table";
import { ShareLinkPanel } from "@/components/invoices/share-link-panel";
import { useInvoice } from "@/hooks/use-invoice";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * 견적서 상세 페이지 - 발행자용 (F004, F005)
 * - useInvoice(id)로 GET /api/invoices/{id} 데이터 fetch
 * - MetaSection + ItemsTable + ShareLinkPanel + 메모 카드
 * - 로딩/에러 상태 처리
 */
export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  /* Next.js 15 비동기 params — use()로 언래핑 */
  const { id } = use(params);
  const { data: invoice, isLoading, error, refetch } = useInvoice(id);

  /* 뒤로 가기 버튼 */
  const backAction = (
    <Button variant="ghost" size="sm" asChild>
      <Link href="/invoices">
        <ChevronLeft className="mr-1 h-4 w-4" />
        목록으로
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="견적서 상세"
          description="견적서 내용을 확인하고 공유 링크를 생성합니다."
          actions={backAction}
        />
        <ErrorState onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="견적서 상세"
        description="견적서 내용을 확인하고 공유 링크를 생성합니다."
        actions={backAction}
      />

      {/* 메타 정보 섹션 */}
      <InvoiceMetaSection invoice={invoice} />

      {/* 공유 링크 패널 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">공유 링크</CardTitle>
        </CardHeader>
        <CardContent>
          <ShareLinkPanel
            invoiceId={invoice.id}
            shareToken={invoice.shareToken}
          />
        </CardContent>
      </Card>

      {/* 견적 항목 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">견적 항목</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <InvoiceItemsTable
            items={invoice.data.items}
            totalAmount={invoice.data.totalAmount}
            taxIncluded={invoice.data.taxIncluded}
          />
        </CardContent>
      </Card>

      {/* 메모 카드 (있을 때만 표시) */}
      {invoice.data.note && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <StickyNote className="h-4 w-4" />
              메모
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {invoice.data.note}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
