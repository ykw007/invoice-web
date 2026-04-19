import { CalendarDays, StickyNote } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { InvoiceItemsTable } from "@/components/invoices/invoice-items-table";
import type { InvoiceData } from "@/types";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

interface PublicInvoiceBodyProps {
  /** 파싱된 견적서 데이터 */
  invoiceData: InvoiceData;
  className?: string;
}

/**
 * 공개 뷰어 본문 컴포넌트 (서버 컴포넌트)
 * - 발행일/유효기한 날짜 섹션
 * - InvoiceItemsTable 재사용 (항목 + 합계 + 세금)
 * - 메모 섹션 (note 있을 때만 표시)
 * - 반응형 레이아웃 + 인쇄 최적화
 */
export function PublicInvoiceBody({ invoiceData, className }: PublicInvoiceBodyProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {/* 날짜 정보 섹션 */}
      <section className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-4 print:py-4">
        <div>
          <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground print:text-gray-500">
            <CalendarDays className="h-3 w-3" aria-hidden="true" />
            발행일
          </p>
          <p className="mt-1 text-sm tabular-nums">
            {formatDate(invoiceData.issuedAt, "yyyy.MM.dd")}
          </p>
        </div>

        {invoiceData.dueDate && (
          <div>
            <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-muted-foreground print:text-gray-500">
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              유효기한
            </p>
            <p className="mt-1 text-sm tabular-nums">
              {formatDate(invoiceData.dueDate, "yyyy.MM.dd")}
            </p>
          </div>
        )}
      </section>

      <Separator />

      {/* 견적 항목 테이블 (재사용 컴포넌트) */}
      <section className="py-6 print:py-4">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground print:text-gray-500">
          견적 항목
        </h2>
        <InvoiceItemsTable
          items={invoiceData.items}
          totalAmount={invoiceData.totalAmount}
          taxIncluded={invoiceData.taxIncluded}
        />
      </section>

      {/* 메모 섹션 (있을 때만 표시) */}
      {invoiceData.note && (
        <>
          <Separator />
          <section className="py-6 print:py-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground print:text-gray-500">
              <StickyNote className="h-3 w-3" aria-hidden="true" />
              메모
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground print:text-gray-600">
              {invoiceData.note}
            </p>
          </section>
        </>
      )}

      {/* 인쇄용 푸터 */}
      <footer className="hidden border-t py-4 text-center text-xs text-muted-foreground print:block print:text-gray-400">
        본 견적서는 자동 생성되었습니다.
      </footer>
    </div>
  );
}
