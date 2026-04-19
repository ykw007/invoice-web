import type { NavLink } from "@/types";

/** 앱 기본 설정 */
export const APP_CONFIG = {
  name: "Next.js 스타터킷",
  description: "모던 Next.js 웹 개발을 위한 완성도 높은 스타터킷",
  year: new Date().getFullYear(),
  github: "https://github.com",
} as const;

/** 라우트 상수 */
export const ROUTES = {
  home: "/",
  invoices: "/invoices",
  settingsNotion: "/settings/notion",
} as const;

/** 반응형 브레이크포인트 (px) */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** 사이드바 네비게이션 링크 */
export const NAV_LINKS: NavLink[] = [
  { label: "견적서 목록", href: ROUTES.invoices },
  { label: "노션 연동", href: ROUTES.settingsNotion },
];
