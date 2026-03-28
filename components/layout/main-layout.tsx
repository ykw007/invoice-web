import { Header } from "./header";
import { Footer } from "./footer";
import type { BaseProps } from "@/types";

/** 기본 페이지 레이아웃 (Header + main + Footer) */
export function MainLayout({ children }: BaseProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
