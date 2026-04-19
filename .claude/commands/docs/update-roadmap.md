---
description: 'Shrimp Task Manager의 완료된 작업을 기반으로 docs/ROADMAP.md의 체크리스트를 업데이트합니다'
allowed-tools:
  [
    'Read',
    'Edit',
    'mcp__shrimp-task-manager__list_tasks',
    'mcp__shrimp-task-manager__get_task_detail',
  ]
---

# Claude 명령어: update-roadmap

Shrimp Task Manager에서 완료(`completed`)된 작업을 조회하고, 해당 내용을 `docs/ROADMAP.md`의 체크리스트에 반영합니다.

## 실행 절차

### 1단계: 완료된 태스크 목록 수집

`mcp__shrimp-task-manager__list_tasks` 도구를 `status: "completed"`로 호출하여 완료된 작업 목록을 가져옵니다.

### 2단계: ROADMAP.md 읽기

`docs/ROADMAP.md` 파일을 읽어 현재 체크리스트 상태를 파악합니다.

### 3단계: 매핑 및 업데이트

완료된 태스크의 이름/설명을 ROADMAP.md의 각 항목과 비교합니다.

#### 매핑 규칙

- 태스크 이름에서 컴포넌트명, 파일명, 기능명을 추출하여 ROADMAP 항목과 대조합니다.
- 아래 패턴으로 `[ ]`를 `[x]`로 변경합니다:

| 태스크 키워드 | ROADMAP 항목 패턴 |
|-------------|-----------------|
| `랜딩 페이지` | 랜딩 페이지 관련 항목 |
| `로그인 폼` | `login-form`, 로그인 폼 관련 |
| `회원가입 폼` | `register-form`, 회원가입 폼 관련 |
| `사용자 메뉴` | `user-menu`, 사용자 메뉴 관련 |
| `use-notion-status` | 훅 구현 관련 항목 |
| `노션 연동 상태 카드` | `connection-status-card` 관련 |
| `노션 연결/해제 버튼` | `connect-button` 관련 |
| `노션 DB ID 설정 폼` | `database-setting-form` 관련 |
| `노션 설정 페이지` | `/settings/notion/page.tsx` 관련 |
| `노션 연동 안내 배너` | `notion-connection-banner` 관련 |
| `견적서 상태 뱃지` | `invoice-status-badge` 관련 |
| `동기화 버튼` | `sync-button` 관련 |
| `견적서 목록 테이블` | `invoice-table` 관련 |
| `견적서 목록 페이지` | `/invoices/page.tsx` 관련 |
| `use-create-share-link` | 공유 링크 훅 관련 |
| `견적서 메타 섹션` | `invoice-meta-section` 관련 |
| `견적서 항목 테이블` | `invoice-items-table` 관련 |
| `공유 링크 패널` | `share-link-panel` 관련 |
| `견적서 상세 페이지` | `/invoices/[id]/page.tsx` 관련 |
| `공개 뷰어 헤더` | `public-invoice-header` 관련 |
| `공개 뷰어 본문` | `public-invoice-body` 관련 |
| `PDF Document` | `invoice-pdf.tsx`, PDF 관련 |
| `PDF 다운로드 버튼` | `pdf-download-button` 관련 |
| `공개 뷰어 페이지` | `/view/[token]/page.tsx` 관련 |

#### 체크박스 업데이트 방식

```markdown
# 변경 전
- [ ] **`components/auth/login-form.tsx` 작성** (담당: 프론트엔드, 예상: 3h) `"use client"`

# 변경 후
- [x] **`components/auth/login-form.tsx` 작성** (담당: 프론트엔드, 예상: 3h) `"use client"`
```

**완료 체크리스트 섹션**의 기능 ID(F001~F011) 항목도 동일하게 업데이트합니다:

```markdown
# 변경 전
- [ ] F006 공유 링크 생성 — `POST /api/invoices/[id]/share`

# 변경 후
- [x] F006 공유 링크 생성 — `POST /api/invoices/[id]/share`
```

### 4단계: Edit 도구로 반영

매핑된 각 항목에 대해 `Edit` 도구를 사용하여 `[ ]` → `[x]` 변경을 적용합니다.

- 이미 `[x]`인 항목은 건드리지 않습니다.
- 태스크와 매핑되지 않는 항목은 그대로 유지합니다.

### 5단계: 결과 보고

업데이트 완료 후 변경된 항목 목록을 출력합니다:

```
## ROADMAP.md 업데이트 완료

변경된 항목 (N개):
- [x] 랜딩 페이지 리디자인 (Milestone 1.1)
- [x] components/auth/login-form.tsx 작성 (Milestone 1.1)
...

변경 없음 (이미 완료 또는 미매핑):
- Notion "Users" DB 생성 — Shrimp 태스크 없음
...
```

## 주의사항

- `docs/ROADMAP.md`만 수정하며 다른 파일은 변경하지 않습니다.
- Shrimp에서 `pending` / `in_progress` 상태인 작업은 `[ ]`를 유지합니다.
- 태스크 이름이 명확히 매핑되지 않을 경우 해당 항목을 건너뛰고 보고서에 "미매핑"으로 표시합니다.
