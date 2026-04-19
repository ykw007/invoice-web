"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth.schema";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { toast } from "@/lib/toast";
import type { ApiErrorResponse } from "@/types";

/**
 * 회원가입 폼 컴포넌트
 * - POST /api/auth/register 호출
 * - 성공 시 자동 로그인(POST /api/auth/login) 후 /invoices 이동
 * - 실패 시 에러 토스트 표시
 */
export function RegisterForm() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      /* 1. 회원가입 */
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const registerJson: { success: boolean; message?: string } =
        await registerRes.json();

      if (!registerRes.ok || !registerJson.success) {
        const errJson = registerJson as ApiErrorResponse;
        toast.error("회원가입 실패", errJson.message ?? "회원가입에 실패했습니다.");
        return;
      }

      /* 2. 자동 로그인 */
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const loginJson: { success: boolean; data?: { token: string }; message?: string } =
        await loginRes.json();

      if (loginRes.ok && loginJson.success && loginJson.data?.token) {
        document.cookie = `token=${loginJson.data.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      }

      toast.success("회원가입 성공!", `${data.name}님, 환영합니다!`);
      router.push("/invoices");
    } catch {
      toast.error("회원가입 실패", "네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField
        control={control}
        name="name"
        label="이름"
        required
        render={({ value, onChange, onBlur }) => (
          <Input
            placeholder="홍길동"
            id="name"
            autoComplete="name"
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}
      />

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
            placeholder="8자 이상 영문+숫자"
            id="password"
            autoComplete="new-password"
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <FormField
        control={control}
        name="confirmPassword"
        label="비밀번호 확인"
        required
        render={({ value, onChange, onBlur }) => (
          <Input
            type="password"
            placeholder="비밀번호 재입력"
            id="confirmPassword"
            autoComplete="new-password"
            value={typeof value === "string" ? value : ""}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}
      />

      <FormField
        control={control}
        name="agreeToTerms"
        render={({ value, onChange }) => (
          <div className="flex items-center gap-2">
            <Checkbox
              id="agreeToTerms"
              checked={typeof value === "boolean" ? value : false}
              onCheckedChange={onChange}
            />
            <Label htmlFor="agreeToTerms" className="cursor-pointer text-sm">
              <Link href="/terms" className="text-primary hover:underline">
                이용약관
              </Link>
              에 동의합니다
            </Label>
          </div>
        )}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            처리 중...
          </span>
        ) : (
          "회원가입"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-primary hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
