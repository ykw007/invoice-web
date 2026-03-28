import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { StatCard } from "@/components/common/stat-card";
import { CodeBlock } from "@/components/common/code-block";
import { AnimatedWrapper } from "@/components/common/animated-wrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, Star, Terminal } from "lucide-react";

export default function ComponentsPage() {
  return (
    <MainLayout>
    <Container as="main" className="py-12">
      <PageHeader
        title="컴포넌트 쇼케이스"
        description="스타터킷에 포함된 모든 컴포넌트를 확인하세요."
      />

      <div className="space-y-16">
        {/* Layer 0 - 애니메이션 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Layer 0 · 애니메이션</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AnimatedWrapper animation="fade" delay={0}>
              <div className="rounded-lg border p-4 text-center text-sm">fade</div>
            </AnimatedWrapper>
            <AnimatedWrapper animation="slide-up" delay={0.1}>
              <div className="rounded-lg border p-4 text-center text-sm">slide-up</div>
            </AnimatedWrapper>
            <AnimatedWrapper animation="scale" delay={0.2}>
              <div className="rounded-lg border p-4 text-center text-sm">scale</div>
            </AnimatedWrapper>
          </div>
        </section>

        {/* Layer 3 - 피드백 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Layer 3 · 피드백</h2>

          <div className="flex flex-wrap items-center gap-4">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <EmptyState
              title="주문 내역이 없습니다"
              description="첫 번째 주문을 시작해보세요."
            />
            <ErrorState
              title="데이터를 불러오지 못했습니다"
              message="네트워크 연결을 확인해주세요."
            />
          </div>

          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>알림</AlertTitle>
            <AlertDescription>shadcn/ui Alert 컴포넌트입니다.</AlertDescription>
          </Alert>
        </section>

        {/* Layer 4 - 데이터 표시 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Layer 4 · 데이터 표시</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard title="총 사용자" value="12,345" change={12.5} icon={Users} />
            <StatCard title="평점" value="4.8" change={0.3} icon={Star} />
            <StatCard title="매출" value="₩9,870,000" change={-2.1} />
          </div>

          <CodeBlock
            language="tsx"
            code={`import { StatCard } from "@/components/common/stat-card";

<StatCard
  title="총 사용자"
  value="12,345"
  change={12.5}
  icon={Users}
/>`}
          />

          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Accordion 아이템 1</AccordionTrigger>
              <AccordionContent>
                Accordion 컨텐츠입니다. shadcn/ui Accordion 컴포넌트를 사용합니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Accordion 아이템 2</AccordionTrigger>
              <AccordionContent>
                두 번째 Accordion 아이템입니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* 기본 UI 컴포넌트 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">기본 UI 컴포넌트</h2>

          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </section>
      </div>
    </Container>
    </MainLayout>
  );
}
