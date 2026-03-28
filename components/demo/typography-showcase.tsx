import { SectionHeading } from "@/components/common/section-heading";
import { Separator } from "@/components/ui/separator";

/** 타이포그래피 스타일 시각화 */
export function TypographyShowcase() {
  return (
    <section className="container mx-auto px-4 py-16 space-y-8">
      <SectionHeading
        title="타이포그래피"
        description="Tailwind CSS 기반의 타이포그래피 스타일을 확인합니다."
      />

      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            H1. 제목 스타일
          </h1>
          <Separator className="mt-2" />
        </div>

        <h2 className="text-3xl font-semibold tracking-tight">H2. 부제목 스타일</h2>
        <h3 className="text-2xl font-semibold tracking-tight">H3. 소제목 스타일</h3>
        <h4 className="text-xl font-semibold tracking-tight">H4. 소소제목 스타일</h4>
        <h5 className="text-lg font-semibold">H5. 강조 텍스트</h5>
        <h6 className="text-base font-semibold">H6. 기본 강조 텍스트</h6>

        <p className="leading-7 text-xl text-muted-foreground">
          Lead — 본문보다 크게 표시되는 강조 단락입니다. 페이지의 주요 내용을
          요약할 때 사용합니다.
        </p>

        <p className="leading-7">
          Paragraph — 기본 본문 텍스트입니다. 충분한 줄 높이(line-height)와 가독성 좋은
          폰트 크기를 제공합니다. 긴 텍스트도 편안하게 읽을 수 있습니다.
        </p>

        <p className="text-sm text-muted-foreground">
          Muted — 보조 설명이나 부연 내용에 사용하는 흐린 텍스트입니다.
        </p>

        <p className="text-sm">
          Code 예시:{" "}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
            npm run dev
          </code>
        </p>
      </div>
    </section>
  );
}
