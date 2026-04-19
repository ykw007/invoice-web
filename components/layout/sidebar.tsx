"use client";

import { cn } from "@/lib/utils";
import type { SidebarProps } from "@/types";
import { NAV_LINKS } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText, Settings } from "lucide-react";

/** 각 네비게이션 링크에 대응하는 아이콘 */
const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/invoices": FileText,
  "/settings/notion": Settings,
};

/** 사이드바 레이아웃 컴포넌트 */
export function Sidebar({ isCollapsed = false, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-14" : "w-60",
        className
      )}
    >
      {/* 로고 영역 */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-3",
          isCollapsed && "justify-center"
        )}
      >
        {!isCollapsed && (
          <span className="text-sm font-semibold">Invoice Web</span>
        )}
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-1 p-2">
        {NAV_LINKS.map((link) => {
          const Icon = NAV_ICONS[link.href] ?? FileText;
          const isActive = pathname === link.href;

          if (isCollapsed) {
            return (
              <Tooltip key={link.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{link.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
