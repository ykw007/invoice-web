import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/types";
import { INVOICE_STATUS_LABEL } from "@/types";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

/** 견적서 상태별 배지 색상 매핑 */
const STATUS_CLASS_MAP: Record<InvoiceStatus, string> = {
  draft: "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent",
  sent: "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-transparent dark:bg-blue-900/30 dark:text-blue-400",
  accepted: "bg-green-100 text-green-700 hover:bg-green-100/80 border-transparent dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 hover:bg-red-100/80 border-transparent dark:bg-red-900/30 dark:text-red-400",
};

/**
 * 견적서 상태 뱃지 컴포넌트 (서버 컴포넌트)
 * - draft: 회색, sent: 파란색, accepted: 초록색, rejected: 빨간색
 * - INVOICE_STATUS_LABEL 상수로 한국어 라벨 표시
 */
export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_CLASS_MAP[status], className)}
    >
      {INVOICE_STATUS_LABEL[status]}
    </Badge>
  );
}
