import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

/**
 * 로그인 페이지 (서버 컴포넌트)
 * - 이미 로그인된 사용자: /invoices로 즉시 redirect
 * - 비로그인 상태: LoginForm 렌더링
 */
export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (token?.value) {
    redirect("/invoices");
  }

  return (
    <AuthLayout
      title="로그인"
      description="이메일과 비밀번호를 입력해주세요."
    >
      <LoginForm />
    </AuthLayout>
  );
}
