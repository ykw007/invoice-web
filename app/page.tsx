import { redirect } from "next/navigation";

/**
 * 루트 경로 접근 시 로그인 페이지로 리다이렉트
 * 추후 Supabase 세션 확인 후 대시보드로 분기 처리 예정
 */
export default function RootPage() {
  redirect("/login");
}
