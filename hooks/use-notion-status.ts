"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, NotionStatusDTO } from "@/types";

/**
 * 노션 연동 상태 조회 훅
 * - GET /api/notion/status 호출
 * - NotionStatusDTO 반환 (status, databaseId, itemsDatabaseId, connectedAt)
 */
export function useNotionStatus() {
  return useQuery<NotionStatusDTO, Error>({
    queryKey: ["notion", "status"],
    queryFn: async (): Promise<NotionStatusDTO> => {
      const res = await fetch("/api/notion/status", {
        credentials: "include",
      });
      if (res.status === 401) {
        return { status: "disconnected" } as NotionStatusDTO;
      }
      if (!res.ok) {
        throw new Error("노션 연동 상태 조회에 실패했습니다.");
      }
      const json: ApiResponse<NotionStatusDTO> = await res.json();
      return json.data;
    },
    staleTime: 60 * 1000,
  });
}
