import type { BaseProps } from "@/types";

export default function ViewerLayout({ children }: BaseProps) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
