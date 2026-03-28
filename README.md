# 노션 견적서 웹 뷰어

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)

> 노션 데이터베이스에 입력한 견적서를 고유 URL로 클라이언트에게 공유하고 PDF 다운로드까지 제공하는 서비스.
> 별도 견적서 툴 없이 노션만으로 전문적인 견적 프로세스를 완결합니다.

---

## 주요 기능

- **노션 연동**: OAuth로 노션 계정을 연결하고 견적서 데이터베이스를 등록하여 자동 동기화
- **견적서 관리**: 동기화된 견적서 목록 조회 및 상세 미리보기
- **공유 링크 생성**: 견적서별 고유 토큰 기반 URL 생성 및 클립보드 복사
- **클라이언트 웹 뷰어**: 로그인 없이 고유 URL로 견적서 확인 가능
- **PDF 다운로드**: 클라이언트가 견적서를 PDF 파일로 저장

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router), React 19 |
| 언어 | TypeScript 5 (strict mode) |
| 스타일링 | Tailwind CSS v4 (postcss 기반, 설정 파일 없음) |
| UI 컴포넌트 | shadcn/ui + Radix UI |
| 폼 검증 | React Hook Form 7 + Zod |
| 서버 상태 | TanStack Query v5 |
| 노션 연동 | @notionhq/client (공식 Notion API SDK) |
| PDF 생성 | @react-pdf/renderer |
| 인증 & DB | Supabase (Auth + PostgreSQL) |
| 애니메이션 | Framer Motion |
| 아이콘 | Lucide React |
| 토스트 | Sonner |
| 배포 | Vercel |

---

## 프로젝트 구조

```
invoice-web/
├── app/
│   ├── (auth)/                  # 인증 레이아웃 그룹
│   │   ├── login/page.tsx       # 로그인 페이지
│   │   └── register/page.tsx    # 회원가입 페이지
│   ├── (dashboard)/             # 발행자 대시보드
│   │   ├── invoices/            # 견적서 목록
│   │   ├── invoices/[id]/       # 견적서 상세 (발행자 뷰)
│   │   └── settings/notion/     # 노션 연동 설정
│   ├── view/[token]/            # 클라이언트 웹 뷰어 (공개)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                      # shadcn/ui 컴포넌트
│   ├── common/                  # 공용 컴포넌트
│   ├── layout/                  # 레이아웃 컴포넌트
│   └── providers/               # Context Provider
├── hooks/                       # 커스텀 훅
├── lib/                         # 유틸 함수, Zod 스키마
├── types/                       # TypeScript 타입 정의
├── docs/
│   └── PRD.md                   # MVP 기획 문서
└── public/                      # 정적 파일
```

---

## 시작하기

### 요구 사항

- Node.js 18 이상
- npm
- Supabase 프로젝트
- Notion 통합(Integration) 설정

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-username/invoice-web.git
cd invoice-web

# 의존성 설치
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Notion
NOTION_CLIENT_ID=your_notion_oauth_client_id
NOTION_CLIENT_SECRET=your_notion_oauth_client_secret
NOTION_REDIRECT_URI=http://localhost:3000/api/auth/notion/callback
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
npm run start
```

---

## 스크립트

| 스크립트 | 설명 |
|----------|------|
| `npm run dev` | 개발 서버 실행 (http://localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 코드 검사 |

---

## 데이터 모델

| 테이블 | 설명 |
|--------|------|
| `User` | 발행자 계정 (이메일/비밀번호 인증) |
| `NotionIntegration` | 노션 OAuth 토큰 및 데이터베이스 ID |
| `Invoice` | 동기화된 견적서 (노션 페이지 ID, 공유 토큰, JSON 데이터) |

---

## 라이선스

MIT
