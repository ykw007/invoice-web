import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout, FileText, LayoutGrid, Code2, Database, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ExampleCategory {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  badge: string;
}

const EXAMPLE_CATEGORIES: ExampleCategory[] = [
  {
    title: "컴포넌트 쇼케이스",
    description: "shadcn/ui 컴포넌트들의 다양한 사용법",
    href: "/examples/components",
    icon: Layout,
    badge: "38개 컴포넌트",
  },
  {
    title: "폼 예제",
    description: "React Hook Form + Zod 폼 유효성 검사",
    href: "/examples/forms",
    icon: FileText,
    badge: "Hook Form + Zod",
  },
  {
    title: "레이아웃 예제",
    description: "Grid, Flex, Container 레이아웃 패턴",
    href: "/examples/layout",
    icon: LayoutGrid,
    badge: "Tailwind CSS",
  },
  {
    title: "usehooks-ts 예제",
    description: "유용한 커스텀 훅 실전 활용법",
    href: "/examples/hooks",
    icon: Code2,
    badge: "usehooks-ts",
  },
  {
    title: "데이터 페칭",
    description: "TanStack Query로 서버 데이터 관리",
    href: "/examples/data-fetching",
    icon: Database,
    badge: "React Query",
  },
  {
    title: "설정 및 최적화",
    description: "테마, 성능 최적화, 앱 설정 가이드",
    href: "/examples/optimization",
    icon: Settings,
    badge: "최적화",
  },
];

export default function ExamplesPage() {
  return (
    <MainLayout>
      <Container as="main" className="py-12">
        <PageHeader
          title="예제 모음"
          description="스타터킷의 다양한 기능을 실제 예제로 확인해보세요."
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {EXAMPLE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.href} className="flex flex-col">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1" />
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={category.href}>예제보기</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </Container>
    </MainLayout>
  );
}
