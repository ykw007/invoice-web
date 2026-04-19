import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { InvoiceItem } from "@/types";

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

interface InvoiceItemsTableProps {
  /** 견적 항목 목록 */
  items: InvoiceItem[];
  /** 합계 금액 (원) */
  totalAmount: number;
  /** 세금 포함 여부 */
  taxIncluded: boolean;
  className?: string;
}

/**
 * 견적서 항목 테이블 컴포넌트 (서버 컴포넌트)
 * - 항목명/수량/단가/소계 컬럼
 * - tfoot에 합계/세금/총계 표시
 * - KRW 통화 포맷 (Intl.NumberFormat)
 * - 세금 포함 여부 뱃지 표시
 */
export function InvoiceItemsTable({
  items,
  totalAmount,
  taxIncluded,
  className,
}: InvoiceItemsTableProps) {
  /* 세금 계산 */
  const taxAmount = taxIncluded
    ? Math.round(totalAmount - totalAmount / (1 + TAX_RATE))
    : Math.round(totalAmount * TAX_RATE);

  const grandTotal = taxIncluded ? totalAmount : totalAmount + taxAmount;

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm" aria-label="견적 항목 목록">
        <thead>
          <tr className="border-b bg-muted/40 text-left">
            <th className="px-4 py-3 font-medium text-muted-foreground">품목</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              수량
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              단가
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              소계
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                견적 항목이 없습니다.
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr
                key={index}
                className={cn(
                  "hover:bg-muted/20",
                  index % 2 === 1 && "bg-muted/10"
                )}
              >
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {item.quantity.toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {formatKRW(item.unitPrice)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">
                  {formatKRW(item.subtotal)}
                </td>
              </tr>
            ))
          )}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan={4} className="px-4 pt-4">
              <dl className="flex flex-col gap-2">
                {/* 소계 */}
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-muted-foreground">소계</dt>
                  <dd className="tabular-nums">{formatKRW(totalAmount)}</dd>
                </div>

                {/* 부가세 */}
                <div className="flex items-center justify-between text-sm">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    부가세 (10%)
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        taxIncluded
                          ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {taxIncluded ? "포함" : "별도"}
                    </Badge>
                  </dt>
                  <dd className="tabular-nums text-muted-foreground">
                    {taxIncluded ? "−" : "+"}&nbsp;{formatKRW(taxAmount)}
                  </dd>
                </div>

                <Separator className="my-1" />

                {/* 총계 */}
                <div className="flex items-center justify-between pb-3">
                  <dt className="text-base font-semibold">총계</dt>
                  <dd className="text-lg font-bold tabular-nums">
                    {formatKRW(grandTotal)}
                  </dd>
                </div>
              </dl>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
