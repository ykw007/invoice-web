import { cn } from "@/lib/utils";
import type { Size } from "@/types";

interface LoadingSpinnerProps {
  size?: Size;
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

/** 로딩 스피너 컴포넌트 */
export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={cn(
        "animate-spin rounded-full border-muted border-t-foreground",
        sizeClasses[size],
        className
      )}
    />
  );
}
