# claude-nextjs-starter

Next.js 16 + React 19 App Router 기반 스타터킷. `src/` 디렉터리 없음.

## 기술 스택 (글로벌 설정과 다른 부분)

- **상태관리**: TanStack Query v5 (Zustand 없음)
- **Tailwind**: v4, postcss 기반 — `tailwind.config` 파일 없음, `app/globals.css`에서 직접 설정
- **Path alias**: `@/*` → 프로젝트 루트 (e.g. `@/components/ui/button`)
- **애니메이션**: Framer Motion (`AnimatedWrapper` 컴포넌트로 래핑)
- **토스트**: Sonner — 직접 임포트 금지, `@/lib/toast` 래퍼 사용
- **날짜**: date-fns — `@/lib/date` 래퍼 사용
- **아이콘**: lucide-react

## 핵심 규칙

- `"use client"` — 상태/이벤트/훅 사용 시만 추가 (기본: 서버 컴포넌트)
- className 병합: 반드시 `cn()` 사용 (`@/lib/utils`)
- 파일명: kebab-case (`user-card.tsx`)
- 컴포넌트: PascalCase named export (`export function UserCard`)

## 라우트 그룹

```
app/(auth)/      ← auth, login, register 관련
app/(dashboard)/ ← dashboard, settings, admin 관련
app/             ← 그 외
```

## 재사용 컴포넌트 (먼저 확인 후 사용)

| 컴포넌트 | 경로 | 용도 |
|---------|------|------|
| `FormField<T>` | `components/common/form-field.tsx` | RHF Controller + Label + 에러 통합 |
| `DataTable<T>` | `components/common/data-table.tsx` | 제네릭 정렬 테이블 |
| `AnimatedWrapper` | `components/common/animated-wrapper.tsx` | Framer Motion 래퍼 |
| `LoadingSpinner` | `components/common/loading-spinner.tsx` | 로딩 표시 |
| `EmptyState` | `components/common/empty-state.tsx` | 빈 상태 |
| `ErrorState` | `components/common/error-state.tsx` | 에러 상태 + retry |
| `StatCard` | `components/common/stat-card.tsx` | 대시보드 통계 카드 |
| `PageHeader` | `components/layout/page-header.tsx` | 페이지 타이틀/설명 |
| `RootProvider` | `components/providers/root-provider.tsx` | 최상위 Provider 묶음 |

## Zod 스키마

- 위치: `lib/schemas/<name>.schema.ts`
- 공통 유틸: `lib/schemas/common.schema.ts`
  - `emailSchema`, `passwordSchema`
  - `requiredString(label)` — 필수 문자열 팩토리

## TanStack Query 패턴

```ts
// 전역 기본값
staleTime: 60 * 1000

// 페이지별 긴 캐시
staleTime: 5 * 60 * 1000
```

로딩: `<LoadingSpinner size="lg" />` / 에러: `<ErrorState onRetry={() => void refetch()} />`

## API Route 응답 형식

```ts
// types/index.ts의 ApiResponse<T> 사용 필수
{ success: true,  data: T,    message?: string }  // 성공
{ success: false, data: null, message: string  }  // 실패
```

- HTTP: 조회/수정/삭제 200, 생성 201, 유효성 실패 400, 없음 404, 서버 오류 500
- Next.js 16 동적 params: `Promise<{ id: string }>` 타입
- body: `unknown`으로 받아 Zod `safeParse`로 검증

## 공통 타입

`types/index.ts` — `BaseProps`, `ApiResponse<T>`, `TableColumn<T>`, `PaginationState`, `FormStatus`, `NavLink`, `Size`, `Theme`

## 슬래시 명령어

```
/new-component <Name> [common|layout|demo|ui] [--form] [--card]
/new-page <경로> [--form] [--query]
/new-api <resource> [--crud] [--id]
```

## 서브에이전트 (구현 완료 후 실행)

- `code-reviewer` — 코드 구현/수정 후
- `component-reviewer` — 컴포넌트 작성/리팩토링 후
- `dead-code-detector` — 미사용 코드 탐지
- `type-auditor` — TypeScript 타입 안전성 감사
