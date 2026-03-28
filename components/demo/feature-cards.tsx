import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FolderOpen, Moon, Layers, Shield } from "lucide-react";
import { SectionHeading } from "@/components/common/section-heading";

const FEATURES = [
  {
    icon: FolderOpen,
    title: "명확한 폴더 구조",
    description:
      "types, hooks, components, lib 등 실전 프로젝트에 최적화된 폴더 구조를 제공합니다.",
  },
  {
    icon: Moon,
    title: "다크 모드 지원",
    description:
      "next-themes와 Tailwind CSS의 .dark 클래스 방식으로 라이트/다크/시스템 테마를 지원합니다.",
  },
  {
    icon: Layers,
    title: "컴포넌트 시스템",
    description:
      "shadcn/ui 기반의 18개 컴포넌트가 포함되어 있어 즉시 사용 가능합니다.",
  },
  {
    icon: Shield,
    title: "타입 안전성",
    description:
      "any 타입 없는 엄격한 TypeScript 설정으로 안전하고 예측 가능한 코드를 작성합니다.",
  },
];

/** 주요 기능 카드 그리드 섹션 */
export function FeatureCards() {
  return (
    <section className="container mx-auto px-4 py-16 space-y-8">
      <SectionHeading
        title="주요 기능"
        description="실전 프로젝트 개발을 위한 모든 기반이 갖춰져 있습니다."
        className="text-center items-center"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-base">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
