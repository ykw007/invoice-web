"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/schemas/auth.schema";
import { AuthLayout } from "@/components/layout/auth-layout";
import { FormField } from "@/components/common/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/lib/toast";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import Link from "next/link";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("회원가입 성공!", `${data.name}님, 환영합니다!`);
  };

  return (
    <AuthLayout title="회원가입" description="계정을 생성해주세요.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              value={value as string}
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
              value={value as string}
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
              value={value as string}
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
              value={value as string}
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
                checked={value as boolean}
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
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-primary hover:underline">
          로그인
        </Link>
      </p>
    </AuthLayout>
  );
}
