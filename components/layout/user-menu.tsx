"use client";

import { useRouter } from "next/navigation";
import { User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  /** 로그인된 사용자 이메일 */
  email: string;
  className?: string;
}

/**
 * 사용자 메뉴 드롭다운 컴포넌트
 * - 이메일 표시
 * - 로그아웃: token 쿠키 제거 후 / 이동
 */
export function UserMenu({ email, className }: UserMenuProps) {
  const router = useRouter();

  const handleLogout = () => {
    /* token 쿠키 즉시 만료 처리 */
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("flex items-center gap-2 px-2", className)}
          aria-label="사용자 메뉴 열기"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="hidden max-w-[140px] truncate text-sm sm:block">
            {email}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs text-muted-foreground">로그인 계정</p>
            <p className="truncate text-sm font-medium">{email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href="/settings/notion" className="flex cursor-pointer items-center">
            <Settings className="mr-2 h-4 w-4" />
            노션 연동 설정
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
