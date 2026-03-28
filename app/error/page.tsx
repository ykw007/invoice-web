import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * 오류 안내 페이지
 * - 만료된 공유 링크 안내
 * - 유효하지 않은 토큰 안내
 *
 * TODO: searchParams로 오류 유형 구분 (expired | invalid | not_found)
 * TODO: 오류 유형에 따른 메시지 분기 처리
 */
export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">링크를 사용할 수 없습니다</h1>
        <p className="text-muted-foreground">
          이 견적서 링크가 만료되었거나 유효하지 않습니다.
          <br />
          발행자에게 새로운 링크를 요청해주세요.
        </p>
      </div>

      {/* TODO: 오류 유형별 상세 안내 메시지 */}

      <Button asChild variant="outline">
        <Link href="/login">로그인 페이지로</Link>
      </Button>
    </div>
  );
}
