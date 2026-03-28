---
description: '새로운 Next.js 페이지를 프로젝트 패턴에 맞게 생성합니다'
allowed-tools:
  [
    'Read',
    'Write',
    'Edit',
    'Bash(ls:*)',
    'Glob',
  ]
---

# Claude 명령어: new-page

`$ARGUMENTS`에 지정된 경로에 새 페이지를 생성합니다.

## 인수 파싱

`$ARGUMENTS` 형식: `<경로> [--form] [--query]`

- `<경로>`: 생성할 페이지 경로 (예: `dashboard/reports`, `auth/forgot-password`, `about`)
- `--form`: React Hook Form + Zod 폼 포함
- `--query`: TanStack Query 데이터 페칭 포함

## 프로세스

1. `$ARGUMENTS`에서 경로와 플래그를 파싱
2. 경로의 첫 세그먼트로 라우트 그룹 자동 감지:
   - `dashboard`, `settings`, `admin` → `app/(dashboard)/`
   - `auth`, `login`, `register` → `app/(auth)/`
   - 그 외 → `app/`
3. 아래 규칙에 따라 파일 생성

## 생성 파일

### 기본 (플래그 없음)
- `app/<그룹>/<경로>/page.tsx`

### `--query` 플래그
- `app/<그룹>/<경로>/page.tsx` (Suspense + useQuery 포함)

### `--form` 플래그
- `app/<그룹>/<경로>/page.tsx`
- `lib/schemas/<name>.schema.ts` (Zod 스키마)

## 코드 패턴

### 기본 대시보드 페이지 패턴
```tsx
"use client";

import { PageHeader } from "@/components/layout/page-header";

export default function <Name>Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="<타이틀>"
        description="<설명>"
      />
      {/* 콘텐츠 */}
    </div>
  );
}
```

### `--query` 패턴 (TanStack Query)
```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import type { ApiResponse } from "@/types";

/** <Resource> 도메인 타입 */
interface <Resource> {
  id: string;
  // 필드 정의
}

export default function <Name>Page() {
  const { data, isLoading, isError, refetch } = useQuery<ApiResponse<<Resource>[]>>({
    queryKey: ["<name>"],
    queryFn: async () => {
      const res = await fetch("/api/<name>");
      if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
      return res.json() as Promise<ApiResponse<<Resource>[]>>;
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시 유지
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="데이터를 불러오지 못했습니다."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="<타이틀>" description="<설명>" />
      {/* data.data 활용 콘텐츠 */}
    </div>
  );
}
```

### `--form` 패턴 (React Hook Form + Zod)
```tsx
// lib/schemas/<name>.schema.ts
import { z } from "zod";
import { requiredString } from "./common.schema";

export const <name>Schema = z.object({
  // 필드 정의
});

export type <Name>FormData = z.infer<typeof <name>Schema>;
```

```tsx
// page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { <name>Schema, type <Name>FormData } from "@/lib/schemas/<name>.schema";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { toast } from "@/lib/toast";

export default function <Name>Page() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<<Name>FormData>({
    resolver: zodResolver(<name>Schema),
    defaultValues: {},
  });

  const onSubmit = async (data: <Name>FormData) => {
    try {
      // 제출 로직 (예: await fetch("/api/<name>", { method: "POST", body: JSON.stringify(data) }))
      toast.success("저장 완료!", "성공적으로 저장되었습니다.");
    } catch {
      toast.error("오류 발생", "저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* FormField 컴포넌트로 필드 구성 */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoadingSpinner size="sm" /> : "저장"}
        </Button>
      </form>
    </div>
  );
}
```

## 규칙

- `any` 타입 사용 금지, 모든 타입 명시
- 2칸 들여쓰기
- 컴포넌트명은 PascalCase, 경로 마지막 세그먼트 기반
- 한국어 주석 및 UI 텍스트
- 반응형 레이아웃 필수 (Tailwind 반응형 클래스 사용)
- `"use client"` 지시어: 상태/이벤트 사용 시 추가
- 기존 컴포넌트 재사용: `PageHeader`, `LoadingSpinner`, `ErrorState`, `FormField`, `StatCard`, `DataTable`
