"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { toast } from "@/lib/toast";
import type { NotionConnectionStatus } from "@/types";

interface ConnectButtonProps {
  /** 현재 노션 연동 상태 */
  status: NotionConnectionStatus;
}

/**
 * 노션 연결/해제 버튼 컴포넌트
 * - disconnected/error: /api/auth/notion OAuth 플로우 진입
 * - connected: DELETE /api/notion/database → 연동 해제 + 캐시 무효화
 */
export function ConnectButton({ status }: ConnectButtonProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const queryClient = useQueryClient();

  /** 노션 OAuth 연동 시작 */
  const handleConnect = () => {
    window.location.href = "/api/auth/notion";
  };

  /** 노션 연동 해제 */
  const handleDisconnect = async () => {
    if (!confirm("정말로 노션 연동을 해제하시겠습니까? 기존 동기화 데이터는 유지됩니다.")) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/notion/database", {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const json: { message?: string } = await res.json();
        throw new Error(json.message ?? "연동 해제에 실패했습니다.");
      }

      await queryClient.invalidateQueries({ queryKey: ["notion", "status"] });
      toast.success("연동 해제 완료", "노션 연동이 해제되었습니다.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "연동 해제에 실패했습니다.";
      toast.error("연동 해제 실패", message);
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (status === "connected") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleDisconnect}
        disabled={isDisconnecting}
        className="text-destructive hover:text-destructive"
        aria-label="노션 연동 해제"
      >
        {isDisconnecting ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            해제 중...
          </>
        ) : (
          <>
            <Unplug className="mr-2 h-4 w-4" />
            연동 해제
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={handleConnect}
      aria-label={status === "error" ? "노션 재연동" : "노션 연동 시작"}
    >
      <ExternalLink className="mr-2 h-4 w-4" />
      {status === "error" ? "다시 연동하기" : "노션으로 연결"}
    </Button>
  );
}
