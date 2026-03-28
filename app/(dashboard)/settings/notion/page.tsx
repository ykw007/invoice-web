import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, RefreshCw } from "lucide-react";

/**
 * 노션 연동 설정 페이지 (F001, F002)
 * - 노션 OAuth 연동 및 액세스 토큰 저장
 * - 노션 데이터베이스 ID 등록
 * - 견적서 수동 동기화
 *
 * TODO: 노션 OAuth 인증 플로우 구현 (Notion API)
 * TODO: 연동된 데이터베이스 ID 입력 폼
 * TODO: 동기화 버튼 → /api/notion/sync API 연결
 * TODO: 연동 상태 표시 (연동됨 / 미연동)
 * TODO: NotionIntegration 데이터 fetch (TanStack Query)
 */
export default function NotionSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="노션 연동 설정"
        description="노션 데이터베이스와 연동하여 견적서를 동기화합니다."
      />

      {/* 노션 OAuth 연동 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            노션 계정 연동
          </CardTitle>
          <CardDescription>
            노션 계정을 연동하여 데이터베이스에 접근 권한을 부여합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: 연동 상태에 따라 연동 버튼 / 연동 해제 버튼 표시 */}
          <Button disabled>
            노션으로 연동하기
          </Button>
        </CardContent>
      </Card>

      {/* 데이터베이스 ID 등록 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>데이터베이스 설정</CardTitle>
          <CardDescription>
            견적서가 저장된 노션 데이터베이스 ID를 입력합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* TODO: database_id 입력 폼 (React Hook Form + Zod) */}
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            데이터베이스 ID 입력 폼이 여기에 표시됩니다.
          </div>
        </CardContent>
      </Card>

      {/* 동기화 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            견적서 동기화
          </CardTitle>
          <CardDescription>
            노션 데이터베이스에서 최신 견적서 데이터를 가져옵니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: 동기화 버튼 → POST /api/notion/sync */}
          <Button variant="outline" disabled>
            <RefreshCw className="mr-2 h-4 w-4" />
            지금 동기화
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
