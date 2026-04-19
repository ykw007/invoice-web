import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import type { InvoiceData, InvoiceStatus, Issuer } from "@/types";
import { cn } from "@/lib/utils";

interface PublicInvoiceHeaderProps {
  /** 발행자 정보 */
  issuer: Issuer;
  /** 파싱된 견적서 데이터 */
  invoiceData: InvoiceData;
  /** 견적서 상태 */
  status: InvoiceStatus;
  className?: string;
}

/**
 * 공개 뷰어 헤더 컴포넌트 (서버 컴포넌트)
 * - 발행자 정보(이름/연락처) + 견적서 번호/상태
 * - 클라이언트 정보(수신자명/이메일)
 * - 인쇄 친화적 레이아웃
 */
export function PublicInvoiceHeader({
  issuer,
  invoiceData,
  status,
  className,
}: PublicInvoiceHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      {/* 발행자 정보 */}
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground print:text-gray-500">
          발행자
        </p>
        <p className="text-lg font-bold">{issuer.name}</p>
        {issuer.contact && (
          <p className="text-sm text-muted-foreground print:text-gray-600">
            {issuer.contact}
          </p>
        )}
      </div>

      {/* 견적서 번호 + 상태 + 클라이언트 정보 */}
      <div className="space-y-3 sm:text-right">
        {/* 견적서 제목 */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight print:text-xl">
            견적서
          </h1>
          <p className="text-base font-semibold text-muted-foreground">
            {invoiceData.invoiceNumber}
          </p>
          <div className="flex sm:justify-end">
            <InvoiceStatusBadge status={status} />
          </div>
        </div>

        {/* 클라이언트(수신자) 정보 */}
        <div className="space-y-0.5 sm:text-right">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground print:text-gray-500">
            수신자
          </p>
          <p className="font-semibold">{invoiceData.clientName}</p>
          {invoiceData.clientEmail && (
            <p className="text-sm text-muted-foreground print:text-gray-600">
              {invoiceData.clientEmail}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
