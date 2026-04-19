import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";

/**
 * 회원가입 페이지 (서버 컴포넌트)
 * - 이미 로그인된 사용자: /invoices로 즉시 redirect
 * - 비로그인 상태: RegisterForm 렌더링
 */
export default async function RegisterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (token?.value) {
    redirect("/invoices");
  }

  return (
    <AuthLayout title="회원가입" description="계정을 생성해주세요.">
      <RegisterForm />
    </AuthLayout>
  );
}
