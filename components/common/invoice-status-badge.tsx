import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/types";
import { INVOICE_STATUS_LABEL } from "@/types";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

/** 견적서 상태별 배지 색상 매핑 */
const STATUS_VARIANT_MAP: Record<
  InvoiceStatus,
  { className: string }
> = {
  draft: {
    className: "bg-muted text-muted-foreground hover:bg-muted/80 border-transparent",
  },
  sent: {
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100/80 border-transparent dark:bg-blue-900/30 dark:text-blue-400",
  },
  accepted: {
    className: "bg-green-100 text-green-700 hover:bg-green-100/80 border-transparent dark:bg-green-900/30 dark:text-green-400",
  },
  rejected: {
    className: "bg-red-100 text-red-700 hover:bg-red-100/80 border-transparent dark:bg-red-900/30 dark:text-red-400",
  },
};

/** 견적서 상태 배지 컴포넌트 */
export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  const { className: statusClassName } = STATUS_VARIANT_MAP[status];

  return (
    <Badge
      variant="outline"
      className={cn(statusClassName, className)}
    >
      {INVOICE_STATUS_LABEL[status]}
    </Badge>
  );
}
