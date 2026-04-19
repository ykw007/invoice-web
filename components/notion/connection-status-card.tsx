import { CheckCircle2, XCircle, AlertCircle, Database } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { NotionConnectionStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ConnectionStatusCardProps {
  /** 현재 노션 연동 상태 */
  status: NotionConnectionStatus;
  /** 등록된 견적서 DB ID */
  databaseId: string | null;
  /** 연동 일시 (ISO 문자열) */
  connectedAt: string | null;
  className?: string;
}

/** 상태별 UI 설정 */
const STATUS_CONFIG: Record<
  NotionConnectionStatus,
  {
    label: string;
    description: string;
    badgeClass: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
  }
> = {
  connected: {
    label: "연동됨",
    description: "노션 데이터베이스와 정상적으로 연동되어 있습니다.",
    badgeClass:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircle2,
    iconClass: "text-green-600 dark:text-green-400",
  },
  disconnected: {
    label: "미연동",
    description: "노션 계정이 연동되지 않았습니다. 아래 버튼으로 연동해주세요.",
    badgeClass: "border-muted text-muted-foreground",
    icon: XCircle,
    iconClass: "text-muted-foreground",
  },
  error: {
    label: "연동 오류",
    description: "노션 연동 중 오류가 발생했습니다. 다시 연동해주세요.",
    badgeClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: AlertCircle,
    iconClass: "text-red-600 dark:text-red-400",
  },
};

/**
 * 노션 연동 상태 카드 컴포넌트 (서버 컴포넌트)
 * - connected/disconnected/error 상태별 색상 뱃지 및 설명
 * - 연동된 경우 databaseId 및 connectedAt 표시
 */
export function ConnectionStatusCard({
  status,
  databaseId,
  connectedAt,
  className,
}: ConnectionStatusCardProps) {
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">노션 연동 상태</CardTitle>
          <Badge variant="outline" className={cn("text-xs", config.badgeClass)}>
            <StatusIcon className={cn("mr-1 h-3 w-3", config.iconClass)} />
            {config.label}
          </Badge>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>

      {status === "connected" && (databaseId ?? connectedAt) && (
        <>
          <Separator />
          <CardContent className="pt-4">
            <dl className="space-y-2 text-sm">
              {databaseId && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:w-28 sm:shrink-0">
                    <Database className="h-3.5 w-3.5" />
                    견적서 DB
                  </dt>
                  <dd className="truncate font-mono text-xs text-foreground">
                    {databaseId}
                  </dd>
                </div>
              )}
              {connectedAt && (
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <dt className="text-xs font-medium text-muted-foreground sm:w-28 sm:shrink-0">
                    연동일
                  </dt>
                  <dd className="text-xs tabular-nums">
                    {new Date(connectedAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </>
      )}

      {status === "error" && (
        <>
          <Separator />
          <CardContent className="pt-4">
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              연동 토큰이 만료되었거나 권한이 변경되었을 수 있습니다.
              재연동 후 정상 동작을 확인해주세요.
            </p>
          </CardContent>
        </>
      )}
    </Card>
  );
}
