import { DashboardLayout } from "@/components/layout/dashboard-layout";
import type { BaseProps } from "@/types";

export default function DashboardGroupLayout({ children }: BaseProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
