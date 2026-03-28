import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Github } from "lucide-react";

const TECH_STACK = [
  "Next.js 15",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "shadcn/ui",
  "next-themes",
];

/** 랜딩 페이지 히어로 섹션 */
export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-24 text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          모던 Next.js
          <br />
          <span className="text-muted-foreground">스타터킷</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          빠른 웹 개발을 위한 완성도 높은 스타터킷.
          다크모드, 반응형, 타입 안전성을 기본으로 제공합니다.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" asChild>
          <Link href="#components">
            컴포넌트 보기 <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Github className="mr-2 h-4 w-4" /> GitHub
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {TECH_STACK.map((tech) => (
          <Badge key={tech} variant="secondary">
            {tech}
          </Badge>
        ))}
      </div>
    </section>
  );
}
