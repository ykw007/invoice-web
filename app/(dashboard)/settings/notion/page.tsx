"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Info, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { ConnectionStatusCard } from "@/components/notion/connection-status-card";
import { ConnectButton } from "@/components/notion/connect-button";
import { DatabaseSettingForm } from "@/components/notion/database-setting-form";
import { SyncButton } from "@/components/invoices/sync-button";
import { useNotionStatus } from "@/hooks/use-notion-status";
import { toast } from "@/lib/toast";

/**
 * 노션 연동 설정 페이지 (클라이언트 컴포넌트)
 * - useNotionStatus()로 연동 상태 조회
 * - ?connected=true → 성공 토스트
 * - ?error=<message> → 에러 토스트
 * - ConnectionStatusCard + ConnectButton + DatabaseSettingForm + SyncButton
 */
export default function NotionSettingsPage() {
  const searchParams = useSearchParams();
  const { data, isLoading, error, refetch } = useNotionStatus();

  /* OAuth 콜백 쿼리 파라미터 처리 (마운트 시 1회) */
  useEffect(() => {
    const connected = searchParams.get("connected");
    const errMsg = searchParams.get("error");

    if (connected === "true") {
      toast.success("노션 연동 완료", "노션 계정이 성공적으로 연동되었습니다.");
    } else if (errMsg) {
      toast.error("노션 연동 실패", decodeURIComponent(errMsg));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState onRetry={() => void refetch()} />
    );
  }

  const isConnected = data.status === "connected";

  return (
    <div className="space-y-6">
      <PageHeader
        title="노션 연동 설정"
        description="노션 데이터베이스와 연동하여 견적서를 동기화합니다."
      />

      {/* 1. 연동 상태 카드 */}
      <ConnectionStatusCard
        status={data.status}
        databaseId={data.databaseId}
        connectedAt={data.connectedAt}
      />

      {/* 2. 연결/해제 버튼 */}
      <div className="flex justify-start">
        <ConnectButton status={data.status} />
      </div>

      {/* 3. 데이터베이스 ID 설정 폼 */}
      <DatabaseSettingForm
        currentDatabaseId={data.databaseId}
        currentItemsDatabaseId={data.itemsDatabaseId}
        disabled={!isConnected}
      />

      {/* 4. 동기화 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="h-4 w-4" />
            견적서 동기화
          </CardTitle>
          <CardDescription>
            노션 데이터베이스에서 최신 견적서 데이터를 가져옵니다.
            {!isConnected && (
              <span className="ml-1 text-amber-600 dark:text-amber-400">
                (노션 연동 후 사용 가능합니다)
              </span>
            )}
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          <div className="flex gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              동기화는 노션 데이터베이스의 모든 견적서를 가져옵니다. 기존
              데이터는 덮어쓰기됩니다. 변경 사항이 있을 때만 실행하세요.
            </p>
          </div>
        </CardContent>

        <CardFooter>
          {isConnected ? (
            <SyncButton />
          ) : (
            <SyncButton />
          )}
        </CardFooter>
      </Card>

      {/* 5. 연동 가이드 카드 */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            연동 방법 안내
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground">
            {[
              "노션으로 연결 버튼을 클릭하여 OAuth 인증을 완료합니다.",
              "견적서 데이터베이스 ID를 노션 페이지 URL에서 복사하여 입력합니다.",
              "동기화 버튼을 눌러 노션의 견적서를 가져옵니다.",
            ].map((step, i) => (
              <li key={i} className="flex gap-2">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
