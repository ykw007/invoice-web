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
  data: T;
  message?: string;
  success: boolean;
}

/** 페이지네이션 상태 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/** 폼 제출 상태 */
export type FormStatus = "idle" | "loading" | "success" | "error";

/** 주문 상태 리터럴 유니온 */
export type OrderStatus = "완료" | "처리중" | "취소";

/** 리포트 도메인 타입 */
export interface Report {
  id: string;
  title: string;
  date: string;
  status: string;
}
