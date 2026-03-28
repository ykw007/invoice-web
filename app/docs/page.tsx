import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

export default function DocsPage() {
  return (
    <MainLayout>
      <Container as="main" className="py-12">
        <PageHeader
          title="문서"
          description="스타터킷 사용 방법과 컴포넌트 가이드를 확인하세요."
        />

        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">시작하기</h2>
            <p className="text-muted-foreground">
              이 스타터킷은 Next.js 15, React 19, Tailwind CSS, shadcn/ui를 기반으로
              구성된 현대적인 웹 애플리케이션 템플릿입니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">설치</h2>
            <div className="rounded-lg border bg-muted p-4 font-mono text-sm">
              <p>git clone &lt;repository-url&gt;</p>
              <p>cd project</p>
              <p>npm install</p>
              <p>npm run dev</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">디렉토리 구조</h2>
            <div className="rounded-lg border bg-muted p-4 font-mono text-sm space-y-1">
              <p>app/          — Next.js App Router 페이지</p>
              <p>components/   — 재사용 가능한 컴포넌트</p>
              <p>hooks/        — 커스텀 훅</p>
              <p>lib/          — 유틸리티 함수</p>
              <p>types/        — TypeScript 타입 정의</p>
            </div>
          </section>
        </div>
      </Container>
    </MainLayout>
  );
}
