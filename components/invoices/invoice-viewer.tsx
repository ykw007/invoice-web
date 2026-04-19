import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { InvoiceStatusBadge } from "@/components/common/invoice-status-badge";
import type { InvoiceData, InvoiceStatus, Issuer } from "@/types";
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

/** 세율 (10%) */
const TAX_RATE = 0.1;

interface InvoiceViewerProps {
  /** 파싱된 견적서 데이터 */
  data: InvoiceData;
  /** 견적서 상태 */
  status: InvoiceStatus;
  /** 발행자 정보 */
  issuer: Issuer;
  className?: string;
}

/**
 * 인쇄 최적화 견적서 뷰어 컴포넌트 (서버 컴포넌트)
 * - 클라이언트용 공개 뷰어에서 사용
 * - print: CSS를 통해 인쇄 최적화
 */
export function InvoiceViewer({ data, status, issuer, className }: InvoiceViewerProps) {
  /* 세금 계산 */
  const taxAmount = data.taxIncluded
    ? Math.round(data.totalAmount - data.totalAmount / (1 + TAX_RATE))
    : Math.round(data.totalAmount * TAX_RATE);

  const grandTotal = data.taxIncluded
    ? data.totalAmount
    : data.totalAmount + taxAmount;

  return (
    <article
      className={cn(
        "rounded-xl border bg-white shadow-sm print:border-none print:shadow-none",
        className
      )}
      aria-label={`견적서 ${data.invoiceNumber}`}
    >
      {/* 견적서 헤더 */}
      <header className="p-8 pb-6 print:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* 발행자 정보 */}
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              발행자
            </p>
            <p className="text-lg font-bold">{issuer.name}</p>
            {issuer.contact && (
              <p className="text-sm text-muted-foreground">{issuer.contact}</p>
            )}
          </div>

          {/* 견적서 번호 + 상태 */}
          <div className="space-y-2 sm:text-right">
            <div className="flex items-center gap-2 sm:justify-end">
              <h1 className="text-2xl font-extrabold tracking-tight">
                견적서
              </h1>
            </div>
            <p className="text-base font-semibold text-muted-foreground">
              {data.invoiceNumber}
            </p>
            <div className="flex sm:justify-end">
              <InvoiceStatusBadge status={status} />
            </div>
          </div>
        </div>
      </header>

      <Separator />

      {/* 클라이언트 & 날짜 정보 */}
      <section className="grid grid-cols-1 gap-6 p-8 py-6 sm:grid-cols-2 print:p-6">
        {/* 수신자 정보 */}
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            수신자
          </p>
          <p className="font-semibold">{data.clientName}</p>
          {data.clientEmail && (
            <p className="text-sm text-muted-foreground">{data.clientEmail}</p>
          )}
        </div>

        {/* 날짜 정보 */}
        <div className="space-y-3 sm:text-right">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              발행일
            </p>
            <p className="text-sm tabular-nums">
              {formatDate(data.issuedAt, "yyyy년 MM월 dd일")}
            </p>
          </div>
          {data.dueDate && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                유효기한
              </p>
              <p className="text-sm tabular-nums">
                {formatDate(data.dueDate, "yyyy년 MM월 dd일")}
              </p>
            </div>
          )}
        </div>
      </section>

      <Separator />

      {/* 견적 항목 테이블 */}
      <section className="p-8 py-6 print:p-6">
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm"
            aria-label="견적 항목 목록"
          >
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 pr-4 font-semibold">품목</th>
                <th className="pb-3 px-4 text-right font-semibold">수량</th>
                <th className="pb-3 px-4 text-right font-semibold">단가</th>
                <th className="pb-3 pl-4 text-right font-semibold">소계</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr
                  key={index}
                  className={cn(
                    "border-b last:border-b-0",
                    index % 2 === 0 ? "bg-transparent" : "bg-muted/20"
                  )}
                >
                  <td className="py-3 pr-4 font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">
                    {item.quantity.toLocaleString("ko-KR")}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-muted-foreground">
                    {formatKRW(item.unitPrice)}
                  </td>
                  <td className="py-3 pl-4 text-right tabular-nums font-semibold">
                    {formatKRW(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 합계 / 세금 / 총계 섹션 */}
        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-2">
            {/* 소계 */}
            <div className="flex justify-between text-sm">
              <dt className="text-muted-foreground">소계</dt>
              <dd className="tabular-nums">{formatKRW(data.totalAmount)}</dd>
            </div>

            {/* 부가세 */}
            <div className="flex justify-between text-sm">
              <dt className="text-muted-foreground">
                부가세 (10%)
                {data.taxIncluded && (
                  <Badge
                    variant="outline"
                    className="ml-1.5 text-[10px] px-1 py-0"
                  >
                    포함
                  </Badge>
                )}
              </dt>
              <dd className="tabular-nums text-muted-foreground">
                {data.taxIncluded ? "−" : "+"}&nbsp;{formatKRW(taxAmount)}
              </dd>
            </div>

            <Separator />

            {/* 총계 */}
            <div className="flex justify-between">
              <dt className="font-semibold">총계</dt>
              <dd className="text-xl font-extrabold tabular-nums">
                {formatKRW(grandTotal)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 메모 (있을 때만) */}
      {data.note && (
        <>
          <Separator />
          <section className="p-8 py-6 print:p-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              메모
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {data.note}
            </p>
          </section>
        </>
      )}

      {/* 인쇄용 푸터 */}
      <footer className="hidden border-t px-8 py-4 text-center text-xs text-muted-foreground print:block">
        본 견적서는 자동 생성되었습니다.
      </footer>
    </article>
  );
}
