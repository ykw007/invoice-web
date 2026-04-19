"use client";

import { Check, Copy, Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatedWrapper } from "@/components/common/animated-wrapper";
import { useCreateShareLink } from "@/hooks/use-create-share-link";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface ShareLinkPanelProps {
  /** 견적서 ID */
  invoiceId: string;
  /** 기존 공유 토큰 (없으면 null) */
  shareToken: string | null;
  className?: string;
}

/**
 * 견적서 공유 링크 패널 컴포넌트
 * - shareToken 없음: '공유 링크 생성' 버튼 → mutate() 호출
 * - shareToken 있음: 공유 URL 표시 + 클립보드 복사 버튼
 * - 링크 생성/복사 성공 시 toast 표시
 */
export function ShareLinkPanel({
  invoiceId,
  shareToken: initialShareToken,
  className,
}: ShareLinkPanelProps) {
  const [copied, setCopied] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(initialShareToken);

  const { mutate, isPending } = useCreateShareLink(invoiceId);

  /** 공유 URL 생성 */
  const buildShareUrl = (token: string) =>
    `${window.location.origin}/view/${token}`;

  /** 공유 링크 생성 */
  const handleCreate = () => {
    mutate(undefined, {
      onSuccess: (data) => {
        setCurrentToken(data.shareToken);
        toast.success("공유 링크 생성됨", "링크가 클립보드에 복사되었습니다.");
        navigator.clipboard.writeText(buildShareUrl(data.shareToken)).catch(() => {
          /* 클립보드 접근 실패 시 무시 */
        });
      },
      onError: (err) => {
        toast.error("생성 실패", err.message ?? "공유 링크 생성에 실패했습니다.");
      },
    });
  };

  /** 클립보드 복사 */
  const handleCopy = async () => {
    if (!currentToken) return;
    try {
      await navigator.clipboard.writeText(buildShareUrl(currentToken));
      setCopied(true);
      toast.success("복사됨", "공유 링크가 클립보드에 복사되었습니다.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사 실패", "클립보드 접근에 실패했습니다.");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {!currentToken ? (
        /* 미생성 상태: 생성 버튼 */
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreate}
          disabled={isPending}
          aria-label="공유 링크 생성"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Link2 className="mr-2 h-4 w-4" />
              공유 링크 생성
            </>
          )}
        </Button>
      ) : (
        /* 생성 완료 상태: URL + 복사 버튼 */
        <AnimatedWrapper animation="fade" duration={0.3}>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={buildShareUrl(currentToken)}
              className="h-8 flex-1 font-mono text-xs text-muted-foreground"
              aria-label="공유 링크 URL"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              aria-label="공유 링크 복사"
              className="h-8 shrink-0 px-3"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </AnimatedWrapper>
      )}
    </div>
  );
}
