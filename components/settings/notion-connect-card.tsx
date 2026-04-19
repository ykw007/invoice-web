"use client";

import { CheckCircle2, XCircle, Unplug, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { NotionConnectionStatus } from "@/types";
import { cn } from "@/lib/utils";

interface NotionConnectCardProps {
  /** 현재 노션 연동 상태 */
  status: NotionConnectionStatus;
  /** 연동 일시 (ISO 문자열, 연동됐을 때만) */
  connectedAt?: string | null;
}

/** 연동 상태별 UI 설정 */
const STATUS_CONFIG: Record<
  NotionConnectionStatus,
  {
    label: string;
    badgeClass: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
  }
> = {
  connected: {
    label: "연동됨",
    badgeClass:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircle2,
    iconClass: "text-green-600 dark:text-green-400",
  },
  disconnected: {
    label: "미연동",
    badgeClass: "border-muted text-muted-foreground",
    icon: XCircle,
    iconClass: "text-muted-foreground",
  },
  error: {
    label: "연동 오류",
    badgeClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: XCircle,
    iconClass: "text-red-600 dark:text-red-400",
  },
};

/** 노션 계정 연동 상태 카드 */
export function NotionConnectCard({
  status,
  connectedAt,
}: NotionConnectCardProps) {
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span>노션 계정 연동</span>
          <Badge variant="outline" className={cn("text-xs", config.badgeClass)}>
            <StatusIcon className={cn("mr-1 h-3 w-3", config.iconClass)} />
            {config.label}
          </Badge>
        </CardTitle>
        <CardDescription>
          노션 계정을 연동하여 데이터베이스에 접근 권한을 부여합니다.
        </CardDescription>
      </CardHeader>

      {status === "connected" && connectedAt && (
        <>
          <Separator />
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              연동일:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {new Date(connectedAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </CardContent>
        </>
      )}

      {status === "error" && (
        <>
          <Separator />
          <CardContent className="pt-4">
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              노션 연동 중 오류가 발생했습니다. 다시 연동해주세요.
            </p>
          </CardContent>
        </>
      )}

      <CardFooter className="gap-2 pt-4">
        {status === "connected" ? (
          /* 연동됨 → 연동 해제 버튼 표시 */
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              /* TODO: 노션 연동 해제 API 연결 */
            }}
          >
            <Unplug className="mr-2 h-4 w-4" />
            연동 해제
          </Button>
        ) : (
          /* 미연동 / 오류 → 연동 버튼 표시 */
          <Button
            size="sm"
            onClick={() => {
              /* TODO: GET /api/auth/notion 리다이렉트로 OAuth 플로우 시작 */
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {status === "error" ? "다시 연동하기" : "노션으로 연동하기"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
