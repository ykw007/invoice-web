import type { ComponentType, ReactNode } from "react";

/** 네비게이션 링크 타입 */
export interface NavLink {
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  external?: boolean;
}

/** 테마 타입 */
export type Theme = "light" | "dark" | "system";

/** 사이즈 타입 */
export type Size = "sm" | "md" | "lg";

/** 공통 베이스 Props */
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

/** 사이드바 Props */
export interface SidebarProps extends BaseProps {
  isCollapsed?: boolean;
}

/** 테이블 컬럼 정의 */
export interface TableColumn<T extends object> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

/** API 응답 타입 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/** API 오류 응답 타입 */
export interface ApiErrorResponse {
  success: false;
  data: null;
  message: string;
}

/** 페이지네이션 상태 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/** 폼 제출 상태 */
export type FormStatus = "idle" | "loading" | "success" | "error";

// ---------------------------------------------------------------------------
// 도메인 타입 — 견적서(Invoice)
// ---------------------------------------------------------------------------

/** 견적서 상태 (내부 코드용 영어 enum) */
export type InvoiceStatus = "draft" | "sent" | "accepted" | "rejected";

/** 견적 항목 단일 행 */
export interface InvoiceItem {
  /** 항목명 — Items DB `항목명` Title */
  name: string;
  /** 수량 — Items DB `수량` Number */
  quantity: number;
  /** 단가 (원) — Items DB `단가` Number */
  unitPrice: number;
  /** 소계 (원) — Items DB `소계` Formula(수량 × 단가) */
  subtotal: number;
}

/** 견적서 데이터 (Invoice DB에서 파싱된 구조) */
export interface InvoiceData {
  /** 견적서 번호 — Invoice DB `견적서 번호` Title (예: inv-2026-001) */
  invoiceNumber: string;
  /** 클라이언트명 — Invoice DB `클라이언트명` Rich Text */
  clientName: string;
  /** 클라이언트 이메일 — Invoice DB `클라이언트 이메일` Email */
  clientEmail?: string;
  /** 발행일 ISO 8601 — Invoice DB `발행일` Date */
  issuedAt: string;
  /** 유효기한 ISO 8601 — Invoice DB `유효기한` Date */
  dueDate?: string;
  /** 견적 항목 목록 — Items DB Relation에서 조회 */
  items: InvoiceItem[];
  /** 합계 금액 (원) — Invoice DB `합계 금액` Rollup(Sum of Items.소계) */
  totalAmount: number;
  /** 메모 — Invoice DB `메모` Rich Text */
  note?: string;
  /** 세금 포함 여부 — Invoice DB `세금 포함` Checkbox */
  taxIncluded: boolean;
}

/** 앱 시스템 Invoices DB 행 (캐시 레이어) */
export interface Invoice {
  /** 앱 시스템 Invoices DB 페이지 ID */
  id: string;
  /** 발행자 ID (앱 시스템 Users DB 페이지 ID) */
  userId: string;
  /** 원본 사용자 Invoice DB 페이지 ID (upsert 기준키) */
  notionPageId: string;
  /** 공개 공유 토큰 (생성 전 null) */
  shareToken: string | null;
  /** 파싱된 견적서 데이터 */
  data: InvoiceData;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

/** 견적서 목록용 경량 타입 */
export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: number;
  status: InvoiceStatus;
  issuedAt: string;
  hasShareLink: boolean;
}

/** 공개 뷰어용 발행자 정보 */
export interface Issuer {
  name: string;
  contact: string | null;
}

// ---------------------------------------------------------------------------
// 노션 연동 타입
// ---------------------------------------------------------------------------

/** 앱 시스템 Integrations DB 행 */
export interface NotionIntegration {
  /** 시스템 Integrations DB 페이지 ID */
  id: string;
  /** 발행자 ID (시스템 Users DB 페이지 ID) */
  userId: string;
  /** Notion OAuth 액세스 토큰 */
  accessToken: string;
  /** 사용자 Invoice DB ID */
  databaseId: string | null;
  /** 사용자 Items DB ID */
  itemsDatabaseId: string | null;
  /** 연동 상태 */
  status: "connected" | "error";
  createdAt: string;
}

/** 노션 연동 상태 (UI 표시용) */
export type NotionConnectionStatus = "connected" | "disconnected" | "error";

/** 노션 연동 상태 DTO (API 응답용) */
export interface NotionStatusDTO {
  status: NotionConnectionStatus;
  databaseId: string | null;
  itemsDatabaseId: string | null;
  connectedAt: string | null;
}

// ---------------------------------------------------------------------------
// 시스템 Notion DB 행 타입 (lib/notion/db/ 헬퍼에서 사용)
// ---------------------------------------------------------------------------

/** 시스템 Users DB 행 */
export interface NotionUserRow {
  /** Users DB 페이지 ID */
  pageId: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

/** 시스템 Integrations DB 행 */
export interface NotionIntegrationRow {
  /** Integrations DB 페이지 ID */
  pageId: string;
  /** Users DB 페이지 ID */
  userId: string;
  accessToken: string;
  invoiceDbId: string | null;
  itemsDbId: string | null;
  status: "connected" | "error";
  connectedAt: string | null;
}

/** 시스템 Invoices DB 행 */
export interface NotionInvoiceRow {
  /** Invoices DB 페이지 ID */
  pageId: string;
  /** Users DB 페이지 ID */
  userId: string;
  /** 원본 사용자 Invoice DB 페이지 ID */
  notionPageId: string;
  /** InvoiceData JSON 직렬화 문자열 */
  dataJson: string;
  status: InvoiceStatus;
  shareToken: string | null;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// 노션 DB 프로퍼티명 상수
// ---------------------------------------------------------------------------

/**
 * 사용자 Invoice DB 프로퍼티명 (한국어)
 * 실제 노션 내보내기 기준으로 확인된 값
 */
export const NOTION_INVOICE_PROPS = {
  invoiceNumber: "견적서 번호",
  clientName:    "클라이언트명",
  clientEmail:   "클라이언트 이메일",
  issuedAt:      "발행일",
  dueDate:       "유효기한",
  status:        "상태",
  taxIncluded:   "세금 포함",
  note:          "메모",
  items:         "항목",
  totalAmount:   "합계 금액",
} as const;

/**
 * 사용자 Items DB 프로퍼티명
 * invoice: "Invoices" — 역방향 Relation 이름이 영어로 설정되어 있음 (실제 확인값)
 */
export const NOTION_ITEM_PROPS = {
  name:      "항목명",
  invoice:   "Invoices",
  quantity:  "수량",
  unitPrice: "단가",
  subtotal:  "소계",
} as const;

/** 앱 시스템 Users DB 프로퍼티명 */
export const NOTION_SYS_USER_PROPS = {
  name:         "Name",
  email:        "Email",
  passwordHash: "PasswordHash",
  createdAt:    "CreatedAt",
} as const;

/** 앱 시스템 Integrations DB 프로퍼티명 */
export const NOTION_SYS_INTEGRATION_PROPS = {
  userId:       "UserId",
  accessToken:  "AccessToken",
  invoiceDbId:  "InvoiceDbId",
  itemsDbId:    "ItemsDbId",
  status:       "Status",
  connectedAt:  "ConnectedAt",
} as const;

/** 앱 시스템 Invoices DB 프로퍼티명 */
export const NOTION_SYS_INVOICE_PROPS = {
  invoiceNumber: "InvoiceNumber",
  userId:        "UserId",
  notionPageId:  "NotionPageId",
  dataJson:      "DataJson",
  status:        "Status",
  shareToken:    "ShareToken",
  updatedAt:     "UpdatedAt",
} as const;

/** 노션 상태 옵션(한국어) → InvoiceStatus 변환 맵 */
export const NOTION_STATUS_MAP: Record<string, InvoiceStatus> = {
  "초안":   "draft",
  "발송됨": "sent",
  "수락됨": "accepted",
  "거절됨": "rejected",
} as const;

/** UI 표시용 한국어 라벨 */
export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft:    "초안",
  sent:     "발송됨",
  accepted: "수락됨",
  rejected: "거절됨",
} as const;
