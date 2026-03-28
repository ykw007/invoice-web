---
description: '새로운 React 컴포넌트를 프로젝트 패턴에 맞게 생성합니다'
allowed-tools:
  [
    'Read',
    'Write',
    'Edit',
    'Bash(ls:*)',
    'Glob',
  ]
---

# Claude 명령어: new-component

`$ARGUMENTS`에 지정된 이름과 카테고리로 새 컴포넌트를 생성합니다.

## 인수 파싱

`$ARGUMENTS` 형식: `<ComponentName> [카테고리] [--form] [--card]`

- `<ComponentName>`: PascalCase 컴포넌트 이름 (예: `UserCard`, `ProductList`)
- `[카테고리]`: 저장 위치 (기본값: `common`)
  - `common` → `components/common/`
  - `layout` → `components/layout/`
  - `demo` → `components/demo/`
  - `ui` → `components/ui/`
- `--form`: React Hook Form + Zod 폼 컴포넌트로 생성
- `--card`: Card UI 래퍼 포함

## 생성 파일

- `components/<카테고리>/<component-name>.tsx` (kebab-case 파일명)

## 코드 패턴

### 기본 컴포넌트
```tsx
import { cn } from "@/lib/utils";
import type { BaseProps } from "@/types";

interface <ComponentName>Props extends BaseProps {
  // Props 정의
}

/** <ComponentName> 컴포넌트 설명 */
export function <ComponentName>({ className, children }: <ComponentName>Props) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}
```

### `--card` 패턴
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BaseProps } from "@/types";

interface <ComponentName>Props extends BaseProps {
  title: string;
  // 추가 Props
}

/** <ComponentName> 카드 컴포넌트 */
export function <ComponentName>({ title, className, children }: <ComponentName>Props) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
```

### `--form` 패턴 (React Hook Form + Zod)
```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { requiredString } from "@/lib/schemas/common.schema";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const <componentName>Schema = z.object({
  // 필드 정의
});

type <ComponentName>FormData = z.infer<typeof <componentName>Schema>;

interface <ComponentName>Props {
  className?: string;
  onSuccess?: () => void;
}

/** <ComponentName> 폼 컴포넌트 */
export function <ComponentName>({ className, onSuccess }: <ComponentName>Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<<ComponentName>FormData>({
    resolver: zodResolver(<componentName>Schema),
    defaultValues: {},
  });

  const onSubmit = async (data: <ComponentName>FormData) => {
    // 제출 로직
    toast.success("저장 완료!", "성공적으로 저장되었습니다.");
    reset();
    onSuccess?.();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-4", className)}
    >
      {/* FormField로 필드 구성 */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            저장 중...
          </span>
        ) : (
          "저장"
        )}
      </Button>
    </form>
  );
}
```

## 규칙

- `any` 타입 사용 금지, Props 인터페이스 명시
- 2칸 들여쓰기
- 파일명은 kebab-case (예: `user-card.tsx`)
- 컴포넌트명은 PascalCase, named export 사용
- `cn()` 유틸로 className 병합
- 한국어 JSDoc 주석 필수
- `"use client"` 지시어: 상태/이벤트/훅 사용 시만 추가
- 기존 컴포넌트 재사용: `FormField`, `LoadingSpinner`, `Button`, `Input`, `Card` 등
- 반응형 필수 (Tailwind 반응형 클래스 사용)
