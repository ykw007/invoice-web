"use client";

import { Copy, Check, Link2, CalendarDays, User, Mail, FileText, StickyNote } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InvoiceStatusBadge } from "@/components/common/invoice-status-badge";
import type { Invoice } from "@/types";
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

interface InvoiceDetailProps {
  /** 견적서 데이터 (실제 구현 시 TanStack Query에서 주입) */
  invoice: Invoice;
}

/** 견적서 상세 클라이언트 컴포넌트 */
export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  /* TODO: 클립보드 복사 성공 상태 — use-copy-to-clipboard 훅으로 교체 */
  const [copied, setCopied] = useState(false);

  const { data } = invoice;

  /* 세금 계산 */
  const taxAmount = data.taxIncluded
    ? Math.round(data.totalAmount - data.totalAmount / (1 + TAX_RATE))
    : Math.round(data.totalAmount * TAX_RATE);

  const grandTotal = data.taxIncluded
    ? data.totalAmount
    : data.totalAmount + taxAmount;

  const handleCopyShareLink = () => {
    /* TODO: 공유 링크 생성 API(POST /api/invoices/{id}/share) 연결 후 클립보드 복사 */
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 헤더: 견적서 번호 + 상태 배지 + 공유 버튼 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight">
            {data.invoiceNumber}
          </h2>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyShareLink}
          aria-label="견적서 공유 링크 생성 및 복사"
          className="w-full sm:w-auto"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              복사됨
            </>
          ) : (
            <>
              <Link2 className="mr-2 h-4 w-4" />
              공유 링크 복사
            </>
          )}
        </Button>
      </div>

      {/* 견적서 메타 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* 클라이언트명 */}
            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                클라이언트
              </dt>
              <dd className="text-sm font-medium">{data.clientName}</dd>
            </div>

            {/* 클라이언트 이메일 */}
            {data.clientEmail && (
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  이메일
                </dt>
                <dd className="text-sm">
                  <a
                    href={`mailto:${data.clientEmail}`}
                    className="text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
                  >
                    {data.clientEmail}
                  </a>
                </dd>
              </div>
            )}

            {/* 발행일 */}
            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                발행일
              </dt>
              <dd className="text-sm tabular-nums">
                {formatDate(data.issuedAt, "yyyy년 MM월 dd일")}
              </dd>
            </div>

            {/* 유효기한 */}
            {data.dueDate && (
              <div className="flex flex-col gap-1">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  유효기한
                </dt>
                <dd className="text-sm tabular-nums">
                  {formatDate(data.dueDate, "yyyy년 MM월 dd일")}
                </dd>
              </div>
            )}

            {/* 세금 포함 여부 */}
            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                세금
              </dt>
              <dd>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    data.taxIncluded
                      ? "border-green-200 text-green-700 dark:border-green-800 dark:text-green-400"
                      : "text-muted-foreground"
                  )}
                >
                  {data.taxIncluded ? "세금 포함" : "세금 별도"}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* 견적 항목 테이블 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">견적 항목</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="견적 항목 목록">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-6 py-3 font-medium text-muted-foreground">
                    품목
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                    수량
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                    단가
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                    소계
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((item, index) => (
                  <tr key={index} className="hover:bg-muted/20">
                    <td className="px-6 py-3 font-medium">{item.name}</td>
                    <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                      {item.quantity.toLocaleString("ko-KR")}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                      {formatKRW(item.unitPrice)}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums font-medium">
                      {formatKRW(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 합계 섹션 */}
          <div className="border-t px-6 py-4">
            <dl className="flex flex-col gap-2">
              {/* 소계 */}
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">소계</dt>
                <dd className="tabular-nums">{formatKRW(data.totalAmount)}</dd>
              </div>

              {/* 세금 */}
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">
                  부가세 (10%){" "}
                  {data.taxIncluded && (
                    <span className="text-xs text-muted-foreground/70">
                      포함
                    </span>
                  )}
                </dt>
                <dd className="tabular-nums text-muted-foreground">
                  {data.taxIncluded ? "−" : "+"}&nbsp;{formatKRW(taxAmount)}
                </dd>
              </div>

              <Separator className="my-1" />

              {/* 총계 */}
              <div className="flex items-center justify-between">
                <dt className="text-base font-semibold">총계</dt>
                <dd className="text-lg font-bold tabular-nums">
                  {formatKRW(grandTotal)}
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      {/* 메모 카드 (메모가 있을 때만 표시) */}
      {data.note && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <StickyNote className="h-4 w-4" />
              메모
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {data.note}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
