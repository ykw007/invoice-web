"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.schema";
import { AuthLayout } from "@/components/layout/auth-layout";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/lib/toast";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import Link from "next/link";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("로그인 성공!", `${data.email}으로 로그인했습니다.`);
  };

  return (
    <AuthLayout
      title="로그인"
      description="이메일과 비밀번호를 입력해주세요."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                로그인 상태 유지
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
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link href="/register" className="text-primary hover:underline">
          회원가입
        </Link>
      </p>
    </AuthLayout>
  );
}
