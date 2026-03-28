import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
}

/** 텍스트 기반 로고 컴포넌트 */
export function Logo({ href = "/", className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "font-bold text-xl tracking-tight hover:opacity-80 transition-opacity",
        className
      )}
    >
      <span className="text-primary">Next</span>
      <span className="text-muted-foreground">.starter</span>
    </Link>
  );
}
