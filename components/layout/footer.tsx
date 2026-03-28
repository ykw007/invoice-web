import Link from "next/link";
import { Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/common/logo";
import { APP_CONFIG } from "@/lib/constants";

/** 페이지 하단 푸터 컴포넌트 */
export function Footer() {
  return (
    <footer className="w-full">
      <Separator />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <Logo />
            <p className="text-sm text-muted-foreground">
              {APP_CONFIG.description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={APP_CONFIG.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          © {APP_CONFIG.year} {APP_CONFIG.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
