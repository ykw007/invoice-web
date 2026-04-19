import { CalendarDays, Mail, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import type { Invoice } from "@/types";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

interface InvoiceMetaSectionProps {
  invoice: Invoice;
  className?: string;
}

/**
 * 견적서 메타 정보 섹션 컴포넌트 (서버 컴포넌트)
 * - 견적서 번호/상태/클라이언트명/이메일/발행일/유효기한 표시
 * - 반응형 Grid 레이아웃 (1col → 2col → 3col)
 */
export function InvoiceMetaSection({ invoice, className }: InvoiceMetaSectionProps) {
  const { data, status } = invoice;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-xl font-bold tracking-tight">
            {data.invoiceNumber}
          </CardTitle>
          <InvoiceStatusBadge status={status} />
        </div>
      </CardHeader>

      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 클라이언트명 */}
          <div className="flex flex-col gap-1">
            <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              클라이언트
            </dt>
            <dd className="text-sm font-medium">{data.clientName}</dd>
          </div>

          {/* 클라이언트 이메일 */}
          {data.clientEmail && (
            <div className="flex flex-col gap-1">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
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
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
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
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
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
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
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
  );
}
