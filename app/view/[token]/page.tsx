import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

/**
 * 공개 견적서 뷰어 페이지 - 클라이언트용 (F006, F007, F011)
 * - 로그인 없이 share_token으로 접근 가능
 * - 토큰 유효성 검사 후 견적서 표시
 * - PDF 다운로드 기능
 *
 * TODO: share_token 유효성 검사 → GET /api/invoices/view/[token]
 * TODO: 유효하지 않거나 만료된 토큰 → /error 페이지로 리다이렉트
 * TODO: 견적서 뷰어 UI 구현 (인쇄 최적화 레이아웃)
 * TODO: @react-pdf/renderer로 PDF 생성 및 다운로드
 */
interface ViewPageProps {
  params: Promise<{ token: string }>;
}

export default async function InvoiceViewPage({ params }: ViewPageProps) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* 상단 액션 바 */}
      <div className="border-b bg-background px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="text-sm text-muted-foreground">
            견적서 토큰: {token}
          </span>
          {/* TODO: PDF 다운로드 버튼 */}
          <Button variant="outline" size="sm" disabled>
            <Download className="mr-2 h-4 w-4" />
            PDF 다운로드
          </Button>
        </div>
      </div>

      {/* 견적서 본문 */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* TODO: 토큰 유효성 검사 후 견적서 데이터 렌더링 */}
        <div className="rounded-lg border border-dashed bg-background p-12 text-center text-muted-foreground">
          견적서 내용이 여기에 표시됩니다.
        </div>
      </div>
    </div>
  );
}
