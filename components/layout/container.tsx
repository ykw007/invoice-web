import { cn } from "@/lib/utils";
import type { BaseProps } from "@/types";

interface ContainerProps extends BaseProps {
  as?: React.ElementType;
}

/** 최대 너비 + 패딩을 포함한 레이아웃 래퍼 */
export function Container({ as: Tag = "div", className, children }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </Tag>
  );
}
