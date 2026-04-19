# Development Guidelines — invoice-web

## 프로젝트 개요

- **목적**: 프리랜서/1인 사업자가 Notion DB 견적서를 동기화하고 클라이언트에게 공유 링크(PDF 다운로드 포함)를 제공하는 MVP 웹 서비스
- **스택**: Next.js 15 App Router + React 19 + TypeScript + Notion API + TanStack Query v5

---

## 아키텍처 — Notion 전용

모든 데이터는 **Notion Database**로 관리. Supabase 미사용.

### 시스템 Notion DB (앱 Internal Integration으로 관리)

| DB | 용도 | 환경변수 |
|----|------|---------|
| Users DB | 회원 정보 (이름, 이메일, 비밀번호 해시) | `NOTION_USERS_DB_ID` |
| Integrations DB | OAuth 토큰 및 사용자 Invoice/Items DB ID | `NOTION_INTEGRATIONS_DB_ID` |
| Invoices DB | 동기화된 견적서 캐시 + 공유 토큰 | `NOTION_INVOICES_DB_ID` |

### 사용자 소유 Notion DB (OAuth로 접근)

| DB | 용도 |
|----|------|
| Invoice DB | 사용자가 직접 작성하는 견적서 (한국어 프로퍼티) |
| Items DB | 견적 항목 (Invoice DB와 Relation 연결) |

---

## 디렉터리 구조

```
app/
  (auth)/login/        → 로그인 페이지
  (auth)/register/     → 회원가입 페이지
  (dashboard)/invoices/          → 견적서 목록
  (dashboard)/invoices/[id]/     → 견적서 상세
  (dashboard)/settings/notion/   → 노션 연동 설정
  view/[token]/        → 공개 뷰어 (인증 불필요)
  error/               → 에러 페이지
  page.tsx             → 랜딩 페이지
components/
  common/    → 재사용 공통 컴포넌트
  layout/    → 레이아웃 컴포넌트
  providers/ → Provider 래퍼
  ui/        → shadcn/ui (직접 수정 금지)
lib/
  auth/      → JWT 유틸 (jwt.ts), 비밀번호 해싱 (password.ts)
  notion/
    client.ts      → Notion 클라이언트 초기화 (getMasterClient, getUserClient)
    parser.ts      → Invoice/Items 페이지 파싱
    db/
      users.ts        → 시스템 Users DB CRUD
      integrations.ts → 시스템 Integrations DB CRUD
      invoices.ts     → 시스템 Invoices DB CRUD
  schemas/   → Zod 스키마 (<name>.schema.ts)
  toast.ts   → Sonner 래퍼
  date.ts    → date-fns 래퍼
  utils.ts   → cn() 함수
types/
  index.ts   → 모든 공통/도메인 타입
hooks/       → 커스텀 훅
app/api/     → Next.js API Route
```

---

## 코드 규칙

### 파일 & 컴포넌트 네이밍

- 파일명: **kebab-case** (`invoice-card.tsx`, `notion-sync-button.tsx`)
- 컴포넌트: **PascalCase named export** (`export function InvoiceCard`)
- 훅: `use-` 접두사 (`use-invoice-list.ts`)

### TypeScript

- `any` 타입 **절대 금지** — `unknown` 후 타입 가드 사용
- 모든 도메인 타입은 `types/index.ts`에서 가져옴
- `import type` 구분 사용 (값이 아닌 타입은 반드시 `import type`)

### 서버/클라이언트 컴포넌트

- 기본값: **서버 컴포넌트** (`"use client"` 없음)
- `"use client"` 추가 조건: `useState`, `useEffect`, 이벤트 핸들러(`onClick` 등), 브라우저 API 사용 시만
- 데이터 패칭은 서버 컴포넌트 또는 TanStack Query 사용 (둘 다 아닌 경우 없음)

### className 병합

- **반드시 `cn()` 사용** (`@/lib/utils`)
- `clsx()` 또는 문자열 직접 병합 금지

```ts
// ✅
className={cn("base-class", condition && "conditional-class", className)}
// ❌
className={`base-class ${condition ? "conditional-class" : ""}`}
```

---

## 컴포넌트 작성 규칙

### 재사용 컴포넌트 우선 확인

새 컴포넌트 작성 전 아래 목록 먼저 확인:

| 컴포넌트 | 경로 | 용도 |
|---------|------|------|
| `FormField<T>` | `components/common/form-field.tsx` | RHF Controller + Label + 에러 |
| `DataTable<T>` | `components/common/data-table.tsx` | 견적서 목록 테이블 |
| `AnimatedWrapper` | `components/common/animated-wrapper.tsx` | Framer Motion 래퍼 |
| `LoadingSpinner` | `components/common/loading-spinner.tsx` | 로딩 표시 |
| `EmptyState` | `components/common/empty-state.tsx` | 빈 상태 |
| `ErrorState` | `components/common/error-state.tsx` | 에러 + retry 버튼 |
| `StatCard` | `components/common/stat-card.tsx` | 통계 카드 |
| `PageHeader` | `components/layout/page-header.tsx` | 페이지 타이틀/설명 |
| `RootProvider` | `components/providers/root-provider.tsx` | 최상위 Provider |

### shadcn/ui 사용 규칙

- `components/ui/` 내 파일 **직접 수정 금지**
- shadcn/ui 컴포넌트는 래퍼 컴포넌트로 감싸서 커스텀
- 새 shadcn 컴포넌트 추가: `npx shadcn add <name>` 명령 사용

### 폼 컴포넌트

- React Hook Form + Zod 조합만 사용
- `FormField<T>` 컴포넌트로 필드 구성
- 스키마는 `lib/schemas/<name>.schema.ts`에 위치

```ts
// ✅ 올바른 폼 패턴
const form = useForm<FormData>({ resolver: zodResolver(schema) })
// FormField 컴포넌트로 각 필드 래핑
```

---

## API Route 규칙

### 응답 형식 (반드시 준수)

```ts
// types/index.ts의 ApiResponse<T> / ApiErrorResponse 사용
{ success: true, data: T, message?: string }   // 성공
{ success: false, data: null, message: string } // 실패
```

### HTTP 상태 코드

| 상황 | 코드 |
|------|------|
| 조회/수정/삭제 성공 | 200 |
| 생성 성공 | 201 |
| 유효성 실패 | 400 |
| 미인증 | 401 |
| 리소스 없음 | 404 |
| 서버 오류 | 500 |

### Request Body 검증

```ts
// body는 반드시 unknown으로 받아 Zod safeParse 검증
const body: unknown = await request.json()
const result = schema.safeParse(body)
if (!result.success) return fail("유효성 검사 실패", 400)
```

### 동적 Params 타입 (Next.js 15)

```ts
// props.params는 반드시 Promise 타입으로 선언
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### 인증 확인 (JWT)

```ts
// Authorization: Bearer <token> 헤더에서 추출
import { verifyToken } from "@/lib/auth/jwt"

const authHeader = request.headers.get("Authorization")
const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
if (!token) return fail("인증이 필요합니다", 401)

const payload = verifyToken(token)
if (!payload) return fail("유효하지 않은 토큰입니다", 401)
const { userId } = payload
```

- Dashboard API 전부: JWT 검증 필수
- `app/view/[token]`: 인증 불필요 — shareToken으로만 접근

### API 엔드포인트 목록

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/auth/register` | 회원가입 | 불필요 |
| POST | `/api/auth/login` | 로그인 + JWT 발급 | 불필요 |
| GET | `/api/auth/notion` | 노션 OAuth URL 생성 + 리디렉션 | 필요 |
| GET | `/api/auth/notion/callback` | OAuth 콜백, 토큰 저장 | 필요 |
| GET | `/api/notion/status` | 연동 상태 + DB ID 조회 | 필요 |
| POST | `/api/notion/database` | DB ID 등록/수정 | 필요 |
| DELETE | `/api/notion/database` | 연동 해제 | 필요 |
| GET | `/api/invoices` | 견적서 목록 | 필요 |
| GET | `/api/invoices/[id]` | 견적서 단건 | 필요 |
| POST | `/api/invoices/sync` | 노션 동기화 | 필요 |
| POST | `/api/invoices/[id]/share` | 공유 토큰 생성 | 필요 |
| GET | `/api/view/[token]` | 공개 견적서 조회 | 불필요 |

---

## 도메인 비즈니스 규칙

### 견적서(Invoice) 핵심 규칙

- `notionPageId`가 upsert 기준 키 — 동기화 시 중복 생성 금지
- `shareToken`이 `null`이면 미공개 상태 (공개 링크 없음)
- `shareToken` 생성: `crypto.randomUUID()` 사용, 만료 없음 (MVP)
- 견적서 직접 편집 없음 — 노션에서 수정 후 재동기화

### 노션 동기화 규칙

- `databases.query()`로 사용자 Invoice DB 페이지 목록 조회
- `항목` Relation으로 연결된 Items DB 페이지 병렬 조회
- Items JSON 파싱 실패 시 해당 페이지 `items: []`로 저장 후 계속 진행
- Notion API 429(Rate Limit): SDK 자동 재시도 최대 2회 후 실패 처리
- 파서: `lib/notion/parser.ts`의 `parseInvoicePage`, `parseItemPage` 사용

### 사용자 Invoice DB 프로퍼티 매핑 (한국어)

| Notion 프로퍼티 | 타입 | 도메인 필드 |
|----------------|------|------------|
| `견적서 번호` | Title | `data.invoiceNumber` |
| `클라이언트명` | Rich Text | `data.clientName` |
| `클라이언트 이메일` | Email | `data.clientEmail` |
| `발행일` | Date | `data.issuedAt` |
| `유효기한` | Date | `data.dueDate` |
| `상태` | Select | `status` (NOTION_STATUS_MAP 변환) |
| `합계 금액` | Rollup(Sum) | `data.totalAmount` |
| `세금 포함` | Checkbox | `data.taxIncluded` |
| `메모` | Rich Text | `data.note` |
| `항목` | Relation → Items DB | `data.items` |

### 사용자 Items DB 프로퍼티 매핑

| Notion 프로퍼티 | 타입 | 도메인 필드 |
|----------------|------|------------|
| `항목명` | Title | `item.name` |
| `Invoices` | Relation (역방향, 영어) | — |
| `수량` | Number | `item.quantity` |
| `단가` | Number | `item.unitPrice` |
| `소계` | Formula | `item.subtotal` |

### 공개 뷰어 규칙

- `/view/[token]` 페이지: 로그인 UI 요소 없음 (클린 UI)
- shareToken 유효하지 않으면 에러 메시지 표시 (리디렉션 아님)
- 발행자 정보(name, contact)는 시스템 Users DB에서 userId로 조회

### 인증 흐름

- 미인증 사용자가 대시보드 접근 → 로그인 페이지로 리디렉션 (middleware.ts)
- 이미 로그인 상태에서 `/` 접근 → 견적서 목록 페이지로 리디렉션
- 노션 미연동 상태로 견적서 목록 접근 → 연동 안내 배너 표시 (강제 이동 없음)

---

## 라이브러리 사용 규칙

### Sonner (토스트)

```ts
// ✅ 반드시 래퍼 사용
import { toast } from "@/lib/toast"
toast.success("동기화 완료")
// ❌ 직접 임포트 금지
import { toast } from "sonner"
```

### date-fns (날짜)

```ts
// ✅ 반드시 래퍼 사용
import { formatDate } from "@/lib/date"
// ❌ 직접 임포트 금지
import { format } from "date-fns"
```

### TanStack Query

```ts
// 전역 staleTime 기본값: 60 * 1000
// 페이지별 긴 캐시: 5 * 60 * 1000

// 로딩 상태
if (isLoading) return <LoadingSpinner size="lg" />
// 에러 상태
if (isError) return <ErrorState onRetry={() => void refetch()} />
```

### Notion API

```ts
// 마스터 클라이언트 (시스템 DB 접근)
import { getMasterClient } from "@/lib/notion/client"
const notion = getMasterClient()

// 사용자 클라이언트 (OAuth 토큰)
import { getUserClient } from "@/lib/notion/client"
const notion = getUserClient(accessToken)

// 데이터베이스 조회
await notion.databases.query({ database_id: databaseId })
```

### @react-pdf/renderer (PDF)

- `"use client"` 컴포넌트에서만 사용
- PDF Document 컴포넌트는 별도 파일로 분리 (`invoice-pdf.tsx`)
- 브라우저 다운로드: `pdf(Document).toBlob()` → `URL.createObjectURL()` 패턴

---

## Zod 스키마 규칙

- 위치: `lib/schemas/<name>.schema.ts`
- 공통 유틸: `lib/schemas/common.schema.ts`
  - `emailSchema` — 이메일 검증
  - `passwordSchema` — 비밀번호 검증
  - `requiredString(label)` — 필수 문자열 팩토리
- 기존 스키마: `auth.schema.ts`, `invoice.schema.ts`, `notion.schema.ts`

---

## 환경변수

```bash
# Notion 마스터 Integration (시스템 DB 접근)
NOTION_INTEGRATION_TOKEN=

# 시스템 DB IDs
NOTION_USERS_DB_ID=
NOTION_INTEGRATIONS_DB_ID=
NOTION_INVOICES_DB_ID=

# Notion OAuth
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
NOTION_REDIRECT_URI=http://localhost:3000/api/auth/notion/callback

# JWT
NEXTAUTH_SECRET=

# 앱
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 에러 처리 패턴

```ts
// Notion OAuth 토큰 만료 (401)
// → Integrations DB status = 'error' 업데이트
// → 사용자에게 재연동 안내 토스트
// → 설정 페이지 이동 버튼 표시

// Notion DB ID 잘못됨 (ObjectNotFound)
// → "데이터베이스를 찾을 수 없습니다." 에러 메시지

// Notion Rate Limit (429)
// → SDK 자동 재시도 2회 → 실패 시 "잠시 후 다시 시도해주세요."

// Items JSON 파싱 실패
// → items: [] 로 저장 후 계속 진행 (전체 실패 금지)
// → 응답의 errors 배열에 해당 페이지 ID 포함
```

---

## 금지 사항

- `any` 타입 사용 금지
- `components/ui/` 직접 수정 금지 (shadcn/ui 원본 보존)
- `sonner`에서 `toast` 직접 임포트 금지 → `@/lib/toast` 사용
- `date-fns`에서 직접 임포트 금지 → `@/lib/date` 사용
- `tailwind.config` 파일 생성 금지 (Tailwind v4 — globals.css 직접 설정)
- `src/` 디렉터리 생성 금지 (프로젝트 루트 직접 구조)
- Zustand 사용 금지 (TanStack Query v5 사용)
- Supabase 사용 금지 (Notion API 전용)
- `"use client"` 불필요한 컴포넌트에 추가 금지
- `clsx()` 또는 문자열 직접 병합으로 className 처리 금지 → `cn()` 사용
- 새 API Route에서 `ApiResponse<T>` 타입 미사용 금지
- Request body를 `unknown` 없이 바로 타입 캐스팅 금지
- 동적 params를 `Promise` 없이 직접 접근 금지 (Next.js 15)
- `notionPageId` 없이 견적서 upsert 금지
- 공개 뷰어(`/view/[token]`)에 로그인/회원가입 UI 요소 추가 금지
