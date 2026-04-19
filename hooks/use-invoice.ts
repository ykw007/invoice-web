"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, Invoice } from "@/types";
import { UnauthorizedError } from "@/lib/errors";

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${id}`, { credentials: "include" });
      if (res.status === 401) throw new UnauthorizedError();
      if (!res.ok) throw new Error("견적서 조회에 실패했습니다.");
      const json: ApiResponse<Invoice> = await res.json();
      return json.data;
    },
    staleTime: 60 * 1000,
    enabled: !!id,
  });
}
