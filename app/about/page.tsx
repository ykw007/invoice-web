import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";

export default function AboutPage() {
  return (
    <MainLayout>
      <Container as="main" className="py-12">
        <PageHeader
          title="소개"
          description="이 프로젝트에 대해 알아보세요."
        />

        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">프로젝트 소개</h2>
            <p className="text-muted-foreground">
              이 스타터킷은 빠르고 효율적인 웹 개발을 위해 설계된 Next.js 템플릿입니다.
              현대적인 기술 스택과 best practice를 적용하여 프로젝트를 빠르게 시작할 수 있습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">기술 스택</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Next.js 15 — React 기반 풀스택 프레임워크</li>
              <li>• React 19 — 최신 React 기능 활용</li>
              <li>• TypeScript — 타입 안전성 보장</li>
              <li>• Tailwind CSS — 유틸리티 기반 스타일링</li>
              <li>• shadcn/ui — 고품질 UI 컴포넌트</li>
              <li>• Zustand — 가벼운 상태 관리</li>
              <li>• React Hook Form + Zod — 폼 유효성 검사</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">목표</h2>
            <p className="text-muted-foreground">
              반복적인 초기 설정 없이 핵심 비즈니스 로직에 집중할 수 있도록
              필수 기능과 컴포넌트를 사전 구성하여 제공합니다.
            </p>
          </section>
        </div>
      </Container>
    </MainLayout>
  );
}
