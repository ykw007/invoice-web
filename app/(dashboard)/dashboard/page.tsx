"use client";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/common/stat-card";
import { DataTable } from "@/components/common/data-table";
import type { TableColumn, OrderStatus } from "@/types";
import { Users, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  status: OrderStatus;
  amount: string;
  date: string;
}

const ORDERS: Order[] = [
  { id: "ORD-001", customer: "김철수", status: "완료", amount: "₩150,000", date: "2026-03-01" },
  { id: "ORD-002", customer: "이영희", status: "처리중", amount: "₩89,000", date: "2026-03-05" },
  { id: "ORD-003", customer: "박민준", status: "완료", amount: "₩230,000", date: "2026-03-10" },
  { id: "ORD-004", customer: "최지은", status: "취소", amount: "₩45,000", date: "2026-03-12" },
  { id: "ORD-005", customer: "정다연", status: "처리중", amount: "₩178,000", date: "2026-03-15" },
];

const COLUMNS: TableColumn<Order>[] = [
  { key: "id", header: "주문번호", sortable: true },
  { key: "customer", header: "고객명", sortable: true },
  {
    key: "status",
    header: "상태",
    render: (value) => {
      const colorMap: Record<OrderStatus, string> = {
        완료: "text-green-600",
        처리중: "text-yellow-600",
        취소: "text-red-600",
      };
      return (
        <span className={colorMap[value as OrderStatus] ?? ""}>
          {String(value)}
        </span>
      );
    },
  },
  { key: "amount", header: "금액", sortable: true },
  { key: "date", header: "날짜", sortable: true },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="대시보드"
        description="비즈니스 현황을 한눈에 확인하세요."
      />

      {/* 통계 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="총 사용자"
          value="12,345"
          change={12.5}
          icon={Users}
        />
        <StatCard
          title="총 주문"
          value="1,234"
          change={-3.2}
          icon={ShoppingCart}
        />
        <StatCard
          title="월 매출"
          value="₩45,678,000"
          change={8.1}
          icon={DollarSign}
        />
        <StatCard
          title="전환율"
          value="3.24%"
          change={0.5}
          icon={TrendingUp}
        />
      </div>

      {/* 최근 주문 테이블 */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold">최근 주문</h2>
        <DataTable columns={COLUMNS} data={ORDERS} keyField="id" />
      </div>
    </div>
  );
}
