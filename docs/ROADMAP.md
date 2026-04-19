# 노션 견적서 웹 뷰어 (invoice-web) 개발 로드맵

## 개요

### 프로젝트 목표
발행자(프리랜서/1인 사업자)가 Notion DB에 작성한 견적서를 동기화하여, 클라이언트가 인증 없이 공개 링크로 열람하고 PDF로 다운로드할 수 있는 MVP 웹 서비스를 구축한다.

### 전체 예상 기간
**약 6~7주 (1인 기준 풀타임)** — 7개 Phase

| Phase | 기간 | 핵심 산출물 |
|-------|------|------------|
| Phase 0: 프로젝트 구조 및 골격 구축 | 2~3일 | 라우트 skeleton, 타입 정의, API stub, 공통 인프라 |
| Phase 1: UI/UX 구현 전체 | 약 2주 | 인증/노션 연동/견적서 목록·상세/공개 뷰어/PDF 전체 UI |
| Phase 2: 환경 설정 | 3~4일 | Notion DB 구조, 환경변수, Notion OAuth 앱 |
| Phase 3: 인증 백엔드 | 3~4일 | NextAuth.js 설정, 세션 헬퍼, 회원가입 API, 미들웨어 |
| Phase 4: 노션 연동 백엔드 | 4~5일 | OAuth 유틸/API, 상태/DB API |
| Phase 5: 동기화 및 목록 API | 4~5일 | 파서, sync API, 목록 API |
| Phase 6: 상세·공유·뷰어 API | 3~4일 | 상세 API, 공유 링크 API, 공개 뷰어 API |

### 핵심 성공 지표 (KPI)
- **기능 완성도**: PRD F001~F008, F010~F011 전 기능 구현 및 동작 검증
- **타입 안전성**: `any` 타입 0건, `tsc --noEmit` 통과
- **사용자 여정 완주율**: 가입 → 노션 연동 → 동기화 → 공유 링크 생성 → 클라이언트 PDF 다운로드 end-to-end 성공
- **동기화 성능**: 노션 페이지 50건 기준 sync API 5초 이내 응답
- **데이터 격리**: Notion DB `user_id` 필터로 발행자 간 데이터 완전 격리

---

## 기술 아키텍처 결정사항

### 주요 기술 선택 근거

| 영역 | 선택 | 근거 |
|------|------|------|
| Auth | NextAuth.js v5 (Auth.js) | Credentials 프로바이더로 이메일/패스워드 인증, JWT 세션 |
| DB | Notion API (@notionhq/client v5) | 모든 데이터(users, invoices, integrations)를 Notion 데이터베이스로 관리 |
| Notion API | @notionhq/client v5 | 공식 SDK, rate limit 자동 재시도 내장 |
| PDF 생성 | @react-pdf/renderer | 클라이언트 사이드 렌더링 가능, 서버 부하 최소화 |
| 상태 관리 | TanStack Query v5 | 서버 상태 캐싱 + invalidation 일원화 (동기화 후 목록 갱신에 적합) |
| 폼/검증 | React Hook Form + Zod | 클라이언트-서버 Zod 스키마 공유 가능 |
| UI | shadcn/ui + Tailwind v4 | 이미 구축된 공통 컴포넌트 재사용 |

### 폴더 구조 설계

```
invoice-web/
├── app/
│   ├── (auth)/                    # 비로그인 라우트 그룹
│   │   ├── layout.tsx             # 기존 - 중앙 정렬 래퍼
│   │   ├── login/page.tsx         # 기존 - 스타터 유지, 로직 대체
│   │   └── register/page.tsx      # 기존 - 스타터 유지, 로직 대체
│   ├── (dashboard)/               # 인증 필수 라우트 그룹
│   │   ├── layout.tsx             # 기존 - Sidebar + PageHeader
│   │   ├── invoices/
│   │   │   ├── page.tsx           # 기존 - 견적서 목록
│   │   │   └── [id]/page.tsx      # 신규 - 견적서 상세
│   │   └── settings/notion/page.tsx  # 신규 - 노션 연동 설정
│   ├── view/[token]/page.tsx      # 기존 - 공개 뷰어 (로직 대체)
│   ├── api/
│   │   ├── auth/notion/
│   │   │   ├── route.ts           # GET - OAuth 시작
│   │   │   └── callback/route.ts  # GET - OAuth 콜백
│   │   ├── notion/
│   │   │   ├── status/route.ts    # GET
│   │   │   └── database/route.ts  # POST, DELETE
│   │   ├── invoices/
│   │   │   ├── route.ts           # GET (목록)
│   │   │   ├── sync/route.ts      # POST
│   │   │   └── [id]/
│   │   │       ├── route.ts       # GET (단건)
│   │   │       └── share/route.ts # POST (공유 링크 생성)
│   │   └── view/[token]/route.ts  # GET (공개 조회)
│   ├── page.tsx                   # 기존 - 랜딩 (로직 대체)
│   └── layout.tsx                 # 기존 - RootProvider
├── components/
│   ├── auth/                      # 신규 - 인증 폼/가드
│   ├── invoices/                  # 신규 - 견적서 특화 컴포넌트
│   ├── notion/                    # 신규 - 노션 연동 UI
│   ├── viewer/                    # 신규 - 공개 뷰어/PDF
│   ├── common/                    # 기존 - 재사용 컴포넌트
│   ├── layout/                    # 기존 - page-header, sidebar
│   ├── providers/                 # 기존 - root-provider
│   └── ui/                        # 기존 - shadcn/ui
├── lib/
│   ├── auth/                      # 신규 - NextAuth.js 설정
│   │   ├── auth.ts                # NextAuth config (Credentials provider)
│   │   └── session.ts             # 세션 헬퍼 (getServerSession 래핑)
│   ├── notion/                    # 신규 - 노션 연동 유틸
│   │   ├── client.ts              # Notion SDK 인스턴스 팩토리
│   │   ├── oauth.ts               # OAuth URL 생성, 코드 교환
│   │   ├── parser.ts              # 페이지 → InvoiceData 파싱
│   │   └── db/                    # Notion DB CRUD 헬퍼
│   │       ├── users.ts           # Users DB 조회/생성
│   │       ├── integrations.ts    # Integrations DB 조회/수정
│   │       └── invoices.ts        # Invoices DB 조회/upsert
│   ├── pdf/                       # 신규 - PDF Document 구성
│   │   └── invoice-pdf.tsx
│   ├── schemas/                   # 기존 - Zod 스키마
│   ├── api/                       # 신규 - ApiResponse 헬퍼
│   │   └── response.ts
│   ├── constants.ts               # 기존
│   ├── date.ts                    # 기존
│   ├── toast.ts                   # 기존
│   └── utils.ts                   # 기존
├── hooks/                         # 신규 TanStack Query 훅
│   ├── use-invoices.ts
│   ├── use-invoice.ts
│   ├── use-notion-status.ts
│   └── use-sync-invoices.ts
├── middleware.ts                  # 신규 - 인증 가드 (NextAuth withAuth)
└── types/
    └── index.ts                   # 기존 - 도메인 타입 정의 완료
```

### 데이터 흐름 설계

```
[클라이언트]
  └─ TanStack Query hooks (use-invoices, use-notion-status 등)
      └─ fetch → /api/* Route Handlers
          ├─ NextAuth.js getServerSession (JWT 세션 기반 인증)
          │   └─ userId로 Notion DB 필터링 (사용자별 데이터 격리)
          └─ @notionhq/client (integration token)
              ├─ Notion "Users" DB (users.ts)
              ├─ Notion "Integrations" DB (integrations.ts)
              └─ Notion "Invoices" DB (invoices.ts)

[공개 뷰어]
  └─ /view/[token]
      └─ /api/view/[token] (공개, shareToken 검증)
          └─ @notionhq/client (integration token)
              └─ Notion "Invoices" DB → shareToken 필터 조회
          └─ @react-pdf/renderer (클라이언트 사이드 PDF 생성)
```

### API 설계 원칙

- 모든 API Route는 `ApiResponse<T>` 또는 `ApiErrorResponse` 반환 (`types/index.ts`)
- HTTP 상태 코드: 조회/수정/삭제 200, 생성 201, 유효성 실패 400, 인증 실패 401, 없음 404, 서버 오류 500
- Next.js 16 동적 params는 `Promise<{ id: string }>` 타입 사용
- 요청 body는 `unknown`으로 받아 Zod `safeParse`로 검증
- `user_id`는 항상 NextAuth.js 세션(`getServerSession`)에서 추출 (body에서 받지 않음)
- 공통 응답 헬퍼: `lib/api/response.ts` — `ok(data)`, `fail(message, status)`

---

## Phase별 상세 계획

### Phase 0: 프로젝트 구조 및 골격 구축 (2~3일)

**목표**: 실제 기능 구현에 앞서 전체 애플리케이션의 라우트 구조·레이아웃·타입·API stub을 먼저 완성한다. 이 Phase 완료 후에야 다음 Phase 진행이 가능하다.

> **⚠️ 구조 우선 원칙**: 이 Phase는 기능 구현이 아닌 뼈대 작업이다. 실제 로직은 Phase 1 이후 단계별로 채운다.

**완료 기준**:
- 모든 라우트 파일이 skeleton 형태로 존재하고 dev 서버에서 404 없이 접근 가능
- 공통 레이아웃·사이드바·네비게이션 UI 골격 렌더링 확인
- 타입 정의 파일 작성 완료, `tsc --noEmit` 통과
- 모든 API Route가 `501 Not Implemented` stub으로 응답
- 환경변수 구조 문서화 완료

#### Milestone 0.1: 라우트 및 페이지 Skeleton

- [x] **전체 라우트 파일 skeleton 생성** (예상: 2h)
  - `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx` 확인 및 정리
  - `app/(dashboard)/invoices/page.tsx` 확인
  - `app/(dashboard)/invoices/[id]/page.tsx` 신규 — 빈 skeleton
  - `app/(dashboard)/settings/notion/page.tsx` 신규 — 빈 skeleton
  - `app/view/[token]/page.tsx` 확인
  - `app/page.tsx` (랜딩) 확인
  - 완료 기준: `npm run dev` 후 모든 경로 404 없이 접근 가능

- [x] **공통 레이아웃 골격 구현** (예상: 2h)
  - `app/(dashboard)/layout.tsx` — 사이드바 + 메인 영역 골격 (더미 메뉴)
  - `app/(auth)/layout.tsx` — 중앙 정렬 래퍼 확인
  - `app/view/[token]/layout.tsx` — 클린 레이아웃 (사이드바 없음) 신규
  - 완료 기준: 각 라우트 그룹별 레이아웃 분리 렌더링 확인

#### Milestone 0.2: 타입 정의 및 Notion DB 프로퍼티 구조

- [x] **도메인 타입 정의 확인 및 보완 `types/index.ts`** (예상: 2h)
  - `Invoice`, `InvoiceItem`, `InvoiceData`, `InvoiceStatus`, `InvoiceListItem` 타입 확인
  - `NotionIntegration`, `NotionStatusDTO` 타입 정의
  - `Issuer { name: string; contact: string | null }` 타입 정의
  - `ApiResponse<T>`, `ApiErrorResponse` 공통 타입 확인
  - 완료 기준: `tsc --noEmit` 통과, `any` 0건

- [x] **Notion DB 프로퍼티 구조 설계 문서화** (예상: 1h)
  - PRD 기준 10개 프로퍼티 목록을 `lib/notion/parser.ts` 주석으로 문서화 (실제 연동 제외)
  - 프로퍼티명 → TypeScript 타입 매핑 테이블 작성
  - 완료 기준: parser.ts 파일 생성, 함수 시그니처만 정의 (구현 없음)

#### Milestone 0.3: API Route Stub 생성

- [x] **모든 API Route stub 생성** (예상: 2h)
  - 9개 엔드포인트 각각 `501 Not Implemented` 응답 반환
  - `app/api/auth/notion/route.ts` (GET)
  - `app/api/auth/notion/callback/route.ts` (GET)
  - `app/api/notion/status/route.ts` (GET)
  - `app/api/notion/database/route.ts` (POST, DELETE)
  - `app/api/invoices/route.ts` (GET)
  - `app/api/invoices/sync/route.ts` (POST)
  - `app/api/invoices/[id]/route.ts` (GET)
  - `app/api/invoices/[id]/share/route.ts` (POST)
  - `app/api/view/[token]/route.ts` (GET)
  - 완료 기준: 모든 엔드포인트 호출 시 `{ success: false, message: "구현 예정" }` + 501 응답

#### Milestone 0.4: 공통 인프라 뼈대

- [x] **`lib/api/response.ts` 뼈대 작성** (예상: 1h)
  - `ok<T>(data: T, status?: number): NextResponse<ApiResponse<T>>`
  - `fail(message: string, status?: number): NextResponse<ApiErrorResponse>`
  - 완료 기준: API stub에서 import 가능

- [x] **환경변수 구조 정의 `.env.local.example`** (예상: 0.5h)
  - Notion 공통: `NOTION_INTEGRATION_TOKEN`, `NOTION_USERS_DB_ID`, `NOTION_INTEGRATIONS_DB_ID`, `NOTION_INVOICES_DB_ID`
  - Notion OAuth: `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI`
  - NextAuth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - 앱: `NEXT_PUBLIC_APP_URL`
  - 완료 기준: `.env.local.example` 커밋, `.gitignore`에 `.env.local` 포함 확인

- [x] **`hooks/` 디렉토리 stub 파일 생성** (예상: 1h)
  - `hooks/use-invoices.ts`, `use-invoice.ts`, `use-notion-status.ts`, `use-sync-invoices.ts`, `use-create-share-link.ts`
  - 각 파일에 함수 시그니처만 정의 (구현 없음, TODO 주석)
  - 완료 기준: import 가능한 stub 파일 존재

---

### Phase 1: UI/UX 구현 전체 (약 2주)

**목표**: 백엔드 API stub을 바탕으로 모든 화면과 컴포넌트를 먼저 구현한다.

**완료 기준**:
- 모든 페이지가 mock 데이터 또는 stub API로 렌더링 확인 가능
- 로딩/에러/빈 상태 일관성 구현 (`LoadingSpinner`, `ErrorState`, `EmptyState`)
- `"use client"` 필요 시에만 사용 (서버 컴포넌트 우선)
- 모든 폼이 React Hook Form + Zod + `FormField<T>` 패턴 준수

#### Milestone 1.1: 인증 UI

- [x] **랜딩 페이지 리디자인 `app/page.tsx`** (담당: 프론트엔드, 예상: 3h) `"use server"` (기본)
  - 서비스 소개 히어로 섹션 + 로그인/회원가입 CTA 버튼
  - NextAuth.js 세션 존재 시 `redirect("/invoices")`
  - `AnimatedWrapper` (기존), `Button` (shadcn/ui) 활용
  - 완료 기준: 비로그인 시 랜딩 표시, 로그인 시 자동 리디렉션

- [x] **`components/auth/login-form.tsx` 작성** (담당: 프론트엔드, 예상: 3h) `"use client"`
  - React Hook Form + Zod (`loginSchema` 기존 활용)
  - 기존 `FormField<LoginFormData>` 재사용 (`components/common/form-field.tsx`)
  - NextAuth.js `signIn("credentials", { email, password })` 호출
  - 성공: `router.push("/invoices")` + 성공 토스트 (`@/lib/toast`)
  - 실패: 인라인 에러 메시지 + 에러 토스트
  - 완료 기준: 올바른 계정 로그인 성공, 잘못된 계정 에러 표시

- [x] **`app/(auth)/login/page.tsx` 로직 대체** (담당: 프론트엔드, 예상: 1h)
  - 기존 스타터 페이지 → `<LoginForm />` 렌더링
  - 로그인 상태면 `redirect("/invoices")` (서버 컴포넌트 레벨)
  - 회원가입 페이지 링크 유지
  - 완료 기준: 이미 로그인된 상태에서 접근 시 즉시 리디렉션

- [x] **`components/auth/register-form.tsx` 작성** (담당: 프론트엔드, 예상: 3h) `"use client"`
  - `registerSchema` 활용 (`name`, `email`, `password`, `confirmPassword`, `agreeToTerms`)
  - `POST /api/auth/register` 호출 → Notion "Users" DB에 `createUser()` + `bcrypt.hash(password)` 저장
  - 성공: 자동 로그인(`signIn("credentials")`) → `/invoices` 리디렉션
  - 완료 기준: 신규 계정 생성 시 `profiles` 자동 생성 확인

- [x] **`app/(auth)/register/page.tsx` 로직 대체** (담당: 프론트엔드, 예상: 1h)
  - `<RegisterForm />` 렌더링 + 세션 있을 시 리디렉션
  - 완료 기준: 회원가입 완료 후 세션 생성

- [x] **`components/layout/user-menu.tsx` 작성** (담당: 프론트엔드, 예상: 2h) `"use client"`
  - 헤더/사이드바에 표시되는 사용자 이메일 + 로그아웃 버튼
  - NextAuth.js `signOut()` → `router.push("/")`
  - shadcn/ui `DropdownMenu` 활용
  - 완료 기준: 로그아웃 시 세션 제거 및 랜딩 이동

#### Milestone 1.2: 노션 연동 UI

- [x] **`hooks/use-notion-status.ts` 작성** (담당: 프론트엔드, 예상: 1.5h) `"use client"`
  - `useQuery({ queryKey: ["notion", "status"], queryFn, staleTime: 60 * 1000 })`
  - 완료 기준: 설정 페이지에서 상태 구독

- [x] **`components/notion/connection-status-card.tsx`** (담당: 프론트엔드, 예상: 2h)
  - 상태 뱃지 (connected 초록, disconnected 회색, error 빨강)
  - `Card` (shadcn/ui) + `cn()` 사용
  - 완료 기준: 3가지 상태별 시각적 구분

- [x] **`components/notion/connect-button.tsx`** (담당: 프론트엔드, 예상: 1.5h) `"use client"`
  - "노션으로 연결" 버튼 → `window.location.href = "/api/auth/notion"`
  - 연동 완료 상태면 "연동 해제" 버튼 표시 (DELETE 호출 → `queryClient.invalidateQueries`)
  - 완료 기준: OAuth 진입 및 해제 동작

- [x] **`components/notion/database-setting-form.tsx`** (담당: 프론트엔드, 예상: 2.5h) `"use client"`
  - `FormField<NotionDatabaseSettingFormData>` 재사용
  - `notionDatabaseSettingSchema` 검증
  - POST 성공 시 토스트 + `invalidateQueries(["notion", "status"])`
  - 완료 기준: 저장 후 상태 카드에 DB ID 반영

- [x] **`app/(dashboard)/settings/notion/page.tsx` 작성** (담당: 프론트엔드, 예상: 1.5h)
  - `PageHeader` + `<ConnectionStatusCard />` + `<ConnectButton />` + `<DatabaseSettingForm />`
  - 쿼리 파라미터 `?connected=true` → 성공 토스트, `?error=...` → 에러 토스트
  - 완료 기준: 전체 연동 UX 완주

#### Milestone 1.3: 견적서 목록 UI

- [x] **`components/invoices/notion-connection-banner.tsx`** (담당: 프론트엔드, 예상: 1.5h)
  - `use-notion-status` 구독 → `disconnected`일 때만 표시
  - "노션 연동이 필요합니다" 배너 + 설정 페이지 이동 링크 (Next.js `Link`)
  - `cn()`으로 강조 스타일
  - 완료 기준: 미연동 상태에만 노출

- [x] **`components/invoices/invoice-status-badge.tsx`** (담당: 프론트엔드, 예상: 1.5h)
  - `InvoiceStatus` → 뱃지 색상/라벨 매핑 (`draft`, `sent`, `accepted`, `rejected`)
  - `Badge` (shadcn/ui) + `cn()`
  - 완료 기준: 상태별 색상 구분 명확

- [x] **`components/invoices/sync-button.tsx`** (담당: 프론트엔드, 예상: 2h) `"use client"`
  - `use-sync-invoices` 훅 사용
  - 로딩 중 `LoadingSpinner size="sm"` + 버튼 비활성화
  - 완료 기준: PRD 에러 처리 전체 토스트 시나리오 검증

- [x] **`components/invoices/invoice-table.tsx`** (담당: 프론트엔드, 예상: 3h) `"use client"`
  - 기존 `DataTable<InvoiceListItem>` 활용
  - 컬럼: 제목, 클라이언트명, 금액 (`Intl.NumberFormat("ko-KR")`), 상태 (`InvoiceStatusBadge`), 발행일 (`@/lib/date`), 공유 링크 여부 (아이콘)
  - 행 클릭 → `router.push("/invoices/${id}")`
  - 빈 상태: 기존 `EmptyState` 컴포넌트 (동기화 버튼 CTA)
  - 에러 상태: 기존 `ErrorState onRetry={refetch}` 컴포넌트
  - 완료 기준: 정렬, 빈/에러 상태 모두 렌더링

- [x] **`app/(dashboard)/invoices/page.tsx` 로직 대체** (담당: 프론트엔드, 예상: 2h)
  - `PageHeader` ("견적서 목록") + `SyncButton` + `NotionConnectionBanner` + `InvoiceTable`
  - `"use client"` — TanStack Query 사용
  - 완료 기준: 동기화 → 목록 갱신 end-to-end 동작

#### Milestone 1.4: 견적서 상세 UI

- [x] **`hooks/use-create-share-link.ts` 작성** (담당: 프론트엔드, 예상: 1h) `"use client"`
  - `useMutation` + 성공 시 `invalidateQueries(["invoice", id])`, `invalidateQueries(["invoices"])`
  - 완료 기준: 토큰 생성 후 상세 + 목록 동기화

- [x] **`components/invoices/invoice-meta-section.tsx`** (담당: 프론트엔드, 예상: 2h)
  - 제목/클라이언트명/이메일/발행일/유효기한/상태 카드
  - `@/lib/date` 포맷팅 적용
  - 완료 기준: 모든 메타 정보 반응형 표시

- [x] **`components/invoices/invoice-items-table.tsx`** (담당: 프론트엔드, 예상: 2.5h)
  - `InvoiceItem[]` 테이블: 항목명 / 수량 / 단가 / 소계 / (합계 Footer)
  - `Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" })` 활용
  - 세금 포함 여부 표시
  - 완료 기준: 모바일에서도 가독성 유지

- [x] **`components/invoices/share-link-panel.tsx`** (담당: 프론트엔드, 예상: 2.5h) `"use client"`
  - shareToken 없으면 "공유 링크 생성" 버튼
  - 있으면 공개 URL 텍스트 + "복사" 버튼 (`navigator.clipboard.writeText` + 성공 토스트)
  - `AnimatedWrapper`로 생성 시 페이드 인
  - 완료 기준: 생성 → 복사 UX 매끄럽게 동작

- [x] **`app/(dashboard)/invoices/[id]/page.tsx`** (담당: 프론트엔드, 예상: 2h) `"use client"`
  - `params: Promise<{ id: string }>` → `use()` 훅으로 언래핑
  - `use-invoice` 훅 사용 → 로딩 `LoadingSpinner`, 에러 `ErrorState onRetry`
  - 레이아웃: `PageHeader` + "목록으로" 링크 + `MetaSection` + `ItemsTable` + `ShareLinkPanel` + 메모 카드
  - 완료 기준: URL 직접 접근 시 데이터 렌더링, 소유자 아니면 에러

#### Milestone 1.5: 공개 뷰어 UI + PDF

- [x] **`components/viewer/public-invoice-header.tsx`** (담당: 프론트엔드, 예상: 2h)
  - 발행자 이름/연락처 + 로고 영역 (MVP는 텍스트)
  - 클라이언트 정보 블록
  - 완료 기준: 인쇄 친화적 레이아웃

- [x] **`components/viewer/public-invoice-body.tsx`** (담당: 프론트엔드, 예상: 3h)
  - 발행일/유효기한 + 항목 테이블 + 합계 + 세금 포함 여부 + 메모
  - 반응형 (모바일 컬럼 조정)
  - 완료 기준: 상세 페이지와 데이터 일치

- [x] **`app/view/[token]/page.tsx` 로직 대체** (담당: 프론트엔드, 예상: 2.5h)
  - 서버 컴포넌트로 `fetch` → `/api/view/[token]`
  - 유효하지 않으면 Next.js `notFound()` 또는 커스텀 에러 UI
  - `PublicInvoiceHeader` + `PublicInvoiceBody` + `<PdfDownloadButton />`
  - `layout.tsx`는 대시보드와 분리된 클린 레이아웃 (사이드바 없음)
  - 완료 기준: 링크 직접 방문 시 렌더링, 잘못된 토큰 에러 화면

- [x] **`lib/pdf/invoice-pdf.tsx` 작성** (담당: 프론트엔드, 예상: 5h) `"use client"`
  - `@react-pdf/renderer` — `Document`, `Page`, `View`, `Text`, `StyleSheet`
  - Props: `{ invoice: Invoice, issuer: { name, contact } }`
  - 레이아웃: 헤더(발행자/클라이언트) + 메타(발행일, 유효기한) + 항목 테이블 + 합계 + 메모
  - 한글 폰트 등록 (Noto Sans KR) — `Font.register({ family, src })`
  - 통화 포맷: `Intl.NumberFormat("ko-KR")`
  - 완료 기준: PDF 미리보기에서 깨진 글자 없이 렌더링

- [x] **`components/viewer/pdf-download-button.tsx`** (담당: 프론트엔드, 예상: 2.5h) `"use client"`
  - `@react-pdf/renderer`의 `PDFDownloadLink` 또는 `pdf().toBlob()` 방식
  - 파일명: `invoice-${invoice.data.title}-${YYYY-MM-DD}.pdf` (파일명 안전 문자로 sanitize)
  - 로딩 중 `LoadingSpinner` 표시
  - 완료 기준: 클릭 → 다운로드 완료 3초 이내
  - **[테스트 필수]** Playwright MCP로 PDF 다운로드 테스트 — `browser_click` PDF 다운로드 버튼 → `browser_network_requests`로 Blob 생성 확인 → 파일명 형식 검증
  - **[테스트 필수]** `browser_snapshot`으로 한글 폰트 깨짐 없이 렌더링 확인 (Noto Sans KR 등록 검증)
  - ⛔ 테스트 통과 전 배포 진행 불가

---

### Phase 2: 환경 설정 (3~4일)

**목표**: 개발/배포 환경을 완비하고 Notion DB 구조를 설계하며 Notion OAuth 앱·NextAuth.js를 준비하여 다음 Phase가 즉시 실행될 수 있는 기반을 만든다.

**완료 기준**:
- Notion 워크스페이스에 `Users`, `Integrations`, `Invoices` 데이터베이스 생성 및 프로퍼티 구성 완료
- `.env.local`에 모든 환경변수 설정 완료
- Notion OAuth 앱 등록 및 redirect URI 설정 완료
- NextAuth.js 기본 설정 및 `lib/auth/` 헬퍼 동작 확인

#### Milestone 2.1: Notion 데이터베이스 구조 설계

- [ ] **Notion "Users" 데이터베이스 생성** (담당: 백엔드, 예상: 1h)
  - 프로퍼티: `Name` (title), `Email` (email, UNIQUE), `PasswordHash` (rich_text), `Contact` (rich_text), `CreatedAt` (date)
  - Internal Integration Token으로 접근 권한 부여
  - 완료 기준: `@notionhq/client`로 레코드 조회 성공

- [ ] **Notion "Integrations" 데이터베이스 생성** (담당: 백엔드, 예상: 1h)
  - 프로퍼티: `Name` (title, 식별용), `UserId` (rich_text), `AccessToken` (rich_text), `DatabaseId` (rich_text), `Status` (select: connected|error), `CreatedAt` (date)
  - 완료 기준: userId 필터 조회 성공

- [ ] **Notion "Invoices" 데이터베이스 생성** (담당: 백엔드, 예상: 1h)
  - 프로퍼티: `Name` (title), `UserId` (rich_text), `NotionPageId` (rich_text, 동기화 기준 키), `ShareToken` (rich_text), `Data` (rich_text, JSON 직렬화), `Status` (select: draft|sent|accepted|rejected), `CreatedAt` (date), `UpdatedAt` (date)
  - 완료 기준: userId 필터 조회 및 upsert 성공

- [x] **`lib/notion/db/` CRUD 헬퍼 뼈대 작성** (담당: 백엔드, 예상: 2h)
  - `users.ts` — `findByEmail()`, `createUser()`, `findById()` 함수 시그니처
  - `integrations.ts` — `findByUserId()`, `upsertIntegration()`, `deleteByUserId()` 시그니처
  - `invoices.ts` — `findAllByUserId()`, `findById()`, `findByShareToken()`, `upsertInvoice()` 시그니처
  - 완료 기준: 타입 시그니처 정의 완료, `tsc --noEmit` 통과

#### Milestone 2.2: Notion OAuth 앱 및 환경변수

- [ ] **Notion 통합(Integration) 등록** (담당: 백엔드, 예상: 1h)
  - https://www.notion.so/my-integrations 에서 Public OAuth 앱 생성
  - Redirect URI: `http://localhost:3000/api/auth/notion/callback` + 프로덕션 URL
  - `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI` 획득
  - 완료 기준: `.env.local.example`에 키 목록 문서화

- [ ] **`.env.local.example` 작성 및 `.gitignore` 확인** (담당: 백엔드, 예상: 0.5h)
  - Notion 공통: `NOTION_INTEGRATION_TOKEN` (Internal Integration Token, DB 관리용)
  - Notion OAuth: `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI`
  - Notion DB ID 4개: `NOTION_USERS_DB_ID`, `NOTION_INTEGRATIONS_DB_ID`, `NOTION_INVOICES_DB_ID`
  - NextAuth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - 앱: `NEXT_PUBLIC_APP_URL`
  - 완료 기준: README에 환경변수 설정 가이드 추가

- [x] **`lib/api/response.ts` 작성 — API 응답 헬퍼** (담당: 백엔드, 예상: 1h)
  - `ok<T>(data: T, status = 200, message?: string)` → `NextResponse<ApiResponse<T>>`
  - `fail(message: string, status = 400)` → `NextResponse<ApiErrorResponse>`
  - 완료 기준: 타입 안전하게 `ApiResponse<T>` 반환

---

### Phase 3: 인증 백엔드 (F010) (3~4일)

**목표**: NextAuth.js 설정과 세션 헬퍼, 회원가입 API, 미들웨어를 구현하여 보호 경로가 미인증 접근을 차단한다.

**완료 기준**:
- NextAuth.js Credentials 프로바이더로 로그인/로그아웃 동작
- `POST /api/auth/register`로 신규 계정 생성 가능
- `/dashboard/*` 미인증 접근 시 `/login` 리디렉션
- 로그인 상태에서 `/`, `/login`, `/register` 접근 시 `/invoices` 리디렉션

#### Milestone 3.1: NextAuth.js 설정

- [ ] **NextAuth.js v5 설치 및 `lib/auth/auth.ts` 작성** (담당: 백엔드, 예상: 3h)
  - `npm install next-auth@beta bcryptjs`
  - Credentials 프로바이더: `email` + `password` 입력 → Notion "Users" DB에서 `findByEmail` → `bcrypt.compare` 검증
  - 회원가입은 별도 `/api/auth/register` Route Handler 구현
  - JWT 세션 전략: `session.strategy = "jwt"`, `token.userId` 저장
  - 완료 기준: `signIn("credentials", {...})` 성공 시 세션 생성

- [ ] **`lib/auth/session.ts` 헬퍼 작성** (담당: 백엔드, 예상: 1h)
  - `getAuthSession()` — `getServerSession(authOptions)` 래핑, 세션 없으면 401 반환
  - Route Handler에서 `const { userId } = await getAuthSession()` 패턴으로 사용
  - 완료 기준: API Route에서 `userId` 추출 가능

#### Milestone 3.2: 회원가입 API 및 미들웨어

- [ ] **`app/api/auth/register/route.ts` — POST** (담당: 백엔드, 예상: 2h)
  - body `unknown` → `registerSchema.safeParse()` 검증
  - Notion "Users" DB에서 `findByEmail` → 중복 시 400
  - `bcrypt.hash(password)` → `createUser()` 호출
  - 응답: `{ userId }`
  - 완료 기준: 중복 이메일 400, 신규 가입 201

- [x] **`middleware.ts` 작성** (담당: 백엔드, 예상: 3h)
  - NextAuth.js `withAuth` 또는 `getToken` 기반 세션 검증
  - 경로 매트릭스: `/dashboard/*`, `/invoices/*`, `/settings/*` 보호
  - 인증 필요 경로에 미인증 접근 → `/login?redirect=<path>`
  - 로그인 상태에서 `/login`, `/register`, `/` 접근 → `/invoices`
  - `matcher` 설정으로 `_next`, `api`, 정적 자산 제외
  - 완료 기준: 브라우저 쿠키 삭제 후 `/invoices` 접근 → 로그인 페이지로 이동

- [x] **`app/(dashboard)/layout.tsx` 보강** (담당: 프론트엔드, 예상: 1.5h)
  - 사이드바 네비게이션 (견적서 목록, 설정 > 노션 연동)
  - `PageHeader` (기존 `components/layout/page-header.tsx`) 활용
  - `<UserMenu />` 배치
  - 완료 기준: 대시보드 진입 시 내비게이션 표시

---

### Phase 4: 노션 연동 백엔드 (F001, F002, F011) (4~5일)

**목표**: 발행자가 노션 OAuth로 인증하고, 동기화할 DB ID를 등록하여 연동 상태를 확인할 수 있도록 백엔드 API를 구현한다.

**완료 기준**:
- OAuth 연결 → 콜백 처리 → 액세스 토큰 저장 완료
- DB ID 입력 저장 → `notion_integrations.database_id` 갱신
- 연동 상태(connected/disconnected/error) 정확히 반환
- 연동 해제 API로 토큰 + DB ID 삭제 가능

#### Milestone 4.1: Notion OAuth 유틸

- [x] **`lib/notion/oauth.ts` 작성** (담당: 백엔드, 예상: 3h)
  - `getNotionAuthUrl(state: string)` — OAuth 인증 URL 생성
  - `exchangeCodeForToken(code: string)` — `access_token`, `workspace_id`, `bot_id` 획득
  - `fetch` 기반 POST `https://api.notion.com/v1/oauth/token` (Basic Auth: `NOTION_CLIENT_ID:NOTION_CLIENT_SECRET`)
  - 완료 기준: 유닛 레벨로 토큰 교환 동작 확인

- [x] **`lib/notion/client.ts` 작성** (담당: 백엔드, 예상: 1h)
  - `createNotionClient(accessToken: string)` → `new Client({ auth: accessToken })`
  - 완료 기준: 타입 안전한 Notion SDK 인스턴스 생성

#### Milestone 4.2: OAuth API Routes (F001)

- [x] **`app/api/auth/notion/route.ts` — GET** (담당: 백엔드, 예상: 2h)
  - 세션 확인 → 없으면 401
  - `state` (CSRF 방지, `crypto.randomUUID()`) 쿠키 저장
  - `getNotionAuthUrl(state)` → `NextResponse.redirect(url)`
  - 완료 기준: 버튼 클릭 시 노션 OAuth 페이지로 이동

- [x] **`app/api/auth/notion/callback/route.ts` — GET** (담당: 백엔드, 예상: 4h)
  - 쿼리: `code`, `state` — Zod `notionOAuthCallbackSchema`로 검증
  - 쿠키의 `state`와 비교 (CSRF 검증)
  - `exchangeCodeForToken(code)` → `access_token` 획득
  - `notion_integrations` upsert (`user_id` 기준, `status: "connected"`)
  - 성공 시 `/settings/notion?connected=true` 리디렉션, 실패 시 `?error=...`
  - 완료 기준: 콜백 완료 후 DB에 토큰 저장 + 설정 페이지로 이동
  - **[테스트 필수]** Playwright MCP로 OAuth 플로우 E2E 테스트 — `browser_navigate("/api/auth/notion")` → 노션 OAuth 페이지 리디렉션 확인 → 콜백 후 `browser_network_requests`로 DB upsert 응답 검증
  - **[테스트 필수]** 잘못된 state 값(CSRF 위변조) 전달 시 에러 리디렉션 확인
  - ⛔ 테스트 통과 전 다음 Milestone 진행 불가

#### Milestone 4.3: 노션 상태/DB API Routes (F002, F011)

- [x] **`app/api/notion/status/route.ts` — GET (F011)** (담당: 백엔드, 예상: 2h)
  - 세션 확인 → `notion_integrations` 조회
  - 응답: `{ status: "connected" | "disconnected" | "error", databaseId: string | null, connectedAt: string | null }`
  - `ApiResponse<NotionStatusDTO>` 반환
  - 완료 기준: 연동 미완/완료 각각 정상 응답

- [x] **`app/api/notion/database/route.ts` — POST (F002)** (담당: 백엔드, 예상: 2h)
  - body: `unknown` → `notionDatabaseSettingSchema.safeParse()` (기존 활용)
  - 세션 확인 → `notion_integrations.database_id` 업데이트
  - DB 존재 검증: 노션 SDK로 `databases.retrieve({ database_id })` 시도, 실패 시 400
  - 완료 기준: 잘못된 DB ID 400, 정상 DB ID 200

- [x] **`app/api/notion/database/route.ts` — DELETE** (담당: 백엔드, 예상: 1.5h)
  - 세션 확인 → `notion_integrations` row 삭제 (또는 `access_token`, `database_id` null 처리)
  - 연관 `invoices`는 유지 (재연동 시 재동기화)
  - 완료 기준: 연동 해제 시 상태 `disconnected` 반환

---

### Phase 5: 동기화 및 목록 API (F003, F004) (4~5일)

**목표**: 노션 DB를 조회하여 Notion "Invoices" 데이터베이스에 upsert하고, 발행자의 견적서 목록을 조회하는 API를 구현한다.

**완료 기준**:
- sync API 호출 시 노션 DB 전체 페이지를 `invoices`에 upsert
- 목록 API 응답이 발행자 데이터로 격리되어 있음
- 노션 미연동/토큰 만료/DB 없음 등 PRD 에러 처리 정책 충족
- 50건 기준 sync 응답 5초 이내

#### Milestone 5.1: 노션 파서 및 동기화 API

- [x] **`lib/notion/parser.ts` 작성** (담당: 백엔드, 예상: 4h)
  - `parseNotionPage(page: PageObjectResponse): { notionPageId, data: InvoiceData, status } | { error }`
  - PRD 컬럼 매핑: `Name` (title), `Client Name` (rich_text), `Client Email` (email), `Issued At` (date), `Due Date` (date), `Status` (select), `Total Amount` (number), `Tax Included` (checkbox), `Note` (rich_text), `Items` (rich_text → JSON.parse → `InvoiceItem[]`)
  - `items` JSON 파싱 실패 시 `items: []` + errors 배열에 기록
  - `invoiceItemSchema` / `invoiceDataSchema` 로 파싱 결과 검증
  - 완료 기준: 노션 mock 페이지 객체를 `InvoiceData`로 정확히 변환

- [x] **`app/api/invoices/sync/route.ts` — POST (F003)** (담당: 백엔드, 예상: 5h)
  - 세션 확인
  - `notion_integrations` 조회 → 없으면 `{ success: false, message: "노션 연동이 필요합니다." }`
  - `databases.query({ database_id, page_size: 100 })` 페이지네이션 수집
  - 토큰 만료(401) → `status: "error"` 업데이트 → `{ success: false, message: "노션 연동이 만료되었습니다. 재연동이 필요합니다." }`
  - DB 없음(ObjectNotFound) → 400 + "데이터베이스를 찾을 수 없습니다."
  - Rate limit(429) → SDK 자동 재시도 (최대 2회) 후 실패 시 "잠시 후 다시 시도해주세요."
  - 각 페이지 → `parseNotionPage` → Notion "Invoices" DB upsert (`NotionPageId` 프로퍼티 기준)
  - 응답: `{ synced: number, created: number, updated: number, errors: string[] }`
  - 완료 기준: PRD 에러 처리 정책 전체 시나리오 검증
  - **[테스트 필수]** Playwright MCP로 동기화 API 통합 테스트 — `browser_network_requests`로 `POST /api/invoices/sync` 응답(`synced`, `created`, `updated`, `errors`) 검증
  - **[테스트 필수]** Notion 미연동 상태에서 sync 호출 시 `{ success: false, message: "노션 연동이 필요합니다." }` 응답 확인
  - **[테스트 필수]** `lib/notion/parser.ts` Items JSON 파싱 오류 페이지 포함 시 `errors[]` 배열 반환 확인
  - ⛔ 테스트 통과 전 다음 Milestone 진행 불가

#### Milestone 5.2: 견적서 목록 API

- [x] **`app/api/invoices/route.ts` — GET (F004)** (담당: 백엔드, 예상: 2h)
  - 세션 확인 → `invoices` 조회 (`user_id` RLS, `issued_at` DESC)
  - `InvoiceListItem[]` 로 매핑 (경량 타입)
  - 쿼리: `?status=draft|sent|accepted|rejected` 필터 지원
  - 완료 기준: 100건 기준 응답 시간 300ms 이내

- [x] **`hooks/use-invoices.ts` 작성** (담당: 프론트엔드, 예상: 1.5h) `"use client"`
  - `useQuery({ queryKey: ["invoices"], queryFn, staleTime: 60 * 1000 })`
  - 완료 기준: 데이터 갱신 및 로딩/에러 상태 제공

- [x] **`hooks/use-sync-invoices.ts` 작성** (담당: 프론트엔드, 예상: 1.5h) `"use client"`
  - `useMutation({ mutationFn: syncApi, onSuccess: () => queryClient.invalidateQueries(["invoices"]) })`
  - 성공/실패 Sonner 토스트 (`@/lib/toast`)
  - 완료 기준: 동기화 완료 후 목록 자동 갱신

---

### Phase 6: 상세·공유·뷰어 API (F005, F006, F007) (3~4일)

**목표**: 견적서 단건 조회, 공유 링크(shareToken) 생성, 공개 뷰어 API를 구현하여 클라이언트가 인증 없이 링크로 견적서를 확인할 수 있도록 한다.

**완료 기준**:
- 상세 API가 RLS로 `user_id` 격리된 견적서를 반환
- 공유 링크 API가 동일 견적서에 대해 동일 토큰을 반환 (중복 생성 방지)
- 공개 뷰어 API가 인증 없이 `{ invoice, issuer }` 구조로 응답
- 유효하지 않은 토큰 접근 시 404 반환

#### Milestone 6.1: 견적서 상세 및 공유 API (F005, F006)

- [x] **`app/api/invoices/[id]/route.ts` — GET (F005)** (담당: 백엔드, 예상: 2h)
  - Next.js 16 동적 params: `{ params: Promise<{ id: string }> }`
  - 세션 확인 → RLS로 `user_id` 격리 조회
  - 없을 시 404, `{ success: false, message: "견적서를 찾을 수 없습니다." }`
  - 응답: `ApiResponse<Invoice>`
  - 완료 기준: 타 사용자의 id로 접근 시 404

- [x] **`hooks/use-invoice.ts` 작성** (담당: 프론트엔드, 예상: 1h) `"use client"`
  - `useQuery({ queryKey: ["invoice", id], queryFn, staleTime: 5 * 60 * 1000 })`
  - 완료 기준: 상세 데이터 캐싱

- [ ] **`app/api/invoices/[id]/share/route.ts` — POST (F006)** (담당: 백엔드, 예상: 3h)
  - `params: Promise<{ id: string }>`
  - 세션 확인 → 소유 확인 (RLS)
  - 이미 `share_token` 있으면 기존 값 반환 (PRD: 동일 응답 형식)
  - 없으면 `crypto.randomUUID()` (또는 `nanoid(24)`) 생성 → UPDATE
  - 응답: `{ shareToken: string, shareUrl: string }` — `shareUrl = ${NEXT_PUBLIC_APP_URL}/view/${shareToken}`
  - 완료 기준: 동일 견적서 2회 호출 시 같은 토큰 반환
  - **[테스트 필수]** Playwright MCP로 공유 링크 생성 플로우 테스트 — `browser_click` 생성 버튼 → `browser_network_requests`로 `POST /api/invoices/[id]/share` 응답 검증 → `shareUrl` 형식 확인
  - **[테스트 필수]** 타 사용자의 견적서 id로 POST 시 404 응답 확인 (RLS 검증)
  - ⛔ 테스트 통과 전 다음 Milestone 진행 불가

#### Milestone 6.2: 공개 뷰어 API (F007)

- [ ] **`app/api/view/[token]/route.ts` — GET** (담당: 백엔드, 예상: 3h)
  - `params: Promise<{ token: string }>`
  - 인증 불필요 — Internal Integration Token으로 Notion "Invoices" DB 직접 접근
  - `ShareToken` 프로퍼티 필터로 조회 → 발행자 `UserId`로 Notion "Users" DB에서 프로필 조회
  - 없으면 404, `{ success: false, message: "유효하지 않은 링크입니다." }`
  - 응답: `{ invoice: Invoice, issuer: { name: string, contact: string | null } }`
  - 완료 기준: 존재/부재 토큰 모두 검증
  - **[테스트 필수]** Playwright MCP로 공개 뷰어 API 테스트 — `browser_navigate("/view/<유효한토큰>")` → `browser_snapshot`으로 견적서 내용 렌더링 확인
  - **[테스트 필수]** 존재하지 않는 토큰 접근 시 에러 화면 표시 확인
  - **[테스트 필수]** `browser_network_requests`로 `GET /api/view/[token]` 응답 구조 (`invoice`, `issuer`) 검증
  - ⛔ 테스트 통과 전 다음 Milestone 진행 불가

---

## 기술 부채 및 리스크

### 식별된 리스크

| 리스크 | 영향도 | 확률 | 완화 전략 |
|--------|--------|------|-----------|
| Notion API Rate Limit (평균 3req/s) | 중 | 중 | SDK 내장 자동 재시도 + 사용자 안내 토스트 (PRD 정책) |
| 노션 OAuth 토큰 만료/재인증 | 고 | 중 | 401 감지 시 `status: "error"` 즉시 변경 + 재연동 CTA |
| Items 컬럼 JSON 파싱 실패 | 중 | 고 | `items: []` 대체 저장 + `errors[]` 배열로 UI에 경고 표시 |
| @react-pdf/renderer 한글 폰트 깨짐 | 고 | 고 | 초기부터 Noto Sans KR `Font.register` 필수 검증 |
| Notion DB userId 필터 누락으로 데이터 유출 | 치명 | 중 | 모든 Notion DB 쿼리에 `userId` 필터 필수 적용 + Phase 1 완료 후 두 계정 간 데이터 격리 수동 테스트 |
| shareToken 유출 시 견적서 공개됨 | 중 | 저 | MVP 만료 없음 명시, 이후 Phase에서 만료/갱신 기능 추가 |
| Next.js 16 `params` 비동기 변경 | 저 | 고 (확실) | 모든 동적 Route Handler/Page에서 `Promise<...>` 타입 준수 |
| 노션 DB 스키마 변경/컬럼 누락 | 중 | 중 | parser에서 누락 필드 기본값 처리 + errors 반환 |

### 기술 부채 (MVP 이후 해결)

- shareToken 만료/갱신 기능 (현재 무한 유효)
- 동기화 증분 처리 (현재 전체 덮어쓰기)
- 견적서 상태 수동 변경 UI
- 이메일 발송 기능
- 다국어 지원 (현재 ko-KR 고정)

---

## 재사용 가능한 컴포넌트 계획

### 기존 공통 컴포넌트 활용

| 컴포넌트 | 활용 위치 |
|---------|----------|
| `FormField<T>` | 로그인/회원가입/노션 DB ID 입력 폼 |
| `DataTable<T>` | 견적서 목록 테이블 |
| `AnimatedWrapper` | 랜딩 CTA, 공유 링크 생성 결과 영역 |
| `LoadingSpinner` | 동기화 중, PDF 생성 중, Query 로딩 |
| `EmptyState` | 견적서 목록 빈 상태 |
| `ErrorState` | Query 에러, 동기화 실패 |
| `StatCard` | 동기화 결과 요약 (created/updated) — 선택 |
| `PageHeader` | 대시보드 각 페이지 타이틀 |
| `RootProvider` | QueryClientProvider + ThemeProvider (기존) |

### 신규 공통/도메인 컴포넌트

| 컴포넌트 | 경로 | 용도 |
|---------|------|------|
| `UserMenu` | `components/layout/user-menu.tsx` | 사용자 이메일 + 로그아웃 |
| `LoginForm` | `components/auth/login-form.tsx` | 로그인 폼 |
| `RegisterForm` | `components/auth/register-form.tsx` | 회원가입 폼 |
| `ConnectionStatusCard` | `components/notion/connection-status-card.tsx` | 노션 연동 상태 표시 |
| `ConnectButton` | `components/notion/connect-button.tsx` | OAuth 진입/해제 |
| `DatabaseSettingForm` | `components/notion/database-setting-form.tsx` | DB ID 등록 폼 |
| `NotionConnectionBanner` | `components/invoices/notion-connection-banner.tsx` | 미연동 안내 배너 |
| `InvoiceStatusBadge` | `components/invoices/invoice-status-badge.tsx` | 상태 뱃지 |
| `SyncButton` | `components/invoices/sync-button.tsx` | 동기화 트리거 |
| `InvoiceTable` | `components/invoices/invoice-table.tsx` | 견적서 목록 테이블 |
| `InvoiceMetaSection` | `components/invoices/invoice-meta-section.tsx` | 상세 메타 정보 |
| `InvoiceItemsTable` | `components/invoices/invoice-items-table.tsx` | 항목 테이블 |
| `ShareLinkPanel` | `components/invoices/share-link-panel.tsx` | 공유 링크 생성/복사 |
| `PublicInvoiceHeader` | `components/viewer/public-invoice-header.tsx` | 공개 뷰어 헤더 |
| `PublicInvoiceBody` | `components/viewer/public-invoice-body.tsx` | 공개 뷰어 본문 |
| `PdfDownloadButton` | `components/viewer/pdf-download-button.tsx` | PDF 다운로드 버튼 |

---

## API 엔드포인트 목록

### 인증 (NextAuth.js + Notion "Users" DB)

| 메서드 | 설명 |
|--------|------|
| `POST /api/auth/register` | 회원가입 — Notion "Users" DB에 bcrypt 해시 저장 (F010) |
| NextAuth.js `signIn("credentials", {...})` | 로그인 — Notion "Users" DB 조회 + bcrypt 검증 (F010) |
| NextAuth.js `signOut()` | 로그아웃 — JWT 세션 파기 |

### 노션 연동

| 메서드 | 경로 | 기능 ID | 요청 | 응답 (성공) | 응답 (실패) |
|--------|------|---------|------|-------------|-------------|
| GET | `/api/auth/notion` | F001 | 쿠키 세션 | 302 Redirect → 노션 OAuth URL | 401 |
| GET | `/api/auth/notion/callback` | F001 | query: `code`, `state` | 302 Redirect → `/settings/notion?connected=true` | 302 Redirect → `/settings/notion?error=...` |
| GET | `/api/notion/status` | F011 | 쿠키 세션 | `{ status, databaseId, connectedAt }` | `{ message }` |
| POST | `/api/notion/database` | F002 | body: `{ databaseId }` | `{ databaseId }` | `{ message: "데이터베이스를 찾을 수 없습니다." }` |
| DELETE | `/api/notion/database` | — | 쿠키 세션 | `{ status: "disconnected" }` | `{ message }` |

### 견적서

| 메서드 | 경로 | 기능 ID | 요청 | 응답 (성공) | 응답 (실패) |
|--------|------|---------|------|-------------|-------------|
| GET | `/api/invoices` | F004 | query: `?status=` | `InvoiceListItem[]` | `{ message }` |
| GET | `/api/invoices/[id]` | F005 | params | `Invoice` | 404 `{ message: "견적서를 찾을 수 없습니다." }` |
| POST | `/api/invoices/sync` | F003 | body 없음 | `{ synced, created, updated, errors }` | `{ message: "노션 연동이 필요합니다." }` 등 |
| POST | `/api/invoices/[id]/share` | F006 | params | `{ shareToken, shareUrl }` | `{ message }` |

### 공개 뷰어

| 메서드 | 경로 | 기능 ID | 인증 | 응답 (성공) | 응답 (실패) |
|--------|------|---------|------|-------------|-------------|
| GET | `/api/view/[token]` | F007 | 불필요 | `{ invoice, issuer: { name, contact } }` | 404 `{ message: "유효하지 않은 링크입니다." }` |

모든 응답은 `types/index.ts`의 `ApiResponse<T>` / `ApiErrorResponse` 타입을 준수한다.

---

## Zod 스키마 계획

### 기존 스키마 (재사용)

| 스키마 | 위치 | 용도 |
|--------|------|------|
| `loginSchema` | `lib/schemas/auth.schema.ts` | 로그인 폼 |
| `registerSchema` | `lib/schemas/auth.schema.ts` | 회원가입 폼 |
| `invoiceStatusSchema` | `lib/schemas/invoice.schema.ts` | 견적서 상태 |
| `invoiceItemSchema` | `lib/schemas/invoice.schema.ts` | 견적 항목 |
| `invoiceDataSchema` | `lib/schemas/invoice.schema.ts` | 노션 파서 검증 |
| `createShareLinkSchema` | `lib/schemas/invoice.schema.ts` | 공유 링크 생성 |
| `notionDatabaseSettingSchema` | `lib/schemas/notion.schema.ts` | DB ID 등록 |
| `notionSyncSchema` | `lib/schemas/notion.schema.ts` | 동기화 요청 |
| `notionOAuthCallbackSchema` | `lib/schemas/notion.schema.ts` | OAuth 콜백 |
| `emailSchema`, `passwordSchema`, `requiredString()` | `lib/schemas/common.schema.ts` | 공통 |

### 신규 스키마 (필요 시 추가)

| 스키마 | 위치 | 용도 |
|--------|------|------|
| `shareTokenParamSchema` | `lib/schemas/invoice.schema.ts` | `/api/view/[token]` 파라미터 검증 (`z.string().min(16)`) |
| `invoiceListQuerySchema` | `lib/schemas/invoice.schema.ts` | `GET /api/invoices?status=...` 쿼리 검증 |
| `profileUpdateSchema` | `lib/schemas/profile.schema.ts` | (MVP 이후) 발행자 프로필 수정 |

---

## 완료 체크리스트

### 기능 구현
- [x] F001 노션 OAuth 연결 — `/api/auth/notion`, `/api/auth/notion/callback`
- [x] F002 노션 DB ID 등록 — `POST /api/notion/database`
- [x] F003 견적서 동기화 — `POST /api/invoices/sync`
- [x] F004 견적서 목록 조회 — `GET /api/invoices` + 목록 페이지
- [x] F005 견적서 상세 조회 — `GET /api/invoices/[id]` + 상세 페이지
- [ ] F006 공유 링크 생성 — `POST /api/invoices/[id]/share`
- [ ] F007 공개 견적서 뷰어 — `GET /api/view/[token]` + `/view/[token]` 페이지
- [x] F008 PDF 다운로드 — `@react-pdf/renderer` + 한글 폰트
- [x] F010 기본 인증 — 회원가입/로그인/로그아웃 + 미들웨어
- [x] F011 노션 연동 상태 확인 — `GET /api/notion/status` + 상태 카드

### Notion 데이터베이스 구조
- [ ] Notion "Users" DB 생성 + 프로퍼티 구성 + Internal Integration 접근 권한 부여
- [ ] Notion "Integrations" DB 생성 + `UserId` 필터 조회 동작 확인
- [ ] Notion "Invoices" DB 생성 + `NotionPageId` 기준 upsert + `ShareToken` 필터 동작 확인
- [ ] 모든 Notion DB 쿼리에 `userId` 필터 적용 (데이터 격리) 확인

### 품질
- [ ] 타입 안전성: `tsc --noEmit` 통과, `any` 사용 0건
- [ ] ESLint 경고 0건
- [ ] 모든 API Route가 `ApiResponse<T>` / `ApiErrorResponse` 타입 준수
- [ ] 모든 폼이 React Hook Form + Zod + `FormField<T>` 패턴 준수
- [ ] 반응형 디자인 검증 (모바일 320px ~ 데스크톱 1440px)
- [ ] 로딩/에러 상태 일관성 (`LoadingSpinner`, `ErrorState`, `EmptyState`)
- [ ] 토스트는 `@/lib/toast` 래퍼 경유, Sonner 직접 import 0건
- [ ] 날짜 포맷은 `@/lib/date` 래퍼 사용
- [ ] `cn()`으로 className 병합
- [ ] 파일명 kebab-case 일관성
- [ ] `"use client"` 필요 시에만 사용 (서버 컴포넌트 우선)

### 사용자 여정 E2E 검증 (Playwright MCP 필수)

- [ ] **Flow 1 — 최초 설정** (Playwright MCP E2E 테스트 통과 필수)
  - `browser_navigate("/")` → 랜딩 페이지 렌더링 확인
  - `browser_click` 회원가입 버튼 → `browser_fill_form` 이메일/비밀번호 입력 → 가입 완료
  - 자동 로그인 후 `/invoices` 리디렉션 확인 (`browser_snapshot`)
  - 노션 미연동 배너 표시 → 설정 페이지 이동 → OAuth 연결 → DB ID 등록 → 목록 복귀
- [ ] **Flow 2 — 동기화 및 공유** (Playwright MCP E2E 테스트 통과 필수)
  - `browser_click` 동기화 버튼 → `browser_network_requests`로 sync API 응답 검증
  - 목록 갱신 확인 → 견적서 행 클릭 → 상세 페이지 렌더링
  - 공유 링크 생성 → `browser_snapshot`으로 URL 표시 확인 → 링크 복사 토스트 확인
- [ ] **Flow 3 — 클라이언트 열람 및 PDF** (Playwright MCP E2E 테스트 통과 필수)
  - `browser_navigate("/view/<shareToken>")` → 견적서 내용 전체 렌더링 확인
  - PDF 다운로드 버튼 클릭 → 파일 생성 및 한글 깨짐 없음 확인
- [ ] **Flow 4 — 에러 시나리오** (Playwright MCP E2E 테스트 통과 필수)
  - 미인증 상태에서 `/invoices` 접근 → `/login` 리디렉션 확인
  - 타 사용자 견적서 id로 `/invoices/[id]` 접근 → 에러 처리 확인
  - 존재하지 않는 shareToken `/view/invalid-token` 접근 → 에러 페이지 표시 확인
  - 노션 토큰 만료 시 동기화 → 재연동 안내 토스트 + 설정 페이지 CTA 확인

### Notion DB 쿼리 파싱 정확성 검증
- [ ] Notion 페이지 10가지 프로퍼티(`Name`, `Client Name`, `Client Email`, `Issued At`, `Due Date`, `Status`, `Total Amount`, `Tax Included`, `Note`, `Items`) 파싱 정확성 확인
- [ ] `Items` 컬럼 JSON 파싱 성공 시 `InvoiceItem[]` 정확 변환 확인
- [ ] `Items` 컬럼 JSON 파싱 실패 시 `items: []` 대체 + `errors[]` 포함 확인
- [ ] 누락 필드 기본값 처리 (null/빈값) 정상 동작 확인

### 서브에이전트 실행 (구현 완료 후)
- [ ] `code-reviewer` — Phase별 코드 구현 완료 후
- [ ] `component-reviewer` — 신규 컴포넌트 작성 후
- [ ] `dead-code-detector` — 모든 Phase 완료 후
- [ ] `type-auditor` — 최종 배포 전

### 배포
- [ ] Vercel 프로젝트 환경변수 설정 (`NOTION_INTEGRATION_TOKEN`, `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`, `NOTION_REDIRECT_URI`, DB ID 3개, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`)
- [ ] Notion OAuth Redirect URI에 프로덕션 도메인 추가
- [ ] Notion Internal Integration에 프로덕션 워크스페이스 DB 접근 권한 부여
- [ ] 프로덕션 환경에서 E2E 여정 재검증
