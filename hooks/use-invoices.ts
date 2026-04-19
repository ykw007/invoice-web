"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, InvoiceListItem } from "@/types";
import { UnauthorizedError } from "@/lib/errors";

export function useInvoices() {
  return useQuery<InvoiceListItem[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices", { credentials: "include" });
      if (res.status === 401) throw new UnauthorizedError();
      if (!res.ok) throw new Error("견적서 목록 조회에 실패했습니다.");
      const json: ApiResponse<InvoiceListItem[]> = await res.json();
      return json.data;
    },
    staleTime: 60 * 1000,
  });
}
