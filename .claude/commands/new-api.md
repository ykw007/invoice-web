---
description: '새로운 Next.js API Route를 프로젝트 패턴에 맞게 생성합니다'
allowed-tools:
  [
    'Read',
    'Write',
    'Edit',
    'Bash(ls:*)',
    'Glob',
  ]
---

# Claude 명령어: new-api

`$ARGUMENTS`에 지정된 리소스 이름으로 새 API Route를 생성합니다.

## 인수 파싱

`$ARGUMENTS` 형식: `<resource> [--crud] [--id]`

- `<resource>`: 리소스 이름 (kebab-case 권장, 예: `users`, `blog-posts`)
- `--crud`: GET(목록) + POST + PUT + DELETE 핸들러 전체 생성
- `--id`: `[id]` 동적 세그먼트 라우트 추가 생성

## 생성 파일

| 플래그 | 생성 파일 |
|--------|-----------|
| 기본 | `app/api/<resource>/route.ts` |
| `--id` | `app/api/<resource>/route.ts` + `app/api/<resource>/[id]/route.ts` |
| `--crud` | 위와 동일 (핸들러 전체 포함) |

## 코드 패턴

### 기본 (GET + POST)
```ts
// app/api/<resource>/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { ApiResponse } from "@/types";

const create<Resource>Schema = z.object({
  // 필드 정의
});

/** GET /api/<resource> - 목록 조회 */
export async function GET(): Promise<NextResponse<ApiResponse<<Resource>[]>>> {
  try {
    // 데이터 조회 로직
    return NextResponse.json({ success: true, data: [] });
  } catch {
    return NextResponse.json(
      { success: false, data: [], message: "조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

/** POST /api/<resource> - 생성 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<<Resource> | null>>> {
  try {
    const body: unknown = await request.json();
    const parsed = create<Resource>Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // 생성 로직
    return NextResponse.json(
      { success: true, data: null, message: "생성되었습니다." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
```

### `--id` 동적 라우트 (GET + PUT + DELETE)
```ts
// app/api/<resource>/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { ApiResponse } from "@/types";

const update<Resource>Schema = z.object({
  // 수정 가능한 필드
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/<resource>/[id] - 단건 조회 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<<Resource> | null>>> {
  try {
    const { id } = await params;
    // 단건 조회 로직
    return NextResponse.json({ success: true, data: null });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

/** PUT /api/<resource>/[id] - 수정 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const parsed = update<Resource>Schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, data: null, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // 수정 로직
    return NextResponse.json({ success: true, data: null, message: "수정되었습니다." });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

/** DELETE /api/<resource>/[id] - 삭제 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await params;
    // 삭제 로직
    return NextResponse.json({ success: true, data: null, message: "삭제되었습니다." });
  } catch {
    return NextResponse.json(
      { success: false, data: null, message: "삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
```

## 응답 형식

모든 API는 `types/index.ts`의 `ApiResponse<T>` 타입을 사용합니다:

```ts
{ success: true, data: T, message?: string }      // 성공
{ success: false, data: null, message: string }    // 실패
```

## HTTP 상태 코드

| 상황 | 코드 |
|------|------|
| 성공 (조회/수정/삭제) | 200 |
| 생성 성공 | 201 |
| 유효성 검사 실패 | 400 |
| 리소스 없음 | 404 |
| 서버 오류 | 500 |

## 규칙

- `any` 타입 사용 금지 — `unknown`으로 받아 Zod로 파싱
- 2칸 들여쓰기
- `try/catch`로 모든 핸들러 감싸기
- Zod `safeParse` 사용 (예외 대신 결과 객체 처리)
- 요청 Body는 반드시 Zod 스키마로 검증
- 한국어 JSDoc 주석 및 에러 메시지
- `ApiResponse<T>` 타입을 반환 타입으로 명시
- Next.js 15 `params`는 `Promise<{ id: string }>` 타입 사용
