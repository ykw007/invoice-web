import { cn } from "@/lib/utils";
import type { BaseProps } from "@/types";
import { APP_CONFIG } from "@/lib/constants";
import Link from "next/link";

interface AuthLayoutProps extends BaseProps {
  title?: string;
  description?: string;
}

/** 로그인/회원가입 중앙 카드 레이아웃 */
export function AuthLayout({ title, description, children, className }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50 px-4 py-12">
      <div className={cn("w-full max-w-sm space-y-6", className)}>
        {/* 로고 */}
        <div className="text-center">
          <Link href="/" className="text-xl font-bold">
            {APP_CONFIG.name}
          </Link>
          {title && (
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {/* 폼 카드 */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
