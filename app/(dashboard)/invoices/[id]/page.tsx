import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

/**
 * 견적서 상세 페이지 - 발행자용 (F004, F005)
 * - 견적서 상세 내용 확인
 * - 공유 링크 생성 및 클립보드 복사
 *
 * TODO: params.id로 견적서 데이터 fetch (TanStack Query)
 * TODO: 견적서 상세 UI 컴포넌트 구현
 * TODO: 공유 링크 생성 API 연결 (share_token 발급)
 * TODO: 클립보드 복사 기능 (use-copy-to-clipboard 훅 활용)
 */
interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title="견적서 상세"
        description={`견적서 ID: ${id}`}
      />

      {/* TODO: 공유 링크 생성 버튼 */}
      <div className="flex justify-end">
        <Button variant="outline" disabled>
          <Link2 className="mr-2 h-4 w-4" />
          공유 링크 생성
        </Button>
      </div>

      {/* TODO: 견적서 상세 내용 렌더링 */}
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        견적서 상세 내용이 여기에 표시됩니다.
      </div>
    </div>
  );
}
