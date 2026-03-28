"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { CodeBlock } from "@/components/common/code-block";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/** 색상 팔레트 스와치 */
function ColorSwatch({ variable, label }: { variable: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-8 w-8 rounded-md border shadow-sm"
        style={{ backgroundColor: `hsl(var(--${variable}))` }}
      />
      <div>
        <p className="text-xs font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">--{variable}</p>
      </div>
    </div>
  );
}

export default function OptimizationExamplePage() {
  return (
    <MainLayout>
      <Container as="main" className="py-12">
        <PageHeader
          title="설정 및 최적화"
          description="테마, 성능 최적화, 앱 설정 가이드입니다."
        />

        <div className="space-y-12">
          {/* 테마 전환 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">테마 전환</h2>
              <Badge variant="outline">next-themes</Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ThemeToggle 컴포넌트</CardTitle>
                <CardDescription>라이트 / 다크 / 시스템 테마를 순환합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <span className="text-sm text-muted-foreground">
                    클릭하여 테마를 변경하세요
                  </span>
                </div>
                <CodeBlock
                  language="tsx"
                  code={`import { ThemeToggle } from "@/components/common/theme-toggle";

// 헤더에 배치
<ThemeToggle />`}
                />
              </CardContent>
            </Card>
          </section>

          {/* 색상 팔레트 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">색상 팔레트</h2>
              <Badge variant="outline">CSS Variables</Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">다크/라이트 모드 색상</CardTitle>
                <CardDescription>
                  테마 전환 시 CSS 변수가 자동으로 교체됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">기본 색상</p>
                    <ColorSwatch variable="background" label="Background" />
                    <ColorSwatch variable="foreground" label="Foreground" />
                    <ColorSwatch variable="card" label="Card" />
                    <ColorSwatch variable="primary" label="Primary" />
                    <ColorSwatch variable="secondary" label="Secondary" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">상태 색상</p>
                    <ColorSwatch variable="destructive" label="Destructive" />
                    <ColorSwatch variable="muted" label="Muted" />
                    <ColorSwatch variable="accent" label="Accent" />
                    <ColorSwatch variable="border" label="Border" />
                    <ColorSwatch variable="input" label="Input" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator />

          {/* 코드 스플리팅 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">코드 스플리팅</h2>
              <Badge variant="outline">Next.js</Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">dynamic import</CardTitle>
                <CardDescription>
                  클라이언트에서만 필요한 컴포넌트를 동적으로 import합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="tsx"
                  code={`import dynamic from "next/dynamic";

// SSR을 비활성화하고 동적으로 로드
const HeavyChart = dynamic(
  () => import("@/components/charts/heavy-chart"),
  {
    ssr: false,
    loading: () => <LoadingSpinner />,
  }
);

export default function Page() {
  return <HeavyChart />;
}`}
                />
              </CardContent>
            </Card>
          </section>

          {/* Image 최적화 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Image 최적화</h2>
              <Badge variant="outline">next/image</Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Next.js Image 컴포넌트</CardTitle>
                <CardDescription>
                  자동 WebP 변환, lazy loading, 크기 최적화를 지원합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="tsx"
                  code={`import Image from "next/image";

// 정적 이미지 (자동 크기 감지)
<Image
  src="/images/hero.png"
  alt="히어로 이미지"
  width={1200}
  height={630}
  priority // LCP 이미지에 적용
/>

// 반응형 이미지
<div className="relative aspect-video">
  <Image
    src="/images/banner.jpg"
    alt="배너"
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
</div>`}
                />
              </CardContent>
            </Card>
          </section>

          {/* 메타데이터 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">메타데이터 설정</h2>
              <Badge variant="outline">App Router</Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">layout.tsx 메타데이터</CardTitle>
                <CardDescription>
                  SEO를 위한 메타데이터를 정적/동적으로 설정합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="tsx"
                  code={`import type { Metadata } from "next";

// 정적 메타데이터
export const metadata: Metadata = {
  title: "페이지 제목",
  description: "페이지 설명",
  openGraph: {
    title: "OG 제목",
    description: "OG 설명",
    images: ["/og-image.png"],
  },
};

// 동적 메타데이터 (params 사용)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await fetchPost(params.id);
  return {
    title: post.title,
    description: post.excerpt,
  };
}`}
                />
              </CardContent>
            </Card>
          </section>

          {/* 환경변수 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">환경변수 설정</h2>
              <Badge variant="outline">.env</Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">.env.local 예시</CardTitle>
                <CardDescription>
                  NEXT_PUBLIC_ 접두사가 있으면 클라이언트에서도 접근 가능합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  language="bash"
                  code={`# 서버 전용 (API 키, DB URL 등)
DATABASE_URL="postgresql://..."
API_SECRET_KEY="your-secret-key"

# 클라이언트 접근 가능
NEXT_PUBLIC_APP_URL="https://example.com"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"`}
                />
              </CardContent>
            </Card>
          </section>
        </div>
      </Container>
    </MainLayout>
  );
}
