"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.schema";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { toast } from "@/lib/toast";
import type { ApiErrorResponse } from "@/types";

/**
 * 로그인 폼 컴포넌트
 * - POST /api/auth/login 호출
 * - 성공 시 JWT 쿠키 저장 후 /invoices 이동
 * - 실패 시 에러 토스트 표시
 */
export function LoginForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const json: { success: boolean; data?: { token: string }; message?: string } =
        await res.json();

      if (!res.ok || !json.success) {
        const errMsg = (json as unknown as ApiErrorResponse).message ?? "이메일 또는 비밀번호를 확인해주세요.";
        toast.error("로그인 실패", errMsg);
        return;
      }

      /* JWT 쿠키 저장 (max-age: 7일) */
      const maxAge = data.rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
      if (json.data?.token) {
        document.cookie = `token=${json.data.token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }

      toast.success("로그인 성공!", `${data.email}으로 로그인했습니다.`);
      router.push("/invoices");
    } catch {
      toast.error("로그인 실패", "네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        control={control}
        name="email"
        label="이메일"
        required
        render={({ value, onChange, onBlur }) => (
          <Input
            type="email"
            placeholder="example@email.com"
            id="email"
            autoComplete="email"
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <FormField
        control={control}
        name="password"
        label="비밀번호"
        required
        render={({ value, onChange, onBlur }) => (
          <Input
            type="password"
            placeholder="비밀번호 입력"
            id="password"
            autoComplete="current-password"
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <FormField
        control={control}
        name="rememberMe"
        render={({ value, onChange }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={typeof value === "boolean" ? value : false}
              onCheckedChange={onChange}
            />
            <Label htmlFor="rememberMe" className="cursor-pointer text-sm">
              로그인 상태 유지 (7일)
            </Label>
          </div>
        )}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            로그인 중...
          </span>
        ) : (
          "로그인"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link href="/register" className="text-primary hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
