import { PageHeader } from "@/components/layout/page-header";

/**
 * 견적서 목록 페이지 (F002, F003)
 * - 노션 DB에서 동기화된 견적서 목록 표시
 * - 동기화 버튼, 검색/필터 기능 포함
 *
 * TODO: TanStack Query로 견적서 목록 fetch
 * TODO: DataTable 컴포넌트로 목록 렌더링
 * TODO: 노션 DB 동기화 버튼 구현
 * TODO: 공유 링크 생성 액션 연결
 */
export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="견적서 목록"
        description="노션 데이터베이스에서 동기화된 견적서를 관리합니다."
      />

      {/* TODO: 동기화 버튼 + 검색 영역 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          견적서를 불러오는 중입니다...
        </p>
      </div>

      {/* TODO: DataTable<Invoice> 렌더링 */}
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        견적서 목록이 여기에 표시됩니다.
      </div>
    </div>
  );
}
