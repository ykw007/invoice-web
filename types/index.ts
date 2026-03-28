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
// 도메인 타입 — invoice-web
// ---------------------------------------------------------------------------

/** 견적서 상태 */
export type InvoiceStatus = "draft" | "sent" | "accepted" | "rejected";

/**
 * 견적서 아이템 (노션 DB의 견적 항목)
 * InvoiceData.items 배열의 단일 항목
 */
export interface InvoiceItem {
  /** 항목명 */
  name: string;
  /** 수량 */
  quantity: number;
  /** 단가 (원) */
  unitPrice: number;
  /** 소계 (quantity * unitPrice) */
  subtotal: number;
}

/** 견적서 JSON 데이터 (노션 DB에서 파싱된 구조) */
export interface InvoiceData {
  /** 견적서 제목 */
  title: string;
  /** 클라이언트명 */
  clientName: string;
  /** 클라이언트 이메일 */
  clientEmail?: string;
  /** 발행일 (ISO 8601) */
  issuedAt: string;
  /** 유효기한 (ISO 8601) */
  dueDate?: string;
  /** 견적 항목 목록 */
  items: InvoiceItem[];
  /** 합계 금액 (원) */
  totalAmount: number;
  /** 메모/특이사항 */
  note?: string;
  /** 세금 포함 여부 */
  taxIncluded?: boolean;
}

/** 견적서 도메인 타입 (DB 행 + 파싱된 data) */
export interface Invoice {
  id: string;
  userId: string;
  notionPageId: string;
  /** 공개 공유용 토큰 (생성 전 null) */
  shareToken: string | null;
  /** 파싱된 견적서 데이터 */
  data: InvoiceData;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

/** 견적서 목록 아이템 (목록 페이지용 경량 타입) */
export interface InvoiceListItem {
  id: string;
  title: string;
  clientName: string;
  totalAmount: number;
  status: InvoiceStatus;
  issuedAt: string;
  hasShareLink: boolean;
}

/** 노션 연동 정보 */
export interface NotionIntegration {
  id: string;
  userId: string;
  /** 노션 OAuth 액세스 토큰 */
  accessToken: string;
  /** 연동된 노션 데이터베이스 ID */
  databaseId: string | null;
  createdAt: string;
}

/** 노션 연동 상태 (UI 표시용) */
export type NotionConnectionStatus = "connected" | "disconnected" | "error";
